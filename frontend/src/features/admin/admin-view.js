import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderAvatar } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderAdminView(state) {
  const currentTab = state.adminTab || 'org';
  const org = state.organization || {};
  const project = state.projectDetail;

  return `
    <div class="admin-view-container space-y-6">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">WORKSPACE & COMPLIANCE</p>
          <h2>Administration & Settings</h2>
        </div>
      </div>

      <!-- Admin Tab Navigation -->
      <div class="admin-tab-nav flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button class="admin-tab-btn ${currentTab === 'org' ? 'active' : ''}" data-admin-tab="org">
          ${renderIcon('building', 'w-4 h-4')}
          <span>Organization</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'members' ? 'active' : ''}" data-admin-tab="members">
          ${renderIcon('users', 'w-4 h-4')}
          <span>Members & Invites (${state.members?.length || 0})</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'roles' ? 'active' : ''}" data-admin-tab="roles">
          ${renderIcon('shield', 'w-4 h-4')}
          <span>Roles & Permissions</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'groups' ? 'active' : ''}" data-admin-tab="groups">
          ${renderIcon('folder', 'w-4 h-4')}
          <span>Departments & Groups</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'fields' ? 'active' : ''}" data-admin-tab="fields">
          ${renderIcon('sparkles', 'w-4 h-4')}
          <span>Custom Fields</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'workflows' ? 'active' : ''}" data-admin-tab="workflows">
          ${renderIcon('refresh', 'w-4 h-4')}
          <span>Workflows & FSM (${state.workflows?.length || 0})</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'catalog' ? 'active' : ''}" data-admin-tab="catalog">
          ${renderIcon('board', 'w-4 h-4')}
          <span>Issue Types & Catalog</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'audit' ? 'active' : ''}" data-admin-tab="audit">
          ${renderIcon('code', 'w-4 h-4')}
          <span>Audit & Outbox</span>
        </button>
        <button class="admin-tab-btn ${currentTab === 'project' ? 'active' : ''}" data-admin-tab="project">
          ${renderIcon('settings', 'w-4 h-4')}
          <span>Project Settings (${state.selectedProjectId ? 'Active' : 'Select'})</span>
        </button>
        ${state.user?.isSystemAdmin ? `
          <button class="admin-tab-btn ${currentTab === 'system' ? 'active' : ''}" data-admin-tab="system">
            ${renderIcon('bolt', 'w-4 h-4')}
            <span>Platform Admin</span>
          </button>
        ` : ''}
      </div>

      <div class="admin-tab-content pt-2">
        ${currentTab === 'org' ? renderOrgTab(org, state) :
          currentTab === 'members' ? renderMembersTab(state) :
          currentTab === 'roles' ? renderRolesTab(state) :
          currentTab === 'groups' ? renderGroupsTab(state) :
          currentTab === 'fields' ? renderCustomFieldsTab(state) :
          currentTab === 'workflows' ? renderWorkflowsTab(state) :
          currentTab === 'catalog' ? renderCatalogTab(state) :
          currentTab === 'audit' ? renderAuditTab(state) :
          currentTab === 'system' ? renderSystemAdminTab(state) :
          renderProjectSettingsTab(project, state)}
      </div>
    </div>
  `;
}

function renderOrgTab(org, state) {
  return `
    <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white">Organization Profile</h3>
          <p class="text-xs text-slate-400">Manage root tenant identity, key prefix, and operational status.</p>
        </div>
        <span class="badge ${org.status === 'active' ? 'badge-status status-done' : 'badge-status status-danger'}">
          ${(org.status || 'ACTIVE').toUpperCase()}
        </span>
      </div>

      <form id="form-update-org" class="space-y-4 max-w-2xl">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="form-group">
            <label for="org-key-input" class="text-xs font-semibold text-slate-400">Organization Key</label>
            <input type="text" id="org-key-input" value="${escapeHtml(org.key || state.org)}" disabled class="w-full bg-slate-950 font-mono text-xs opacity-75" />
          </div>
          <div class="form-group">
            <label for="org-name-input" class="text-xs font-semibold text-slate-300">Organization Name</label>
            <input type="text" id="org-name-input" name="name" value="${escapeHtml(org.name || '')}" class="w-full text-xs" required />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="form-group">
            <label for="org-status-select" class="text-xs font-semibold text-slate-300">Status</label>
            <select id="org-status-select" name="status" class="select-clean w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs">
              <option value="active" ${org.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="suspended" ${org.status === 'suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
          <div class="form-group">
            <label class="text-xs font-semibold text-slate-400">Subscription Plan</label>
            <input type="text" value="${escapeHtml(org.plan || 'Enterprise')}" disabled class="w-full bg-slate-950 text-xs opacity-75" />
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="button primary btn-sm">Save Organization Settings</button>
        </div>
      </form>
    </div>
  `;
}

function renderMembersTab(state) {
  const members = state.members || [];
  const invitations = state.invitations || [];

  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Active Members List -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Active Members (${members.length})</h3>
            <p class="text-xs text-slate-400">People who have accepted invites and belong to this organization.</p>
          </div>
        </div>

        <div class="space-y-2.5">
          ${members.map(m => `
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                ${renderAvatar(m, 'sm')}
                <div class="truncate">
                  <strong class="text-xs font-bold text-white block truncate">${escapeHtml(m.fullName)}</strong>
                  <span class="text-[11px] text-slate-400 block truncate">${escapeHtml(m.email)}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="badge badge-status status-${m.status === 'active' ? 'done' : 'todo'} text-[10px]">${escapeHtml(m.status)}</span>
                <select class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 select-member-status" data-member-id="${m.id}">
                  <option value="active" ${m.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="suspended" ${m.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                </select>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Invitations -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Invitations (${invitations.length})</h3>
            <p class="text-xs text-slate-400">Pending invite links sent to prospective team members.</p>
          </div>
        </div>

        <form id="form-invite-member" class="flex items-center gap-2 flex-wrap">
          <input type="email" id="invite-email-input" name="email" placeholder="colleague@company.com" required class="flex-1 min-w-[180px] text-xs" />
          <select id="invite-role-select" name="roleId" class="select-clean text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-2">
            <option value="">Standard Member (Default)</option>
            ${(state.orgRoles || []).map(r => `
              <option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${escapeHtml(r.key)})</option>
            `).join('')}
          </select>
          <button type="submit" class="button primary btn-sm">
            ${renderIcon('mail', 'w-3.5 h-3.5')}
            <span>Send Invite</span>
          </button>
        </form>

        <div class="space-y-2.5">
          ${invitations.length ? invitations.map(inv => `
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
              <div class="space-y-1 min-w-0">
                <strong class="text-xs font-semibold text-slate-200 block truncate">${escapeHtml(inv.email)}</strong>
                <div class="flex items-center gap-2 text-[11px] text-slate-400">
                  <span class="badge badge-status status-${inv.status === 'pending' ? 'progress' : 'todo'} text-[10px]">${escapeHtml(inv.status)}</span>
                  <span>Expires: ${formatDate(inv.expiresAt)}</span>
                </div>
              </div>
              ${inv.status === 'pending' ? `
                <div class="flex items-center gap-2">
                  <button type="button" class="button ghost btn-xs btn-resend-invitation text-blue-400 border-blue-500/30 hover:bg-blue-500/10" data-invitation-id="${inv.id}" title="Re-issue invite token">
                    ${renderIcon('refresh', 'w-3 h-3')}
                    <span>Resend</span>
                  </button>
                  <button type="button" class="button danger btn-xs btn-revoke-invitation" data-invitation-id="${inv.id}" title="Revoke invite">Revoke</button>
                </div>
              ` : ''}
            </div>
          `).join('') : `
            <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No pending invitations.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderRolesTab(state) {
  const roles = state.orgRoles || [];

  return `
    <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white">Organization Roles & RBAC</h3>
          <p class="text-xs text-slate-400">Define reusable roles and grant granular capabilities across organizations.</p>
        </div>
        <button class="button primary btn-sm" id="btn-create-org-role">
          ${renderIcon('plus', 'w-3.5 h-3.5')}
          <span>Add Org Role</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${roles.map(r => `
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between">
              <strong class="text-xs font-bold text-white">${escapeHtml(r.name)}</strong>
              <code class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-blue-400">${escapeHtml(r.key)}</code>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(r.description || 'No description provided.')}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderGroupsTab(state) {
  const depts = state.departments || [];
  const groups = state.groups || [];

  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Departments -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Departments</h3>
            <p class="text-xs text-slate-400">Hierarchical departmental organizational tree.</p>
          </div>
          <button class="button ghost btn-sm" id="btn-create-dept">
            ${renderIcon('plus', 'w-3.5 h-3.5')}
            <span>Add Department</span>
          </button>
        </div>

        <div class="space-y-2.5">
          ${depts.length ? depts.map(d => `
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                ${renderIcon('folder', 'w-4 h-4 text-blue-400')}
                <strong class="text-xs font-bold text-white">${escapeHtml(d.name)}</strong>
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 uppercase font-mono">${d.parentDepartmentId ? 'Nested' : 'Root'}</span>
            </div>
          `).join('') : `
            <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No departments created.
            </div>
          `}
        </div>
      </div>

      <!-- User Groups -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">User Groups</h3>
            <p class="text-xs text-slate-400">Named cohorts used for bulk role assignments.</p>
          </div>
          <button class="button ghost btn-sm" id="btn-create-group">
            ${renderIcon('plus', 'w-3.5 h-3.5')}
            <span>Add Group</span>
          </button>
        </div>

        <div class="space-y-2.5">
          ${groups.length ? groups.map(g => `
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                ${renderIcon('users', 'w-4 h-4 text-indigo-400')}
                <div>
                  <strong class="text-xs font-bold text-white block">${escapeHtml(g.name)}</strong>
                  <p class="text-[11px] text-slate-400">${escapeHtml(g.description || 'Team Cohort')}</p>
                </div>
              </div>
            </div>
          `).join('') : `
            <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No groups created.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderCustomFieldsTab(state) {
  const fields = state.customFields || [];
  return `
    <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white">Custom Fields & Schema Attributes</h3>
          <p class="text-xs text-slate-400">Define typed custom attributes (Text, Number, Single Select, Multi Select, Date) across issues.</p>
        </div>
        <button type="button" class="button primary btn-sm" id="btn-admin-add-custom-field">
          ${renderIcon('plus', 'w-3.5 h-3.5')}
          <span>Add Custom Field</span>
        </button>
      </div>

      <div class="overflow-x-auto border border-slate-800 rounded-xl">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <th class="p-3">Field Name</th>
              <th class="p-3">Field Key</th>
              <th class="p-3">Data Type</th>
              <th class="p-3">Description</th>
              <th class="p-3 text-right">Options</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${fields.length ? fields.map(f => `
              <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="p-3">
                  <strong class="text-white">${escapeHtml(f.name)}</strong>
                  ${f.isRequired ? '<span class="ml-2 px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 text-[10px]">Required</span>' : ''}
                </td>
                <td class="p-3 font-mono text-slate-400">${escapeHtml(f.key || f.id?.slice(0, 8))}</td>
                <td class="p-3">
                  <span class="badge badge-status status-progress text-[10px] uppercase">${escapeHtml(f.fieldType || 'text')}</span>
                </td>
                <td class="p-3 text-slate-400">${escapeHtml(f.description || 'Organization Field')}</td>
                <td class="p-3 text-right">
                  ${f.fieldType === 'select' || f.fieldType === 'multi_select' ? `
                    <button type="button" class="button ghost btn-xs btn-admin-add-option" data-field-id="${f.id}" data-field-name="${escapeHtml(f.name)}">
                      + Option
                    </button>
                  ` : '<span class="text-slate-600">—</span>'}
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No custom fields defined yet. Click "+ Add Custom Field" to create one.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderProjectSettingsTab(project, state) {
  if (!project) {
    return `
      <div class="empty-state-view flex flex-col items-center justify-center p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
        <h3 class="text-base font-bold text-white mb-2">No project selected</h3>
        <p class="text-xs text-slate-400 mb-6">Choose a project from the top navigation bar or create a new project to start managing tasks.</p>
        <button type="button" class="button primary btn-sm" id="btn-admin-create-project-trigger">
          ${renderIcon('plus', 'w-3.5 h-3.5')}
          <span>Create New Project</span>
        </button>
      </div>
    `;
  }

  const components = state.components || [];
  const versions = state.versions || [];

  return `
    <div class="space-y-6">
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Project: ${escapeHtml(project.name)} (${escapeHtml(project.key)})</h3>
            <p class="text-xs text-slate-400">Lifecycle, visibility, and components for this workspace.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="button primary btn-sm" id="btn-admin-create-project-trigger">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>New Project</span>
            </button>
            <button class="button ghost btn-sm text-slate-300" id="btn-toggle-project-archive">
              ${project.archivedAt ? 'Restore Project' : 'Archive Project'}
            </button>
          </div>
        </div>

        <form id="form-update-project" class="space-y-4 max-w-2xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="text-xs font-semibold text-slate-400">Project Key</label>
              <input type="text" value="${escapeHtml(project.key)}" disabled class="w-full bg-slate-950 font-mono text-xs opacity-75" />
            </div>
            <div class="form-group">
              <label class="text-xs font-semibold text-slate-300">Project Name</label>
              <input type="text" name="name" value="${escapeHtml(project.name)}" class="w-full text-xs" required />
            </div>
          </div>
          <div class="form-group">
            <label class="text-xs font-semibold text-slate-300">Visibility</label>
            <select name="visibility" class="select-clean w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs">
              <option value="private" ${project.visibility === 'private' ? 'selected' : ''}>Private</option>
              <option value="org" ${project.visibility === 'org' ? 'selected' : ''}>Organization-wide</option>
              <option value="public" ${project.visibility === 'public' ? 'selected' : ''}>Public</option>
            </select>
          </div>
          <button type="submit" class="button primary btn-sm">Save Project</button>
        </form>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Components -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white">Components (${components.length})</h4>
            <button class="button ghost btn-sm" id="btn-add-component">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Component</span>
            </button>
          </div>
          <div class="space-y-2.5">
            ${components.length ? components.map(c => `
              <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <strong class="text-xs font-bold text-white block">${escapeHtml(c.name)}</strong>
                  <p class="text-[11px] text-slate-400">${escapeHtml(c.description || 'No description')}</p>
                </div>
                <button class="icon-button btn-archive-component text-slate-500 hover:text-red-400" data-component-id="${c.id}" title="Archive">
                  ${renderIcon('trash', 'w-3.5 h-3.5')}
                </button>
              </div>
            `).join('') : '<div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">No components. Create components to categorize issues.</div>'}
          </div>
        </div>

        <!-- Versions -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white">Releases & Versions (${versions.length})</h4>
            <button class="button ghost btn-sm" id="btn-add-version">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Version</span>
            </button>
          </div>
          <div class="space-y-2.5">
            ${versions.length ? versions.map(v => `
              <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <strong class="text-xs font-bold text-white block">${escapeHtml(v.name)}</strong>
                  <span class="badge badge-status status-${v.status === 'released' ? 'done' : 'todo'} text-[10px] mt-1">${escapeHtml(v.status)}</span>
                </div>
                ${v.status === 'unreleased' ? `
                  <button class="button primary btn-xs btn-release-version" data-version-id="${v.id}">Release</button>
                ` : ''}
              </div>
            `).join('') : '<div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">No releases. Create versions to plan target releases.</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSystemAdminTab(state) {
  const users = state.systemUsers || [];
  const orgs = state.systemOrgs || [];
  const outbox = state.mailOutbox || [];

  return `
    <div class="system-admin-dashboard space-y-6">
      <!-- Section 1: Global Users Directory -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
          <div>
            <h3 class="text-base font-bold text-white">Global User Management & Account CRUD</h3>
            <p class="text-xs text-slate-400">System Administrator control plane — create, edit, deactivate/delete accounts, and force-terminate active sessions.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="button primary btn-sm" id="btn-admin-add-user">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Add User</span>
            </button>
            <span class="count-badge">${users.length} Users</span>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">User</th>
                <th class="p-3">Status</th>
                <th class="p-3">Platform Role</th>
                <th class="p-3">Registered</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${users.length ? users.map(u => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-3">
                    <div class="flex items-center gap-2.5">
                      ${renderAvatar(u, 'xs')}
                      <div>
                        <strong class="text-white block">${escapeHtml(u.fullName || 'No Name')}</strong>
                        <span class="text-[11px] text-slate-400">${escapeHtml(u.email)}</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-3">
                    <span class="badge badge-status status-${u.status === 'active' ? 'done' : u.status === 'suspended' ? 'danger' : 'todo'} text-[10px]">
                      ${escapeHtml(u.status)}
                    </span>
                  </td>
                  <td class="p-3">
                    ${u.isSystemAdmin ? '<span class="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50 text-[10px] font-bold">System Admin</span>' : '<span class="text-slate-400">User</span>'}
                  </td>
                  <td class="p-3 text-slate-400">${formatDate(u.createdAt)}</td>
                  <td class="p-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button type="button" class="button ghost btn-xs btn-admin-edit-user" data-user-id="${u.id}" data-email="${escapeHtml(u.email)}" data-fullname="${escapeHtml(u.fullName || '')}" data-status="${u.status}" data-admin="${u.isSystemAdmin ? 'true' : 'false'}">
                        Edit
                      </button>
                      ${u.id !== state.user?.id ? `
                        <button type="button" class="button ${u.status === 'suspended' ? 'primary' : 'ghost'} btn-xs btn-admin-toggle-user" data-user-id="${u.id}" data-current-status="${u.status}">
                          ${u.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        <button type="button" class="button ghost btn-xs btn-admin-force-revoke text-slate-400" data-user-id="${u.id}" title="Revoke all active sessions for this user">
                          Revoke
                        </button>
                        <button type="button" class="button danger btn-xs btn-admin-delete-user" data-user-id="${u.id}" data-email="${escapeHtml(u.email)}" title="Delete user account">
                          Delete
                        </button>
                      ` : `
                        <span class="text-[10px] text-slate-500 italic px-2">Current</span>
                      `}
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No users loaded or unauthorized.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Mail Gateway & SMTP Delivery Diagnostics -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
          <div>
            <h3 class="text-base font-bold text-white">Mail Gateway & SMTP Delivery Diagnostics</h3>
            <p class="text-xs text-slate-400">Live SMTP dispatch verification, automated welcome emails, password resets, and outbox logs.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="button ghost btn-sm" id="btn-refresh-outbox">
              ${renderIcon('refresh', 'w-3 h-3')}
              <span>Refresh Outbox</span>
            </button>
            <span class="count-badge">${outbox.length} in Outbox</span>
          </div>
        </div>

        <form id="form-send-test-mail" class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <h4 class="text-xs font-bold text-slate-200">Send Diagnostic Test Email</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label for="test-mail-recipient" class="text-xs font-semibold text-slate-400">Recipient Email</label>
              <input type="email" id="test-mail-recipient" class="w-full text-xs" placeholder="admin@company.com" value="${escapeHtml(state.user?.email || 'admin@taskmanager.dev')}" required />
            </div>
            <div class="form-group">
              <label for="test-mail-subject" class="text-xs font-semibold text-slate-400">Subject (Optional)</label>
              <input type="text" id="test-mail-subject" class="w-full text-xs" placeholder="Task Manager Pro — SMTP Delivery Test" />
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="button primary btn-sm" id="btn-submit-test-mail">
              ${renderIcon('mail', 'w-3.5 h-3.5')}
              <span>Send Diagnostic Email</span>
            </button>
          </div>
        </form>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Timestamp</th>
                <th class="p-3">Recipient</th>
                <th class="p-3">Category</th>
                <th class="p-3">Subject</th>
                <th class="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${outbox.length ? outbox.map(m => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-3 text-slate-500 font-mono text-[11px]">${formatDate(m.timestamp)}</td>
                  <td class="p-3 font-semibold text-slate-200">${escapeHtml(m.to)}</td>
                  <td class="p-3">
                    <span class="badge badge-status status-progress text-[10px] uppercase">${escapeHtml(m.category || 'general')}</span>
                  </td>
                  <td class="p-3 text-slate-300 truncate max-w-xs">${escapeHtml(m.subject)}</td>
                  <td class="p-3 text-right">
                    <span class="badge badge-status ${m.sent ? 'status-done' : 'status-danger'} text-[10px]">
                      ${m.sent ? 'Delivered' : 'Queued'}
                    </span>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No recent dispatched emails in buffer.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Global Organizations Directory -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Global Organizations & Tenants</h3>
            <p class="text-xs text-slate-400">Manage workspace boundaries, tenant subscription tiers, and operational status.</p>
          </div>
          <span class="count-badge">${orgs.length} Organizations</span>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Key / Name</th>
                <th class="p-3">Plan Tier</th>
                <th class="p-3">Status</th>
                <th class="p-3">Created</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${orgs.length ? orgs.map(o => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-3">
                    <strong class="text-white block">${escapeHtml(o.name)}</strong>
                    <code class="text-[10px] font-mono text-blue-400">${escapeHtml(o.key)}</code>
                  </td>
                  <td class="p-3">
                    <select class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 sys-org-plan-select" data-org-id="${o.id}">
                      <option value="free" ${o.plan === 'free' ? 'selected' : ''}>Free Tier</option>
                      <option value="starter" ${o.plan === 'starter' ? 'selected' : ''}>Starter</option>
                      <option value="professional" ${o.plan === 'professional' ? 'selected' : ''}>Professional</option>
                      <option value="enterprise" ${o.plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                    </select>
                  </td>
                  <td class="p-3">
                    <select class="select-clean text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 sys-org-status-select" data-org-id="${o.id}">
                      <option value="active" ${o.status === 'active' ? 'selected' : ''}>Active</option>
                      <option value="suspended" ${o.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                    </select>
                  </td>
                  <td class="p-3 text-slate-400 font-mono text-[11px]">${formatDate(o.createdAt)}</td>
                  <td class="p-3 text-right">
                    <button type="button" class="button primary btn-xs btn-sys-update-org" data-org-id="${o.id}">
                      Apply
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No organizations found.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderWorkflowsTab(state) {
  const workflows = state.workflows || [];
  const selectedWf = state.selectedWorkflowDetail || (workflows.length > 0 ? workflows[0] : null);
  const states = selectedWf?.states || state.workflowStates || [];
  const transitions = selectedWf?.transitions || state.workflowTransitions || [];

  return `
    <div class="space-y-6">
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
          <div>
            <h3 class="text-base font-bold text-white">Workflow Schemes & Finite State Machine (FSM)</h3>
            <p class="text-xs text-slate-400">Manage lifecycle states, directional transitions, and rule guards that govern issue progression.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="button primary btn-sm" id="btn-admin-create-workflow">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Create Workflow</span>
            </button>
            <button type="button" class="button ghost btn-sm" id="btn-admin-add-guard">
              ${renderIcon('shield', 'w-3.5 h-3.5')}
              <span>Add Transition Guard</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Workflow Name</th>
                <th class="p-3">Workflow Key</th>
                <th class="p-3">Version</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${workflows.length ? workflows.map(w => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-3">
                    <strong class="text-white">${escapeHtml(w.name)}</strong>
                  </td>
                  <td class="p-3">
                    <code class="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-blue-400">${escapeHtml(w.key)}</code>
                  </td>
                  <td class="p-3 text-slate-400 font-mono">v${w.version || 1}</td>
                  <td class="p-3">
                    <span class="badge badge-status status-${w.isActive ? 'done' : 'todo'} text-[10px]">
                      ${w.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <button type="button" class="button ghost btn-xs btn-view-workflow-detail" data-workflow-id="${w.id}">
                      ${renderIcon('search', 'w-3 h-3')}
                      <span>Inspect FSM</span>
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No custom workflows created yet. Default standard agile workflow is active.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Active Workflow FSM States & Transitions Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- FSM States -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="pb-3 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white">Workflow States (${states.length})</h4>
            <p class="text-xs text-slate-400">Configured execution columns and issue categories.</p>
          </div>
          <div class="space-y-2.5">
            ${states.length ? states.map(s => {
              const cat = (s.category || 'todo').toLowerCase();
              const badgeClass = cat === 'done' ? 'status-done' : (cat === 'in_progress' ? 'status-progress' : 'status-todo');
              return `
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <strong class="text-xs font-bold text-white block">${escapeHtml(s.name)}</strong>
                    <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>Position: #${s.position ?? 0}</span>
                      ${s.isInitial ? '<span class="px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800/60">Initial</span>' : ''}
                      ${s.isTerminal ? '<span class="px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800/60">Terminal</span>' : ''}
                    </div>
                  </div>
                  <span class="badge badge-status ${badgeClass} text-[10px] uppercase">
                    ${escapeHtml(s.category || 'TODO')}
                  </span>
                </div>
              `;
            }).join('') : `
              <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Standard States: Backlog (TODO) ➔ In Progress (IN_PROGRESS) ➔ Review (IN_PROGRESS) ➔ Done (DONE)
              </div>
            `}
          </div>
        </div>

        <!-- FSM Transitions & Guards -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="pb-3 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white">Permitted Transitions (${transitions.length})</h4>
            <p class="text-xs text-slate-400">Directional state jumps with validation guards.</p>
          </div>
          <div class="space-y-2.5">
            ${transitions.length ? transitions.map(t => {
              const fromName = states.find(st => st.id === t.fromStateId)?.name || 'Any State';
              const toName = states.find(st => st.id === t.toStateId)?.name || (t.toStateId ? t.toStateId.slice(0, 8) : 'Target');
              return `
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <strong class="text-xs font-bold text-white block">${escapeHtml(t.name || 'Transition')}</strong>
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>${escapeHtml(fromName)}</span>
                      <span class="text-blue-400">➔</span>
                      <span>${escapeHtml(toName)}</span>
                    </div>
                  </div>
                  <span class="badge badge-status status-progress text-[10px]">
                    ${renderIcon('shield', 'w-3 h-3')}
                    <span>Guarded</span>
                  </span>
                </div>
              `;
            }).join('') : `
              <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Standard Transitions: Start Progress, Request Review, Approve & Complete, Reopen.
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCatalogTab(state) {
  const issueTypes = state.issueTypes || [];
  const linkTypes = state.linkTypes || [];
  const labels = state.labels || [];

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Issue Types Catalog -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 class="text-base font-bold text-white">Issue Types Catalog</h3>
              <p class="text-xs text-slate-400">Hierarchy levels and work item classifications.</p>
            </div>
            <button type="button" class="button primary btn-sm" id="btn-admin-add-issue-type">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Add Type</span>
            </button>
          </div>

          <div class="overflow-x-auto border border-slate-800 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th class="p-3">Type Name</th>
                  <th class="p-3">Key</th>
                  <th class="p-3">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${issueTypes.length ? issueTypes.map(it => `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="p-3 font-semibold text-white">${escapeHtml(it.name)}</td>
                    <td class="p-3 font-mono text-blue-400">${escapeHtml(it.key)}</td>
                    <td class="p-3 text-slate-400 truncate max-w-xs">${escapeHtml(it.description || 'Standard work item type')}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="3" class="p-6 text-center text-slate-500 text-xs">Standard Types: Story, Bug, Task, Epic, Subtask</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Link Types Catalog -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 class="text-base font-bold text-white">Issue Link Types</h3>
              <p class="text-xs text-slate-400">Semantic dependency and relationship graphs.</p>
            </div>
            <button type="button" class="button primary btn-sm" id="btn-admin-add-link-type">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Add Link Type</span>
            </button>
          </div>

          <div class="overflow-x-auto border border-slate-800 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th class="p-3">Key</th>
                  <th class="p-3">Outward Label</th>
                  <th class="p-3">Inward Label</th>
                  <th class="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${linkTypes.length ? linkTypes.map(lt => `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="p-3 font-mono text-blue-400">${escapeHtml(lt.key)}</td>
                    <td class="p-3 text-slate-200">${escapeHtml(lt.outwardLabel)}</td>
                    <td class="p-3 text-slate-300">${escapeHtml(lt.inwardLabel)}</td>
                    <td class="p-3 text-right">
                      <button type="button" class="icon-button btn-archive-link-type text-slate-500 hover:text-red-400" data-link-type-id="${lt.id}" title="Archive Link Type">
                        ${renderIcon('trash', 'w-3.5 h-3.5')}
                      </button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" class="p-6 text-center text-slate-500 text-xs">Standard Links: Blocks / Is Blocked By, Relates To, Clones</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Labels Taxonomy Card -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Taxonomy & Labels Catalog</h3>
            <p class="text-xs text-slate-400">Cross-cutting tags used across issues, boards, and JQL queries.</p>
          </div>
          <span class="count-badge">${labels.length} Active Labels</span>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          ${labels.length ? labels.map(lbl => `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span>${escapeHtml(lbl.name)}</span>
              <button type="button" class="icon-button btn-archive-label text-slate-500 hover:text-red-400 p-0 w-4 h-4" data-label-id="${lbl.id}" title="Archive Label">
                ${renderIcon('close', 'w-3 h-3')}
              </button>
            </div>
          `).join('') : `
            <div class="text-slate-500 text-xs">
              No global labels registered yet. Labels created on issues will appear here automatically.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderAuditTab(state) {
  const auditLogs = state.auditLogs || [];
  const outbox = state.mailOutbox || [];

  return `
    <div class="space-y-6">
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
          <div>
            <h3 class="text-base font-bold text-white">Audit Trail & Security Compliance Logs</h3>
            <p class="text-xs text-slate-400">Immutable event ledger documenting organizational mutations, membership changes, and issue transitions.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="button ghost btn-sm" id="btn-admin-refresh-audit">
              ${renderIcon('refresh', 'w-3 h-3')}
              <span>Refresh Audit Trail</span>
            </button>
            <span class="count-badge">${auditLogs.length} Events Loaded</span>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Timestamp</th>
                <th class="p-3">Actor</th>
                <th class="p-3">Action</th>
                <th class="p-3">Entity Type</th>
                <th class="p-3">Details / Payload</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${auditLogs.length ? auditLogs.map(log => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-3 text-slate-500 font-mono text-[11px]">${formatDate(log.createdAt || log.timestamp)}</td>
                  <td class="p-3 font-semibold text-white">${escapeHtml(log.actorName || (log.actorId ? log.actorId.slice(0, 8) : 'System'))}</td>
                  <td class="p-3">
                    <span class="badge badge-status status-progress text-[10px] uppercase">${escapeHtml(log.action || log.eventType || 'MUTATE')}</span>
                  </td>
                  <td class="p-3 font-mono text-slate-400">${escapeHtml(log.entityType || 'record')}</td>
                  <td class="p-3 text-slate-300 font-mono text-[11px] truncate max-w-xs">${escapeHtml(typeof log.payload === 'object' ? JSON.stringify(log.payload) : (log.details || log.entityId || ''))}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No audit records captured yet for this organization.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Outbox Dispatches -->
      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white">Transactional Outbox & Webhook Events</h3>
            <p class="text-xs text-slate-400">Reliable event dispatch buffer for notifications, webhooks, and SMTP deliveries.</p>
          </div>
          <span class="count-badge">${outbox.length} Dispatched</span>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Timestamp</th>
                <th class="p-3">Target / Recipient</th>
                <th class="p-3">Category</th>
                <th class="p-3">Subject / Event</th>
                <th class="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${outbox.length ? outbox.map(m => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-3 text-slate-500 font-mono text-[11px]">${formatDate(m.timestamp)}</td>
                  <td class="p-3 font-semibold text-slate-200">${escapeHtml(m.to || 'internal')}</td>
                  <td class="p-3">
                    <span class="badge badge-status status-progress text-[10px] uppercase">${escapeHtml(m.category || 'EVENT')}</span>
                  </td>
                  <td class="p-3 text-slate-300 truncate max-w-xs">${escapeHtml(m.subject || 'Event Dispatch')}</td>
                  <td class="p-3 text-right">
                    <span class="badge badge-status ${m.sent !== false ? 'status-done' : 'status-danger'} text-[10px]">
                      ${m.sent !== false ? 'SENT' : 'QUEUED'}
                    </span>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="p-6 text-center text-slate-500 text-xs">No recent outbox event dispatches buffered.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
