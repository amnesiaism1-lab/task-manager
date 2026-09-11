import { escapeHtml, formatDateTime } from '../../shared/utils/formatters.js';

export function renderJobsView(state) {
  const jobs = state.jobs || [];

  return `
    <div class="jobs-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">OPERATIONS & WORKER</p>
          <h2>Background Jobs & Reconciliation</h2>
        </div>
        <div class="header-actions">
          <button class="button primary" id="btn-trigger-reconciliation">
            ▶ Run Reconciliation Job
          </button>
        </div>
      </div>

      <p class="section-lead-text">
        Observable, cancellable long-running processes executed by dedicated worker daemons with distributed leases and automatic retry policies.
      </p>

      <div class="jobs-panel-card">
        <div class="jobs-list">
          ${jobs.length ? jobs.map(j => `
            <div class="job-item">
              <div class="job-status-col">
                <span class="badge badge-status status-${j.status === 'completed' ? 'done' : (j.status === 'running' || j.status === 'pending') ? 'in_progress' : 'danger'}">
                  ${j.status.toUpperCase()}
                </span>
              </div>

              <div class="job-info-col">
                <strong>${escapeHtml(j.jobType.toUpperCase())}</strong>
                <div class="job-progress-row">
                  <div class="progress-bar-track progress-sm">
                    <div class="progress-bar-fill" style="width: ${j.progress || 0}%;"></div>
                  </div>
                  <span class="progress-num">${j.progress || 0}%</span>
                </div>
                <small class="muted-small">Started: ${formatDateTime(j.createdAt)} · Attempts: ${j.attempts || 0}</small>
                ${j.lastError ? `<p class="job-error-text">⚠️ ${escapeHtml(j.lastError)}</p>` : ''}
              </div>

              <div class="job-action-col">
                ${(j.status === 'pending' || j.status === 'running') ? `
                  <button class="button danger btn-sm btn-cancel-job" data-job-id="${j.id}">Cancel</button>
                ` : ''}
              </div>
            </div>
          `).join('') : `
            <div class="empty-hint-text">No background jobs currently running or queued.</div>
          `}
        </div>
      </div>
    </div>
  `;
}
