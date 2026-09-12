import { store as appStore } from '../../shared/state/store.js';
import { request as appRequest } from '../../shared/api/client.js';
import { showToast as appShowToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';
import { escapeHtml } from '../../shared/utils/formatters.js';
import { loadProjects as defaultLoadProjects, openCreateProjectModal } from '../project/project-controller.js';

export async function loadAdminData(request = appRequest, store = appStore) {
  const { org, selectedProjectId, token } = store.getState();
  if (!org || !token) return;

  try {
    store.setState({ loading: true });
    const [
      organization,
      members,
      invitations,
      departments,
      groups,
      orgRoles,
      customFields,
      workflows,
      issueTypes,
      linkTypes,
      labels,
      auditRes,
    ] = await Promise.all([
      request(`/organizations/${org}`).catch(() => null),
      request(`/organizations/${org}/members`).catch(() => []),
      request(`/organizations/${org}/invitations`).catch(() => []),
      request(`/organizations/${org}/departments`).catch(() => []),
      request(`/organizations/${org}/groups`).catch(() => []),
      request(`/organizations/${org}/roles`).catch(() => []),
      request(`/organizations/${org}/custom-fields`).catch(() => []),
      request(`/organizations/${org}/workflows`).catch(() => []),
      request(`/organizations/${org}/catalog/issue-types`).catch(() => []),
      request(`/organizations/${org}/catalog/link-types`).catch(() => []),
      request(`/organizations/${org}/catalog/labels`).catch(() => []),
      request(`/organizations/${org}/audit?limit=25`).catch(() => ({ items: [] })),
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

    let selectedWorkflowDetail = store.getState().selectedWorkflowDetail;
    if (!selectedWorkflowDetail && Array.isArray(workflows) && workflows.length > 0) {
      selectedWorkflowDetail = await request(`/organizations/${org}/workflows/${workflows[0].id}`).catch(() => null);
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
      customFields: customFields || [],
      workflows: workflows || [],
      issueTypes: issueTypes || [],
      linkTypes: linkTypes || [],
      labels: labels || [],
      auditLogs: auditRes?.items || [],
      selectedWorkflowDetail,
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

  // Trigger create project modal from Admin view
  document.querySelectorAll('#btn-admin-create-project-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      openCreateProjectModal(reload);
    });
  });

  // Admin Add Custom Field Modal
  document.querySelector('#btn-admin-add-custom-field')?.addEventListener('click', () => {
    openModal({
      title: 'Add Custom Field',
      subtitle: 'EXTENSIBLE SCHEMA ATTRIBUTE',
      size: 'medium',
      contentHtml: `
        <form id="form-create-custom-field" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Field Name</label>
              <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Risk Level, Customer Tier" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Field Key</label>
              <input name="key" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono" placeholder="risk_level" required />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Data Type</label>
              <select name="fieldType" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary">
                <option value="text">Text (Single line / String)</option>
                <option value="number">Number (Float / Integer)</option>
                <option value="select">Single Select (Dropdown)</option>
                <option value="multi_select">Multi Select (Tags)</option>
                <option value="date">Date (ISO Timestamp)</option>
              </select>
            </div>
            <div class="flex items-center pt-6 gap-2">
              <input type="checkbox" id="cf-is-required" name="isRequired" class="rounded border-border-default text-brand-primary focus:ring-brand-primary" />
              <label for="cf-is-required" class="text-sm text-text-primary">Required on issue creation</label>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <input name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="Instructions or purpose of this field..." />
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Custom Field</button>
          </div>
        </form>
      `,
    });

    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-custom-field')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get('name')?.toString().trim();
      const key = formData.get('key')?.toString().trim().toLowerCase().replace(/\s+/g, '_');
      const fieldType = formData.get('fieldType')?.toString() || 'text';
      const description = formData.get('description')?.toString().trim() || undefined;
      const isRequired = formData.get('isRequired') === 'on';
      const { org } = store.getState();

      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/custom-fields`, {
          method: 'POST',
          body: JSON.stringify({ name, key, fieldType, description, isRequired }),
        });
        closeModal();
        showToast(`Custom field "${name}" created!`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Admin Add Option to Select Custom Field
  document.querySelectorAll('.btn-admin-add-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const fieldId = btn.dataset.fieldId;
      const fieldName = btn.dataset.fieldName;

      openModal({
        title: `Add Option: ${escapeHtml(fieldName)}`,
        subtitle: 'SELECT VALUE CHOICE',
        size: 'small',
        contentHtml: `
          <form id="form-create-cf-option" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Option Value</label>
              <input name="value" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono" placeholder="e.g. HIGH, CRITICAL, TIER_1" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Display Label</label>
              <input name="label" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. High Priority (P1)" required />
            </div>
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
              <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
              <button type="submit" class="button primary">Add Option</button>
            </div>
          </form>
        `,
      });

      document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
      document.querySelector('#form-create-cf-option')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const value = formData.get('value')?.toString().trim();
        const label = formData.get('label')?.toString().trim();
        const { org } = store.getState();

        try {
          store.setState({ loading: true });
          await request(`/organizations/${org}/custom-fields/${fieldId}/options`, {
            method: 'POST',
            body: JSON.stringify({ value, label }),
          });
          closeModal();
          showToast(`Option "${label}" added to ${fieldName}!`, 'success');
          await reload();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          store.setState({ loading: false });
        }
      });
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

  // Create Department Modal Trigger
  document.querySelector('#btn-create-dept')?.addEventListener('click', () => {
    openModal({
      title: 'Create Department',
      subtitle: 'ORGANIZATION HIERARCHY',
      size: 'small',
      contentHtml: `
        <form id="form-create-department" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Department Name</label>
            <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Engineering, Product, Security" required />
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Department</button>
          </div>
        </form>
      `,
    });
    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-department')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/departments`, { method: 'POST', body: JSON.stringify(body) });
        closeModal();
        showToast('Department created successfully', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Create Group Modal Trigger
  document.querySelector('#btn-create-group')?.addEventListener('click', () => {
    openModal({
      title: 'Create User Group',
      subtitle: 'ACCESS & ROLE ASSIGNMENT COHORT',
      size: 'small',
      contentHtml: `
        <form id="form-create-group" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Group Name</label>
            <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Core Engineers, QA Team" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" rows="2" placeholder="Cohort purpose..."></textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Group</button>
          </div>
        </form>
      `,
    });
    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-group')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/groups`, { method: 'POST', body: JSON.stringify(body) });
        closeModal();
        showToast('Group created successfully', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Create Component Modal Trigger
  document.querySelector('#btn-add-component')?.addEventListener('click', () => {
    openModal({
      title: 'Add Project Component',
      subtitle: 'MODULAR ARCHITECTURE SUBSYSTEM',
      size: 'small',
      contentHtml: `
        <form id="form-create-component" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Component Name</label>
            <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Auth-Service, Payment-Gateway" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" rows="2" placeholder="Subsystem scope and responsibilities..."></textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Component</button>
          </div>
        </form>
      `,
    });
    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-component')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      const { org, selectedProjectId } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/projects/${selectedProjectId}/components`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        closeModal();
        showToast('Component added successfully', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Create Version Modal Trigger
  document.querySelector('#btn-add-version')?.addEventListener('click', () => {
    openModal({
      title: 'Create Release Version',
      subtitle: 'TARGET MILESTONE RELEASE',
      size: 'small',
      contentHtml: `
        <form id="form-create-version" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Version Name</label>
            <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono" placeholder="e.g. v1.0.0, 2026.Q4" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" rows="2" placeholder="Milestone deliverables and scope..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Release Date (Optional)</label>
            <input type="date" name="releaseDate" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Version</button>
          </div>
        </form>
      `,
    });
    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-version')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      if (!body.releaseDate) delete body.releaseDate;
      const { org, selectedProjectId } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/projects/${selectedProjectId}/versions`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        closeModal();
        showToast('Version created successfully', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
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

  // ─── Workflows & FSM Event Handlers ────────────────────────────────────────

  // Create Workflow Modal Trigger
  document.querySelector('#btn-admin-create-workflow')?.addEventListener('click', () => {
    openModal({
      title: 'Create Workflow Scheme',
      subtitle: 'FINITE STATE MACHINE DEFINITION',
      size: 'medium',
      contentHtml: `
        <form id="form-create-workflow" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Workflow Name</label>
              <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Bug Triage Workflow, Epic Lifecycle" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Workflow Key</label>
              <input name="key" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono" placeholder="bug_triage_v1" required />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Workflow</button>
          </div>
        </form>
      `,
    });

    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-workflow')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get('name')?.toString().trim();
      const key = formData.get('key')?.toString().trim().toLowerCase().replace(/\s+/g, '_');
      const { org } = store.getState();

      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/workflows`, {
          method: 'POST',
          body: JSON.stringify({ key, name }),
        });
        closeModal();
        showToast(`Workflow "${name}" created successfully!`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Add Transition Guard Modal Trigger
  document.querySelector('#btn-admin-add-guard')?.addEventListener('click', () => {
    const { selectedWorkflowDetail } = store.getState();
    const transitions = selectedWorkflowDetail?.transitions || [];

    openModal({
      title: 'Add Transition Guard',
      subtitle: 'FSM VALIDATION & PREREQUISITE RULE',
      size: 'medium',
      contentHtml: `
        <form id="form-create-guard" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Target Transition</label>
            ${transitions.length ? `
              <select name="transitionId" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" required>
                ${transitions.map(t => `<option value="${t.id}">${escapeHtml(t.name || 'Transition')} (${t.id.slice(0, 8)})</option>`).join('')}
              </select>
            ` : `
              <input name="transitionId" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary font-mono" placeholder="Transition UUID" required />
            `}
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Guard Type</label>
            <select name="guardType" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" required>
              <option value="requires_fields">Requires Fields (e.g. resolution on Done)</option>
              <option value="json_logic">JSON Logic Expression</option>
              <option value="dsl">DSL Expression</option>
              <option value="custom">Custom Policy</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Configuration JSON</label>
            <textarea name="configJson" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm font-mono text-text-primary focus:outline-none focus:border-brand-primary" rows="4" placeholder='{"requiredFields": ["resolution"]}' required>{"requiredFields": ["resolution"]}</textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Add Guard Rule</button>
          </div>
        </form>
      `,
    });

    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-guard')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const transitionId = formData.get('transitionId')?.toString().trim();
      const guardType = formData.get('guardType')?.toString().trim();
      let configJson;
      try {
        configJson = JSON.parse(formData.get('configJson')?.toString() || '{}');
      } catch {
        showToast('Configuration must be valid JSON', 'error');
        return;
      }

      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/workflows/guards`, {
          method: 'POST',
          body: JSON.stringify({ transitionId, guardType, configJson }),
        });
        closeModal();
        showToast('Transition guard added successfully!', 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Inspect FSM Workflow Detail
  document.querySelectorAll('.btn-view-workflow-detail').forEach(btn => {
    btn.addEventListener('click', async () => {
      const wfId = btn.dataset.workflowId;
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        const detail = await request(`/organizations/${org}/workflows/${wfId}`);
        store.setState({ selectedWorkflowDetail: detail, loading: false });
        showToast(`Loaded details for workflow "${detail?.workflow?.name || wfId}"`, 'info');
      } catch (err) {
        store.setState({ loading: false });
        showToast(err.message, 'error');
      }
    });
  });

  // ─── Issue Types & Catalog Event Handlers ─────────────────────────────────

  // Add Issue Type Modal
  document.querySelector('#btn-admin-add-issue-type')?.addEventListener('click', () => {
    openModal({
      title: 'Add Issue Type',
      subtitle: 'ORGANIZATIONAL WORK CLASSIFICATION',
      size: 'small',
      contentHtml: `
        <form id="form-create-issue-type" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Issue Type Name</label>
            <input name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Investigation, Improvement" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Type Key</label>
            <input name="key" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono" placeholder="investigation" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea name="description" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" rows="2" placeholder="Classification purpose and usage..."></textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Issue Type</button>
          </div>
        </form>
      `,
    });

    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-issue-type')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      body.key = body.key?.trim().toLowerCase().replace(/\s+/g, '_');
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/catalog/issue-types`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        closeModal();
        showToast(`Issue type "${body.name}" created!`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Add Link Type Modal
  document.querySelector('#btn-admin-add-link-type')?.addEventListener('click', () => {
    openModal({
      title: 'Add Link Type',
      subtitle: 'GRAPH DEPENDENCY RELATIONSHIP',
      size: 'medium',
      contentHtml: `
        <form id="form-create-link-type" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Link Key</label>
              <input name="key" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary font-mono focus:outline-none focus:border-brand-primary" placeholder="e.g. causes, depends_on" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Directionality</label>
              <select name="directionality" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary">
                <option value="directed">Directed (A causes B)</option>
                <option value="symmetric">Symmetric (A relates to B)</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Outward Description</label>
              <input name="outwardLabel" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. causes" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Inward Description</label>
              <input name="inwardLabel" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. is caused by" required />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
            <button type="submit" class="button primary">Create Link Type</button>
          </div>
        </form>
      `,
    });

    document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    document.querySelector('#form-create-link-type')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      body.key = body.key?.trim().toLowerCase().replace(/\s+/g, '_');
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/catalog/link-types`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        closeModal();
        showToast(`Link type "${body.key}" added!`, 'success');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Archive Link Type
  document.querySelectorAll('.btn-archive-link-type').forEach(btn => {
    btn.addEventListener('click', async () => {
      const linkTypeId = btn.dataset.linkTypeId;
      const { org } = store.getState();
      if (!confirm('Archive this link type? Existing issue links will remain archived.')) return;
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/catalog/link-types/${linkTypeId}`, { method: 'DELETE' });
        showToast('Link type archived', 'info');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Archive Label
  document.querySelectorAll('.btn-archive-label').forEach(btn => {
    btn.addEventListener('click', async () => {
      const labelId = btn.dataset.labelId;
      const { org } = store.getState();
      try {
        store.setState({ loading: true });
        await request(`/organizations/${org}/catalog/labels/${labelId}`, { method: 'DELETE' });
        showToast('Label archived from catalog', 'info');
        await reload();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // ─── Audit & Outbox Event Handlers ─────────────────────────────────────────

  // Refresh Audit Trail
  document.querySelector('#btn-admin-refresh-audit')?.addEventListener('click', async () => {
    const { org } = store.getState();
    try {
      store.setState({ loading: true });
      const auditRes = await request(`/organizations/${org}/audit?limit=25`).catch(() => ({ items: [] }));
      const mailOutbox = await request('/admin/mail/outbox').catch(() => []);
      store.setState({ auditLogs: auditRes?.items || [], mailOutbox, loading: false });
      showToast(`Audit trail refreshed (${(auditRes?.items || []).length} records)`, 'info');
    } catch (err) {
      store.setState({ loading: false });
      showToast(err.message, 'error');
    }
  });
}

