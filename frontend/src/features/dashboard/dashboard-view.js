import { escapeHtml, formatDate, formatSeconds } from '../../shared/utils/formatters.js';
import { renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderDashboardView(state) {
  const dashboards = state.dashboards || [];
  const currentDashboard = state.selectedDashboard || dashboards[0];
  const issues = state.issues || [];
  const sprints = state.sprints || [];
  const activeSprint = sprints.find(s => s.state === 'active');

  // Stats calculation
  const totalIssues = issues.length;
  const todoIssues = issues.filter(i => (i.state?.category || '').includes('todo') || (i.status || '').toLowerCase().includes('open') || (i.status || '').toLowerCase().includes('todo'));
  const inProgIssues = issues.filter(i => (i.state?.category || '').includes('progress') || (i.status || '').toLowerCase().includes('progress') || (i.status || '').toLowerCase().includes('review'));
  const doneIssues = issues.filter(i => (i.state?.category || '').includes('done') || i.resolvedAt || (i.status || '').toLowerCase().includes('done'));

  const todoPercent = totalIssues ? Math.round((todoIssues.length / totalIssues) * 100) : 0;
  const inProgPercent = totalIssues ? Math.round((inProgIssues.length / totalIssues) * 100) : 0;
  const donePercent = totalIssues ? Math.round((doneIssues.length / totalIssues) * 100) : 0;

  // Current user's issues
  const currentMember = state.members.find(m => m.userId === state.user?.id);
  const myIssues = currentMember ? issues.filter(i => i.assigneeMemberId === currentMember.id) : [];

  return `
    <div class="dashboard-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">ANALYTICS / REPORTS</p>
          <h2>${escapeHtml(currentDashboard?.name || 'Engineering Overview')}</h2>
        </div>

        <div class="header-actions">
          <div class="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1">
            <select id="dashboard-picker" class="select-clean">
              ${dashboards.map(d => `
                <option value="${d.id}" ${d.id === currentDashboard?.id ? 'selected' : ''}>
                  ${escapeHtml(d.name)}
                </option>
              `).join('')}
            </select>
          </div>
          <button class="button ghost btn-sm" id="btn-create-dashboard">
            ${renderIcon('plus', 'w-3.5 h-3.5')}
            <span>New Dashboard</span>
          </button>
          <button class="button primary btn-sm" id="btn-add-widget">
            ${renderIcon('plus', 'w-3.5 h-3.5')}
            <span>Add Widget</span>
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Widget 1: Quick Metric Cards -->
        <div class="dashboard-card metric-summary-card">
          <div class="metric-item">
            <span class="metric-label">Total Workload</span>
            <strong class="metric-val">${totalIssues}</strong>
            <span class="metric-sub">tracked issues</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">In Flight</span>
            <strong class="metric-val text-amber-400">${inProgIssues.length}</strong>
            <span class="metric-sub">in progress & review</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Completed</span>
            <strong class="metric-val text-emerald-400">${doneIssues.length}</strong>
            <span class="metric-sub">resolved tasks</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Completion Rate</span>
            <strong class="metric-val text-blue-400">${donePercent}%</strong>
            <span class="metric-sub">target delivery</span>
          </div>
        </div>

        <!-- Widget 2: Status Breakdown Chart -->
        <div class="dashboard-card widget-breakdown">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-white">Work Status Breakdown</h4>
            <span class="badge badge-status status-done text-[10px]">Live</span>
          </div>

          <div class="breakdown-bars-container">
            <div class="stacked-bar-track">
              <div class="bar-segment bar-done" style="width: ${donePercent}%;" title="Done: ${donePercent}%"></div>
              <div class="bar-segment bar-progress" style="width: ${inProgPercent}%;" title="In Progress: ${inProgPercent}%"></div>
              <div class="bar-segment bar-todo" style="width: ${todoPercent}%;" title="To Do: ${todoPercent}%"></div>
            </div>

            <div class="breakdown-legend">
              <div class="legend-item">
                <span class="legend-dot dot-done"></span>
                <span>Done (${doneIssues.length})</span>
                <strong class="text-white">${donePercent}%</strong>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-progress"></span>
                <span>In Progress (${inProgIssues.length})</span>
                <strong class="text-white">${inProgPercent}%</strong>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-todo"></span>
                <span>To Do (${todoIssues.length})</span>
                <strong class="text-white">${todoPercent}%</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget 3: Active Sprint Progress -->
        <div class="dashboard-card widget-sprint-health">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-white">Active Sprint Health</h4>
            <span class="badge ${activeSprint ? 'badge-status status-in_progress' : 'badge-status status-todo'} text-[10px]">${activeSprint ? 'Sprint Running' : 'No Sprint'}</span>
          </div>

          ${activeSprint ? `
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <strong class="text-sm font-bold text-white">${escapeHtml(activeSprint.name)}</strong>
                <span class="text-xs text-slate-400 font-mono">${formatDate(activeSprint.startAt)} → ${formatDate(activeSprint.endAt)}</span>
              </div>
              ${activeSprint.goal ? `<p class="text-xs text-slate-400 italic">"${escapeHtml(activeSprint.goal)}"</p>` : ''}

              <div class="grid grid-cols-3 gap-3 pt-2">
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                  <span class="text-[11px] text-slate-500 font-semibold">Sprint Issues</span>
                  <strong class="text-base font-bold text-white mt-1">${issues.filter(i => i.sprintId === activeSprint.id).length}</strong>
                </div>
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                  <span class="text-[11px] text-slate-500 font-semibold">Total Estimate</span>
                  <strong class="text-base font-bold text-white mt-1">${formatSeconds(issues.filter(i => i.sprintId === activeSprint.id).reduce((sum, i) => sum + (i.originalEstimateSeconds || 0), 0))}</strong>
                </div>
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                  <span class="text-[11px] text-slate-500 font-semibold">Time Logged</span>
                  <strong class="text-base font-bold text-blue-400 mt-1">${formatSeconds(issues.filter(i => i.sprintId === activeSprint.id).reduce((sum, i) => sum + (i.timeSpentSeconds || 0), 0))}</strong>
                </div>
              </div>
            </div>
          ` : `
            <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No sprint is currently active. Go to <strong>Backlog</strong> to start a sprint.
            </div>
          `}
        </div>

        <!-- Widget 4: My Assigned Issues -->
        <div class="dashboard-card widget-my-work">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-white">Assigned to Me (${myIssues.length})</h4>
          </div>

          <div class="space-y-2">
            ${myIssues.length ? myIssues.map(issue => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:bg-slate-800/40 cursor-pointer transition-colors" data-open-issue="${escapeHtml(issue.id)}">
                <div class="flex items-center gap-3 min-w-0">
                  ${renderTypeBadge(issue.issueType || 'Task')}
                  <span class="issue-key-link">${escapeHtml(issue.key)}</span>
                  <span class="text-xs text-slate-200 truncate font-medium">${escapeHtml(issue.summary)}</span>
                </div>
                ${renderStatusBadge(issue.state || 'Open')}
              </div>
            `).join('') : `
              <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                You have no open issues assigned. You're all caught up!
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}
