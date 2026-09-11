/**
 * AuthController — Handles authentication forms, token storage, and session switching.
 */
import { store } from '../../shared/state/store.js';
import { request, handleUnauthorized } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';

export async function loadMe() {
  try {
    const user = await request('/auth/me');
    store.setState({ user });
  } catch (err) {
    if (store.getState().token) {
      handleUnauthorized();
    }
  }
}

export function bindAuthEvents(loadInitialData) {
  // Tab switches
  document.querySelectorAll('[data-auth-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setState({ authMode: btn.dataset.authMode, authMessage: '' });
    });
  });

  // Auto-fill demo credentials
  document.querySelector('#fill-demo-creds')?.addEventListener('click', () => {
    const emailInput = document.querySelector('#login-email');
    const passwordInput = document.querySelector('#login-password');
    if (emailInput && passwordInput) {
      emailInput.value = 'admin@taskmanager.dev';
      passwordInput.value = 'Admin@123456';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    store.setState({ loginEmail: 'admin@taskmanager.dev', loginPassword: 'Admin@123456' });
    showToast('Demo credentials filled!', 'info', 2000);
  });

  // Login form submit
  document.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);

    try {
      store.setState({ loading: true, authMessage: '' });
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      store.setState({
        token: result.accessToken,
        user: result.user,
        authMessage: '',
        loading: false,
      });

      showToast(`Welcome back, ${result.user?.fullName || 'User'}!`, 'success');
      await checkAndProcessPendingInvite();
      if (typeof loadInitialData === 'function') {
        await loadInitialData();
      }
    } catch (err) {
      store.setState({
        loading: false,
        authMessage: `Error: ${err.message}`,
      });
      showToast(err.message, 'error');
    }
  });

  // Register form submit
  document.querySelector('#register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);

    try {
      store.setState({ loading: true });
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      store.setState({
        loading: false,
        authMode: 'verify',
        authMessage: `Registration successful! Check console or enter OTP token. Verification token: ${res.verificationToken || 'Check server log'}`,
      });
      showToast('Registration initiated. Verification token sent.', 'info');
    } catch (err) {
      store.setState({ loading: false, authMessage: `Error: ${err.message}` });
      showToast(err.message, 'error');
    }
  });

  // Verify email form
  document.querySelector('#verify-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      store.setState({ loading: true });
      await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      store.setState({ loading: false, authMode: 'login', authMessage: 'Email verified successfully! Please sign in.' });
      showToast('Email verified. You can now log in.', 'success');
    } catch (err) {
      store.setState({ loading: false, authMessage: `Error: ${err.message}` });
      showToast(err.message, 'error');
    }
  });

  // Forgot password form
  document.querySelector('#forgot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      store.setState({ loading: true });
      const res = await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      store.setState({
        loading: false,
        authMode: 'reset',
        authMessage: `Reset link sent! Debug token: ${res.resetToken || 'Check server log'}`,
      });
      showToast('Reset instructions generated.', 'info');
    } catch (err) {
      store.setState({ loading: false, authMessage: `Error: ${err.message}` });
      showToast(err.message, 'error');
    }
  });

  // Reset password form
  document.querySelector('#reset-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      store.setState({ loading: true });
      await request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      store.setState({ loading: false, authMode: 'login', authMessage: 'Password updated. Sign in with your new password.' });
      showToast('Password reset successfully', 'success');
    } catch (err) {
      store.setState({ loading: false, authMessage: `Error: ${err.message}` });
      showToast(err.message, 'error');
    }
  });

  // Reactivate account form
  document.querySelector('#reactivate-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      store.setState({ loading: true });
      await request('/auth/reactivate', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      store.setState({ loading: false, authMode: 'login', authMessage: 'Account reactivated. Please sign in.' });
      showToast('Account reactivated successfully', 'success');
    } catch (err) {
      store.setState({ loading: false, authMessage: `Error: ${err.message}` });
      showToast(err.message, 'error');
    }
  });

  // Google OAuth sign-in / registration
  document.querySelectorAll('#google-auth-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isRegister = btn.dataset.isRegister === 'true';
      openModal({
        title: isRegister ? 'Sign Up with Google' : 'Sign In with Google',
        subtitle: 'GOOGLE OAUTH 2.0 FEDERATION',
        size: 'small',
        contentHtml: `
          <div class="google-auth-modal">
            <div class="google-auth-intro">
              <svg class="google-icon-large" viewBox="0 0 24 24" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <p class="google-auth-desc">Authenticate securely using your Google identity. Supports local one-click demo testing and Google Cloud ID tokens.</p>
            </div>

            <div class="google-accounts-list">
              <button type="button" class="google-account-tile" data-email="alex.google@taskmanager.dev" data-name="Alex Google">
                <div class="google-tile-avatar">AG</div>
                <div class="google-tile-info">
                  <strong class="google-tile-name">Alex Google</strong>
                  <span class="google-tile-email">alex.google@taskmanager.dev</span>
                </div>
                <span class="google-tile-badge">1-Click</span>
              </button>

              <button type="button" class="google-account-tile" data-email="admin@taskmanager.dev" data-name="System Admin">
                <div class="google-tile-avatar">SA</div>
                <div class="google-tile-info">
                  <strong class="google-tile-name">System Admin (Google)</strong>
                  <span class="google-tile-email">admin@taskmanager.dev</span>
                </div>
                <span class="google-tile-badge">1-Click</span>
              </button>
            </div>

            <div class="auth-oauth-divider my-3">
              <span class="auth-oauth-line"></span>
              <span class="auth-oauth-text">OR CUSTOM ACCOUNT</span>
              <span class="auth-oauth-line"></span>
            </div>

            <form id="custom-google-form" class="modal-form-vertical">
              <div class="form-group">
                <label for="custom-google-email">Google Email Address</label>
                <input id="custom-google-email" type="email" placeholder="user@gmail.com" required />
              </div>
              <div class="form-group">
                <label for="custom-google-name">Display Name (optional)</label>
                <input id="custom-google-name" type="text" placeholder="Your Full Name" />
              </div>
              <div class="form-group">
                <label for="custom-google-idtoken">ID Token (optional Google Cloud JWT)</label>
                <input id="custom-google-idtoken" type="text" placeholder="eyJhbGciOiJSUzI1NiIs..." />
              </div>
              <button type="submit" class="button primary button-block" id="btn-submit-google">
                Continue with Google Account
              </button>
            </form>
          </div>
        `,
      });

      const executeGoogleAuth = async (payload) => {
        try {
          store.setState({ loading: true });
          const result = await request('/auth/google', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

          closeModal();
          store.setState({
            token: result.accessToken,
            user: result.user,
            authMessage: '',
            loading: false,
          });

          showToast(`Welcome, ${result.user?.fullName || 'Google User'}!`, 'success');
          await checkAndProcessPendingInvite();
          if (typeof loadInitialData === 'function') {
            await loadInitialData();
          }
        } catch (err) {
          store.setState({ loading: false });
          showToast(err.message, 'error');
        }
      };

      document.querySelectorAll('.google-account-tile').forEach((tile) => {
        tile.addEventListener('click', () => {
          executeGoogleAuth({
            demoEmail: tile.dataset.email,
            demoName: tile.dataset.name,
          });
        });
      });

      document.querySelector('#custom-google-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.querySelector('#custom-google-email')?.value?.trim();
        const fullName = document.querySelector('#custom-google-name')?.value?.trim();
        const idToken = document.querySelector('#custom-google-idtoken')?.value?.trim();

        if (!email && !idToken) {
          showToast('Please specify a Google email or ID token', 'error');
          return;
        }

        executeGoogleAuth({
          idToken: idToken || undefined,
          demoEmail: email || undefined,
          demoName: fullName || undefined,
        });
      });
    });
  });
}

export async function checkAndProcessPendingInvite() {
  const pendingInviteStr = sessionStorage.getItem('pendingInvite');
  if (!pendingInviteStr) return;
  try {
    const pendingInvite = JSON.parse(pendingInviteStr);
    sessionStorage.removeItem('pendingInvite');
    const acceptRes = await request('/organizations/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({
        invitationId: pendingInvite.invitationId || undefined,
        token: pendingInvite.invitationToken || undefined,
      }),
    });
    const joinedOrgId = acceptRes.organization?.id || acceptRes.member?.orgId;
    if (joinedOrgId) {
      store.setState({ org: joinedOrgId, selectedProjectId: '' });
    }
    showToast('Successfully joined organization from your invitation!', 'success');
  } catch (inviteErr) {
    console.warn('Auto-accept pending invite error:', inviteErr);
  }
}

