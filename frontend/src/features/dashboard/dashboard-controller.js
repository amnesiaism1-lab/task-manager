import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';

export async function loadDashboards() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const dashboards = await request(`/organizations/${org}/dashboards`);
    store.setState({ dashboards: dashboards || [] });
  } catch (err) {
    console.warn('Could not load dashboards:', err.message);
  }
}

export function bindDashboardEvents() {
  document.querySelector('#dashboard-picker')?.addEventListener('change', (e) => {
    const dashId = e.target.value;
    const current = (store.getState().dashboards || []).find(d => d.id === dashId);
    store.setState({ selectedDashboard: current });
  });

  document.querySelector('#btn-create-dashboard')?.addEventListener('click', openCreateDashboardModal);
}

export function openCreateDashboardModal() {
  const contentHtml = `
    <form id="form-create-dash" class="space-y-4">
      <div>
        <label for="dash-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Dashboard Name</label>
        <input id="dash-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Sprint Performance" required />
      </div>
      <div>
        <label for="dash-modal-desc" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description</label>
        <textarea id="dash-modal-desc" name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary resize-y" rows="2" placeholder="Overview of team velocity and status counts"></textarea>
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Dashboard</button>
      </div>
    </form>
  `;

  openModal({
    title: 'New Dashboard',
    subtitle: 'Create customizable analytics views',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-dash');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(form));
    const { org } = store.getState();

    try {
      const newDash = await request(`/organizations/${org}/dashboards`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      closeModal();
      showToast('Dashboard created!', 'success');
      await loadDashboards();
      store.setState({ selectedDashboard: newDash });
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
