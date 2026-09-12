import { escapeHtml, formatDate, formatSeconds } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderBacklogView(state) {
  const selectedProject = state.projects.find(p => p.id === state.selectedProjectId);
  const sprints = state.sprints || [];
  const activeSprint = sprints.find(s => s.state === 'active');
  const plannedSprints = sprints.filter(s => s.state === 'planned');
  const backlogIssues = state.backlog || [];

  if (!state.selectedProjectId) {
    return `
      <div class="empty-state-view flex flex-col items-center justify-center p-16 text-center">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
          ${renderIcon('folder', 'w-8 h-8')}
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Select a project to manage its backlog & sprints</h2>
        <p class="text-sm text-slate-400 max-w-md">Scrum teams plan work in time-boxed sprints before moving issues to the board.</p>
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
            ${renderIcon('plus', 'w-4 h-4')}
            <span>Create Sprint</span>
          </button>
        </div>
      </div>

      <div class="sprints-planning-area">
        ${activeSprint ? renderSprintSection(activeSprint, state, true) : `
          <div class="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
            <div>
              <strong class="text-sm font-bold text-white block">No active sprint right now.</strong>
              <p class="text-xs text-slate-400">Start a planned sprint below to track progress on your Scrum board.</p>
            </div>
          </div>
        `}

        ${plannedSprints.map(s => renderSprintSection(s, state, false)).join('')}

        <!-- Backlog Section -->
        <div class="backlog-container bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div class="p-4 sm:p-5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3">
              <h3 class="text-base font-bold text-white">Backlog</h3>
              <span class="count-badge">${backlogIssues.length} issues</span>
            </div>
            <button class="button ghost btn-sm" id="btn-quick-create-issue">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Add Issue to Backlog</span>
            </button>
          </div>

          <div class="backlog-issues-list p-3 space-y-1.5" data-droppable-sprint="">
            ${backlogIssues.length ? backlogIssues.map(issue => renderBacklogRow(issue, state, sprints)).join('') : `
              <div class="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Your backlog is empty. Click <strong>+ Add Issue to Backlog</strong> or use the top <strong>Create</strong> button.
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSprintSection(sprint, state, isActive) {
  const sprintIssues = (state.issues || []).filter(i => i.sprintId === sprint.id);
  const totalEstimate = sprintIssues.reduce((sum, i) => sum + (i.originalEstimateSeconds || 0), 0);

  return `
    <div class="sprint-card ${isActive ? 'sprint-active' : 'sprint-planned'}" data-sprint-id="${sprint.id}">
      <div class="sprint-card-header">
        <div class="sprint-info-left">
          <div class="sprint-title-row flex items-center gap-2.5">
            <h3 class="sprint-name">${escapeHtml(sprint.name)}</h3>
            <span class="badge ${isActive ? 'badge-status status-in_progress' : 'badge-status status-todo'}">${sprint.state.toUpperCase()}</span>
          </div>
          ${sprint.goal ? `<p class="text-xs text-slate-400 mt-1"><span class="font-semibold text-slate-300">Goal:</span> ${escapeHtml(sprint.goal)}</p>` : ''}
          <div class="sprint-dates text-xs text-slate-500 mt-1">
            ${sprint.startAt ? `<span>Started: ${formatDate(sprint.startAt)}</span>` : ''}
            ${sprint.endAt ? `<span>Ends: ${formatDate(sprint.endAt)}</span>` : ''}
          </div>
        </div>

        <div class="sprint-actions-right">
          <span class="estimate-pill" title="Total estimated hours">
            ${renderIcon('clock', 'w-3 h-3 text-slate-400')}
            <span>${formatSeconds(totalEstimate)}</span>
          </span>
          <span class="count-badge">${sprintIssues.length} issues</span>

          ${isActive ? `
            <button class="button ghost btn-sm btn-complete-sprint" data-sprint-id="${sprint.id}">
              Complete Sprint
            </button>
          ` : `
            <button class="button primary btn-sm btn-start-sprint" data-sprint-id="${sprint.id}">
              ${renderIcon('play', 'w-3.5 h-3.5')}
              <span>Start Sprint</span>
            </button>
          `}
        </div>
      </div>

      <div class="sprint-issues-list p-3 space-y-1.5" data-droppable-sprint="${sprint.id}">
        ${sprintIssues.length ? sprintIssues.map(issue => renderBacklogRow(issue, state, state.sprints || [])).join('') : `
          <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            Plan this sprint by dragging issues from the backlog below or selecting this sprint when creating an issue.
          </div>
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
        <span class="drag-handle opacity-60 hover:opacity-100" title="Drag to move between sprints or backlog">
          ${renderIcon('dragHandle', 'w-3.5 h-3.5 text-slate-500')}
        </span>
        ${renderTypeBadge(issue.issueType || 'Task')}
        <span class="issue-key-link" data-open-issue="${escapeHtml(issue.id)}">${escapeHtml(issue.key)}</span>
        <span class="issue-summary-text" data-open-issue="${escapeHtml(issue.id)}">${escapeHtml(issue.summary)}</span>
      </div>

      <div class="row-right">
        ${renderStatusBadge(issue.state || issue.status || 'Open')}
        ${renderPriorityBadge(issue.priority || 'Medium')}
        ${issue.originalEstimateSeconds ? `
          <span class="estimate-pill">
            ${renderIcon('clock', 'w-3 h-3 text-slate-400')}
            <span>${formatSeconds(issue.originalEstimateSeconds)}</span>
          </span>
        ` : ''}
        ${renderAvatar(assigneeMember ? { fullName: assigneeMember.fullName } : 'Unassigned', 'xs')}

        <div class="row-sprint-actions">
          <select class="select-clean row-sprint-select text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1" data-assign-sprint-issue="${escapeHtml(issue.id)}" title="Move to sprint">
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
