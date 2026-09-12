import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderAvatar } from '../../shared/components/badges.js';

export function renderAdminView(state) {
  const currentTab = state.adminTab || 'org';
  const org = state.organization || {};
  const project = state.projectDetail;

  return `
    <div class="admin-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">WORKSPACE & COMPLIANCE</p>
          <h2>Administration & Settings</h2>
        </div>
      </div>

      <!-- Admin Tab Navigation -->
      <div class="admin-tab-nav">
        <button class="admin-tab-btn ${currentTab === 'org' ? 'active' : ''}" data-admin-tab="org">
          🏢 Organization
        </button>
        <button class="admin-tab-btn ${currentTab === 'members' ? 'active' : ''}" data-admin-tab="members">
          👥 Members & Invites (${state.members?.length || 0})
        </button>
        <button class="admin-tab-btn ${currentTab === 'roles' ? 'active' : ''}" data-admin-tab="roles">
          🛡️ Roles & Permissions
        </button>
        <button class="admin-tab-btn ${currentTab === 'groups' ? 'active' : ''}" data-admin-tab="groups">
          🌲 Departments & Groups
        </button>
        <button class="admin-tab-btn ${currentTab === 'fields' ? 'active' : ''}" data-admin-tab="fields">
          ✨ Custom Fields
        </button>
        <button class="admin-tab-btn ${currentTab === 'workflows' ? 'active' : ''}" data-admin-tab="workflows">
          🔄 Workflows & FSM (${state.workflows?.length || 0})
        </button>
        <button class="admin-tab-btn ${currentTab === 'catalog' ? 'active' : ''}" data-admin-tab="catalog">
          📋 Issue Types & Catalog
        </button>
        <button class="admin-tab-btn ${currentTab === 'audit' ? 'active' : ''}" data-admin-tab="audit">
          📜 Audit & Outbox
        </button>
        <button class="admin-tab-btn ${currentTab === 'project' ? 'active' : ''}" data-admin-tab="project">
          📁 Project Settings (${state.selectedProjectId ? 'Active' : 'Select'})
        </button>
        ${state.user?.isSystemAdmin ? `
          <button class="admin-tab-btn ${currentTab === 'system' ? 'active' : ''}" data-admin-tab="system">
            ⚡ Platform Admin
          </button>
        ` : ''}
      </div>

      <div class="admin-tab-content">
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
    <div class="admin-section-card">
      <div class="card-header">
        <div>
          <h3>Organization Profile</h3>
          <p class="muted">Manage the root tenant identity, key, and membership boundaries.</p>
        </div>
        <span class="badge ${org.status === 'active' ? 'badge-primary' : 'badge-danger'}">${(org.status || 'ACTIVE').toUpperCase()}</span>
      </div>

      <form id="form-update-org" class="admin-form-grid">
        <div class="form-row-2">
          <div class="form-group">
            <label for="org-key-input">Organization Key</label>
            <input type="text" id="org-key-input" value="${escapeHtml(org.key || state.org)}" disabled class="input-clean input-disabled" />
          </div>
          <div class="form-group">
            <label for="org-name-input">Organization Name</label>
            <input type="text" id="org-name-input" name="name" value="${escapeHtml(org.name || '')}" class="input-clean" required />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="org-status-select">Status</label>
            <select id="org-status-select" name="status" class="select-clean full-select">
              <option value="active" ${org.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="suspended" ${org.status === 'suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
          <div class="form-group">
            <label>Subscription Plan</label>
            <input type="text" value="${escapeHtml(org.plan || 'Enterprise')}" disabled class="input-clean input-disabled" />
          </div>
        </div>

        <div class="form-actions-row">
          <button type="submit" class="button primary">Save Organization Settings</button>
        </div>
      </form>
    </div>
  `;
}

function renderMembersTab(state) {
  const members = state.members || [];
  const invitations = state.invitations || [];

  return `
    <div class="admin-grid-2">
      <!-- Members List -->
      <div class="admin-section-card">
        <div class="card-header">
          <div>
            <h3>Active Members (${members.length})</h3>
            <p class="muted">People who have accepted invites and belong to this organization.</p>
          </div>
        </div>

        <div class="admin-items-table">
          ${members.map(m => `
            <div class="admin-member-row">
              <div class="member-info">
                ${renderAvatar(m, 'sm')}
                <div>
                  <strong>${escapeHtml(m.fullName)}</strong>
                  <div class="member-meta">
                    <span>${escapeHtml(m.email)}</span>
                    <span class="badge badge-status status-${m.status === 'active' ? 'done' : 'todo'}">${escapeHtml(m.status)}</span>
                  </div>
                </div>
              </div>
              <div class="member-action-controls">
                <select class="select-clean select-member-status" data-member-id="${m.id}">
                  <option value="active" ${m.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="suspended" ${m.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                </select>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Invitations -->
      <div class="admin-section-card">
        <div class="card-header">
          <div>
            <h3>Invitations (${invitations.length})</h3>
            <p class="muted">Pending invite links sent to prospective team members.</p>
          </div>
        </div>

        <form id="form-invite-member" class="inline-add-form flex-wrap gap-2">
          <input type="email" id="invite-email-input" name="email" placeholder="colleague@company.com" required class="input-clean flex-1 min-w-[200px]" />
          <select id="invite-role-select" name="roleId" class="select-clean text-xs">
            <option value="">Standard Member (Default)</option>
            ${(state.orgRoles || []).map(r => `
              <option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${escapeHtml(r.key)})</option>
            `).join('')}
          </select>
          <button type="submit" class="button primary whitespace-nowrap">Send Invite</button>
        </form>

        <div class="admin-items-table">
          ${invitations.length ? invitations.map(inv => `
            <div class="admin-member-row">
              <div class="inv-info">
                <strong>${escapeHtml(inv.email)}</strong>
                <small class="muted">Status: ${escapeHtml(inv.status)} · Expires: ${formatDate(inv.expiresAt)}</small>
              </div>
              ${inv.status === 'pending' ? `
                <div class="inv-actions-group">
                  <button type="button" class="button ghost btn-sm btn-resend-invitation" data-invitation-id="${inv.id}" title="Re-issue and refresh invite token">🔄 Resend</button>
                  <button type="button" class="button danger btn-sm btn-revoke-invitation" data-invitation-id="${inv.id}" title="Revoke this invitation">Revoke</button>
                </div>
              ` : ''}
            </div>
          `).join('') : `
            <div class="empty-hint-text">No pending invitations.</div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderRolesTab(state) {
  const roles = state.orgRoles || [];

  return `
    <div class="admin-section-card">
      <div class="card-header">
        <div>
          <h3>Organization Roles & RBAC</h3>
          <p class="muted">Define reusable roles and grant granular capabilities across organizations.</p>
        </div>
        <button class="button primary btn-sm" id="btn-create-org-role">+ Add Org Role</button>
      </div>

      <div class="roles-matrix-grid">
        ${roles.map(r => `
          <div class="role-matrix-card">
            <div class="role-card-header">
              <strong>${escapeHtml(r.name)}</strong>
              <code>${escapeHtml(r.key)}</code>
            </div>
            <p class="role-desc">${escapeHtml(r.description || 'No description.')}</p>
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
    <div class="admin-grid-2">
      <!-- Departments -->
      <div class="admin-section-card">
        <div class="card-header">
          <div>
            <h3>Departments</h3>
            <p class="muted">Hierarchical departmental structure.</p>
          </div>
          <button class="button ghost btn-sm" id="btn-create-dept">+ Department</button>
        </div>

        <div class="admin-items-table">
          ${depts.length ? depts.map(d => `
            <div class="admin-member-row">
              <strong>📁 ${escapeHtml(d.name)}</strong>
              <span class="muted-small">${d.parentDepartmentId ? 'Nested' : 'Root'}</span>
            </div>
          `).join('') : '<div class="empty-hint-text">No departments created.</div>'}
        </div>
      </div>

      <!-- Groups -->
      <div class="admin-section-card">
        <div class="card-header">
          <div>
            <h3>User Groups</h3>
            <p class="muted">Named cohorts used for bulk role assignments.</p>
          </div>
          <button class="button ghost btn-sm" id="btn-create-group">+ Group</button>
        </div>

        <div class="admin-items-table">
          ${groups.length ? groups.map(g => `
            <div class="admin-member-row">
              <div>
                <strong>👥 ${escapeHtml(g.name)}</strong>
                <p class="muted-small">${escapeHtml(g.description || '')}</p>
              </div>
            </div>
          `).join('') : '<div class="empty-hint-text">No groups created.</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderCustomFieldsTab(state) {
  const fields = state.customFields || [];
  return `
    <div class="admin-section-card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3>✨ Custom Fields & Schema Attributes</h3>
          <p class="muted">Define typed custom attributes (Text, Number, Single Select, Multi Select, Date) across issues.</p>
        </div>
        <button type="button" class="button primary btn-sm" id="btn-admin-add-custom-field">
          + Add Custom Field
        </button>
      </div>

      <div class="admin-items-table">
        <div class="table-header-row" style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 2fr auto; gap: 12px; padding: 8px 12px; font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--text-muted);">
          <span>Field Name</span>
          <span>Field Key</span>
          <span>Data Type</span>
          <span>Description</span>
          <span style="text-align: right;">Options</span>
        </div>
        ${fields.length ? fields.map(f => `
          <div class="admin-member-row" style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 2fr auto; gap: 12px; align-items: center; padding: 10px 12px;">
            <div>
              <strong>${escapeHtml(f.name)}</strong>
              ${f.isRequired ? '<span class="badge badge-tag" style="margin-left: 6px;">Required</span>' : ''}
            </div>
            <span class="font-mono text-xs text-text-muted">${escapeHtml(f.key || f.id?.slice(0, 8))}</span>
            <div>
              <span class="badge badge-primary text-xs uppercase">${escapeHtml(f.fieldType || 'text')}</span>
            </div>
            <div class="muted-small">
              ${escapeHtml(f.description || 'Organization Field')}
            </div>
            <div style="text-align: right;">
              ${f.fieldType === 'select' || f.fieldType === 'multi_select' ? `
                <button type="button" class="button ghost btn-sm btn-admin-add-option" data-field-id="${f.id}" data-field-name="${escapeHtml(f.name)}">
                  + Option
                </button>
              ` : '<span class="muted-small">—</span>'}
            </div>
          </div>
        `).join('') : '<div class="empty-hint-text">No custom fields defined yet. Click "+ Add Custom Field" to create one.</div>'}
      </div>
    </div>
  `;
}

function renderProjectSettingsTab(project, state) {
  if (!project) {
    return `
      <div class="empty-state-view" style="text-align: center; padding: 48px 20px;">
        <h3>No project selected</h3>
        <p class="muted" style="margin-bottom: 16px;">Choose a project from the top navigation bar or create a new project to start managing tasks.</p>
        <button type="button" class="button primary" id="btn-admin-create-project-trigger">
          + Create New Project
        </button>
      </div>
    `;
  }

  const components = state.components || [];
  const versions = state.versions || [];

  return `
    <div class="project-settings-container">
      <div class="admin-section-card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3>Project: ${escapeHtml(project.name)} (${escapeHtml(project.key)})</h3>
            <p class="muted">Lifecycle, visibility, and components for this workspace.</p>
          </div>
          <div class="header-actions" style="display: flex; gap: 8px;">
            <button type="button" class="button primary btn-sm" id="btn-admin-create-project-trigger">
              + New Project
            </button>
            <button class="button ghost btn-sm" id="btn-toggle-project-archive">
              ${project.archivedAt ? 'Restore Project' : 'Archive Project'}
            </button>
          </div>
        </div>

        <form id="form-update-project" class="admin-form-grid">
          <div class="form-row-2">
            <div class="form-group">
              <label>Project Key</label>
              <input type="text" value="${escapeHtml(project.key)}" disabled class="input-clean input-disabled" />
            </div>
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" name="name" value="${escapeHtml(project.name)}" class="input-clean" required />
            </div>
          </div>
          <div class="form-group">
            <label>Visibility</label>
            <select name="visibility" class="select-clean full-select">
              <option value="private" ${project.visibility === 'private' ? 'selected' : ''}>Private</option>
              <option value="org" ${project.visibility === 'org' ? 'selected' : ''}>Organization-wide</option>
              <option value="public" ${project.visibility === 'public' ? 'selected' : ''}>Public</option>
            </select>
          </div>
          <button type="submit" class="button primary">Save Project</button>
        </form>
      </div>

      <div class="admin-grid-2">
        <!-- Components -->
        <div class="admin-section-card">
          <div class="card-header">
            <h4>Components (${components.length})</h4>
            <button class="button ghost btn-sm" id="btn-add-component">+ Component</button>
          </div>
          <div class="admin-items-table">
            ${components.length ? components.map(c => `
              <div class="admin-member-row">
                <div>
                  <strong>${escapeHtml(c.name)}</strong>
                  <p class="muted-small">${escapeHtml(c.description || 'No description')}</p>
                </div>
                <button class="icon-button btn-archive-component" data-component-id="${c.id}" title="Archive">×</button>
              </div>
            `).join('') : '<div class="empty-hint-text">No components. Create components to categorize issues.</div>'}
          </div>
        </div>

        <!-- Versions -->
        <div class="admin-section-card">
          <div class="card-header">
            <h4>Releases & Versions (${versions.length})</h4>
            <button class="button ghost btn-sm" id="btn-add-version">+ Version</button>
          </div>
          <div class="admin-items-table">
            ${versions.length ? versions.map(v => `
              <div class="admin-member-row">
                <div>
                  <strong>${escapeHtml(v.name)}</strong>
                  <span class="badge badge-status status-${v.status === 'released' ? 'done' : 'todo'}">${escapeHtml(v.status)}</span>
                </div>
                ${v.status === 'unreleased' ? `
                  <button class="button primary btn-sm btn-release-version" data-version-id="${v.id}">Release</button>
                ` : ''}
              </div>
            `).join('') : '<div class="empty-hint-text">No releases. Create versions to plan target releases.</div>'}
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
    <div class="system-admin-dashboard">
      <!-- Section 1: Global Users Directory (UC-SYS-01) & User CRUD -->
      <div class="admin-section-card" style="margin-bottom: 2rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3>⚡ Global User Management & Account CRUD</h3>
            <p class="muted">System Administrator control plane — create, edit, deactivate/delete accounts, and force-terminate active sessions.</p>
          </div>
          <div class="header-action-badge" style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="button primary btn-sm" id="btn-admin-add-user">
              ➕ Add User
            </button>
            <span class="badge badge-primary">Total: ${users.length} Users</span>
          </div>
        </div>

        <div class="admin-items-table">
          <div class="table-header-row user-table-grid">
            <span>User</span>
            <span>Status</span>
            <span>Platform Role</span>
            <span>Registered</span>
            <span style="text-align: right;">Actions</span>
          </div>

          ${users.length ? users.map(u => `
            <div class="admin-member-row user-table-grid" style="align-items: center;">
              <div class="member-info">
                ${renderAvatar(u, 'sm')}
                <div>
                  <strong>${escapeHtml(u.fullName || 'No Name')}</strong>
                  <div class="member-meta">
                    <span>${escapeHtml(u.email)}</span>
                    ${u.emailVerifiedAt ? '<span class="badge-tag tag-verified" title="Email Verified">✓ Verified</span>' : '<span class="badge-tag tag-unverified" title="Email Pending Verification">⏳ Unverified</span>'}
                  </div>
                </div>
              </div>

              <div>
                <span class="badge badge-status status-${u.status === 'active' ? 'done' : u.status === 'suspended' ? 'blocked' : 'todo'}">
                  ${escapeHtml(u.status)}
                </span>
              </div>

              <div>
                ${u.isSystemAdmin ? '<span class="badge badge-purple">⚡ System Admin</span>' : '<span class="muted-small">User</span>'}
              </div>

              <div class="muted-small">
                ${formatDate(u.createdAt)}
              </div>

              <div class="user-action-btns" style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                <button type="button" class="button ghost btn-sm btn-admin-edit-user" data-user-id="${u.id}" data-email="${escapeHtml(u.email)}" data-fullname="${escapeHtml(u.fullName || '')}" data-status="${u.status}" data-admin="${u.isSystemAdmin ? 'true' : 'false'}">
                  ✏️ Edit
                </button>
                ${u.id !== state.user?.id ? `
                  <button type="button" class="button ${u.status === 'suspended' ? 'primary' : 'ghost'} btn-sm btn-admin-toggle-user" data-user-id="${u.id}" data-current-status="${u.status}">
                    ${u.status === 'suspended' ? 'Activate' : 'Suspend'}
                  </button>
                  <button type="button" class="button ghost btn-sm btn-admin-force-revoke" data-user-id="${u.id}" title="Revoke all active sessions for this user">
                    Revoke
                  </button>
                  <button type="button" class="button danger btn-sm btn-admin-delete-user" data-user-id="${u.id}" data-email="${escapeHtml(u.email)}" title="Delete user account">
                    🗑️ Delete
                  </button>
                ` : `
                  <span class="muted-small" style="padding: 4px 8px; font-style: italic;">Current User</span>
                `}
              </div>
            </div>
          `).join('') : `
            <div class="empty-hint-text">No users loaded or unauthorized.</div>
          `}
        </div>
      </div>

      <!-- Section 2: Mail Gateway & SMTP Delivery Diagnostics -->
      <div class="admin-section-card" style="margin-bottom: 2rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3>📧 Mail Gateway & SMTP Delivery Diagnostics</h3>
            <p class="muted">Live SMTP dispatch verification, automated welcome emails, password resets, and outbox logs.</p>
          </div>
          <div class="header-action-badge" style="display: flex; gap: 8px;">
            <button type="button" class="button ghost btn-sm" id="btn-refresh-outbox">
              🔄 Refresh Outbox
            </button>
            <span class="badge badge-primary">${outbox.length} in Outbox</span>
          </div>
        </div>

        <div style="padding: 1.25rem 0;">
          <form id="form-send-test-mail" class="admin-form-grid" style="background: var(--bg-surface-elevated, #1a202c); padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border-color, rgba(255,255,255,0.1));">
            <h4 style="margin: 0 0 0.75rem 0; font-size: 0.95rem; font-weight: 600;">🚀 Send Diagnostic Test Email</h4>
            <div class="form-row-2">
              <div class="form-group" style="margin-bottom: 0;">
                <label for="test-mail-recipient">Recipient Email</label>
                <input type="email" id="test-mail-recipient" class="input-clean" placeholder="admin@company.com" value="${escapeHtml(state.user?.email || 'admin@taskmanager.dev')}" required />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label for="test-mail-subject">Subject (Optional)</label>
                <input type="text" id="test-mail-subject" class="input-clean" placeholder="Task Manager Pro — SMTP Delivery Test" />
              </div>
            </div>
            <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
              <button type="submit" class="button primary btn-sm" id="btn-submit-test-mail">
                ✉️ Send Diagnostic Email
              </button>
            </div>
          </form>

          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.95rem; font-weight: 600;">📬 Recent Outbox Dispatches</h4>
          <div class="admin-items-table">
            <div class="table-header-row" style="display: grid; grid-template-columns: 140px 220px 140px 1fr 120px; gap: 12px; font-weight: 600; font-size: 0.82rem; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
              <span>Timestamp</span>
              <span>Recipient</span>
              <span>Category</span>
              <span>Subject</span>
              <span style="text-align: right;">Status</span>
            </div>

            ${outbox.length ? outbox.map(m => `
              <div class="admin-member-row" style="display: grid; grid-template-columns: 140px 220px 140px 1fr 120px; gap: 12px; align-items: center; padding: 10px 12px; font-size: 0.85rem; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.05));">
                <span class="muted-small">${formatDate(m.timestamp)}</span>
                <strong style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(m.to)}</strong>
                <div>
                  <span class="badge ${m.category === 'verification' ? 'badge-primary' : m.category === 'invitation' ? 'badge-purple' : 'badge-warning'} btn-sm" style="font-size: 0.72rem; text-transform: uppercase;">
                    ${escapeHtml(m.category || 'general')}
                  </span>
                </div>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary);">${escapeHtml(m.subject)}</span>
                <div style="text-align: right;">
                  <span class="badge ${m.sent ? 'badge-primary' : 'badge-danger'}" style="font-size: 0.75rem;">
                    ${m.sent ? '✓ Delivered' : '⚠️ Queued'}
                  </span>
                </div>
              </div>
            `).join('') : `
              <div class="empty-hint-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                No recent dispatched emails in buffer. Use the test sender above or perform registration/invitations to trigger mail delivery.
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Section 3: Global Organizations Directory (UC-SYS-02) -->
      <div class="admin-section-card">
        <div class="card-header">
          <div>
            <h3>🏢 Global Organizations & Tenants (UC-SYS-02)</h3>
            <p class="muted">Manage workspace boundaries, tenant subscription tiers, and operational status.</p>
          </div>
          <div class="header-action-badge">
            <span class="badge badge-primary">Total: ${orgs.length} Organizations</span>
          </div>
        </div>

        <div class="admin-items-table">
          <div class="table-header-row org-table-grid">
            <span>Key / Name</span>
            <span>Plan Tier</span>
            <span>Status</span>
            <span>Created</span>
            <span style="text-align: right;">Actions</span>
          </div>

          ${orgs.length ? orgs.map(o => `
            <div class="admin-member-row org-table-grid" style="align-items: center;">
              <div>
                <strong>${escapeHtml(o.name)}</strong>
                <div class="member-meta">
                  <code>${escapeHtml(o.key)}</code>
                </div>
              </div>

              <div>
                <select class="select-clean sys-org-plan-select" data-org-id="${o.id}">
                  <option value="free" ${o.plan === 'free' ? 'selected' : ''}>Free Tier</option>
                  <option value="starter" ${o.plan === 'starter' ? 'selected' : ''}>Starter</option>
                  <option value="professional" ${o.plan === 'professional' ? 'selected' : ''}>Professional</option>
                  <option value="enterprise" ${o.plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                </select>
              </div>

              <div>
                <select class="select-clean sys-org-status-select" data-org-id="${o.id}">
                  <option value="active" ${o.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="suspended" ${o.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                </select>
              </div>

              <div class="muted-small">
                ${formatDate(o.createdAt)}
              </div>

              <div style="display: flex; justify-content: flex-end;">
                <button type="button" class="button primary btn-sm btn-sys-update-org" data-org-id="${o.id}">
                  Apply
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="empty-hint-text">No organizations found.</div>
          `}
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
    <div class="admin-section-card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3>🔄 Workflow Schemes & Finite State Machine (FSM)</h3>
          <p class="muted">Manage lifecycle states, directional transitions, and rule guards that govern issue progression.</p>
        </div>
        <div class="header-action-badge" style="display: flex; gap: 8px;">
          <button type="button" class="button primary btn-sm" id="btn-admin-create-workflow">
            ➕ Create Workflow
          </button>
          <button type="button" class="button ghost btn-sm" id="btn-admin-add-guard">
            🛡️ Add Transition Guard
          </button>
        </div>
      </div>

      <div class="admin-items-table" style="margin-top: 1rem;">
        <div class="table-header-row" style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr; gap: 12px; font-weight: 600; font-size: 0.82rem; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
          <span>Workflow Name</span>
          <span>Workflow Key</span>
          <span>Version</span>
          <span>Status</span>
          <span style="text-align: right;">Actions</span>
        </div>

        ${workflows.length ? workflows.map(w => `
          <div class="admin-member-row" style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr; gap: 12px; align-items: center; padding: 10px 12px; font-size: 0.85rem; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.05));">
            <div>
              <strong>${escapeHtml(w.name)}</strong>
            </div>
            <div>
              <code style="font-family: var(--font-mono); font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">${escapeHtml(w.key)}</code>
            </div>
            <div>
              <span class="badge badge-purple" style="font-size: 0.72rem;">v${w.version || 1}</span>
            </div>
            <div>
              <span class="badge ${w.isActive ? 'badge-primary' : 'badge-danger'}" style="font-size: 0.72rem;">
                ${w.isActive ? '✓ ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div style="text-align: right;">
              <button type="button" class="button ghost btn-sm btn-view-workflow-detail" data-workflow-id="${w.id}">
                🔍 Inspect FSM
              </button>
            </div>
          </div>
        `).join('') : `
          <div class="empty-hint-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
            No custom workflows created yet. Default standard agile workflow is active.
          </div>
        `}
      </div>
    </div>

    <!-- Active Workflow FSM States & Transitions Grid -->
    <div class="admin-grid-2">
      <!-- FSM States -->
      <div class="admin-section-card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4>🏷️ Workflow States (${states.length})</h4>
            <p class="muted-small">Configured execution columns and issue categories.</p>
          </div>
        </div>
        <div class="admin-items-table">
          ${states.length ? states.map(s => {
            const cat = (s.category || 'todo').toLowerCase();
            const badgeClass = cat === 'done' ? 'badge-primary' : (cat === 'in_progress' ? 'badge-purple' : 'badge-warning');
            return `
              <div class="admin-member-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px;">
                <div>
                  <strong>${escapeHtml(s.name)}</strong>
                  <div class="member-meta" style="margin-top: 2px;">
                    <span class="muted-small">Position: #${s.position ?? 0}</span>
                    ${s.isInitial ? '<span class="badge-tag tag-verified" style="margin-left: 6px;">Initial</span>' : ''}
                    ${s.isTerminal ? '<span class="badge-tag" style="margin-left: 6px; background: rgba(147, 51, 234, 0.2); color: #c084fc;">Terminal</span>' : ''}
                  </div>
                </div>
                <div>
                  <span class="badge ${badgeClass}" style="font-size: 0.72rem; text-transform: uppercase;">
                    ${escapeHtml(s.category || 'TODO')}
                  </span>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="empty-hint-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
              Standard States: Backlog (TODO) ➔ In Progress (IN_PROGRESS) ➔ Review (IN_PROGRESS) ➔ Done (DONE)
            </div>
          `}
        </div>
      </div>

      <!-- FSM Transitions & Guards -->
      <div class="admin-section-card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4>🔀 Permitted Transitions (${transitions.length})</h4>
            <p class="muted-small">Directional state jumps with validation guards.</p>
          </div>
        </div>
        <div class="admin-items-table">
          ${transitions.length ? transitions.map(t => {
            const fromName = states.find(st => st.id === t.fromStateId)?.name || 'Any State';
            const toName = states.find(st => st.id === t.toStateId)?.name || (t.toStateId ? t.toStateId.slice(0, 8) : 'Target');
            return `
              <div class="admin-member-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; font-size: 0.85rem;">
                <div>
                  <strong>${escapeHtml(t.name || 'Transition')}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; display: flex; align-items: center; gap: 6px;">
                    <span>${escapeHtml(fromName)}</span>
                    <span style="color: var(--blue-400);">➔</span>
                    <span>${escapeHtml(toName)}</span>
                  </div>
                </div>
                <div>
                  <span class="badge badge-purple" style="font-size: 0.72rem;" title="Transition Guard">
                    🛡️ Guarded
                  </span>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="empty-hint-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
              Standard Transitions: Start Progress, Request Review, Approve & Complete, Reopen.
            </div>
          `}
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
    <div class="admin-grid-2" style="margin-bottom: 1.5rem;">
      <!-- Issue Types Catalog -->
      <div class="admin-section-card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>📋 Issue Types Catalog</h3>
            <p class="muted">Hierarchy levels and work item classifications.</p>
          </div>
          <button type="button" class="button primary btn-sm" id="btn-admin-add-issue-type">
            ➕ Add Issue Type
          </button>
        </div>

        <div class="admin-items-table" style="margin-top: 0.75rem;">
          <div class="table-header-row" style="display: grid; grid-template-columns: 2fr 1.5fr 2fr; gap: 10px; font-weight: 600; font-size: 0.8rem; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
            <span>Type Name</span>
            <span>Key</span>
            <span>Description</span>
          </div>

          ${issueTypes.length ? issueTypes.map(it => `
            <div class="admin-member-row" style="display: grid; grid-template-columns: 2fr 1.5fr 2fr; gap: 10px; align-items: center; padding: 10px 12px; font-size: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem;">${it.key === 'bug' ? '🐞' : it.key === 'epic' ? '⚡' : it.key === 'subtask' ? '☑️' : '📌'}</span>
                <strong>${escapeHtml(it.name)}</strong>
              </div>
              <div>
                <code style="font-family: var(--font-mono); font-size: 0.78rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">${escapeHtml(it.key)}</code>
              </div>
              <div class="muted-small" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(it.description || 'Standard work item type')}
              </div>
            </div>
          `).join('') : `
            <div class="empty-hint-text" style="padding: 1rem; text-align: center; color: var(--text-muted);">
              Standard Types: Story, Bug, Task, Epic, Subtask
            </div>
          `}
        </div>
      </div>

      <!-- Link Types Catalog -->
      <div class="admin-section-card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>🔗 Issue Link Types</h3>
            <p class="muted">Semantic dependency and relationship graphs.</p>
          </div>
          <button type="button" class="button primary btn-sm" id="btn-admin-add-link-type">
            ➕ Add Link Type
          </button>
        </div>

        <div class="admin-items-table" style="margin-top: 0.75rem;">
          <div class="table-header-row" style="display: grid; grid-template-columns: 1.5fr 2fr 2fr 1fr auto; gap: 10px; font-weight: 600; font-size: 0.8rem; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
            <span>Key</span>
            <span>Outward Label</span>
            <span>Inward Label</span>
            <span>Direction</span>
            <span style="text-align: right;">Action</span>
          </div>

          ${linkTypes.length ? linkTypes.map(lt => `
            <div class="admin-member-row" style="display: grid; grid-template-columns: 1.5fr 2fr 2fr 1fr auto; gap: 10px; align-items: center; padding: 10px 12px; font-size: 0.85rem;">
              <div>
                <code>${escapeHtml(lt.key)}</code>
              </div>
              <div>
                <span class="badge badge-primary" style="font-size: 0.72rem;">${escapeHtml(lt.outwardLabel)}</span>
              </div>
              <div>
                <span class="badge badge-purple" style="font-size: 0.72rem;">${escapeHtml(lt.inwardLabel)}</span>
              </div>
              <div class="muted-small">
                ${escapeHtml(lt.directionality || 'directed')}
              </div>
              <div style="text-align: right;">
                <button type="button" class="icon-button btn-archive-link-type" data-link-type-id="${lt.id}" title="Archive Link Type">×</button>
              </div>
            </div>
          `).join('') : `
            <div class="empty-hint-text" style="padding: 1rem; text-align: center; color: var(--text-muted);">
              Standard Links: Blocks / Is Blocked By, Relates To, Clones / Is Cloned By
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- Labels Taxonomy Card -->
    <div class="admin-section-card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3>🏷️ Taxonomy & Labels Catalog</h3>
          <p class="muted">Cross-cutting tags used across issues, boards, and JQL queries.</p>
        </div>
        <span class="badge badge-primary">${labels.length} Active Labels</span>
      </div>

      <div style="padding: 1rem 0; display: flex; flex-wrap: wrap; gap: 8px;">
        ${labels.length ? labels.map(lbl => `
          <div class="label-chip" style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 0.82rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-default); border-radius: 6px;">
            <span>🏷️ ${escapeHtml(lbl.name)}</span>
            <button type="button" class="icon-button btn-archive-label" data-label-id="${lbl.id}" style="width: 18px; height: 18px; font-size: 12px; opacity: 0.7; cursor: pointer;" title="Archive Label">×</button>
          </div>
        `).join('') : `
          <div class="empty-hint-text" style="color: var(--text-muted); font-size: 0.85rem;">
            No global labels registered yet. Labels created on issues will appear here automatically.
          </div>
        `}
      </div>
    </div>
  `;
}

function renderAuditTab(state) {
  const auditLogs = state.auditLogs || [];
  const outbox = state.mailOutbox || [];

  return `
    <div class="admin-section-card" style="margin-bottom: 2rem;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3>📜 Audit Trail & Security Compliance Logs</h3>
          <p class="muted">Immutable event ledger documenting organizational mutations, membership changes, and issue transitions.</p>
        </div>
        <div class="header-action-badge" style="display: flex; gap: 8px;">
          <button type="button" class="button ghost btn-sm" id="btn-admin-refresh-audit">
            🔄 Refresh Audit Trail
          </button>
          <span class="badge badge-primary">${auditLogs.length} Events Loaded</span>
        </div>
      </div>

      <div class="admin-items-table" style="margin-top: 1rem;">
        <div class="table-header-row" style="display: grid; grid-template-columns: 150px 140px 160px 140px 1fr; gap: 12px; font-weight: 600; font-size: 0.82rem; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
          <span>Timestamp</span>
          <span>Actor</span>
          <span>Action</span>
          <span>Entity Type</span>
          <span>Details / Payload</span>
        </div>

        ${auditLogs.length ? auditLogs.map(log => `
          <div class="admin-member-row" style="display: grid; grid-template-columns: 150px 140px 160px 140px 1fr; gap: 12px; align-items: center; padding: 10px 12px; font-size: 0.85rem; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.05));">
            <span class="muted-small">${formatDate(log.createdAt || log.timestamp)}</span>
            <strong>${escapeHtml(log.actorName || (log.actorId ? log.actorId.slice(0, 8) : 'System'))}</strong>
            <div>
              <span class="badge badge-primary btn-sm" style="font-size: 0.72rem; text-transform: uppercase;">
                ${escapeHtml(log.action || log.eventType || 'MUTATE')}
              </span>
            </div>
            <div>
              <code style="font-size: 0.76rem;">${escapeHtml(log.entityType || 'record')}</code>
            </div>
            <div class="muted-small" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--font-mono); font-size: 0.75rem;">
              ${escapeHtml(typeof log.payload === 'object' ? JSON.stringify(log.payload) : (log.details || log.entityId || ''))}
            </div>
          </div>
        `).join('') : `
          <div class="empty-hint-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
            No audit records captured yet for this organization.
          </div>
        `}
      </div>
    </div>

    <!-- Outbox Dispatches -->
    <div class="admin-section-card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3>📬 Transactional Outbox & Webhook Events</h3>
          <p class="muted">Reliable event dispatch buffer for notifications, webhooks, and SMTP deliveries.</p>
        </div>
        <span class="badge badge-purple">${outbox.length} Dispatched</span>
      </div>

      <div class="admin-items-table" style="margin-top: 1rem;">
        <div class="table-header-row" style="display: grid; grid-template-columns: 150px 180px 140px 1fr 100px; gap: 12px; font-weight: 600; font-size: 0.82rem; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
          <span>Timestamp</span>
          <span>Target / Recipient</span>
          <span>Category</span>
          <span>Subject / Event</span>
          <span style="text-align: right;">Status</span>
        </div>

        ${outbox.length ? outbox.map(m => `
          <div class="admin-member-row" style="display: grid; grid-template-columns: 150px 180px 140px 1fr 100px; gap: 12px; align-items: center; padding: 10px 12px; font-size: 0.85rem; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.05));">
            <span class="muted-small">${formatDate(m.timestamp)}</span>
            <strong style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(m.to || 'internal')}</strong>
            <div>
              <span class="badge ${m.category === 'verification' ? 'badge-primary' : m.category === 'invitation' ? 'badge-purple' : 'badge-warning'}" style="font-size: 0.72rem; text-transform: uppercase;">
                ${escapeHtml(m.category || 'EVENT')}
              </span>
            </div>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary);">${escapeHtml(m.subject || 'Event Dispatch')}</span>
            <div style="text-align: right;">
              <span class="badge ${m.sent !== false ? 'badge-primary' : 'badge-danger'}" style="font-size: 0.72rem;">
                ${m.sent !== false ? '✓ SENT' : 'QUEUED'}
              </span>
            </div>
          </div>
        `).join('') : `
          <div class="empty-hint-text" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
            No recent outbox event dispatches buffered.
          </div>
        `}
      </div>
    </div>
  `;
}
