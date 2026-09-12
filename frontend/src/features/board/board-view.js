import { escapeHtml, formatSeconds } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderTypeBadge } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderBoardView(state) {
  const board = state.boardData?.board;
  const columns = state.boardData?.columns || [];
  const selectedProject = state.projects.find(p => p.id === state.selectedProjectId);

  if (!state.selectedProjectId) {
    return `
      <div class="empty-state-view flex flex-col items-center justify-center p-16 text-center">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
          ${renderIcon('folder', 'w-8 h-8')}
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Select a project to load its board</h2>
        <p class="text-sm text-slate-400 max-w-md">Every project in your organization has dedicated Kanban or Scrum boards to manage workflow progression.</p>
      </div>
    `;
  }

  return `
    <div class="board-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">${escapeHtml(selectedProject?.key || 'PROJECT')} / BOARDS</p>
          <h2>${escapeHtml(board?.name || 'Agile Board')}</h2>
        </div>

        <div class="board-top-controls flex items-center gap-3 flex-wrap">
          <div class="board-selector-wrap bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1">
            <label for="board-picker" class="sr-only">Board</label>
            <select id="board-picker" class="select-clean">
              ${state.boards.map(b => `
                <option value="${b.id}" ${b.id === board?.id ? 'selected' : ''}>
                  ${escapeHtml(b.name)} (${b.boardType.toUpperCase()})
                </option>
              `).join('')}
            </select>
          </div>

          <button class="button ghost btn-sm" id="btn-create-board" title="Create a new board in this project">
            ${renderIcon('plus', 'w-3.5 h-3.5')}
            <span>New Board</span>
          </button>
          <button class="button ghost btn-sm" id="btn-add-column" title="Add a column to this board">
            ${renderIcon('plus', 'w-3.5 h-3.5')}
            <span>Add Column</span>
          </button>
        </div>
      </div>

      <div class="board-toolbar">
        <div class="filter-chips">
          <button class="filter-chip ${state.boardFilter === 'all' || !state.boardFilter ? 'active' : ''}" data-board-filter="all">
            All Issues
          </button>
          <button class="filter-chip ${state.boardFilter === 'my' ? 'active' : ''}" data-board-filter="my">
            Assigned to Me
          </button>
          <button class="filter-chip ${state.boardFilter === 'recent' ? 'active' : ''}" data-board-filter="recent">
            Recently Updated
          </button>
        </div>

        <div class="board-meta-info">
          <span class="count-badge">${columns.reduce((sum, col) => sum + (col.issues?.length || 0), 0)} issues on board</span>
        </div>
      </div>

      ${!board ? `
        <div class="empty-state-view flex flex-col items-center justify-center p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div class="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            ${renderIcon('board', 'w-7 h-7')}
          </div>
          <h3 class="text-lg font-bold text-white mb-2">No board found for this project</h3>
          <p class="text-sm text-slate-400 max-w-md mb-6">Create your first Kanban or Scrum board to start tracking work visually.</p>
          <button class="button primary" id="btn-create-first-board">
            ${renderIcon('plus', 'w-4 h-4')}
            <span>Create First Board</span>
          </button>
        </div>
      ` : `
        <div class="kanban-columns-scroller">
          <div class="kanban-columns-track">
            ${columns.map(column => renderColumn(column, state)).join('')}
          </div>
        </div>
      `}
    </div>
  `;
}

function renderColumn(column, state) {
  let issues = column.issues || [];

  // Filter issues based on board filter
  if (state.boardFilter === 'my') {
    const currentMemberId = state.members.find(m => m.userId === state.user?.id)?.id;
    if (currentMemberId) {
      issues = issues.filter(i => i.assigneeMemberId === currentMemberId);
    }
  } else if (state.boardFilter === 'recent') {
    const twoDaysAgo = Date.now() - 2 * 86400000;
    issues = issues.filter(i => new Date(i.updatedAt).getTime() > twoDaysAgo);
  }

  const count = issues.length;
  const isOverLimit = column.wipLimit && count > column.wipLimit;
  const limitText = column.wipLimit ? `${count} / ${column.wipLimit}` : `${count}`;

  return `
    <div class="kanban-column ${isOverLimit ? 'over-wip' : ''}" data-column-id="${column.id}">
      <div class="column-header">
        <div class="column-title-group flex items-center gap-2">
          <span class="column-name">${escapeHtml(column.name)}</span>
          <span class="column-count-badge ${isOverLimit ? 'badge-danger' : ''}" title="${isOverLimit ? 'WIP limit exceeded!' : 'Issue count'}">
            ${limitText}
          </span>
        </div>
        <div class="column-actions">
          <button class="icon-button btn-col-settings" data-edit-column="${column.id}" title="Edit column WIP limit">
            ${renderIcon('dotsVertical', 'w-4 h-4')}
          </button>
        </div>
      </div>

      <div class="column-cards-container" data-droppable-column="${column.id}">
        ${issues.length ? issues.map(issue => renderBoardCard(issue, state)).join('') : `
          <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl my-auto">
            No issues in column
          </div>
        `}
      </div>
    </div>
  `;
}

function renderBoardCard(issue, state) {
  const assigneeMember = state.members.find(m => m.id === issue.assigneeMemberId);
  const estimateText = issue.originalEstimateSeconds ? formatSeconds(issue.originalEstimateSeconds) : '';

  return `
    <div class="board-card" data-issue-id="${escapeHtml(issue.id)}" draggable="true">
      <div class="card-top-row">
        <div class="card-key-wrap">
          <span class="card-drag-handle opacity-60 hover:opacity-100 cursor-grab" title="Drag to move card">
            ${renderIcon('dragHandle', 'w-3.5 h-3.5 text-slate-500')}
          </span>
          ${renderTypeBadge(issue.issueType || 'Task')}
          <span class="card-key">${escapeHtml(issue.key)}</span>
        </div>
        ${renderPriorityBadge(issue.priority || 'Medium')}
      </div>

      <h4 class="card-summary">${escapeHtml(issue.summary)}</h4>

      <div class="card-bottom-row">
        <div class="card-meta">
          ${estimateText ? `
            <span class="estimate-pill" title="Estimated time">
              ${renderIcon('clock', 'w-3 h-3 text-slate-400')}
              <span>${estimateText}</span>
            </span>
          ` : ''}
          ${issue.dueAt ? `
            <span class="due-pill ${new Date(issue.dueAt) < new Date() ? 'overdue' : ''}" title="Due date">
              ${renderIcon('calendar', 'w-3 h-3')}
              <span>${new Date(issue.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </span>
          ` : ''}
        </div>

        <div class="card-assignee">
          ${renderAvatar(assigneeMember ? { fullName: assigneeMember.fullName } : 'Unassigned', 'sm')}
        </div>
      </div>
    </div>
  `;
}
