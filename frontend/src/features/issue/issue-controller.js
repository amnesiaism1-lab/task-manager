import { openModal, closeModal } from '../../shared/components/modal.js';
import { store as appStore } from '../../shared/state/store.js';
import { request as appRequest } from '../../shared/api/client.js';
import { showToast as appShowToast } from '../../shared/components/toast.js';
import { renderIssueDetailModal } from './issue-detail-modal.js';
import { renderIssueCreateModal } from './issue-create-modal.js';
import { loadBoardData as defaultLoadBoardData } from '../board/board-controller.js';
import { loadSprints as defaultLoadSprints, loadBacklog as defaultLoadBacklog } from '../backlog/backlog-controller.js';

export async function loadIssues(query = '', request = appRequest, store = appStore) {
  let actualQuery = '';
  let actualRequest = appRequest;
  let actualStore = appStore;

  if (typeof query === 'function') {
    actualRequest = query;
    actualStore = (request && typeof request.getState === 'function') ? request : appStore;
    actualQuery = typeof store === 'string' ? store : '';
  } else {
    actualQuery = typeof query === 'string' ? query : '';
    actualRequest = (typeof request === 'function') ? request : appRequest;
    actualStore = (store && typeof store.getState === 'function') ? store : appStore;
  }

  const { org, selectedProjectId, token } = actualStore.getState();
  if (!org || !token) return;

  try {
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (selectedProjectId) params.append('projectId', selectedProjectId);
    if (actualQuery && typeof actualQuery === 'string') params.append('query', actualQuery);

    const url = selectedProjectId
      ? `/organizations/${org}/projects/${selectedProjectId}/issues?${params.toString()}`
      : `/organizations/${org}/issues/search?${params.toString()}`;
    const res = await actualRequest(url);
    const issues = Array.isArray(res) ? res : (res?.data || []);
    actualStore.setState({ issues });
  } catch (err) {
    console.warn('Could not load issues:', err.message);
  }
}

export async function openIssueDetailModal(issueId, ctx = {}) {
  const request = ctx.request || appRequest;
  const store = ctx.store || appStore;
  const showToast = ctx.showToast || appShowToast;
  const loadBoardData = ctx.loadBoardData || defaultLoadBoardData;
  const loadSprints = ctx.loadSprints || defaultLoadSprints;
  const loadBacklog = ctx.loadBacklog || defaultLoadBacklog;
  const loadIssuesFn = ctx.loadIssues || loadIssues;

  const { org } = store.getState();
  if (!org || !issueId) return;

  try {
    store.setState({ loading: true });
    const issue = await request(`/organizations/${org}/issues/${issueId}`);
    store.setState({ selectedIssue: issue, issueDetail: issue, loading: false });

    const contentHtml = renderIssueDetailModal(issue, store.getState());
    openModal({
      title: `${issue.key} · ${issue.summary}`,
      subtitle: `${issue.project?.name || 'Issue'} / Details`,
      contentHtml,
      size: 'large',
      onClose: () => {
        store.setState({ selectedIssue: null, issueDetail: null });
      },
    });

    bindIssueDetailModalEvents(issue, { request, store, showToast, loadBoardData, loadSprints, loadBacklog, loadIssues: loadIssuesFn });
  } catch (err) {
    store.setState({ loading: false });
    showToast(`Error opening issue: ${err.message}`, 'error');
  }
}

export function bindIssueDetailModalEvents(initialIssue, { request, store, showToast, loadBoardData, loadSprints, loadBacklog, loadIssues }) {
  let currentIssue = initialIssue;
  const { org } = store.getState();

  const refreshModal = async () => {
    try {
      const freshIssue = await request(`/organizations/${org}/issues/${currentIssue.id}`);
      currentIssue = freshIssue;
      store.setState({ selectedIssue: freshIssue, issueDetail: freshIssue });

      const dialog = document.querySelector('.modal-dialog');
      if (dialog) {
        const bodyEl = dialog.querySelector('.modal-body');
        if (bodyEl) {
          bodyEl.innerHTML = renderIssueDetailModal(freshIssue, store.getState());
          bindIssueDetailModalEvents(freshIssue, { request, store, showToast, loadBoardData, loadSprints, loadBacklog, loadIssues });
        }
      }
    } catch (err) {
      console.warn('Error refreshing issue modal:', err);
    }
  };

  // Status Transitions Handler (Unified for both quick action buttons and dropdown)
  const handleTransition = async (transitionKey) => {
    if (!transitionKey) return;
    const matchingTrans = (currentIssue.transitions || []).find(t => t.key === transitionKey);
    const transName = matchingTrans?.name || transitionKey;

    try {
      showToast(`Transitioning: ${transName}...`, 'info', 1000);
      await request(`/organizations/${org}/issues/${currentIssue.id}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          transitionKey,
          version: currentIssue.version,
        }),
      });
      showToast(`Status updated: ${transName}`, 'success', 2000);
      await refreshModal();
      if (loadBoardData && store.getState().selectedBoardId) {
        await loadBoardData(store.getState().selectedBoardId, request, store);
      }
      if (loadIssues) {
        await loadIssues(store.getState().query || '', request, store);
      }
    } catch (err) {
      showToast(`Transition failed: ${err.message}`, 'error');
    }
  };

  // Bind Quick Transition Pills
  document.querySelectorAll('.btn-quick-transition').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.transitionKey;
      btn.disabled = true;
      btn.classList.add('opacity-50');
      await handleTransition(key);
    });
  });

  // 1. Status Transition Dropdown
  const transitionSelect = document.querySelector('#issue-transition-select');
  transitionSelect?.addEventListener('change', async (e) => {
    const transitionKey = e.target.value;
    if (!transitionKey) return;
    transitionSelect.disabled = true;
    await handleTransition(transitionKey);
    transitionSelect.disabled = false;
  });

  // 2. Summary Inline Edit
  const summaryInput = document.querySelector('#detail-summary-input');
  summaryInput?.addEventListener('blur', async () => {
    const newSummary = summaryInput.value.trim();
    if (!newSummary || newSummary === currentIssue.summary) return;

    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          summary: newSummary,
          version: currentIssue.version,
        }),
      });
      showToast('Summary saved', 'info', 1500);
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
      summaryInput.value = currentIssue.summary;
    }
  });

  // 3. Description Save
  document.querySelector('#btn-save-description')?.addEventListener('click', async () => {
    const descInput = document.querySelector('#detail-description-input');
    const newDesc = descInput?.value?.trim() || '';
    if (newDesc === (currentIssue.description || '')) return;

    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: newDesc,
          version: currentIssue.version,
        }),
      });
      showToast('Description saved', 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 4. Assignee Select
  document.querySelector('#detail-assignee-select')?.addEventListener('change', async (e) => {
    const assigneeMemberId = e.target.value || null;
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          assigneeMemberId,
          version: currentIssue.version,
        }),
      });
      showToast('Assignee updated', 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 5. Priority Select
  document.querySelector('#detail-priority-select')?.addEventListener('change', async (e) => {
    const priority = e.target.value;
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          priority,
          version: currentIssue.version,
        }),
      });
      showToast('Priority updated', 'info');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 6. Sprint Select
  document.querySelector('#detail-sprint-select')?.addEventListener('change', async (e) => {
    const sprintId = e.target.value || null;
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          sprintId,
          version: currentIssue.version,
        }),
      });
      showToast(sprintId ? 'Issue moved to sprint' : 'Issue moved to backlog', 'success');
      await refreshModal();
      if (loadSprints) loadSprints(request, store);
      if (loadBacklog) loadBacklog(request, store);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 7. Due Date
  document.querySelector('#detail-due-date')?.addEventListener('change', async (e) => {
    const dueAt = e.target.value || null;
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          dueAt,
          version: currentIssue.version,
        }),
      });
      showToast('Due date updated', 'info');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 8. Estimate Input
  document.querySelector('#detail-estimate-input')?.addEventListener('change', async (e) => {
    const hours = parseFloat(e.target.value);
    const originalEstimateSeconds = isNaN(hours) ? null : Math.round(hours * 3600);
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          originalEstimateSeconds,
          version: currentIssue.version,
        }),
      });
      showToast('Estimate saved', 'info');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 8b. Story Points Input
  document.querySelector('#detail-story-points-input')?.addEventListener('change', async (e) => {
    const pts = parseFloat(e.target.value);
    const storyPoints = isNaN(pts) ? null : pts;
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          storyPoints,
          version: currentIssue.version,
        }),
      });
      showToast('Story points updated', 'info');
      await refreshModal();
      if (loadBacklog) loadBacklog(request, store);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 9. Comments Form
  document.querySelector('#form-add-comment')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const commentInput = e.target.querySelector('textarea[name="body"]');
    const body = commentInput?.value?.trim();
    if (!body) return;

    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      showToast('Comment posted', 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 10. Delete Comment
  document.querySelectorAll('.btn-delete-comment').forEach(btn => {
    btn.addEventListener('click', async () => {
      const commentId = btn.dataset.commentId;
      if (!confirm('Delete this comment?')) return;

      try {
        await request(`/organizations/${org}/issues/${currentIssue.id}/comments/${commentId}`, {
          method: 'DELETE',
        });
        showToast('Comment deleted', 'info');
        await refreshModal();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // 11. Worklog Form
  document.querySelector('#form-log-work')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const hours = parseFloat(formData.get('hours')) || 0;
    const comment = formData.get('comment');
    const timeSpentSeconds = Math.round(hours * 3600);

    if (timeSpentSeconds <= 0) {
      showToast('Please enter a valid spent time', 'warning');
      return;
    }

    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}/work-logs`, {
        method: 'POST',
        body: JSON.stringify({
          timeSpentSeconds,
          comment,
          startedAt: new Date().toISOString(),
        }),
      });
      showToast('Work logged successfully', 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 12. Attachment Upload
  const fileInput = document.querySelector('#file-attachment-input');
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast('Uploading attachment...', 'info', 2000);
      await request(`/organizations/${org}/issues/${currentIssue.id}/attachments`, {
        method: 'POST',
        body: formData,
      });
      showToast('File attached', 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 13. Delete Attachment
  document.querySelectorAll('.btn-delete-attachment').forEach(btn => {
    btn.addEventListener('click', async () => {
      const attId = btn.dataset.attachmentId;
      if (!confirm('Delete this attachment?')) return;

      try {
        await request(`/organizations/${org}/issues/${currentIssue.id}/attachments/${attId}`, {
          method: 'DELETE',
        });
        showToast('Attachment deleted', 'info');
        await refreshModal();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // 14. Detail Tabs Switcher
  document.querySelectorAll('[data-detail-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setState({ issueModalTab: btn.dataset.detailTab });
      refreshModal();
    });
  });

  // 15. Add Label
  document.querySelector('#form-add-label')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.querySelector('#new-label-name');
    const name = input?.value?.trim();
    if (!name) return;

    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}/labels`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      showToast(`Label "${name}" added`, 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 16. Toggle Watch
  document.querySelector('#btn-toggle-watch')?.addEventListener('click', async () => {
    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}/watchers`, {
        method: 'POST',
        body: JSON.stringify({ memberId: store.getState().members?.[0]?.id }),
      });
      showToast('Watching this issue', 'info');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 17. Link Issue Form
  document.querySelector('#form-link-issue')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const linkTypeId = document.querySelector('#link-type-select')?.value;
    const linkedIssueId = document.querySelector('#link-target-select')?.value;

    if (!linkTypeId || !linkedIssueId) {
      showToast('Please select relationship and target issue', 'warning');
      return;
    }

    try {
      await request(`/organizations/${org}/issues/${currentIssue.id}/links`, {
        method: 'POST',
        body: JSON.stringify({ linkTypeId, targetIssueId: linkedIssueId }),
      });
      showToast('Issue linked', 'success');
      await refreshModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

export function openIssueCreateModal(ctx = {}) {
  const request = ctx.request || appRequest;
  const store = ctx.store || appStore;
  const showToast = ctx.showToast || appShowToast;
  const loadBoardData = ctx.loadBoardData || defaultLoadBoardData;
  const loadBacklog = ctx.loadBacklog || defaultLoadBacklog;
  const loadIssuesFn = ctx.loadIssues || loadIssues;

  const contentHtml = renderIssueCreateModal(store.getState());
  openModal({
    title: 'Create Issue',
    subtitle: 'Capture work, set estimates and link sprints',
    contentHtml,
    size: 'medium',
  });

  const form = document.querySelector('#form-create-issue');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org, selectedBoardId } = store.getState();

    const projectId = formData.get('projectId');
    const issueTypeKey = formData.get('issueTypeKey');
    const summary = formData.get('summary');
    const description = formData.get('description');
    const assigneeMemberId = formData.get('assigneeMemberId') || undefined;
    const sprintId = formData.get('sprintId') || undefined;
    const dueAt = formData.get('dueAt') || undefined;
    const priority = formData.get('priority') || 'Medium';
    const estimateHours = parseFloat(formData.get('estimateHours'));

    const originalEstimateSeconds = !isNaN(estimateHours) && estimateHours > 0
      ? Math.round(estimateHours * 3600)
      : undefined;

    try {
      store.setState({ loading: true });
      const newIssue = await request(`/organizations/${org}/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify({
          issueTypeKey,
          summary,
          description,
          assigneeMemberId,
          sprintId,
          dueAt,
          priority,
          originalEstimateSeconds,
        }),
      });

      closeModal();
      showToast(`Created issue ${newIssue.key}!`, 'success');

      await Promise.all([
        loadBoardData ? loadBoardData(request, store, selectedBoardId) : Promise.resolve(),
        loadBacklog ? loadBacklog(request, store) : Promise.resolve(),
        loadIssuesFn ? loadIssuesFn(request, store, store.getState().query) : Promise.resolve(),
      ]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}
