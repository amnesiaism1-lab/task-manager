import { escapeHtml } from '../../shared/utils/formatters.js';

export function renderIssueCreateModal(state) {
  const activeMembers = state.members.filter(m => m.status === 'active');
  const sprints = (state.sprints || []).filter(s => s.state !== 'closed');

  return `
    <form id="form-create-issue" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="create-issue-project" class="text-xs font-semibold text-slate-300">Project <span class="text-rose-400">*</span></label>
          <select id="create-issue-project" name="projectId" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs" required>
            ${state.projects.map(p => `
              <option value="${p.id}" ${p.id === state.selectedProjectId ? 'selected' : ''}>
                ${escapeHtml(p.key)} · ${escapeHtml(p.name)}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="create-issue-type" class="text-xs font-semibold text-slate-300">Issue Type <span class="text-rose-400">*</span></label>
          <select id="create-issue-type" name="issueTypeKey" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs" required>
            <option value="task" selected>Task</option>
            <option value="story">Story</option>
            <option value="bug">Bug</option>
            <option value="epic">Epic</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="create-issue-summary" class="text-xs font-semibold text-slate-300">Summary <span class="text-rose-400">*</span></label>
        <input type="text" id="create-issue-summary" name="summary" class="w-full" placeholder="What needs to be done?" required />
      </div>

      <div class="form-group">
        <label for="create-issue-description" class="text-xs font-semibold text-slate-300">Description</label>
        <textarea id="create-issue-description" name="description" class="w-full" rows="4" placeholder="Provide context, acceptance criteria, steps to reproduce..."></textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="form-group">
          <label for="create-issue-assignee" class="text-xs font-semibold text-slate-300">Assignee</label>
          <select id="create-issue-assignee" name="assigneeMemberId" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs">
            <option value="">Unassigned</option>
            ${activeMembers.map(m => `
              <option value="${m.id}">${escapeHtml(m.fullName)}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="create-issue-sprint" class="text-xs font-semibold text-slate-300">Sprint</label>
          <select id="create-issue-sprint" name="sprintId" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs">
            <option value="">Backlog (No Sprint)</option>
            ${sprints.map(s => `
              <option value="${s.id}">${escapeHtml(s.name)} (${s.state})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="create-issue-due" class="text-xs font-semibold text-slate-300">Due Date</label>
          <input type="date" id="create-issue-due" name="dueAt" class="w-full text-xs" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="create-issue-estimate" class="text-xs font-semibold text-slate-300">Estimated Hours</label>
          <input type="number" step="0.5" min="0" id="create-issue-estimate" name="estimateHours" class="w-full" placeholder="e.g. 4" />
        </div>

        <div class="form-group">
          <label for="create-issue-priority" class="text-xs font-semibold text-slate-300">Priority</label>
          <select id="create-issue-priority" name="priority" class="select-clean w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs">
            <option value="Lowest">Lowest</option>
            <option value="Low">Low</option>
            <option value="Medium" selected>Medium</option>
            <option value="High">High</option>
            <option value="Highest">Highest</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Issue</button>
      </div>
    </form>
  `;
}
