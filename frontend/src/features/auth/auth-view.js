import { escapeHtml } from '../../shared/utils/formatters.js';

export function renderAuthView(state) {
  const mode = state.authMode;
  const isRegister = mode === 'register';

  return `
    <div class="auth-layout">
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="brand-tag">
            <span class="brand-tag-icon">⚡</span>
            <span>TASK MANAGER PRO</span>
          </div>
          <h1 class="hero-title">Engineering agility with uncompromising clarity.</h1>
          <p class="hero-subtitle">
            A state-of-the-art multi-tenant Jira alternative with transactional finite-state workflows, Scrum/Kanban boards, real-time auditability, and automated event outboxes.
          </p>

          <div class="hero-features-list">
            <div class="hero-feature-item">
              <span class="feature-icon">🛡️</span>
              <div>
                <strong>Two-tier RBAC Security</strong>
                <p>Fine-grained permissions at both organization and project levels with deny-overrides-allow.</p>
              </div>
            </div>
            <div class="hero-feature-item">
              <span class="feature-icon">🔄</span>
              <div>
                <strong>Deterministic Workflow Engine</strong>
                <p>Configurable transitions with guard conditions, required comments, and optimistic concurrency locks.</p>
              </div>
            </div>
            <div class="hero-feature-item">
              <span class="feature-icon">📊</span>
              <div>
                <strong>Agile Sprints & Backlog</strong>
                <p>Interactive Scrum planning, LexoRank issue ordering, WIP limits, and time tracking logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-panel-container">
        <div class="auth-card">
          <div class="auth-card-tabs">
            <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-auth-mode="login">Sign In</button>
            <button class="auth-tab ${isRegister ? 'active' : ''}" data-auth-mode="register">Create Account</button>
          </div>

          <div class="auth-card-body">
            ${state.authMessage ? `
              <div class="notice ${state.authMessage.toLowerCase().includes('error') ? 'error' : 'info'}">
                ${escapeHtml(state.authMessage)}
              </div>
            ` : ''}

            ${mode === 'forgot' ? renderForgotForm() :
              mode === 'verify' ? renderVerifyForm() :
              mode === 'reset' ? renderResetForm() :
              mode === 'reactivate' ? renderReactivateForm() :
              isRegister ? renderRegisterForm() :
              renderLoginForm(state)}

            <div class="auth-demo-hint">
              <span class="hint-icon">💡</span>
              <div class="hint-content">
                <strong>Pre-seeded Demo Credentials:</strong>
                <code>admin@taskmanager.dev</code> / <code>Admin@123456</code>
                <button type="button" class="link-btn" id="fill-demo-creds">Auto-fill</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderGoogleButton(isRegister = false) {
  return `
    <div class="auth-oauth-divider">
      <span class="auth-oauth-line"></span>
      <span class="auth-oauth-text">OR CONTINUE WITH</span>
      <span class="auth-oauth-line"></span>
    </div>
    <button type="button" class="button google-auth-btn button-block" id="google-auth-btn" data-is-register="${isRegister}">
      <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
      <span>${isRegister ? 'Sign up with Google' : 'Sign in with Google'}</span>
    </button>
  `;
}

function renderLoginForm(state = {}) {
  return `
    <form id="login-form" class="auth-form-body">
      <div class="form-group">
        <label for="login-email">Email Address</label>
        <input id="login-email" name="email" type="email" autocomplete="email" placeholder="name@company.com" value="${escapeHtml(state.loginEmail || '')}" required />
      </div>
      <div class="form-group">
        <div class="label-row">
          <label for="login-password">Password</label>
          <button type="button" class="text-link-btn" data-auth-mode="forgot">Forgot?</button>
        </div>
        <input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" value="${escapeHtml(state.loginPassword || '')}" required />
      </div>
      <button type="submit" class="button primary button-block">Sign In</button>

      ${renderGoogleButton(false)}

      <div class="form-footer-links">
        <button type="button" class="text-link-btn muted-link" data-auth-mode="reactivate">
          Reactivate a deactivated account
        </button>
      </div>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form id="register-form" class="auth-form-body">
      <div class="form-group">
        <label for="reg-name">Full Name</label>
        <input id="reg-name" name="fullName" type="text" autocomplete="name" placeholder="Alex Morgan" required />
      </div>
      <div class="form-group">
        <label for="reg-email">Work Email</label>
        <input id="reg-email" name="email" type="email" autocomplete="email" placeholder="alex@company.com" required />
      </div>
      <div class="form-group">
        <label for="reg-password">Password (8+ characters)</label>
        <input id="reg-password" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="••••••••" required />
      </div>
      <button type="submit" class="button primary button-block">Create Account</button>

      ${renderGoogleButton(true)}
    </form>
  `;
}

function renderForgotForm() {
  return `
    <form id="forgot-form" class="auth-form-body">
      <p class="form-desc">Enter your email and we will generate a password reset token for your account.</p>
      <div class="form-group">
        <label for="forgot-email">Account Email</label>
        <input id="forgot-email" name="email" type="email" required />
      </div>
      <button type="submit" class="button primary button-block">Send Reset Link</button>
      <button type="button" class="button ghost button-block" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}

function renderVerifyForm() {
  return `
    <form id="verify-form" class="auth-form-body">
      <p class="form-desc">Enter the verification token sent to your email to activate your account.</p>
      <div class="form-group">
        <label for="verify-user-id">User ID</label>
        <input id="verify-user-id" name="userId" placeholder="UUID" required />
      </div>
      <div class="form-group">
        <label for="verify-token">Verification Token</label>
        <input id="verify-token" name="token" placeholder="Token" required />
      </div>
      <button type="submit" class="button primary button-block">Verify Email</button>
      <button type="button" class="button ghost button-block" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}

function renderResetForm() {
  return `
    <form id="reset-form" class="auth-form-body">
      <p class="form-desc">Create a new secure password for your account.</p>
      <div class="form-group">
        <label for="reset-user-id">User ID</label>
        <input id="reset-user-id" name="userId" required />
      </div>
      <div class="form-group">
        <label for="reset-token">Reset Token</label>
        <input id="reset-token" name="token" required />
      </div>
      <div class="form-group">
        <label for="reset-password">New Password</label>
        <input id="reset-password" name="password" type="password" minlength="8" required />
      </div>
      <button type="submit" class="button primary button-block">Update Password</button>
      <button type="button" class="button ghost button-block" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}

function renderReactivateForm() {
  return `
    <form id="reactivate-form" class="auth-form-body">
      <p class="form-desc">Provide your email and password to reactivate your deactivated account.</p>
      <div class="form-group">
        <label for="react-email">Account Email</label>
        <input id="react-email" name="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="react-password">Password</label>
        <input id="react-password" name="password" type="password" required />
      </div>
      <button type="submit" class="button primary button-block">Reactivate Account</button>
      <button type="button" class="button ghost button-block" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}
