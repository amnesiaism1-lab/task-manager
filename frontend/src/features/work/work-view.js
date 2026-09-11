import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderAvatar, renderPriorityBadge, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';

export function renderWorkView(state) {
  const issues = state.issues || [];
  const currentMember = state.members.find(m => m.userId === state.user?.id);
  const myIssues = currentMember ? issues.filter(i => i.assigneeMemberId === currentMember.id) : issues;
  const recentIssues = [...issues].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 10);

  return `
    <div class="work-view-container">
      <div class="work-hero-banner">
        <div class="hero-left">
          <p class="eyebrow warm">WORKSPACE / CONTROL CENTER</p>
          <h2>Welcome back, ${escapeHtml(state.user?.fullName?.split(' ')[0] || 'Engineer')} 👋</h2>
          <p class="muted">Here is your team's current focus, active sprint handoffs, and issues requiring your review.</p>
        </div>
        <div class="hero-stats-group">
          <div class="hero-stat-box">
            <strong>${myIssues.length}</strong>
            <span>Assigned to you</span>
          </div>
          <div class="hero-stat-box">
            <strong>${state.projects.length}</strong>
            <span>Projects active</span>
          </div>
        </div>
      </div>

      <div class="work-layout-grid">
        <!-- Main Column: Assigned Issues & Stream -->
        <div class="work-main-column">
          <div class="panel-box">
            <div class="panel-box-head">
              <h4>Assigned to Me (${myIssues.length})</h4>
              <button class="button primary btn-sm" id="btn-quick-create-work">+ New Issue</button>
            </div>

            <div class="work-issues-list">
              ${myIssues.length ? myIssues.map(issue => renderWorkIssueItem(issue, state)).join('') : `
                <div class="empty-hint-text">No issues currently assigned to you. Grab one from the Board or Backlog!</div>
              `}
            </div>
          </div>

          <div class="panel-box">
            <div class="panel-box-head">
              <h4>Recent Project Activity</h4>
            </div>
            <div class="work-issues-list">
              ${recentIssues.map(issue => renderWorkIssueItem(issue, state)).join('')}
            </div>
          </div>
        </div>

        <!-- Side Stack: Shortcuts & Guidelines -->
        <div class="work-side-column">
          <div class="panel-box shortcut-panel">
            <h4>Quick Navigation</h4>
            <div class="shortcut-buttons">
              <button class="shortcut-btn" data-nav-view="boards">
                <span class="btn-icon">▥</span>
                <div class="btn-text">
                  <strong>Kanban & Scrum Boards</strong>
                  <small>Move and transition active cards</small>
                </div>
              </button>
              <button class="shortcut-btn" data-nav-view="backlog">
                <span class="btn-icon">▤</span>
                <div class="btn-text">
                  <strong>Scrum Backlog</strong>
                  <small>Plan sprints and story estimates</small>
                </div>
              </button>
              <button class="shortcut-btn" data-nav-view="filters">
                <span class="btn-icon">◇</span>
                <div class="btn-text">
                  <strong>Filter Library</strong>
                  <small>Query issues with AST filters</small>
                </div>
              </button>
            </div>
          </div>

          <div class="panel-box audit-highlight-box">
            <p class="eyebrow">TRANSACTIONAL AUDITING</p>
            <h4>Optimistic Locking Active</h4>
            <p class="muted-small">Every issue transition checks expected versions to prevent concurrent collision. Audit logs are committed in the same database transaction.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWorkIssueItem(issue, state) {
  const assigneeMember = state.members.find(m => m.id === issue.assigneeMemberId);

  return `
    <div class="work-issue-row" data-open-issue="${escapeHtml(issue.id)}">
      <div class="issue-main-info">
        <div class="issue-badges-row">
          ${renderTypeBadge(issue.issueType || 'Task')}
          <span class="issue-key-tag">${escapeHtml(issue.key)}</span>
          ${renderPriorityBadge(issue.priority || 'Medium')}
        </div>
        <h5 class="issue-title-text">${escapeHtml(issue.summary)}</h5>
      </div>

      <div class="issue-right-meta">
        ${renderStatusBadge(issue.state || issue.status || 'Open')}
        <span class="issue-date-text">${formatDate(issue.updatedAt || issue.createdAt)}</span>
        ${renderAvatar(assigneeMember ? { fullName: assigneeMember.fullName } : 'Unassigned', 'xs')}
      </div>
    </div>
  `;
}
