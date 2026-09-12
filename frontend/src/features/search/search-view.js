import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderSearchView(state) {
  const issues = state.issues || [];
  const filters = state.filters || [];

  return `
    <div class="search-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">WORKSPACE / SEARCH & FILTERS</p>
          <h2>Filter Library & Issue Explorer</h2>
        </div>
        <div class="header-actions">
          <button class="button ghost btn-sm" id="btn-save-current-filter">
            ${renderIcon('star', 'w-3.5 h-3.5 text-amber-400')}
            <span>Save Current View</span>
          </button>
        </div>
      </div>

      <div class="search-toolbar-complex">
        <div class="search-main-input-wrap">
          <span class="search-icon text-slate-400">${renderIcon('search', 'w-4 h-4')}</span>
          <input type="text" id="search-explorer-input" class="search-explorer-input" placeholder="Search by summary, description, or issue key..." value="${escapeHtml(state.query)}" />
          <button class="button primary btn-sm" id="btn-run-explorer-search">Search</button>
        </div>

        <div class="filter-dropdowns-row">
          <div class="filter-group">
            <label for="filter-status-select" class="filter-label">Status:</label>
            <select id="filter-status-select" class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2.5 py-1">
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-type-select" class="filter-label">Type:</label>
            <select id="filter-type-select" class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2.5 py-1">
              <option value="">All Types</option>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-assignee-select" class="filter-label">Assignee:</label>
            <select id="filter-assignee-select" class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2.5 py-1">
              <option value="">Anyone</option>
              <option value="current">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <button class="button ghost btn-xs" id="btn-reset-filters">Reset</button>
        </div>
      </div>

      <!-- Search Content Layout -->
      <div class="search-content-layout">
        <!-- Results Table -->
        <div class="search-results-panel">
          <div class="flex items-center justify-between pb-3">
            <div class="text-xs text-slate-400">
              <strong class="text-white">${issues.length}</strong> matching issues
            </div>
            <button class="icon-button" id="btn-refresh-search" title="Refresh search">
              ${renderIcon('refresh', 'w-4 h-4')}
            </button>
          </div>

          <div class="issues-table-wrapper">
            <table class="issues-data-table">
              <thead>
                <tr>
                  <th style="width: 110px;">Key</th>
                  <th style="width: 100px;">Type</th>
                  <th>Summary</th>
                  <th style="width: 120px;">Status</th>
                  <th style="width: 110px;">Assignee</th>
                  <th style="width: 80px;">Priority</th>
                  <th style="width: 100px;">Updated</th>
                </tr>
              </thead>
              <tbody>
                ${issues.length ? issues.map(issue => renderIssueTableRow(issue, state)).join('') : `
                  <tr>
                    <td colspan="7" class="text-center py-8 text-slate-500 text-xs">No issues found matching your filters.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Saved Filters Sidebar -->
        <div class="saved-filters-sidebar space-y-4">
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Saved Filters (${filters.length})</h4>
            <div class="space-y-1.5">
              ${filters.length ? filters.map(f => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800/60 transition-colors">
                  <button class="flex items-center gap-2 text-xs text-slate-300 font-medium truncate" data-apply-filter="${escapeHtml(f.id)}">
                    ${renderIcon('star', 'w-3.5 h-3.5 text-amber-400 shrink-0')}
                    <span class="truncate">${escapeHtml(f.name)}</span>
                  </button>
                  <button class="icon-button text-slate-500 hover:text-white" data-share-filter="${escapeHtml(f.id)}" title="Share filter">
                    ${renderIcon('externalLink', 'w-3.5 h-3.5')}
                  </button>
                </div>
              `).join('') : `
                <div class="p-4 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  No saved filters yet. Save your favorite query views for fast access.
                </div>
              `}
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div class="flex items-center gap-2 text-blue-400 mb-1.5">
              ${renderIcon('code', 'w-4 h-4')}
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-0">Query AST Visualizer</h4>
            </div>
            <p class="muted-small mb-3 leading-relaxed">Jira-like safe parameter-bound AST compiler prevents SQL injection and enforces tenant boundaries.</p>
            <pre class="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-400 border border-slate-800/80 overflow-x-auto"><code>${escapeHtml(JSON.stringify(state.query ? { field: 'summary', op: 'contains', value: state.query } : { and: [{ field: 'orgId', op: 'eq', value: state.org }] }, null, 2))}</code></pre>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderIssueTableRow(issue, state) {
  const assigneeMember = state.members.find(m => m.id === issue.assigneeMemberId);

  return `
    <tr class="issue-table-row" data-open-issue="${escapeHtml(issue.id)}">
      <td>
        <span class="issue-key-link">${escapeHtml(issue.key)}</span>
      </td>
      <td>
        ${renderTypeBadge(issue.issueType || 'Task')}
      </td>
      <td>
        <strong class="text-slate-200 text-xs">${escapeHtml(issue.summary)}</strong>
      </td>
      <td>
        ${renderStatusBadge(issue.state || issue.status || 'Open')}
      </td>
      <td>
        ${renderAvatar(assigneeMember ? { fullName: assigneeMember.fullName } : 'Unassigned', 'xs')}
      </td>
      <td>
        ${renderPriorityBadge(issue.priority || 'Medium')}
      </td>
      <td class="text-slate-500 text-xs">
        ${formatDate(issue.updatedAt || issue.createdAt)}
      </td>
    </tr>
  `;
}
