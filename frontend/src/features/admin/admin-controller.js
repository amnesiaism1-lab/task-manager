import { store as appStore } from '../../shared/state/store.js';
import { request as appRequest } from '../../shared/api/client.js';
import { showToast as appShowToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';
import { escapeHtml } from '../../shared/utils/formatters.js';
import { loadProjects as defaultLoadProjects } from '../project/project-controller.js';

export async function loadAdminData(request = appRequest, store = appStore) {
  const { org, selectedProjectId, token } = store.getState();
  if (!org || !token) return;

  try {
    store.setState({ loading: true });
    const [organization, members, invitations, departments, groups, orgRoles] = await Promise.all([
      request(`/organizations/${org}`).catch(() => null),
      request(`/organizations/${org}/members`).catch(() => []),
      request(`/organizations/${org}/invitations`).catch(() => []),
      request(`/organizations/${org}/departments`).catch(() => []),
      request(`/organizations/${org}/groups`).catch(() => []),
      request(`/organizations/${org}/roles`).catch(() => []),
    ]);

    let projectDetail = null;
    let projectMembers = [];
    let projectRoles = [];
    let components = [];
    let versions = [];
    let permissionScheme = null;

    if (selectedProjectId) {
      try {
        [projectDetail, projectMembers, projectRoles, components, versions, permissionScheme] = await Promise.all([
          request(`/organizations/${org}/projects/${selectedProjectId}`),
          request(`/organizations/${org}/projects/${selectedProjectId}/members`).catch(() => []),
          request(`/organizations/${org}/projects/${selectedProjectId}/roles`).catch(() => []),
          request(`/organizations/${org}/projects/${selectedProjectId}/components`).catch(() => []),
          request(`/organizations/${org}/projects/${selectedProjectId}/versions`).catch(() => []),
          request(`/organizations/${org}/projects/${selectedProjectId}/permissions`).catch(() => null),
        ]);
      } catch (e) {
        console.warn('Could not load project sub-resources:', e);
      }
    }

    let systemUsers = [];
    let systemOrgs = [];
    let mailOutbox = [];
    if (store.getState().user?.isSystemAdmin) {
      try {
        const [uRes, oRes, outboxRes] = await Promise.all([
          request('/admin/users?page=1&limit=50').catch(() => ({ items: [] })),
          request('/admin/organizations?page=1&limit=50').catch(() => ({ items: [] })),
          request('/admin/mail/outbox').catch(() => []),
        ]);
        systemUsers = uRes?.items || [];
        systemOrgs = oRes?.items || [];
        mailOutbox = outboxRes || [];
      } catch (e) {
        console.warn('Could not load system admin data:', e);
      }
    }

    store.setState({
      organization: organization || store.getState().organization,
      members,
      invitations,
      departments,
      groups,
      orgRoles,
      projectDetail,
      projectMembers,
      projectRoles,
      components,
      versions,
      permissionScheme,
      systemUsers,
      systemOrgs,
      mailOutbox,
      loading: false,
    });
  } catch (err) {
    store.setState({ loading: false });
    console.error('Error loading admin data:', err);
  }
}

export function bindAdminEvents(ctx = {}) {
  const request = ctx.request || appRequest;
  const store = ctx.store || appStore;
  const showToast = ctx.showToast || appShowToast;
  const loadProjects = ctx.loadProjects || defaultLoadProjects;
  const reload = () => loadAdminData(request, store);

  // Admin tabs switch
  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setState({ adminTab: btn.dataset.adminTab });
    });
  });

  // Update Org
  document.querySelector('#form-update-org')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    const { org } = store.getState();
    try {
      store.setState({ loading: true });
      await request(`/organizations/${org}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      showToast('Organization settings updated', 'success');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });

  // Invite Member
  document.querySelector('#form-invite-member')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    if (!body.roleId) delete body.roleId;
    const { org } = store.getState();
    try {
      store.setState({ loading: true });
      await request(`/organizations/${org}/invitations`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showToast(`Invitation sent to ${body.email}`, 'success');
      e.target.reset();
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });

  // Create Project
  document.querySelector('#form-create-project')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    const { org } = store.getState();
    try {
      store.setState({ loading: true });
      const newProj = await request(`/organizations/${org}/projects`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showToast(`Project ${newProj.key} created successfully!`, 'success');
      e.target.reset();
      await loadProjects();
      store.setState({ selectedProjectId: newProj.id });
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });

  // Create Department
  document.querySelector('#form-create-department')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const { org } = store.getState();
    try {
      await request(`/organizations/${org}/departments`, { method: 'POST', body: JSON.stringify(body) });
      showToast('Department created', 'success');
      e.target.reset();
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Create Group
  document.querySelector('#form-create-group')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const { org } = store.getState();
    try {
      await request(`/organizations/${org}/groups`, { method: 'POST', body: JSON.stringify(body) });
      showToast('Group created', 'success');
      e.target.reset();
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Create Component
  document.querySelector('#form-create-component')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const { org, selectedProjectId } = store.getState();
    try {
      await request(`/organizations/${org}/projects/${selectedProjectId}/components`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showToast('Component added', 'success');
      e.target.reset();
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Create Version
  document.querySelector('#form-create-version')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const { org, selectedProjectId } = store.getState();
    try {
      await request(`/organizations/${org}/projects/${selectedProjectId}/versions`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showToast('Version created', 'success');
      e.target.reset();
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Release Version
  document.querySelectorAll('.btn-release-version').forEach(btn => {
    btn.addEventListener('click', async () => {
      const verId = btn.dataset.versionId;
      const { org, selectedProjectId } = store.getState();
      try {
        await request(`/organizations/${org}/projects/${selectedProjectId}/versions/${verId}/release`, {
          method: 'POST',
        });
        showToast('Version marked as released!', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // UC-ORG-10: Resend Invitation
  document.querySelectorAll('.btn-resend-invitation').forEach(btn => {
    btn.addEventListener('click', async () => {
      const invId = btn.dataset.invitationId;
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        const res = await request(`/organizations/${org}/invitations/${invId}/resend`, { method: 'POST' });
        showToast(`Invitation refreshed! Token: ${res.invitationToken || 'Sent via email'}`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // UC-ORG-10: Revoke Invitation
  document.querySelectorAll('.btn-revoke-invitation').forEach(btn => {
    btn.addEventListener('click', async () => {
      const invId = btn.dataset.invitationId;
      const { org } = store.getState();
      if (!confirm('Are you sure you want to revoke this invitation?')) return;
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/invitations/${invId}`, { method: 'DELETE' });
        showToast('Invitation revoked', 'info');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Member Status Change (Active / Suspended)
  document.querySelectorAll('.select-member-status').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const memberId = sel.dataset.memberId;
      const status = e.target.value;
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/members/${memberId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        showToast(`Member status updated to ${status}`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
        await reload();
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // UC-SYS-01: Toggle User Status (Platform Admin)
  document.querySelectorAll('.btn-admin-toggle-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      const currentStatus = btn.dataset.currentStatus;
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      try {
        store.setState({ loading: true });
        await request(`/admin/users/${userId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
        showToast(`User status updated to ${newStatus}`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // UC-SYS-01: Force Revoke All Sessions for User (Platform Admin)
  document.querySelectorAll('.btn-admin-force-revoke').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      if (!confirm('Force terminate all active sessions for this user?')) return;
      try {
        store.setState({ loading: true });
        const res = await request(`/admin/users/${userId}/sessions`, { method: 'DELETE' });
        showToast(`Terminated ${res.revokedCount} active session(s)`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // UC-SYS-02: Update Global Organization (Platform Admin)
  document.querySelectorAll('.btn-sys-update-org').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orgId = btn.dataset.orgId;
      const planSelect = document.querySelector(`.sys-org-plan-select[data-org-id="${orgId}"]`);
      const statusSelect = document.querySelector(`.sys-org-status-select[data-org-id="${orgId}"]`);
      const plan = planSelect?.value;
      const status = statusSelect?.value;
      try {
        store.setState({ loading: true });
        await request(`/admin/organizations/${orgId}`, {
          method: 'PATCH',
          body: JSON.stringify({ plan, status }),
        });
        showToast('Global organization updated', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // UC-SYS-01: Admin Add User Modal
  document.querySelector('#btn-admin-add-user')?.addEventListener('click', () => {
    openModal({
      title: 'Add Platform User',
      subtitle: 'GLOBAL USER PROVISIONING',
      size: 'medium',
      contentHtml: `
        <form id="form-create-admin-user" class="modal-form-vertical">
          <div class="form-group">
            <label for="new-user-email">Email Address *</label>
            <input id="new-user-email" type="email" class="input-clean" placeholder="user@company.com" required />
          </div>
          <div class="form-group">
            <label for="new-user-name">Full Name *</label>
            <input id="new-user-name" type="text" class="input-clean" placeholder="Full Name" required />
          </div>
          <div class="form-group">
            <label for="new-user-password">Password (Optional - auto-generated if left blank)</label>
            <input id="new-user-password" type="password" class="input-clean" placeholder="At least 8 characters" minlength="8" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label for="new-user-status">Initial Status</label>
              <select id="new-user-status" class="select-clean full-select">
                <option value="active" selected>Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div class="form-group" style="display: flex; flex-direction: column; justify-content: center; gap: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="new-user-is-admin" />
                <span>Grant System Admin Access</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="new-user-send-verify" checked />
                <span>Send Welcome/Verification Email</span>
              </label>
            </div>
          </div>
          <div class="modal-form-actions">
            <button type="button" class="button ghost" id="btn-cancel-create-user">Cancel</button>
            <button type="submit" class="button primary">Create User</button>
          </div>
        </form>
      `,
    });

    document.querySelector('#btn-cancel-create-user')?.addEventListener('click', closeModal);

    document.querySelector('#form-create-admin-user')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.querySelector('#new-user-email')?.value?.trim();
      const fullName = document.querySelector('#new-user-name')?.value?.trim();
      const password = document.querySelector('#new-user-password')?.value || undefined;
      const status = document.querySelector('#new-user-status')?.value;
      const isSystemAdmin = document.querySelector('#new-user-is-admin')?.checked;
      const sendVerificationEmail = document.querySelector('#new-user-send-verify')?.checked;

      try {
        store.setState({ loading: true });
        const res = await request('/admin/users', {
          method: 'POST',
          body: JSON.stringify({ email, fullName, password, status, isSystemAdmin, sendVerificationEmail }),
        });
        closeModal();
        if (res.temporaryPassword) {
          showToast(`User created! Generated password: ${res.temporaryPassword}`, 'success', 8000);
        } else {
          showToast(`User ${email} created successfully`, 'success');
        }
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // UC-SYS-01: Admin Edit User Modal
  document.querySelectorAll('.btn-admin-edit-user').forEach((btn) => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId;
      const email = btn.dataset.email;
      const fullName = btn.dataset.fullname;
      const status = btn.dataset.status;
      const isAdmin = btn.dataset.admin === 'true';

      openModal({
        title: 'Edit Platform User',
        subtitle: `USER ID: ${userId.slice(0, 8)}...`,
        size: 'medium',
        contentHtml: `
          <form id="form-edit-admin-user" class="modal-form-vertical">
            <div class="form-group">
              <label for="edit-user-email">Email Address</label>
              <input id="edit-user-email" type="email" class="input-clean" value="${escapeHtml(email)}" required />
            </div>
            <div class="form-group">
              <label for="edit-user-name">Full Name</label>
              <input id="edit-user-name" type="text" class="input-clean" value="${escapeHtml(fullName)}" required />
            </div>
            <div class="form-group">
              <label for="edit-user-password">New Password (Leave blank to keep current)</label>
              <input id="edit-user-password" type="password" class="input-clean" placeholder="At least 8 characters" minlength="8" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label for="edit-user-status">Account Status</label>
                <select id="edit-user-status" class="select-clean full-select">
                  <option value="active" ${status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="suspended" ${status === 'suspended' ? 'selected' : ''}>Suspended</option>
                  <option value="deactivated" ${status === 'deactivated' ? 'selected' : ''}>Deactivated</option>
                </select>
              </div>
              <div class="form-group" style="display: flex; align-items: center;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 20px;">
                  <input type="checkbox" id="edit-user-is-admin" ${isAdmin ? 'checked' : ''} />
                  <span>System Admin Role</span>
                </label>
              </div>
            </div>
            <div class="modal-form-actions">
              <button type="button" class="button ghost" id="btn-cancel-edit-user">Cancel</button>
              <button type="submit" class="button primary">Save Changes</button>
            </div>
          </form>
        `,
      });

      document.querySelector('#btn-cancel-edit-user')?.addEventListener('click', closeModal);

      document.querySelector('#form-edit-admin-user')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEmail = document.querySelector('#edit-user-email')?.value?.trim();
        const newFullName = document.querySelector('#edit-user-name')?.value?.trim();
        const newPassword = document.querySelector('#edit-user-password')?.value || undefined;
        const newStatus = document.querySelector('#edit-user-status')?.value;
        const newIsAdmin = document.querySelector('#edit-user-is-admin')?.checked;

        try {
          store.setState({ loading: true });
          await request(`/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              email: newEmail,
              fullName: newFullName,
              password: newPassword,
              status: newStatus,
              isSystemAdmin: newIsAdmin,
            }),
          });
          closeModal();
          showToast(`User ${newEmail} updated successfully`, 'success');
          await reload();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          store.setState({ loading: false });
        }
      });
    });
  });

  // UC-SYS-01: Admin Delete User Modal
  document.querySelectorAll('.btn-admin-delete-user').forEach((btn) => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId;
      const email = btn.dataset.email;

      openModal({
        title: 'Delete User Account',
        subtitle: 'DANGER ZONE',
        size: 'small',
        contentHtml: `
          <div class="modal-form-vertical">
            <p style="color: var(--text-secondary); line-height: 1.5;">
              Are you sure you want to delete or deactivate account <strong>${escapeHtml(email)}</strong>?
            </p>
            <div class="notice error" style="margin: 12px 0;">
              ⚠️ All active sessions, tokens, and memberships will be safely revoked and removed.
            </div>
            <div class="modal-form-actions">
              <button type="button" class="button ghost" id="btn-cancel-delete-user">Cancel</button>
              <button type="button" class="button danger" id="btn-confirm-delete-user">Delete User</button>
            </div>
          </div>
        `,
      });

      document.querySelector('#btn-cancel-delete-user')?.addEventListener('click', closeModal);

      document.querySelector('#btn-confirm-delete-user')?.addEventListener('click', async () => {
        try {
          store.setState({ loading: true });
          const res = await request(`/admin/users/${userId}`, { method: 'DELETE' });
          closeModal();
          showToast(res.message || 'User deleted successfully', 'success');
          await reload();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          store.setState({ loading: false });
        }
      });
    });
  });

  // Mail Gateway Diagnostics: Send Diagnostic Test Email
  document.querySelector('#form-send-test-mail')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const to = document.querySelector('#test-mail-recipient')?.value?.trim();
    const subject = document.querySelector('#test-mail-subject')?.value?.trim() || undefined;

    if (!to) {
      showToast('Recipient email address is required', 'error');
      return;
    }

    try {
      store.setState({ loading: true });
      const res = await request('/admin/mail/test', {
        method: 'POST',
        body: JSON.stringify({ to, subject }),
      });
      showToast(res.message || `Test email dispatched to ${to}`, 'success');
      const mailOutbox = await request('/admin/mail/outbox').catch(() => []);
      store.setState({ mailOutbox, loading: false });
    } catch (err) {
      store.setState({ loading: false });
      showToast(err.message, 'error');
    }
  });

  // Mail Gateway Diagnostics: Refresh Outbox
  document.querySelector('#btn-refresh-outbox')?.addEventListener('click', async () => {
    try {
      store.setState({ loading: true });
      const mailOutbox = await request('/admin/mail/outbox').catch(() => []);
      store.setState({ mailOutbox, loading: false });
      showToast(`Outbox refreshed (${mailOutbox.length} entries)`, 'info');
    } catch (err) {
      store.setState({ loading: false });
      showToast(err.message, 'error');
    }
  });
}

