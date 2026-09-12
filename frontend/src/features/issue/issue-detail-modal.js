import { escapeHtml, formatDate, formatDateTime, formatSeconds, formatRelativeTime } from '../../shared/utils/formatters.js';
import { renderAvatar, renderStatusBadge, renderTypeBadge } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

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
        <div class="topbar-left flex items-center gap-3">
          ${renderTypeBadge(issue.issueType || 'Task')}
          <span class="detail-issue-key font-mono text-sm font-bold text-blue-400">${escapeHtml(issue.key)}</span>
        </div>

        <div class="topbar-right">
          <!-- Transitions Dropdown -->
          <div class="transition-control-wrap flex items-center gap-3">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
            <div class="transition-dropdown-group flex items-center gap-2">
              ${renderStatusBadge(issue.state || issue.status || 'Open')}
              ${transitions.length ? `
                <div class="quick-transitions-wrap flex items-center gap-1.5">
                  ${transitions.slice(0, 3).map(t => `
                    <button type="button" class="btn-quick-transition button ghost btn-xs ${t.name.toLowerCase().includes('done') || t.name.toLowerCase().includes('resolve') ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' : 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10'}" data-transition-key="${escapeHtml(t.key)}" title="Transition issue to ${escapeHtml(t.name)}">
                      ${renderIcon('play', 'w-3 h-3')}
                      <span>${escapeHtml(t.name)}</span>
                    </button>
                  `).join('')}
                </div>
                <select id="issue-transition-select" class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1" aria-label="Change status">
                  <option value="">More transitions...</option>
                  ${transitions.map(t => `
                    <option value="${escapeHtml(t.key)}">${escapeHtml(t.name)}</option>
                  `).join('')}
                </select>
              ` : '<span class="text-xs text-slate-500 italic">(No further transitions)</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout: Left Content, Right Details Sidebar -->
      <div class="detail-main-layout">
        <!-- Left Section -->
        <div class="detail-left-pane space-y-6">
          <!-- Summary Header (Inline Editable) -->
          <div class="editable-summary-wrap">
            <input type="text" id="detail-summary-input" class="w-full text-lg sm:text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:bg-slate-900/50 rounded px-2 py-1.5 transition-all outline-none" value="${escapeHtml(issue.summary)}" title="Click to edit summary" />
          </div>

          <!-- Description Section -->
          <div class="detail-section bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
            </div>
            <textarea id="detail-description-input" class="w-full bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none min-h-[110px]" placeholder="Add a detailed description, reproduction steps, or specifications...">${escapeHtml(issue.description || '')}</textarea>
            <div class="flex justify-end mt-3">
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
              <form id="form-add-comment" class="mb-4 space-y-2">
                <textarea name="body" class="w-full bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none" placeholder="Add a comment... (Markdown supported)"></textarea>
                <div class="flex justify-end">
                  <button type="submit" class="button primary btn-sm">Post Comment</button>
                </div>
              </form>

              <div class="space-y-3">
                ${comments.length ? comments.map(c => renderCommentItem(c, state)).join('') : `
                  <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No comments yet. Be the first to add context.
                  </div>
                `}
              </div>
            </div>

            <!-- Tab: Work Log -->
            <div class="tab-pane ${activeTab === 'worklog' ? 'active' : ''}" id="tab-worklog">
              <div class="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 mb-4 space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span>Logged: <strong class="text-white">${formatSeconds(spent)}</strong></span>
                  <span>Original: <strong class="text-white">${formatSeconds(estimate)}</strong></span>
                </div>
                <div class="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div class="h-full bg-blue-500 transition-all duration-300" style="width: ${progressPercent}%;"></div>
                </div>
              </div>

              <form id="form-log-work" class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 mb-4 space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="form-group">
                    <label for="worklog-hours" class="text-xs font-semibold text-slate-400">Time (hours, e.g. 2.5)</label>
                    <input type="number" step="0.25" min="0.1" name="hours" id="worklog-hours" placeholder="1.5" required class="w-full" />
                  </div>
                  <div class="form-group">
                    <label for="worklog-comment" class="text-xs font-semibold text-slate-400">Work description</label>
                    <input type="text" name="comment" id="worklog-comment" placeholder="What did you work on?" class="w-full" />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button type="submit" class="button primary btn-sm">Log Time</button>
                </div>
              </form>

              <div class="space-y-3">
                ${workLogs.length ? workLogs.map(w => renderWorkLogItem(w, state)).join('') : `
                  <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No work logged yet. Keep team progress visible by logging time.
                  </div>
                `}
              </div>
            </div>

            <!-- Tab: Attachments -->
            <div class="tab-pane ${activeTab === 'attachments' ? 'active' : ''}" id="tab-attachments">
              <div class="upload-dropzone p-6 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl text-center mb-4 transition-colors" id="attachment-dropzone">
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-2">
                  ${renderIcon('paperclip', 'w-5 h-5')}
                </div>
                <p class="text-xs text-slate-300">Drag files here or <label for="file-attachment-input" class="text-blue-400 font-semibold cursor-pointer hover:underline">browse to upload</label></p>
                <small class="text-[11px] text-slate-500 block mt-1">PNG, JPG, PDF, TXT up to 10MB</small>
                <input type="file" id="file-attachment-input" class="hidden" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${attachments.length ? attachments.map(a => renderAttachmentItem(a, issue, state)).join('') : `
                  <div class="col-span-2 p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No attachments uploaded.
                  </div>
                `}
              </div>
            </div>

            <!-- Tab: Links -->
            <div class="tab-pane ${activeTab === 'links' ? 'active' : ''}" id="tab-links">
              <form id="form-link-issue" class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 mb-4 space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="form-group">
                    <label for="link-type-select" class="text-xs font-semibold text-slate-400">Relationship</label>
                    <select id="link-type-select" class="select-clean w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5" required>
                      <option value="">Choose relationship...</option>
                      ${(state.linkTypes || []).map(lt => `
                        <option value="${lt.id}">${escapeHtml(lt.outwardLabel)} (${escapeHtml(lt.key)})</option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="link-target-select" class="text-xs font-semibold text-slate-400">Target Issue</label>
                    <select id="link-target-select" class="select-clean w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5" required>
                      <option value="">Select issue...</option>
                      ${issues.filter(i => i.id !== issue.id).map(i => `
                        <option value="${i.id}">${escapeHtml(i.key)} — ${escapeHtml(i.summary)}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>
                <div class="flex justify-end">
                  <button type="submit" class="button primary btn-sm">Link Issue</button>
                </div>
              </form>

              <div class="space-y-2">
                ${links.length ? links.map(l => renderLinkItem(l, issue, state)).join('') : `
                  <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No linked issues. Connect dependencies or related stories here.
                  </div>
                `}
              </div>
            </div>

            <!-- Tab: History -->
            <div class="tab-pane ${activeTab === 'history' ? 'active' : ''}" id="tab-history">
              <div class="space-y-3">
                ${history.length ? history.map(h => renderHistoryItem(h, state)).join('') : `
                  <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No transitions recorded yet.
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Details Sidebar -->
        <div class="detail-right-sidebar space-y-4">
          <div class="sidebar-section">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 mb-3">Details</h4>

            <div class="detail-attribute-row">
              <span class="attr-label">Assignee</span>
              <div class="attr-value">
                <select id="detail-assignee-select" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs">
                  <option value="">Unassigned</option>
                  ${members.filter(m => m.status === 'active').map(m => `
                    <option value="${m.id}" ${m.id === issue.assigneeMemberId ? 'selected' : ''}>
                      ${escapeHtml(m.fullName)}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Reporter</span>
              <div class="flex items-center gap-2 pt-1 text-xs text-slate-300">
                ${renderAvatar(reporterMember ? { fullName: reporterMember.fullName } : 'Admin', 'xs')}
                <span>${escapeHtml(reporterMember?.fullName || 'Administrator')}</span>
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Sprint</span>
              <div class="attr-value">
                <select id="detail-sprint-select" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs">
                  <option value="">No Sprint (Backlog)</option>
                  ${(state.sprints || []).filter(s => s.state !== 'closed').map(s => `
                    <option value="${s.id}" ${s.id === issue.sprintId ? 'selected' : ''}>
                      ${escapeHtml(s.name)} (${s.state})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Due Date</span>
              <div class="attr-value">
                <input type="date" id="detail-due-date" class="w-full text-xs" value="${issue.dueAt ? new Date(issue.dueAt).toISOString().split('T')[0] : ''}" />
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Estimate (Hours)</span>
              <div class="attr-value">
                <input type="number" step="0.5" id="detail-estimate-input" class="w-full text-xs" placeholder="Hours" value="${issue.originalEstimateSeconds ? (issue.originalEstimateSeconds / 3600) : ''}" />
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Story Points</span>
              <div class="attr-value">
                <input type="number" step="1" id="detail-story-points-input" class="w-full text-xs" placeholder="Pts (e.g. 5)" value="${issue.storyPoints !== null && issue.storyPoints !== undefined ? issue.storyPoints : ''}" />
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Watchers</span>
              <div class="attr-value">
                <button class="button ghost btn-xs w-full justify-start" id="btn-toggle-watch">
                  ${renderIcon('eye', 'w-3.5 h-3.5')}
                  <span>${watchers.length} Watchers</span>
                </button>
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Priority</span>
              <div class="attr-value">
                <select id="detail-priority-select" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs">
                  <option value="Lowest" ${issue.priority === 'Lowest' ? 'selected' : ''}>Lowest</option>
                  <option value="Low" ${issue.priority === 'Low' ? 'selected' : ''}>Low</option>
                  <option value="Medium" ${!issue.priority || issue.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="High" ${issue.priority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Highest" ${issue.priority === 'Highest' ? 'selected' : ''}>Highest</option>
                </select>
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Component</span>
              <div class="attr-value">
                <select id="detail-component-select" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs">
                  <option value="">None</option>
                  ${(state.components || []).map(c => `
                    <option value="${c.id}" ${c.id === (issue.componentId || issue.component?.id) ? 'selected' : ''}>
                      ${escapeHtml(c.name)}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="detail-attribute-row mt-3">
              <span class="attr-label">Fix Version</span>
              <div class="attr-value">
                <select id="detail-fix-version-select" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs">
                  <option value="">None</option>
                  ${(state.versions || []).filter(v => v.status !== 'archived').map(v => `
                    <option value="${v.id}" ${v.id === (issue.fixVersionId || issue.fixVersion?.id) ? 'selected' : ''}>
                      ${escapeHtml(v.name)} (${escapeHtml(v.status)})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="detail-attribute-row labels-row mt-3">
              <span class="attr-label">Labels</span>
              <div class="attr-value space-y-1.5 pt-1">
                <div class="flex flex-wrap gap-1">
                  ${labels.map(l => `<span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">${escapeHtml(l.name)}</span>`).join('')}
                </div>
                <form id="form-add-label">
                  <input type="text" id="new-label-name" placeholder="+ add label" class="w-full text-xs px-2 py-1" />
                </form>
              </div>
            </div>

            ${((issue.customFields && issue.customFields.length > 0) ? issue.customFields : (state.customFields || [])).length > 0 ? `
              <div class="pt-3 mt-3 border-t border-slate-800/80">
                <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Fields</div>
                ${((issue.customFields && issue.customFields.length > 0) ? issue.customFields : (state.customFields || [])).map(cf => {
                  const val = cf.value !== null && cf.value !== undefined ? cf.value : '';
                  const ctxId = cf.contextId || cf.id;
                  let inputHtml = '';
                  if (cf.fieldType === 'select') {
                    const opts = cf.options || [];
                    inputHtml = `
                      <select class="custom-field-input select-clean w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs" data-context-id="${ctxId}" data-field-type="select">
                        <option value="">Select option...</option>
                        ${opts.map(o => `
                          <option value="${escapeHtml(o.value)}" ${String(val) === String(o.value) ? 'selected' : ''}>${escapeHtml(o.label || o.value)}</option>
                        `).join('')}
                      </select>
                    `;
                  } else if (cf.fieldType === 'number') {
                    inputHtml = `
                      <input type="number" class="custom-field-input w-full text-xs px-2 py-1 bg-slate-900 border border-slate-800 rounded" data-context-id="${ctxId}" data-field-type="number" value="${escapeHtml(String(val))}" placeholder="Enter number..." />
                    `;
                  } else if (cf.fieldType === 'date') {
                    const dateVal = val ? new Date(val).toISOString().split('T')[0] : '';
                    inputHtml = `
                      <input type="date" class="custom-field-input w-full text-xs px-2 py-1 bg-slate-900 border border-slate-800 rounded" data-context-id="${ctxId}" data-field-type="date" value="${dateVal}" />
                    `;
                  } else {
                    inputHtml = `
                      <input type="text" class="custom-field-input w-full text-xs px-2 py-1 bg-slate-900 border border-slate-800 rounded" data-context-id="${ctxId}" data-field-type="text" value="${escapeHtml(String(val))}" placeholder="Enter value..." />
                    `;
                  }
                  return `
                    <div class="detail-attribute-row py-1.5 flex flex-col gap-1">
                      <span class="attr-label text-slate-400 text-xs font-medium">${escapeHtml(cf.name)} ${cf.isRequired ? '<span class="text-rose-400">*</span>' : ''}</span>
                      <div class="attr-value w-full">${inputHtml}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}

            <div class="detail-attribute-row pt-4 mt-4 border-t border-slate-800">
              <button type="button" id="btn-delete-issue" class="w-full button danger btn-sm justify-center gap-2" title="Soft-delete this issue from project">
                ${renderIcon('trash', 'w-3.5 h-3.5')}
                <span>Delete Issue</span>
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
    <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2" data-comment-id="${comment.id}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          ${renderAvatar(author ? { fullName: author.fullName } : 'Member', 'xs')}
          <strong class="text-xs font-semibold text-slate-200">${escapeHtml(author?.fullName || 'Team Member')}</strong>
          <span class="text-[11px] text-slate-500">${formatRelativeTime(comment.createdAt)}</span>
        </div>
        ${isAuthor ? `
          <button class="icon-button btn-delete-comment text-slate-500 hover:text-red-400" data-comment-id="${comment.id}" title="Delete comment">
            ${renderIcon('trash', 'w-3.5 h-3.5')}
          </button>
        ` : ''}
      </div>
      <div class="text-xs text-slate-300 leading-relaxed pl-7">
        ${escapeHtml(comment.body)}
      </div>
    </div>
  `;
}

function renderWorkLogItem(log, state) {
  const author = (state.members || []).find(m => m.id === log.authorMemberId);

  return `
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        ${renderAvatar(author ? { fullName: author.fullName } : 'Member', 'xs')}
        <span class="text-slate-300"><strong>${escapeHtml(author?.fullName || 'Member')}</strong> logged <strong class="text-blue-400">${formatSeconds(log.timeSpentSeconds)}</strong></span>
      </div>
      <span class="text-slate-500">${formatDate(log.startedAt)}</span>
    </div>
  `;
}

function renderAttachmentItem(att, issue, state) {
  return `
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3" data-attachment-id="${att.id}">
      <div class="flex items-center gap-2.5 min-width-0">
        ${renderIcon('paperclip', 'w-4 h-4 text-blue-400 shrink-0')}
        <div class="truncate">
          <a href="${state.api}/organizations/${state.org}/issues/${issue.id}/attachments/${att.id}" target="_blank" class="text-xs font-semibold text-blue-400 hover:underline block truncate" download>
            ${escapeHtml(att.fileName)}
          </a>
          <small class="text-[10px] text-slate-500">${Math.ceil((att.fileSize || 0) / 1024)} KB · ${formatDate(att.createdAt)}</small>
        </div>
      </div>
      <button class="icon-button btn-delete-attachment text-slate-500 hover:text-red-400" data-attachment-id="${att.id}" title="Delete attachment">
        ${renderIcon('trash', 'w-3.5 h-3.5')}
      </button>
    </div>
  `;
}

function renderLinkItem(link, issue, state) {
  const isOutward = link.isOutward !== undefined ? link.isOutward : (link.issueId === issue.id);
  const target = link.targetIssue || (state.issues || []).find(i => i.id === (isOutward ? link.linkedIssueId : link.issueId));
  const linkType = link.linkType || (state.linkTypes || []).find(lt => lt.id === link.linkTypeId);

  const relationship = isOutward ? (linkType?.outwardLabel || 'links to') : (linkType?.inwardLabel || 'linked by');

  return `
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs" data-link-id="${link.id}">
      <div class="flex items-center gap-2 truncate">
        <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">${escapeHtml(relationship)}</span>
        ${target ? `
          <button type="button" class="issue-key-link font-mono font-bold text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs" data-open-issue="${target.id}">${escapeHtml(target.key)}</button>
          <span class="text-slate-300 truncate">${escapeHtml(target.summary)}</span>
        ` : `<span class="text-slate-500">Linked Issue</span>`}
      </div>
      <div class="flex items-center gap-2 shrink-0">
        ${target?.state ? renderStatusBadge(target.state) : ''}
        <button type="button" class="icon-button btn-delete-link text-slate-500 hover:text-red-400 p-1" data-link-id="${link.id}" title="Remove link">
          ${renderIcon('trash', 'w-3 h-3')}
        </button>
      </div>
    </div>
  `;
}

function renderHistoryItem(historyItem, state) {
  const actor = (state.members || []).find(m => m.id === historyItem.actorMemberId);

  return `
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
      <div class="space-y-1">
        <p class="text-slate-300">
          <strong class="text-white">${escapeHtml(actor?.fullName || 'User')}</strong> transitioned issue
          ${historyItem.comment ? `with comment: <em>"${escapeHtml(historyItem.comment)}"</em>` : ''}
        </p>
        <span class="text-[11px] text-slate-500 block">${formatDateTime(historyItem.occurredAt)}</span>
      </div>
    </div>
  `;
}
