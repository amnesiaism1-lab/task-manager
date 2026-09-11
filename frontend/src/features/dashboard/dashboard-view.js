import { escapeHtml, formatDate, formatSeconds } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';

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
          <select id="dashboard-picker" class="select-clean">
            ${dashboards.map(d => `
              <option value="${d.id}" ${d.id === currentDashboard?.id ? 'selected' : ''}>
                ${escapeHtml(d.name)}
              </option>
            `).join('')}
          </select>
          <button class="button ghost" id="btn-create-dashboard">+ New Dashboard</button>
          <button class="button primary" id="btn-add-widget">+ Add Widget</button>
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
            <strong class="metric-val text-amber">${inProgIssues.length}</strong>
            <span class="metric-sub">in progress & review</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Completed</span>
            <strong class="metric-val text-green">${doneIssues.length}</strong>
            <span class="metric-sub">resolved tasks</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Completion Rate</span>
            <strong class="metric-val text-blue">${donePercent}%</strong>
            <span class="metric-sub">target delivery</span>
          </div>
        </div>

        <!-- Widget 2: Status Breakdown Chart -->
        <div class="dashboard-card widget-breakdown">
          <div class="card-header">
            <h4>Work Status Breakdown</h4>
            <span class="card-badge">Live</span>
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
                <strong>${donePercent}%</strong>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-progress"></span>
                <span>In Progress (${inProgIssues.length})</span>
                <strong>${inProgPercent}%</strong>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-todo"></span>
                <span>To Do (${todoIssues.length})</span>
                <strong>${todoPercent}%</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget 3: Active Sprint Progress -->
        <div class="dashboard-card widget-sprint-health">
          <div class="card-header">
            <h4>Active Sprint Health</h4>
            <span class="card-badge">${activeSprint ? 'Sprint Running' : 'No Sprint'}</span>
          </div>

          ${activeSprint ? `
            <div class="sprint-health-content">
              <div class="sprint-name-row">
                <strong>${escapeHtml(activeSprint.name)}</strong>
                <span class="sprint-date-badge">${formatDate(activeSprint.startAt)} → ${formatDate(activeSprint.endAt)}</span>
              </div>
              ${activeSprint.goal ? `<p class="sprint-goal-text">🎯 <em>${escapeHtml(activeSprint.goal)}</em></p>` : ''}

              <div class="sprint-metrics-list">
                <div class="metric-mini">
                  <span>Sprint Issues</span>
                  <strong>${issues.filter(i => i.sprintId === activeSprint.id).length}</strong>
                </div>
                <div class="metric-mini">
                  <span>Total Estimate</span>
                  <strong>${formatSeconds(issues.filter(i => i.sprintId === activeSprint.id).reduce((sum, i) => sum + (i.originalEstimateSeconds || 0), 0))}</strong>
                </div>
                <div class="metric-mini">
                  <span>Time Logged</span>
                  <strong>${formatSeconds(issues.filter(i => i.sprintId === activeSprint.id).reduce((sum, i) => sum + (i.timeSpentSeconds || 0), 0))}</strong>
                </div>
              </div>
            </div>
          ` : `
            <div class="empty-widget-state">
              <p class="muted">No sprint is currently active. Go to <strong>Backlog</strong> to start a sprint.</p>
            </div>
          `}
        </div>

        <!-- Widget 4: My Assigned Issues -->
        <div class="dashboard-card widget-my-work">
          <div class="card-header">
            <h4>Assigned to Me (${myIssues.length})</h4>
          </div>

          <div class="my-work-list">
            ${myIssues.length ? myIssues.map(issue => `
              <div class="my-work-item" data-open-issue="${escapeHtml(issue.id)}">
                <div class="work-item-key">
                  ${renderTypeBadge(issue.issueType || 'Task')}
                  <span class="issue-key-link">${escapeHtml(issue.key)}</span>
                </div>
                <span class="work-item-summary">${escapeHtml(issue.summary)}</span>
                ${renderStatusBadge(issue.state || 'Open')}
              </div>
            `).join('') : `
              <div class="empty-widget-state">
                <p class="muted">You have no open issues assigned. You're all caught up!</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}
