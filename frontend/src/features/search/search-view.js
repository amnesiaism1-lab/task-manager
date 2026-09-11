import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';

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
          <button class="button ghost" id="btn-save-current-filter">
            ★ Save Current View
          </button>
        </div>
      </div>

      <div class="search-toolbar-complex">
        <div class="search-main-input-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-explorer-input" class="search-explorer-input" placeholder="Search by summary, description, or issue key..." value="${escapeHtml(state.query)}" />
          <button class="button primary btn-sm" id="btn-run-explorer-search">Search</button>
        </div>

        <div class="filter-dropdowns-row">
          <div class="filter-group">
            <label for="filter-status-select" class="filter-label">Status:</label>
            <select id="filter-status-select" class="select-clean">
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-type-select" class="filter-label">Type:</label>
            <select id="filter-type-select" class="select-clean">
              <option value="">All Types</option>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-assignee-select" class="filter-label">Assignee:</label>
            <select id="filter-assignee-select" class="select-clean">
              <option value="">Anyone</option>
              <option value="current">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <button class="button ghost btn-sm" id="btn-reset-filters">Reset</button>
        </div>
      </div>

      <!-- Search Content Layout -->
      <div class="search-content-layout">
        <!-- Results Table -->
        <div class="search-results-panel">
          <div class="panel-header-row">
            <div class="results-count">
              <strong>${issues.length}</strong> matching issues
            </div>
            <button class="icon-button" id="btn-refresh-search" title="Refresh search">↻</button>
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
                    <td colspan="7" class="table-empty-row">No issues found matching your filters.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Saved Filters Sidebar -->
        <div class="saved-filters-sidebar">
          <div class="sidebar-box">
            <div class="sidebar-box-header">
              <h4>Saved Filters (${filters.length})</h4>
            </div>
            <div class="saved-filters-list">
              ${filters.length ? filters.map(f => `
                <div class="saved-filter-item">
                  <button class="filter-item-btn" data-apply-filter="${escapeHtml(f.id)}">
                    <span class="filter-star">★</span>
                    <span class="filter-name">${escapeHtml(f.name)}</span>
                  </button>
                  <button class="icon-button btn-share-filter" data-share-filter="${escapeHtml(f.id)}" title="Share filter">↗</button>
                </div>
              `).join('') : `
                <div class="empty-hint-text">No saved filters yet. Save your favorite query views for fast access.</div>
              `}
            </div>
          </div>

          <div class="sidebar-box protocol-box">
            <h4>Query AST Visualizer</h4>
            <p class="muted-small">Jira-like safe parameter-bound AST compiler prevents SQL injection and enforces tenant boundaries.</p>
            <pre class="code-ast-preview"><code>${escapeHtml(JSON.stringify(state.query ? { field: 'summary', op: 'contains', value: state.query } : { and: [{ field: 'orgId', op: 'eq', value: state.org }] }, null, 2))}</code></pre>
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
        <strong class="issue-table-summary">${escapeHtml(issue.summary)}</strong>
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
      <td class="text-muted">
        ${formatDate(issue.updatedAt || issue.createdAt)}
      </td>
    </tr>
  `;
}
