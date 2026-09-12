import { escapeHtml, formatDateTime } from '../../shared/utils/formatters.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderJobsView(state) {
  const jobs = state.jobs || [];

  return `
    <div class="jobs-view-container space-y-6">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">OPERATIONS & WORKER</p>
          <h2>Background Jobs & Reconciliation</h2>
        </div>
        <div class="header-actions">
          <button class="button primary btn-sm" id="btn-trigger-reconciliation">
            ${renderIcon('play', 'w-3.5 h-3.5')}
            <span>Run Reconciliation Job</span>
          </button>
        </div>
      </div>

      <p class="text-sm text-slate-400 max-w-3xl leading-relaxed">
        Observable, cancellable long-running processes executed by dedicated worker daemons with distributed leases and automatic retry policies.
      </p>

      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-3">
        <div class="space-y-3">
          ${jobs.length ? jobs.map(j => `
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3">
                <span class="badge badge-status status-${j.status === 'completed' ? 'done' : (j.status === 'running' || j.status === 'pending') ? 'in_progress' : 'danger'} text-[10px]">
                  ${j.status.toUpperCase()}
                </span>
                <strong class="text-xs font-bold text-white font-mono">${escapeHtml(j.jobType.toUpperCase())}</strong>
              </div>

              <div class="flex-1 max-w-xs space-y-1">
                <div class="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Progress</span>
                  <span class="font-mono text-white">${j.progress || 0}%</span>
                </div>
                <div class="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div class="h-full bg-blue-500 transition-all duration-300" style="width: ${j.progress || 0}%;"></div>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 font-mono">
                Started: ${formatDateTime(j.createdAt)} · Attempts: ${j.attempts || 0}
              </div>

              <div>
                ${(j.status === 'pending' || j.status === 'running') ? `
                  <button class="button danger btn-xs btn-cancel-job" data-job-id="${j.id}">Cancel</button>
                ` : ''}
              </div>

              ${j.lastError ? `
                <div class="w-full text-xs text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/40 flex items-center gap-2">
                  ${renderIcon('alertCircle', 'w-3.5 h-3.5 shrink-0')}
                  <span>${escapeHtml(j.lastError)}</span>
                </div>
              ` : ''}
            </div>
          `).join('') : `
            <div class="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No background jobs currently running or queued.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
