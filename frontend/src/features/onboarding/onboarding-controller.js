import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { loadOrganizations, loadUserInvitations } from '../project/project-controller.js';

export function bindOnboardingEvents(loadInitialData) {
  // Sign Out
  document.querySelector('#btn-onboarding-signout')?.addEventListener('click', async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      store.setState({ token: '', user: null, authMode: 'login' });
      showToast('Signed out', 'info');
    }
  });

  // Auto-uppercase organization key
  const keyInput = document.querySelector('#onboarding-org-key');
  const nameInput = document.querySelector('#onboarding-org-name');
  nameInput?.addEventListener('input', () => {
    if (!keyInput?.dataset.touched) {
      const generated = nameInput.value
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 6)
        .toUpperCase();
      if (generated.length >= 2) {
        keyInput.value = generated;
      }
    }
  });
  keyInput?.addEventListener('input', () => {
    keyInput.dataset.touched = 'true';
    keyInput.value = keyInput.value.toUpperCase();
  });

  // Create Organization Form
  document.querySelector('#form-onboarding-create-org')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);

    try {
      store.setState({ loading: true });
      const newOrg = await request('/organizations', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      showToast(`Organization "${newOrg.name}" created!`, 'success');
      store.setState({ org: newOrg.id, selectedProjectId: '' });
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

  // Refresh Invitations
  document.querySelector('#btn-refresh-onboarding-invites')?.addEventListener('click', async () => {
    try {
      store.setState({ loading: true });
      await loadUserInvitations();
      showToast('Invitations refreshed', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      store.setState({ loading: false });
    }
  });

  // Accept Invitation from Onboarding list
  document.querySelectorAll('.btn-accept-onboarding-invite').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const invitationId = btn.dataset.invitationId;
      const orgName = btn.dataset.orgName || 'organization';

      try {
        store.setState({ loading: true });
        const res = await request('/organizations/invitations/accept', {
          method: 'POST',
          body: JSON.stringify({ invitationId }),
        });

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

  // Decline Invitation from Onboarding list
  document.querySelectorAll('.btn-decline-onboarding-invite').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const invitationId = btn.dataset.invitationId;
      if (!confirm('Are you sure you want to decline this invitation?')) return;

      try {
        store.setState({ loading: true });
        await request('/organizations/invitations/decline', {
          method: 'POST',
          body: JSON.stringify({ invitationId }),
        });

        showToast('Invitation declined', 'info');
        await loadUserInvitations();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        store.setState({ loading: false });
      }
    });
  });

  // Join with Token Code Form
  document.querySelector('#form-onboarding-join-token')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.querySelector('#onboarding-invite-token')?.value?.trim();
    if (!token) return;

    try {
      store.setState({ loading: true });
      const res = await request('/organizations/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      showToast(`Successfully joined organization!`, 'success');
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
