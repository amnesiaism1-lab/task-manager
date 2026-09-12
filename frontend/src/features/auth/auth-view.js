import { escapeHtml } from '../../shared/utils/formatters.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderAuthView(state) {
  const mode = state.authMode;
  const isRegister = mode === 'register';

  return `
    <div class="auth-layout min-h-screen flex flex-col lg:flex-row bg-[#080c14] text-slate-100">
      <!-- Left Hero Banner -->
      <div class="auth-hero flex-1 flex flex-col justify-between p-8 lg:p-16 bg-gradient-to-br from-blue-950/40 via-[#080c14] to-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase mb-8">
            ${renderIcon('bolt', 'w-4 h-4')}
            <span>Task Manager Pro</span>
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Engineering agility with <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">uncompromising clarity.</span>
          </h1>

          <p class="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
            A state-of-the-art multi-tenant Jira alternative with transactional finite-state workflows, Scrum/Kanban boards, real-time auditability, and automated event outboxes.
          </p>

          <div class="space-y-6 max-w-lg">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                ${renderIcon('shield', 'w-5 h-5')}
              </div>
              <div>
                <strong class="text-sm font-bold text-slate-200 block">Two-tier RBAC Security</strong>
                <p class="text-xs text-slate-400 leading-relaxed">Fine-grained permissions at organization and project levels with deny-overrides-allow.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                ${renderIcon('refresh', 'w-5 h-5')}
              </div>
              <div>
                <strong class="text-sm font-bold text-slate-200 block">Deterministic Workflow Engine</strong>
                <p class="text-xs text-slate-400 leading-relaxed">Configurable transitions with guard conditions, required comments, and optimistic concurrency locks.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ${renderIcon('board', 'w-5 h-5')}
              </div>
              <div>
                <strong class="text-sm font-bold text-slate-200 block">Agile Sprints & Backlog</strong>
                <p class="text-xs text-slate-400 leading-relaxed">Interactive Scrum planning, WIP limits, time tracking logs, and LexoRank sorting.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 pt-8 text-xs text-slate-500 border-t border-slate-800/60 flex items-center justify-between">
          <span>Enterprise Edition v2.4</span>
          <span>PostgreSQL · NestJS · Vite</span>
        </div>
      </div>

      <!-- Right Auth Card Panel -->
      <div class="auth-panel-container w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center p-6 sm:p-10">
        <div class="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div class="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800/80">
            <button class="flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}" data-auth-mode="login">Sign In</button>
            <button class="flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRegister ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}" data-auth-mode="register">Create Account</button>
          </div>

          <div class="auth-card-body">
            ${state.authMessage ? `
              <div class="p-3 mb-5 rounded-lg text-xs leading-relaxed ${state.authMessage.toLowerCase().includes('error') ? 'bg-red-950/40 border border-red-800/60 text-red-300' : 'bg-blue-950/40 border border-blue-800/60 text-blue-300'} flex items-start gap-2">
                ${renderIcon(state.authMessage.toLowerCase().includes('error') ? 'alertCircle' : 'info', 'w-4 h-4 shrink-0 mt-0.5')}
                <span>${escapeHtml(state.authMessage)}</span>
              </div>
            ` : ''}

            ${mode === 'forgot' ? renderForgotForm() :
              mode === 'verify' ? renderVerifyForm() :
              mode === 'reset' ? renderResetForm() :
              mode === 'reactivate' ? renderReactivateForm() :
              isRegister ? renderRegisterForm() :
              renderLoginForm(state)}

            <!-- Demo Hint Pill -->
            <div class="mt-6 pt-5 border-t border-slate-800/80">
              <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5 text-blue-400 font-semibold">
                    ${renderIcon('sparkles', 'w-3.5 h-3.5')}
                    <span>Pre-seeded Demo Credentials:</span>
                  </div>
                  <div class="font-mono text-slate-300 text-[11px]">
                    admin@taskmanager.dev / Admin@123456
                  </div>
                </div>
                <button type="button" class="button ghost btn-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10 shrink-0" id="fill-demo-creds">
                  Auto-fill
                </button>
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
    <div class="relative flex py-4 items-center">
      <div class="flex-grow border-t border-slate-800"></div>
      <span class="flex-shrink mx-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">OR CONTINUE WITH</span>
      <div class="flex-grow border-t border-slate-800"></div>
    </div>
    <button type="button" class="button secondary button-block justify-center py-2.5" id="google-auth-btn" data-is-register="${isRegister}">
      <svg class="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    <form id="login-form" class="space-y-4">
      <div class="form-group">
        <label for="login-email" class="text-xs font-semibold text-slate-300">Email Address</label>
        <input id="login-email" name="email" type="email" autocomplete="email" placeholder="name@company.com" value="${escapeHtml(state.loginEmail || '')}" required class="w-full" />
      </div>
      <div class="form-group">
        <div class="flex items-center justify-between">
          <label for="login-password" class="text-xs font-semibold text-slate-300">Password</label>
          <button type="button" class="text-xs text-blue-400 hover:underline" data-auth-mode="forgot">Forgot?</button>
        </div>
        <input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" value="${escapeHtml(state.loginPassword || '')}" required class="w-full" />
      </div>
      <button type="submit" class="button primary button-block py-2.5">Sign In</button>

      ${renderGoogleButton(false)}

      <div class="text-center pt-2">
        <button type="button" class="text-xs text-slate-400 hover:text-slate-200" data-auth-mode="reactivate">
          Reactivate a deactivated account
        </button>
      </div>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form id="register-form" class="space-y-4">
      <div class="form-group">
        <label for="reg-name" class="text-xs font-semibold text-slate-300">Full Name</label>
        <input id="reg-name" name="fullName" type="text" autocomplete="name" placeholder="Alex Morgan" required class="w-full" />
      </div>
      <div class="form-group">
        <label for="reg-email" class="text-xs font-semibold text-slate-300">Work Email</label>
        <input id="reg-email" name="email" type="email" autocomplete="email" placeholder="alex@company.com" required class="w-full" />
      </div>
      <div class="form-group">
        <label for="reg-password" class="text-xs font-semibold text-slate-300">Password (8+ characters)</label>
        <input id="reg-password" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="••••••••" required class="w-full" />
      </div>
      <button type="submit" class="button primary button-block py-2.5">Create Account</button>

      ${renderGoogleButton(true)}
    </form>
  `;
}

function renderForgotForm() {
  return `
    <form id="forgot-form" class="space-y-4">
      <p class="text-xs text-slate-400">Enter your email and we will generate a password reset token for your account.</p>
      <div class="form-group">
        <label for="forgot-email" class="text-xs font-semibold text-slate-300">Account Email</label>
        <input id="forgot-email" name="email" type="email" required class="w-full" />
      </div>
      <button type="submit" class="button primary button-block py-2.5">Send Reset Link</button>
      <button type="button" class="button ghost button-block py-2" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}

function renderVerifyForm() {
  return `
    <form id="verify-form" class="space-y-4">
      <p class="text-xs text-slate-400">Enter the verification token sent to your email to activate your account.</p>
      <div class="form-group">
        <label for="verify-user-id" class="text-xs font-semibold text-slate-300">User ID</label>
        <input id="verify-user-id" name="userId" placeholder="UUID" required class="w-full font-mono text-xs" />
      </div>
      <div class="form-group">
        <label for="verify-token" class="text-xs font-semibold text-slate-300">Verification Token</label>
        <input id="verify-token" name="token" placeholder="Token" required class="w-full font-mono text-xs" />
      </div>
      <button type="submit" class="button primary button-block py-2.5">Verify Email</button>
      <button type="button" class="button ghost button-block py-2" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}

function renderResetForm() {
  return `
    <form id="reset-form" class="space-y-4">
      <p class="text-xs text-slate-400">Create a new secure password for your account.</p>
      <div class="form-group">
        <label for="reset-user-id" class="text-xs font-semibold text-slate-300">User ID</label>
        <input id="reset-user-id" name="userId" required class="w-full font-mono text-xs" />
      </div>
      <div class="form-group">
        <label for="reset-token" class="text-xs font-semibold text-slate-300">Reset Token</label>
        <input id="reset-token" name="token" required class="w-full font-mono text-xs" />
      </div>
      <div class="form-group">
        <label for="reset-password" class="text-xs font-semibold text-slate-300">New Password</label>
        <input id="reset-password" name="password" type="password" minlength="8" required class="w-full" />
      </div>
      <button type="submit" class="button primary button-block py-2.5">Update Password</button>
      <button type="button" class="button ghost button-block py-2" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}

function renderReactivateForm() {
  return `
    <form id="reactivate-form" class="space-y-4">
      <p class="text-xs text-slate-400">Provide your email and password to reactivate your deactivated account.</p>
      <div class="form-group">
        <label for="react-email" class="text-xs font-semibold text-slate-300">Account Email</label>
        <input id="react-email" name="email" type="email" required class="w-full" />
      </div>
      <div class="form-group">
        <label for="react-password" class="text-xs font-semibold text-slate-300">Password</label>
        <input id="react-password" name="password" type="password" required class="w-full" />
      </div>
      <button type="submit" class="button primary button-block py-2.5">Reactivate Account</button>
      <button type="button" class="button ghost button-block py-2" data-auth-mode="login">Back to Sign In</button>
    </form>
  `;
}
