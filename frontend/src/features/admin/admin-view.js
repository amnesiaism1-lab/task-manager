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

function renderProjectSettingsTab(project, state) {
  if (!project) {
    return `
      <div class="empty-state-view">
        <h3>No project selected</h3>
        <p class="muted">Choose a project from the top navigation bar to configure its components, versions, and roles.</p>
      </div>
    `;
  }

  const components = state.components || [];
  const versions = state.versions || [];
  const projectRoles = state.projectRoles || [];

  return `
    <div class="project-settings-container">
      <div class="admin-section-card">
        <div class="card-header">
          <div>
            <h3>Project: ${escapeHtml(project.name)} (${escapeHtml(project.key)})</h3>
            <p class="muted">Lifecycle, visibility, and components for this workspace.</p>
          </div>
          <div class="header-actions">
            <button class="button ghost" id="btn-toggle-project-archive">
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
