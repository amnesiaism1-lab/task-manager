import { escapeHtml, formatDate, formatSeconds } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';

export function renderBacklogView(state) {
  const selectedProject = state.projects.find(p => p.id === state.selectedProjectId);
  const sprints = state.sprints || [];
  const activeSprint = sprints.find(s => s.state === 'active');
  const plannedSprints = sprints.filter(s => s.state === 'planned');
  const backlogIssues = state.backlog || [];

  if (!state.selectedProjectId) {
    return `
      <div class="empty-state-view">
        <div class="empty-icon">📁</div>
        <h2>Select a project to manage its backlog & sprints</h2>
        <p class="muted">Scrum teams plan work in time-boxed sprints before moving issues to the board.</p>
      </div>
    `;
  }

  return `
    <div class="backlog-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">${escapeHtml(selectedProject?.key || 'PROJECT')} / PLANNING</p>
          <h2>Scrum Backlog & Sprints</h2>
        </div>
        <div class="header-actions">
          <button class="button primary" id="btn-create-sprint">
            + Create Sprint
          </button>
        </div>
      </div>

      <div class="sprints-planning-area">
        ${activeSprint ? renderSprintSection(activeSprint, state, true) : `
          <div class="no-active-sprint-banner">
            <div>
              <strong>No active sprint right now.</strong>
              <p class="muted">Start a planned sprint below to track progress on your Scrum board.</p>
            </div>
          </div>
        `}

        ${plannedSprints.map(s => renderSprintSection(s, state, false)).join('')}

        <!-- Backlog Section -->
        <div class="backlog-container">
          <div class="backlog-header">
            <div class="backlog-title-wrap">
              <h3>Backlog</h3>
              <span class="count-badge">${backlogIssues.length} issues</span>
            </div>
            <button class="button ghost btn-sm" id="btn-quick-create-issue">
              + Add Issue to Backlog
            </button>
          </div>

          <div class="backlog-issues-list" data-droppable-sprint="">
            ${backlogIssues.length ? backlogIssues.map(issue => renderBacklogRow(issue, state, sprints)).join('') : `
              <div class="empty-backlog-placeholder">
                <p>Your backlog is empty. Click <strong>+ Add Issue to Backlog</strong> or use the top <strong>Create</strong> button.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSprintSection(sprint, state, isActive) {
  // Find issues assigned to this sprint
  const sprintIssues = (state.issues || []).filter(i => i.sprintId === sprint.id);
  const totalEstimate = sprintIssues.reduce((sum, i) => sum + (i.originalEstimateSeconds || 0), 0);

  return `
    <div class="sprint-card ${isActive ? 'sprint-active' : 'sprint-planned'}" data-sprint-id="${sprint.id}">
      <div class="sprint-card-header">
        <div class="sprint-info-left">
          <div class="sprint-title-row">
            <span class="sprint-state-indicator ${sprint.state}"></span>
            <h3 class="sprint-name">${escapeHtml(sprint.name)}</h3>
            <span class="badge ${isActive ? 'badge-primary' : 'badge-neutral'}">${sprint.state.toUpperCase()}</span>
          </div>
          ${sprint.goal ? `<p class="sprint-goal"><span class="goal-label">Goal:</span> ${escapeHtml(sprint.goal)}</p>` : ''}
          <div class="sprint-dates">
            ${sprint.startAt ? `<span>Started: ${formatDate(sprint.startAt)}</span>` : ''}
            ${sprint.endAt ? `<span>Ends: ${formatDate(sprint.endAt)}</span>` : ''}
          </div>
        </div>

        <div class="sprint-actions-right">
          <span class="estimate-pill" title="Total estimated hours">⏱ ${formatSeconds(totalEstimate)}</span>
          <span class="count-badge">${sprintIssues.length} issues</span>

          ${isActive ? `
            <button class="button ghost btn-complete-sprint" data-sprint-id="${sprint.id}">
              Complete Sprint
            </button>
          ` : `
            <button class="button primary btn-start-sprint" data-sprint-id="${sprint.id}">
              Start Sprint
            </button>
          `}
        </div>
      </div>

      <div class="sprint-issues-list" data-droppable-sprint="${sprint.id}">
        ${sprintIssues.length ? sprintIssues.map(issue => renderBacklogRow(issue, state, state.sprints || [])).join('') : `
          <div class="sprint-empty-hint">Plan this sprint by dragging issues from the backlog below or selecting this sprint when creating an issue.</div>
        `}
      </div>
    </div>
  `;
}

function renderBacklogRow(issue, state, sprints) {
  const assigneeMember = state.members.find(m => m.id === issue.assigneeMemberId);
  const otherSprints = sprints.filter(s => s.id !== issue.sprintId && s.state !== 'closed');

  return `
    <div class="backlog-issue-row" draggable="true" data-issue-id="${escapeHtml(issue.id)}" data-current-sprint="${escapeHtml(issue.sprintId || '')}">
      <div class="row-left">
        <span class="drag-handle" title="Drag to move between sprints or backlog">⋮⋮</span>
        ${renderTypeBadge(issue.issueType || 'Task')}
        <span class="issue-key-link" data-open-issue="${escapeHtml(issue.id)}">${escapeHtml(issue.key)}</span>
        <span class="issue-summary-text" data-open-issue="${escapeHtml(issue.id)}">${escapeHtml(issue.summary)}</span>
      </div>

      <div class="row-right">
        ${renderStatusBadge(issue.state || issue.status || 'Open')}
        ${renderPriorityBadge(issue.priority || 'Medium')}
        ${issue.originalEstimateSeconds ? `<span class="estimate-pill">⏱ ${formatSeconds(issue.originalEstimateSeconds)}</span>` : ''}
        ${renderAvatar(assigneeMember ? { fullName: assigneeMember.fullName } : 'Unassigned', 'xs')}

        <div class="row-sprint-actions">
          <select class="select-clean row-sprint-select" data-assign-sprint-issue="${escapeHtml(issue.id)}" title="Move to sprint">
            <option value="">Move to...</option>
            ${issue.sprintId ? `<option value="__backlog__">Send to Backlog</option>` : ''}
            ${otherSprints.map(s => `
              <option value="${s.id}">${escapeHtml(s.name)} (${s.state})</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>
  `;
}
