import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';

export async function loadJobs() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const jobs = await request(`/organizations/${org}/jobs`);
    store.setState({ jobs: jobs || [] });
  } catch (err) {
    console.warn('Could not load jobs:', err.message);
  }
}

export function bindJobsEvents() {
  // Trigger reconciliation
  document.querySelector('#btn-trigger-reconciliation')?.addEventListener('click', async () => {
    const { org } = store.getState();
    try {
      store.setState({ loading: true });
      await request(`/organizations/${org}/jobs`, {
        method: 'POST',
        body: JSON.stringify({
          jobType: 'reconciliation',
          payload: { scope: 'full_integrity_check' },
        }),
      });
      showToast('Reconciliation job started', 'success');
      await loadJobs();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });

  // Cancel job
  document.querySelectorAll('.btn-cancel-job').forEach(btn => {
    btn.addEventListener('click', async () => {
      const jobId = btn.dataset.jobId;
      const { org } = store.getState();
      try {
        await request(`/organizations/${org}/jobs/${jobId}/cancel`, { method: 'POST' });
        showToast('Job cancelled', 'info');
        await loadJobs();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}
