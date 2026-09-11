import { openModal, closeModal } from '../../shared/components/modal.js';
import { store as appStore } from '../../shared/state/store.js';
import { request as appRequest } from '../../shared/api/client.js';
import { showToast as appShowToast } from '../../shared/components/toast.js';
import { openIssueDetailModal } from '../issue/issue-controller.js';

export async function loadBoards(request = appRequest, store = appStore) {
  const { org, selectedProjectId, token } = store.getState();
  if (!org || !selectedProjectId || !token) return;

  try {
    const res = await request(`/organizations/${org}/projects/${selectedProjectId}/boards`);
    const boards = Array.isArray(res) ? res : (res?.data || []);
    let { selectedBoardId } = store.getState();

    if (!selectedBoardId && boards.length > 0) {
      selectedBoardId = boards[0].id;
    } else if (selectedBoardId && !boards.some(b => b.id === selectedBoardId)) {
      selectedBoardId = boards[0]?.id || '';
    }

    store.setState({ boards, selectedBoardId });

    if (selectedBoardId) {
      await loadBoardData(selectedBoardId, request, store);
    }
  } catch (err) {
    console.warn('Could not load boards:', err.message);
  }
}

export async function loadBoardData(boardId, request = appRequest, store = appStore) {
  const { org, selectedProjectId, token } = store.getState();
  if (!org || !selectedProjectId || !boardId || !token) return;

  try {
    store.setState({ loading: true });
    const boardData = await request(`/organizations/${org}/projects/${selectedProjectId}/boards/${boardId}`);
    store.setState({ boardData, selectedBoardId: boardId, loading: false });
  } catch (err) {
    store.setState({ loading: false });
    console.warn('Could not load board data:', err.message);
  }
}

export function bindBoardEvents(ctx = {}) {
  const request = ctx.request || appRequest;
  const store = ctx.store || appStore;
  const showToast = ctx.showToast || appShowToast;

  // Board picker
  document.querySelector('#board-picker')?.addEventListener('change', async (e) => {
    await loadBoardData(e.target.value, request, store);
  });

  // Board filters
  document.querySelectorAll('[data-board-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setState({ boardFilter: btn.dataset.boardFilter });
    });
  });

  // Create board button
  const createBoardBtns = [
    document.querySelector('#btn-create-board'),
    document.querySelector('#btn-create-first-board'),
  ];
  createBoardBtns.forEach(btn => btn?.addEventListener('click', () => openCreateBoardModal({ request, store, showToast })));

  // Add column button
  document.querySelector('#btn-add-column')?.addEventListener('click', () => openAddColumnModal({ request, store, showToast }));

  // Edit column WIP limit
  document.querySelectorAll('[data-edit-column]').forEach(btn => {
    btn.addEventListener('click', () => {
      const colId = btn.dataset.editColumn;
      const column = (store.getState().boardData?.columns || []).find(c => c.id === colId);
      if (column) openEditColumnModal(column, { request, store, showToast });
    });
  });

  // Card clicks (direct click on card)
  document.querySelectorAll('.board-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('select')) return;
      const issueId = card.dataset.issueId;
      if (issueId) openIssueDetailModal(issueId);
    });
  });

  // HTML5 Drag and Drop for Kanban Cards
  const cards = document.querySelectorAll('.board-card');
  const droppableColumns = document.querySelectorAll('[data-droppable-column]');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('is-dragging');
      e.dataTransfer.setData('text/plain', JSON.stringify({
        issueId: card.dataset.issueId,
        fromColumnId: card.closest('[data-column-id]')?.dataset.columnId,
      }));
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      droppableColumns.forEach(c => c.classList.remove('drag-over'));
    });
  });

  droppableColumns.forEach(dropZone => {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('drag-over');
      }
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');

      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { issueId, fromColumnId } = data;
        const targetColumnId = dropZone.dataset.droppableColumn;

        if (!issueId || fromColumnId === targetColumnId) return;

        await handleIssueColumnDrop(issueId, targetColumnId, { request, store, showToast });
      } catch (err) {
        console.warn('Drop error:', err);
      }
    });
  });
}

export async function handleIssueColumnDrop(issueId, targetColumnId, { request = appRequest, store = appStore, showToast = appShowToast } = {}) {
  const { org, selectedBoardId, boardData } = store.getState();
  const targetCol = boardData?.columns?.find(c => c.id === targetColumnId);
  if (!targetCol) return;

  try {
    store.setState({ loading: true });
    const issue = await request(`/organizations/${org}/issues/${issueId}`);
    const targetStatusName = targetCol.name.toLowerCase();
    const matchingTransition = (issue.transitions || []).find(t =>
      t.name.toLowerCase().includes(targetStatusName) ||
      targetStatusName.includes(t.name.toLowerCase())
    );

    if (matchingTransition) {
      await request(`/organizations/${org}/issues/${issueId}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          transitionKey: matchingTransition.key,
          version: issue.version,
        }),
      });
      showToast(`Issue ${issue.key} moved to ${targetCol.name}`, 'success');
    } else {
      await request(`/organizations/${org}/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          version: issue.version,
        }),
      });
      showToast(`Moved ${issue.key}`, 'info');
    }

    await loadBoardData(selectedBoardId, request, store);
  } catch (err) {
    showToast(err.message, 'error');
    await loadBoardData(selectedBoardId, request, store);
  } finally {
    store.setState({ loading: false });
  }
}

export function openCreateBoardModal({ request = appRequest, store = appStore, showToast = appShowToast } = {}) {
  const contentHtml = `
    <form id="form-create-board" class="space-y-4">
      <div>
        <label for="board-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Board Name</label>
        <input id="board-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Sprint Execution Board" required />
      </div>
      <div>
        <label for="board-modal-type" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Board Type</label>
        <select id="board-modal-type" name="boardType" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary">
          <option value="kanban">Kanban (Continuous Flow)</option>
          <option value="scrum">Scrum (Sprints & Backlog)</option>
        </select>
      </div>
      <div>
        <label for="board-modal-desc" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description</label>
        <textarea id="board-modal-desc" name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary resize-y" rows="2" placeholder="Optional description of workflow"></textarea>
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Board</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Create Board',
    subtitle: 'Track work using Kanban or Scrum boards',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-board');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org, selectedProjectId } = store.getState();

    try {
      store.setState({ loading: true });
      const newBoard = await request(`/organizations/${org}/projects/${selectedProjectId}/boards`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          boardType: formData.get('boardType'),
          description: formData.get('description'),
        }),
      });

      closeModal();
      showToast('Board created successfully', 'success');
      await loadBoards(request, store);
      if (newBoard?.id) {
        await loadBoardData(newBoard.id, request, store);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}

export function openAddColumnModal({ request = appRequest, store = appStore, showToast = appShowToast } = {}) {
  const contentHtml = `
    <form id="form-add-column" class="space-y-4">
      <div>
        <label for="col-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Column Name</label>
        <input id="col-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Code Review" required />
      </div>
      <div>
        <label for="col-modal-wip" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">WIP Limit (0 for unlimited)</label>
        <input id="col-modal-wip" name="wipLimit" type="number" min="0" value="0" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Add Column</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Add Column',
    subtitle: 'Add a new workflow stage to this board',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-add-column');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org, selectedProjectId, selectedBoardId, boardData } = store.getState();
    const pos = (boardData?.columns?.length || 0) + 1;
    const wip = parseInt(formData.get('wipLimit'), 10) || null;

    try {
      store.setState({ loading: true });
      await request(`/organizations/${org}/projects/${selectedProjectId}/boards/${selectedBoardId}/columns`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          position: pos,
          wipLimit: wip,
        }),
      });

      closeModal();
      showToast('Column added', 'success');
      await loadBoardData(selectedBoardId, request, store);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}

export function openEditColumnModal(column, { request = appRequest, store = appStore, showToast = appShowToast } = {}) {
  const contentHtml = `
    <form id="form-edit-column" class="space-y-4">
      <div>
        <label for="col-edit-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Column Name</label>
        <input id="col-edit-name" name="name" value="${column.name}" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" required />
      </div>
      <div>
        <label for="col-edit-wip" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">WIP Limit (0 for unlimited)</label>
        <input id="col-edit-wip" name="wipLimit" type="number" min="0" value="${column.wipLimit || 0}" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Save Changes</button>
      </div>
    </form>
  `;

  openModal({
    title: `Edit Column: ${column.name}`,
    subtitle: 'Configure work-in-progress limit and display label',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-edit-column');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org, selectedProjectId, selectedBoardId } = store.getState();
    const wip = parseInt(formData.get('wipLimit'), 10) || null;

    try {
      store.setState({ loading: true });
      await request(`/organizations/${org}/projects/${selectedProjectId}/boards/${selectedBoardId}/columns/${column.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.get('name'),
          wipLimit: wip,
        }),
      });

      closeModal();
      showToast('Column updated', 'success');
      await loadBoardData(selectedBoardId, request, store);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}
