import { openModal, closeModal } from '../../shared/components/modal.js';
import { store as appStore } from '../../shared/state/store.js';
import { request as appRequest } from '../../shared/api/client.js';
import { showToast as appShowToast } from '../../shared/components/toast.js';
import { escapeHtml } from '../../shared/utils/formatters.js';
import { loadIssues } from '../issue/issue-controller.js';
import { loadBoards } from '../board/board-controller.js';

export async function loadSprints(request = appRequest, store = appStore) {
  const { org, selectedProjectId, token } = store.getState();
  if (!org || !selectedProjectId || !token) return;

  try {
    const sprints = await request(`/organizations/${org}/projects/${selectedProjectId}/sprints`);
    store.setState({ sprints: sprints || [] });
  } catch (err) {
    console.warn('Could not load sprints:', err.message);
  }
}

export async function loadBacklog(request = appRequest, store = appStore) {
  const { org, selectedProjectId, token } = store.getState();
  if (!org || !selectedProjectId || !token) return;

  try {
    const res = await request(`/organizations/${org}/projects/${selectedProjectId}/backlog`);
    const items = Array.isArray(res) ? res : (res?.data || []);
    store.setState({ backlog: items, backlogIssues: items });
  } catch (err) {
    console.warn('Could not load backlog:', err.message);
  }
}

export function bindBacklogEvents(ctx = {}) {
  const request = ctx.request || appRequest;
  const store = ctx.store || appStore;
  const showToast = ctx.showToast || appShowToast;

  const reloadBacklogData = () => Promise.all([
    loadSprints(request, store),
    loadBacklog(request, store),
    loadIssues(request, store, store.getState().query),
    loadBoards(request, store),
  ]);

  // Create sprint button
  document.querySelector('#btn-create-sprint')?.addEventListener('click', () => openCreateSprintModal({ request, store, showToast }));

  // Start sprint button
  document.querySelectorAll('.btn-start-sprint').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sprintId = btn.dataset.sprintId;
      const { org, selectedProjectId } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/projects/${selectedProjectId}/sprints/${sprintId}/start`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        showToast('Sprint started successfully!', 'success');
        await reloadBacklogData();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Complete sprint button
  document.querySelectorAll('.btn-complete-sprint').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sprintId = btn.dataset.sprintId;
      const { org, selectedProjectId } = store.getState();
      if (!confirm('Are you sure you want to complete this sprint? Incomplete issues will move to backlog.')) return;

      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/projects/${selectedProjectId}/sprints/${sprintId}/close`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        showToast('Sprint completed!', 'success');
        await reloadBacklogData();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Move issue to sprint dropdown
  document.querySelectorAll('[data-assign-sprint-issue]').forEach(select => {
    select.addEventListener('change', async () => {
      const issueId = select.dataset.assignSprintIssue;
      const targetSprintVal = select.value;
      const { org } = store.getState();
      if (!targetSprintVal) return;

      const targetSprintId = targetSprintVal === '__backlog__' ? null : targetSprintVal;

      try {
        store.setState({ loading: true });
        const issue = await request(`/organizations/${org}/issues/${issueId}`);
        await request(`/organizations/${org}/issues/${issueId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            sprintId: targetSprintId,
            version: issue.version,
          }),
        });
        showToast(targetSprintId ? 'Issue moved to sprint' : 'Issue moved to backlog', 'success');
        await reloadBacklogData();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // HTML5 Drag and Drop for Backlog & Sprints
  const issueRows = document.querySelectorAll('.backlog-issue-row[draggable="true"]');
  const sprintDropZones = document.querySelectorAll('[data-droppable-sprint]');

  issueRows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      row.classList.add('is-dragging');
      e.dataTransfer.setData('text/plain', JSON.stringify({
        issueId: row.dataset.issueId,
        fromSprintId: row.dataset.currentSprint || '',
      }));
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('is-dragging');
      sprintDropZones.forEach(zone => zone.classList.remove('drag-over'));
    });
  });

  sprintDropZones.forEach(dropZone => {
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
        const raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        const data = JSON.parse(raw);
        const { issueId, fromSprintId } = data;
        const targetSprintId = dropZone.dataset.droppableSprint || null;

        if (!issueId || fromSprintId === (targetSprintId || '')) return;

        store.setState({ loading: true });
        const { org } = store.getState();
        const issue = await request(`/organizations/${org}/issues/${issueId}`);
        await request(`/organizations/${org}/issues/${issueId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            sprintId: targetSprintId,
            version: issue.version,
          }),
        });

        showToast(targetSprintId ? 'Moved issue to sprint' : 'Moved issue to backlog', 'success');
        await reloadBacklogData();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });
}

export function openCreateSprintModal({ request = appRequest, store = appStore, showToast = appShowToast } = {}) {
  const contentHtml = `
    <form id="form-create-sprint" class="space-y-4">
      <div>
        <label for="sprint-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Sprint Name</label>
        <input id="sprint-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Sprint 24 - Checkout Revamp" required />
      </div>
      <div>
        <label for="sprint-modal-goal" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Sprint Goal</label>
        <textarea id="sprint-modal-goal" name="goal" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary resize-y" rows="2" placeholder="What does the team aim to accomplish?"></textarea>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="sprint-modal-start" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Start Date</label>
          <input id="sprint-modal-start" name="startAt" type="date" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
        </div>
        <div>
          <label for="sprint-modal-end" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">End Date</label>
          <input id="sprint-modal-end" name="endAt" type="date" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Sprint</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Create Sprint',
    subtitle: 'Plan a timeboxed cycle for your team',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-sprint');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org, selectedProjectId, selectedBoardId } = store.getState();

    if (!selectedBoardId) {
      showToast('Please select or create a Scrum board first', 'error');
      return;
    }

    try {
      store.setState({ loading: true });
      await request(`/organizations/${org}/projects/${selectedProjectId}/boards/${selectedBoardId}/sprints`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          goal: formData.get('goal') || undefined,
          startAt: formData.get('startAt') ? new Date(formData.get('startAt')).toISOString() : undefined,
          endAt: formData.get('endAt') ? new Date(formData.get('endAt')).toISOString() : undefined,
        }),
      });

      closeModal();
      showToast('Sprint created successfully', 'success');
      await Promise.all([
        loadSprints(request, store),
        loadBacklog(request, store),
      ]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}
