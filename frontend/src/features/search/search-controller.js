import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';
import { escapeHtml } from '../../shared/utils/formatters.js';
import { loadIssues } from '../issue/issue-controller.js';

export async function loadFilters() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const filters = await request(`/organizations/${org}/filters`);
    store.setState({ filters: filters || [] });
  } catch (err) {
    console.warn('Could not load filters:', err.message);
  }
}

export function bindSearchEvents() {
  const explorerInput = document.querySelector('#search-explorer-input');
  const runBtn = document.querySelector('#btn-run-explorer-search');

  const executeSearch = () => {
    const q = explorerInput?.value || '';
    store.setState({ query: q });
    loadIssues(q);
  };

  runBtn?.addEventListener('click', executeSearch);
  explorerInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });

  // Quick saved filter clicks
  document.querySelectorAll('[data-filter-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const filterId = btn.dataset.filterId;
      const { org } = store.getState();
      try {
        const filter = await request(`/organizations/${org}/filters/${filterId}`);
        let qText = '';
        try {
          const ast = JSON.parse(filter.queryText);
          qText = ast.value || ast.field || '';
        } catch {
          qText = filter.queryText;
        }
        if (explorerInput) explorerInput.value = qText;
        store.setState({ query: qText });
        await loadIssues(qText);
        showToast(`Loaded filter "${filter.name}"`, 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Save current filter button
  document.querySelector('#btn-save-current-filter')?.addEventListener('click', () => {
    const q = store.getState().query;
    openSaveFilterModal(q);
  });
}

export function openSaveFilterModal(queryText) {
  const contentHtml = `
    <form id="form-save-filter" class="space-y-4">
      <div>
        <label for="filter-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Filter Name</label>
        <input id="filter-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. My Urgent Bugs" required />
      </div>
      <div>
        <label for="filter-modal-query" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Query String / AST</label>
        <input id="filter-modal-query" name="query" value="${escapeHtml(queryText || '')}" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" required />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Save Filter</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Save Current Filter',
    subtitle: 'Save search parameters for quick access',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-save-filter');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org } = store.getState();

    try {
      await request(`/organizations/${org}/filters`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          queryText: JSON.stringify({ field: 'q', op: 'contains', value: formData.get('query') }),
        }),
      });

      closeModal();
      showToast('Filter saved to library', 'success');
      await loadFilters();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
