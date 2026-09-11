import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';
import { escapeHtml } from '../../shared/utils/formatters.js';

export async function loadProjects() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const res = await request(`/organizations/${org}/projects?page=1&limit=50`);
    const projects = res?.data || [];
    let { selectedProjectId } = store.getState();

    if (!selectedProjectId && projects.length > 0) {
      selectedProjectId = projects[0].id;
    } else if (selectedProjectId && !projects.some(p => p.id === selectedProjectId)) {
      selectedProjectId = projects[0]?.id || '';
    }

    store.setState({ projects, selectedProjectId });
  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

export async function loadMembers() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const members = await request(`/organizations/${org}/members`);
    store.setState({ members: members || [] });
  } catch (err) {
    console.warn('Could not load members:', err.message);
  }
}

export async function loadOrganizationDetail(orgId) {
  try {
    const organization = await request(`/organizations/${orgId}`);
    store.setState({ organization });
  } catch (err) {
    console.warn('Could not load org detail:', err.message);
  }
}

export async function loadOrganizations() {
  const { token } = store.getState();
  if (!token) return;

  try {
    const orgs = await request('/organizations');
    const organizations = orgs || [];
    let currentOrg = store.getState().org;

    if (!currentOrg && organizations.length > 0) {
      currentOrg = organizations[0].orgId;
    }

    store.setState({ organizations, org: currentOrg });

    if (currentOrg) {
      loadOrganizationDetail(currentOrg);
    }
  } catch (err) {
    console.error('Error loading organizations:', err);
  }
}

export function openCreateOrgModal(loadInitialData) {
  const contentHtml = `
    <form id="form-create-org" class="space-y-4">
      <div>
        <label for="org-modal-key" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Organization Key</label>
        <input id="org-modal-key" name="key" maxlength="32" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. ACME, CORP" required />
      </div>
      <div>
        <label for="org-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Organization Name</label>
        <input id="org-modal-name" name="name" maxlength="160" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="Acme Technologies Inc." required />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Organization</button>
      </div>
    </form>
  `;

  openModal({
    title: 'New Organization',
    subtitle: 'Create a root multi-tenant boundary',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-org');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(form));

    try {
      store.setState({ loading: true });
      const newOrg = await request('/organizations', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      closeModal();
      showToast(`Organization "${newOrg.name}" created!`, 'success');
      store.setState({ org: newOrg.id, selectedProjectId: '' });
      if (typeof loadInitialData === 'function') {
        await loadInitialData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}

export function openSettingsModal(loadInitialData) {
  const state = store.getState();
  const contentHtml = `
    <form id="form-settings" class="space-y-4">
      <div>
        <label for="settings-api" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">API Base URL</label>
        <input id="settings-api" name="api" value="${escapeHtml(state.api || '')}" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" required />
      </div>
      <div>
        <label for="settings-org" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Organization ID</label>
        <input id="settings-org" name="org" value="${escapeHtml(state.org || '')}" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
      </div>
      <div>
        <label for="settings-token" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Bearer Access Token</label>
        <input id="settings-token" name="token" type="password" value="${escapeHtml(state.token || '')}" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Save Connection</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Workspace Connection',
    subtitle: 'System endpoints and identity',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-settings');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const api = formData.get('api');
    const org = formData.get('org');
    const token = formData.get('token');

    store.setState({ api, org, token, selectedProjectId: '' });
    closeModal();
    showToast('Settings saved', 'success');
    if (typeof loadInitialData === 'function') {
      await loadInitialData();
    }
  });
}

export async function loadUserInvitations() {
  const { token } = store.getState();
  if (!token) return;

  try {
    const invites = await request('/organizations/invitations/me');
    store.setState({ userPendingInvitations: invites || [] });
  } catch (err) {
    console.warn('Could not load user pending invitations:', err.message);
  }
}

export function openJoinOrgModal(loadInitialData) {
  const contentHtml = `
    <form id="form-join-org-modal" class="space-y-4">
      <div>
        <label for="join-modal-token" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Invitation Code / Token</label>
        <input id="join-modal-token" name="token" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono" placeholder="Enter the token from your email" required />
      </div>
      <p class="text-xs text-text-muted">Once redeemed, you will gain immediate access to the organization's projects and boards.</p>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Join Organization</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Join Organization',
    subtitle: 'REDEEM INVITATION CODE',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-join-org-modal');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = form.querySelector('#join-modal-token')?.value?.trim();
    if (!token) return;

    try {
      store.setState({ loading: true });
      const res = await request('/organizations/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      closeModal();
      showToast('Successfully joined organization!', 'success');
      const joinedOrgId = res.organization?.id || res.member?.orgId;
      if (joinedOrgId) {
        store.setState({ org: joinedOrgId, selectedProjectId: '' });
      }
      await loadOrganizations();
      await loadUserInvitations();
      if (typeof loadInitialData === 'function') {
        await loadInitialData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });
}

export function openPendingInvitationsModal(loadInitialData) {
  const state = store.getState();
  const invites = state.userPendingInvitations || [];

  const contentHtml = `
    <div class="space-y-4">
      <p class="text-xs text-text-muted">Review and accept invitations sent to <strong>${escapeHtml(state.user?.email || '')}</strong>.</p>
      <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
        ${invites.length ? invites.map(inv => `
          <div class="p-3 bg-surface-hover/30 border border-border-default rounded-lg flex items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <strong class="text-sm font-semibold text-text-primary">${escapeHtml(inv.orgName || 'Workspace')}</strong>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-hover text-text-muted">${escapeHtml(inv.orgKey || '')}</span>
              </div>
              <div class="text-xs text-text-muted mt-0.5">
                Invited by ${escapeHtml(inv.inviterName || 'Admin')} · Role: ${escapeHtml(inv.roleName || 'Member')}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="button primary btn-sm btn-modal-accept-invite" data-inv-id="${escapeHtml(inv.id)}" data-org-name="${escapeHtml(inv.orgName || '')}">Accept</button>
              <button type="button" class="button ghost btn-sm btn-modal-decline-invite" data-inv-id="${escapeHtml(inv.id)}">Decline</button>
            </div>
          </div>
        `).join('') : `
          <div class="text-center py-6 text-text-muted text-sm">
            No pending invitations found.
          </div>
        `}
      </div>
      <div class="flex items-center justify-end pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Close</button>
      </div>
    </div>
  `;

  openModal({
    title: 'Pending Invitations',
    subtitle: 'ORGANIZATION INVITES',
    contentHtml,
    size: 'small',
  });

  document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  document.querySelectorAll('.btn-modal-accept-invite').forEach(btn => {
    btn.addEventListener('click', async () => {
      const invitationId = btn.dataset.invId;
      const orgName = btn.dataset.orgName;
      try {
        store.setState({ loading: true });
        const res = await request('/organizations/invitations/accept', {
          method: 'POST',
          body: JSON.stringify({ invitationId }),
        });
        closeModal();
        showToast(`You have joined "${orgName}"!`, 'success');
        const joinedOrgId = res.organization?.id || res.member?.orgId;
        if (joinedOrgId) {
          store.setState({ org: joinedOrgId, selectedProjectId: '' });
        }
        await loadOrganizations();
        await loadUserInvitations();
        if (typeof loadInitialData === 'function') {
          await loadInitialData();
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  document.querySelectorAll('.btn-modal-decline-invite').forEach(btn => {
    btn.addEventListener('click', async () => {
      const invitationId = btn.dataset.invId;
      try {
        store.setState({ loading: true });
        await request('/organizations/invitations/decline', {
          method: 'POST',
          body: JSON.stringify({ invitationId }),
        });
        showToast('Invitation declined', 'info');
        await loadUserInvitations();
        closeModal();
        openPendingInvitationsModal(loadInitialData);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });
}
