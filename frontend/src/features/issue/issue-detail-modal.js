import { escapeHtml, formatDate, formatDateTime, formatSeconds, formatRelativeTime } from '../../shared/utils/formatters.js';
import { renderAvatar, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';

export function renderIssueDetailModal(issue, state) {
  const members = state.members || [];
  const issues = state.issues || [];

  const transitions = issue.transitions || [];
  const comments = issue.comments?.data || issue.comments || [];
  const workLogs = issue.workLogs?.data || issue.workLogs || [];
  const attachments = issue.attachments?.data || issue.attachments || [];
  const history = issue.history || [];
  const labels = issue.labels || [];
  const links = issue.links || [];
  const watchers = issue.watchers || [];

  const reporterMember = members.find(m => m.id === issue.reporterMemberId);

  // Time calculations
  const spent = issue.timeSpentSeconds || 0;
  const estimate = issue.originalEstimateSeconds || 0;
  const progressPercent = estimate > 0 ? Math.min(100, Math.round((spent / estimate) * 100)) : (spent > 0 ? 100 : 0);

  const activeTab = state.issueModalTab || 'comments';

  return `
    <div class="issue-detail-container" data-issue-id="${escapeHtml(issue.id)}" data-issue-version="${issue.version}">
      <!-- Modal Top Bar -->
      <div class="detail-topbar">
        <div class="topbar-left">
          ${renderTypeBadge(issue.issueType || 'Task')}
          <span class="detail-issue-key">${escapeHtml(issue.key)}</span>
        </div>

        <div class="topbar-right">
          <!-- Transitions Dropdown -->
          <div class="transition-control-wrap">
            <span class="control-label">Status:</span>
            <div class="transition-dropdown-group">
              ${renderStatusBadge(issue.state || issue.status || 'Open')}
              ${transitions.length ? `
                <select id="issue-transition-select" class="select-clean transition-select" aria-label="Change status">
                  <option value="">Move status...</option>
                  ${transitions.map(t => `
                    <option value="${escapeHtml(t.key)}">${escapeHtml(t.name)}</option>
                  `).join('')}
                </select>
              ` : '<span class="no-transitions-hint">(No further transitions)</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout: Left Content, Right Details Sidebar -->
      <div class="detail-main-layout">
        <!-- Left Section -->
        <div class="detail-left-pane">
          <!-- Summary Header (Inline Editable) -->
          <div class="editable-summary-wrap">
            <input type="text" id="detail-summary-input" class="input-inline-heading" value="${escapeHtml(issue.summary)}" title="Click to edit summary" />
          </div>

          <!-- Description Section -->
          <div class="detail-section">
            <div class="section-title-row">
              <h4>Description</h4>
            </div>
            <textarea id="detail-description-input" class="textarea-clean description-textarea" placeholder="Add a detailed description, reproduction steps, or specifications...">${escapeHtml(issue.description || '')}</textarea>
            <div class="description-actions">
              <button class="button primary btn-sm" id="btn-save-description">Save Details</button>
            </div>
          </div>

          <!-- Activity Tabs -->
          <div class="detail-tabs-section">
            <div class="detail-tab-nav">
              <button class="detail-tab ${activeTab === 'comments' ? 'active' : ''}" data-detail-tab="comments">
                Comments (${comments.length})
              </button>
              <button class="detail-tab ${activeTab === 'worklog' ? 'active' : ''}" data-detail-tab="worklog">
                Work Log (${workLogs.length})
              </button>
              <button class="detail-tab ${activeTab === 'attachments' ? 'active' : ''}" data-detail-tab="attachments">
                Attachments (${attachments.length})
              </button>
              <button class="detail-tab ${activeTab === 'links' ? 'active' : ''}" data-detail-tab="links">
                Links (${links.length})
              </button>
              <button class="detail-tab ${activeTab === 'history' ? 'active' : ''}" data-detail-tab="history">
                History (${history.length})
              </button>
            </div>

            <!-- Tab: Comments -->
            <div class="tab-pane ${activeTab === 'comments' ? 'active' : ''}" id="tab-comments">
              <form id="form-add-comment" class="add-comment-box">
                <textarea name="body" class="textarea-clean" placeholder="Add a comment... (Markdown supported)"></textarea>
                <div class="comment-actions">
                  <button type="submit" class="button primary btn-sm">Post Comment</button>
                </div>
              </form>

              <div class="comments-stream">
                ${comments.length ? comments.map(c => renderCommentItem(c, state)).join('') : `
                  <div class="empty-tab-hint">No comments yet. Be the first to add context.</div>
                `}
              </div>
            </div>

            <!-- Tab: Work Log -->
            <div class="tab-pane ${activeTab === 'worklog' ? 'active' : ''}" id="tab-worklog">
              <div class="worklog-progress-box">
                <div class="progress-labels">
                  <span>Logged: <strong>${formatSeconds(spent)}</strong></span>
                  <span>Original: <strong>${formatSeconds(estimate)}</strong></span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
                </div>
              </div>

              <div class="add-worklog-box">
                <form id="form-log-work" class="inline-form-grid">
                  <div class="form-field">
                    <label for="worklog-hours">Time (hours, e.g. 2.5)</label>
                    <input type="number" step="0.25" min="0.1" name="hours" id="worklog-hours" placeholder="1.5" required />
                  </div>
                  <div class="form-field">
                    <label for="worklog-comment">Work description</label>
                    <input type="text" name="comment" id="worklog-comment" placeholder="What did you work on?" />
                  </div>
                  <button type="submit" class="button primary btn-sm">Log Time</button>
                </form>
              </div>

              <div class="worklog-stream">
                ${workLogs.length ? workLogs.map(w => renderWorkLogItem(w, state)).join('') : `
                  <div class="empty-tab-hint">No work logged yet. Keep team progress visible by logging time.</div>
                `}
              </div>
            </div>

            <!-- Tab: Attachments -->
            <div class="tab-pane ${activeTab === 'attachments' ? 'active' : ''}" id="tab-attachments">
              <div class="upload-dropzone" id="attachment-dropzone">
                <span class="drop-icon">📎</span>
                <p>Drag files here or <label for="file-attachment-input" class="file-upload-label">browse to upload</label></p>
                <small class="muted">PNG, JPG, PDF, TXT up to 10MB</small>
                <input type="file" id="file-attachment-input" class="file-input-hidden" />
              </div>

              <div class="attachments-grid">
                ${attachments.length ? attachments.map(a => renderAttachmentItem(a, issue, state)).join('') : `
                  <div class="empty-tab-hint">No attachments uploaded.</div>
                `}
              </div>
            </div>

            <!-- Tab: Links -->
            <div class="tab-pane ${activeTab === 'links' ? 'active' : ''}" id="tab-links">
              <div class="add-link-box">
                <form id="form-link-issue" class="inline-form-grid">
                  <div class="form-field">
                    <label for="link-type-select">Relationship</label>
                    <select id="link-type-select" class="select-clean" required>
                      <option value="">Choose relationship...</option>
                      ${(state.linkTypes || []).map(lt => `
                        <option value="${lt.id}">${escapeHtml(lt.outwardLabel)} (${escapeHtml(lt.key)})</option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="form-field">
                    <label for="link-target-select">Target Issue</label>
                    <select id="link-target-select" class="select-clean" required>
                      <option value="">Select issue...</option>
                      ${issues.filter(i => i.id !== issue.id).map(i => `
                        <option value="${i.id}">${escapeHtml(i.key)} — ${escapeHtml(i.summary)}</option>
                      `).join('')}
                    </select>
                  </div>
                  <button type="submit" class="button primary btn-sm">Link Issue</button>
                </form>
              </div>

              <div class="links-stream">
                ${links.length ? links.map(l => renderLinkItem(l, issue, state)).join('') : `
                  <div class="empty-tab-hint">No linked issues. Connect dependencies or related stories here.</div>
                `}
              </div>
            </div>

            <!-- Tab: History -->
            <div class="tab-pane ${activeTab === 'history' ? 'active' : ''}" id="tab-history">
              <div class="history-stream">
                ${history.length ? history.map(h => renderHistoryItem(h, state)).join('') : `
                  <div class="empty-tab-hint">No transitions recorded yet.</div>
                `}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Details Sidebar -->
        <div class="detail-right-sidebar">
          <div class="sidebar-section">
            <h4 class="sidebar-section-title">Details</h4>

            <div class="detail-attribute-row">
              <span class="attr-label">Assignee</span>
              <div class="attr-value">
                <select id="detail-assignee-select" class="select-clean full-select">
                  <option value="">Unassigned</option>
                  ${members.filter(m => m.status === 'active').map(m => `
                    <option value="${m.id}" ${m.id === issue.assigneeMemberId ? 'selected' : ''}>
                      ${escapeHtml(m.fullName)}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Reporter</span>
              <div class="attr-value readonly-attr">
                ${renderAvatar(reporterMember ? { fullName: reporterMember.fullName } : 'Admin', 'xs')}
                <span>${escapeHtml(reporterMember?.fullName || 'Administrator')}</span>
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Sprint</span>
              <div class="attr-value">
                <select id="detail-sprint-select" class="select-clean full-select">
                  <option value="">No Sprint (Backlog)</option>
                  ${(state.sprints || []).filter(s => s.state !== 'closed').map(s => `
                    <option value="${s.id}" ${s.id === issue.sprintId ? 'selected' : ''}>
                      ${escapeHtml(s.name)} (${s.state})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Due Date</span>
              <div class="attr-value">
                <input type="date" id="detail-due-date" class="input-clean" value="${issue.dueAt ? new Date(issue.dueAt).toISOString().split('T')[0] : ''}" />
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Estimate</span>
              <div class="attr-value">
                <input type="number" step="0.5" id="detail-estimate-input" class="input-clean" placeholder="Hours" value="${issue.originalEstimateSeconds ? (issue.originalEstimateSeconds / 3600) : ''}" />
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Story Points</span>
              <div class="attr-value">
                <input type="number" step="1" id="detail-story-points-input" class="input-clean" placeholder="Pts (e.g. 5)" value="${issue.storyPoints !== null && issue.storyPoints !== undefined ? issue.storyPoints : ''}" />
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Watchers</span>
              <div class="attr-value">
                <button class="button ghost btn-sm" id="btn-toggle-watch">
                  👁 ${watchers.length} Watchers
                </button>
              </div>
            </div>

            <div class="detail-attribute-row">
              <span class="attr-label">Priority</span>
              <div class="attr-value">
                <select id="detail-priority-select" class="select-clean full-select">
                  <option value="Lowest" ${issue.priority === 'Lowest' ? 'selected' : ''}>Lowest</option>
                  <option value="Low" ${issue.priority === 'Low' ? 'selected' : ''}>Low</option>
                  <option value="Medium" ${!issue.priority || issue.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="High" ${issue.priority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Highest" ${issue.priority === 'Highest' ? 'selected' : ''}>Highest</option>
                </select>
              </div>
            </div>

            ${issue.component ? `
              <div class="detail-attribute-row">
                <span class="attr-label">Component</span>
                <span class="attr-value text-xs text-indigo-400 font-medium">${escapeHtml(issue.component.name || issue.component)}</span>
              </div>
            ` : ''}

            ${issue.fixVersion ? `
              <div class="detail-attribute-row">
                <span class="attr-label">Fix Version</span>
                <span class="attr-value text-xs text-emerald-400 font-medium">${escapeHtml(issue.fixVersion.name || issue.fixVersion)}</span>
              </div>
            ` : ''}

            <div class="detail-attribute-row labels-row">
              <span class="attr-label">Labels</span>
              <div class="attr-value">
                <div class="tags-container">
                  ${labels.map(l => `<span class="label-chip">${escapeHtml(l.name)}</span>`).join('')}
                </div>
                <form id="form-add-label" class="inline-tag-form">
                  <input type="text" id="new-label-name" placeholder="+ label" class="input-clean input-xs" />
                </form>
              </div>
            </div>

            ${(state.customFields || []).length > 0 ? `
              <div class="pt-3 mt-3 border-t border-slate-800/80">
                <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Fields</div>
                ${(state.customFields || []).map(cf => {
                  const valObj = (issue.customFieldValues || []).find(v => v.customFieldId === cf.id);
                  const displayVal = valObj ? (valObj.stringValue || valObj.numberValue || valObj.option?.label || valObj.dateValue || 'Not set') : 'Not set';
                  return `
                    <div class="detail-attribute-row py-1">
                      <span class="attr-label text-slate-400 text-xs">${escapeHtml(cf.name)}</span>
                      <span class="attr-value text-xs text-slate-300 font-medium">${escapeHtml(String(displayVal))}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}

            <div class="detail-attribute-row pt-4 mt-4 border-t border-slate-800">
              <button type="button" id="btn-delete-issue" class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 rounded transition-colors" title="Soft-delete this issue from project">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCommentItem(comment, state) {
  const author = (state.members || []).find(m => m.id === comment.authorMemberId);
  const isAuthor = state.user && author?.userId === state.user.id;

  return `
    <div class="comment-card" data-comment-id="${comment.id}">
      <div class="comment-head">
        <div class="comment-author-info">
          ${renderAvatar(author ? { fullName: author.fullName } : 'Member', 'xs')}
          <strong>${escapeHtml(author?.fullName || 'Team Member')}</strong>
          <span class="comment-timestamp">${formatRelativeTime(comment.createdAt)}</span>
        </div>
        ${isAuthor ? `
          <button class="icon-button btn-delete-comment" data-comment-id="${comment.id}" title="Delete comment">×</button>
        ` : ''}
      </div>
      <div class="comment-body">
        ${escapeHtml(comment.body)}
      </div>
    </div>
  `;
}

function renderWorkLogItem(log, state) {
  const author = (state.members || []).find(m => m.id === log.authorMemberId);

  return `
    <div class="worklog-card">
      <div class="worklog-head">
        <div class="worklog-author">
          ${renderAvatar(author ? { fullName: author.fullName } : 'Member', 'xs')}
          <span><strong>${escapeHtml(author?.fullName || 'Member')}</strong> logged <strong>${formatSeconds(log.timeSpentSeconds)}</strong></span>
        </div>
        <span class="worklog-time">${formatDate(log.startedAt)}</span>
      </div>
      ${log.comment ? `<p class="worklog-desc">${escapeHtml(log.comment)}</p>` : ''}
    </div>
  `;
}

function renderAttachmentItem(att, issue, state) {
  return `
    <div class="attachment-card" data-attachment-id="${att.id}">
      <span class="att-icon">📄</span>
      <div class="att-info">
        <a href="${state.api}/organizations/${state.org}/issues/${issue.id}/attachments/${att.id}" target="_blank" class="att-name" download>
          ${escapeHtml(att.fileName)}
        </a>
        <small class="muted">${Math.ceil((att.fileSize || 0) / 1024)} KB · ${formatDate(att.createdAt)}</small>
      </div>
      <button class="icon-button btn-delete-attachment" data-attachment-id="${att.id}" title="Delete attachment">×</button>
    </div>
  `;
}

function renderLinkItem(link, issue, state) {
  const isOutward = link.issueId === issue.id;
  const targetId = isOutward ? link.linkedIssueId : link.issueId;
  const targetIssue = (state.issues || []).find(i => i.id === targetId);
  const linkType = (state.linkTypes || []).find(lt => lt.id === link.linkTypeId);

  const relationship = isOutward ? (linkType?.outwardLabel || 'links to') : (linkType?.inwardLabel || 'linked by');

  return `
    <div class="link-card">
      <span class="link-relation">${escapeHtml(relationship)}</span>
      ${targetIssue ? `
        <span class="issue-key-link" data-open-issue="${targetIssue.id}">${escapeHtml(targetIssue.key)}</span>
        <span class="link-summary">${escapeHtml(targetIssue.summary)}</span>
        ${renderStatusBadge(targetIssue.state || 'Open')}
      ` : `<span class="muted">Issue ${targetId.slice(0, 8)}</span>`}
    </div>
  `;
}

function renderHistoryItem(historyItem, state) {
  const actor = (state.members || []).find(m => m.id === historyItem.actorMemberId);

  return `
    <div class="history-row">
      <span class="history-dot"></span>
      <div class="history-content">
        <p class="history-text">
          <strong>${escapeHtml(actor?.fullName || 'User')}</strong> transitioned issue
          ${historyItem.comment ? `with comment: <em>"${escapeHtml(historyItem.comment)}"</em>` : ''}
        </p>
        <span class="history-timestamp">${formatDateTime(historyItem.occurredAt)}</span>
      </div>
    </div>
  `;
}
