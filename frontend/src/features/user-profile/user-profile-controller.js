import { openModal, closeModal } from '../../shared/components/modal.js';
import { renderUserProfileModal } from './user-profile-modal.js';
import { store as appStore } from '../../shared/state/store.js';
import { request as appRequest } from '../../shared/api/client.js';
import { showToast as appShowToast } from '../../shared/components/toast.js';
import { loadOrganizations as defaultLoadOrganizations } from '../project/project-controller.js';

export async function openUserProfileModalController(ctx = {}) {
  const request = ctx.request || appRequest;
  const store = ctx.store || appStore;
  const showToast = ctx.showToast || appShowToast;
  const loadOrganizations = ctx.loadOrganizations || defaultLoadOrganizations;
  const loadInitialData = ctx.loadInitialData;

  const state = store.getState();
  const user = state.user || {};
  let sessions = [];
  let invites = state.userPendingInvitations || [];
  try {
    const [sessRes, invRes] = await Promise.all([
      request('/auth/sessions').catch(() => []),
      request('/organizations/invitations/me').catch(() => []),
    ]);
    sessions = sessRes;
    invites = invRes;
    store.setState({ userPendingInvitations: invites });
  } catch (e) {
    console.warn('Could not load profile sub-resources:', e);
  }

  const currentOrg = state.organizations?.find(o => o.orgId === state.org);
  const orgName = currentOrg?.name || currentOrg?.organization?.name || state.organization?.name || state.org;

  const contentHtml = renderUserProfileModal(user, sessions, currentOrg, orgName, invites);

  openModal({
    title: 'Account Settings',
    subtitle: 'Manage your profile, active sessions, and workspace memberships',
    contentHtml,
    size: 'medium',
  });

  // Sign out
  document.querySelector('#btn-user-signout')?.addEventListener('click', async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      closeModal();
      store.setState({ token: '', user: null, authMode: 'login' });
      showToast('Signed out', 'info');
    }
  });

  // UC-AUTH-07: Revoke specific session
  document.querySelectorAll('.btn-revoke-user-session').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sessionId = btn.dataset.sessionId;
      try {
        await request(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
        showToast('Session revoked', 'success');
        closeModal();
        await openUserProfileModalController({ request, store, showToast, loadOrganizations, loadInitialData });
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // UC-ORG-11: Leave workspace
  document.querySelector('#btn-leave-workspace')?.addEventListener('click', async () => {
    const { org } = store.getState();
    if (!confirm('Are you sure you want to leave this organization? This action will revoke all your API tokens in this org.')) return;
    try {
      await request(`/organizations/${org}/members/me`, { method: 'DELETE' });
      showToast('You have left the organization', 'success');
      closeModal();
      store.setState({ org: '' });
      await loadOrganizations();
      if (typeof loadInitialData === 'function') {
        await loadInitialData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Change password form
  document.querySelector('#form-change-password')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    try {
      await request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showToast('Password changed successfully', 'success');
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Accept invitation from profile modal
  document.querySelectorAll('.btn-prof-accept-invite').forEach(btn => {
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

  // Decline invitation from profile modal
  document.querySelectorAll('.btn-prof-decline-invite').forEach(btn => {
    btn.addEventListener('click', async () => {
      const invitationId = btn.dataset.invId;
      if (!confirm('Are you sure you want to decline this invitation?')) return;
      try {
        store.setState({ loading: true });
        await request('/organizations/invitations/decline', {
          method: 'POST',
          body: JSON.stringify({ invitationId }),
        });
        showToast('Invitation declined', 'info');
        closeModal();
        await openUserProfileModalController({ request, store, showToast, loadOrganizations, loadInitialData });
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });
}
