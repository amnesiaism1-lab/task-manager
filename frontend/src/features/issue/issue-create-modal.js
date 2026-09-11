import { escapeHtml } from '../../shared/utils/formatters.js';

export function renderIssueCreateModal(state) {
  const activeMembers = state.members.filter(m => m.status === 'active');
  const sprints = (state.sprints || []).filter(s => s.state !== 'closed');

  return `
    <form id="form-create-issue" class="modal-form-vertical">
      <div class="form-row-2">
        <div class="form-group">
          <label for="create-issue-project">Project <span class="required-star">*</span></label>
          <select id="create-issue-project" name="projectId" class="select-clean full-select" required>
            ${state.projects.map(p => `
              <option value="${p.id}" ${p.id === state.selectedProjectId ? 'selected' : ''}>
                ${escapeHtml(p.key)} · ${escapeHtml(p.name)}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="create-issue-type">Issue Type <span class="required-star">*</span></label>
          <select id="create-issue-type" name="issueTypeKey" class="select-clean full-select" required>
            <option value="task" selected>Task (✓)</option>
            <option value="story">Story (▲)</option>
            <option value="bug">Bug (●)</option>
            <option value="epic">Epic (⚡)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="create-issue-summary">Summary <span class="required-star">*</span></label>
        <input type="text" id="create-issue-summary" name="summary" class="input-clean" placeholder="What needs to be done?" required />
      </div>

      <div class="form-group">
        <label for="create-issue-description">Description</label>
        <textarea id="create-issue-description" name="description" class="textarea-clean" rows="4" placeholder="Provide context, acceptance criteria, steps to reproduce..."></textarea>
      </div>

      <div class="form-row-3">
        <div class="form-group">
          <label for="create-issue-assignee">Assignee</label>
          <select id="create-issue-assignee" name="assigneeMemberId" class="select-clean full-select">
            <option value="">Unassigned</option>
            ${activeMembers.map(m => `
              <option value="${m.id}">${escapeHtml(m.fullName)}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="create-issue-sprint">Sprint</label>
          <select id="create-issue-sprint" name="sprintId" class="select-clean full-select">
            <option value="">Backlog (No Sprint)</option>
            ${sprints.map(s => `
              <option value="${s.id}">${escapeHtml(s.name)} (${s.state})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="create-issue-due">Due Date</label>
          <input type="date" id="create-issue-due" name="dueAt" class="input-clean" />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label for="create-issue-estimate">Estimated Hours</label>
          <input type="number" step="0.5" min="0" id="create-issue-estimate" name="estimateHours" class="input-clean" placeholder="e.g. 4" />
        </div>

        <div class="form-group">
          <label for="create-issue-priority">Priority</label>
          <select id="create-issue-priority" name="priority" class="select-clean full-select">
            <option value="Lowest">Lowest</option>
            <option value="Low">Low</option>
            <option value="Medium" selected>Medium</option>
            <option value="High">High</option>
            <option value="Highest">Highest</option>
          </select>
        </div>
      </div>

      <div class="modal-form-actions">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Issue</button>
      </div>
    </form>
  `;
}
