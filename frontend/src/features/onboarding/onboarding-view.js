import { escapeHtml } from '../../shared/utils/formatters.js';
import { renderAvatar } from '../../shared/components/badges.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderOnboardingView(state) {
  const user = state.user || {};
  const pendingInvites = state.userPendingInvitations || [];
  const firstName = user.fullName?.split(' ')[0] || 'there';

  return `
    <div class="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      <header class="h-[60px] px-6 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            TM
          </div>
          <span class="text-sm font-bold text-white">Task Manager Pro</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            ${renderAvatar(user, 'xs')}
            <span class="text-slate-300 font-mono text-[11px]">${escapeHtml(user.email || '')}</span>
          </div>
          <button type="button" class="button ghost btn-xs" id="btn-onboarding-signout">Sign Out</button>
        </div>
      </header>

      <main class="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-10 space-y-10">
        <div class="text-center max-w-2xl mx-auto space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            ${renderIcon('sparkles', 'w-3.5 h-3.5')}
            <span>Workspace Setup</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white">Welcome to Task Manager, ${escapeHtml(firstName)}!</h1>
          <p class="text-sm text-slate-400 leading-relaxed">
            You don't belong to any active organization yet. Create a fresh workspace for your team or join an existing organization using an invitation.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1: Create Organization -->
          <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-blue-500/40 space-y-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                ${renderIcon('building', 'w-6 h-6')}
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Create a New Organization</h3>
                <p class="text-xs text-slate-400 leading-relaxed mt-1">Set up an isolated multi-tenant workspace with boards, sprints, workflows, and issue tracking.</p>
              </div>

              <form id="form-onboarding-create-org" class="space-y-3 pt-2">
                <div class="form-group">
                  <label for="onboarding-org-name" class="text-xs font-semibold text-slate-300">Organization Name</label>
                  <input
                    type="text"
                    id="onboarding-org-name"
                    name="name"
                    placeholder="e.g. Acme Technologies Inc."
                    maxlength="160"
                    required
                    class="w-full text-xs"
                  />
                </div>

                <div class="form-group">
                  <label for="onboarding-org-key" class="text-xs font-semibold text-slate-300">Organization Key</label>
                  <input
                    type="text"
                    id="onboarding-org-key"
                    name="key"
                    placeholder="e.g. ACME"
                    maxlength="32"
                    required
                    class="w-full font-mono uppercase text-xs"
                  />
                  <span class="text-[10px] text-slate-500">Used as the unique tenant prefix (2-32 characters).</span>
                </div>

                <button type="submit" class="button primary button-block py-2.5 mt-2" id="btn-create-org-submit">
                  ${renderIcon('sparkles', 'w-3.5 h-3.5')}
                  <span>Create Workspace & Start</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Card 2: Pending Invitations -->
          <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                ${renderIcon('mail', 'w-6 h-6')}
              </div>
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">Pending Invitations (${pendingInvites.length})</h3>
                  <button type="button" class="button ghost btn-xs text-slate-400" id="btn-refresh-onboarding-invites" title="Refresh invitations">
                    ${renderIcon('refresh', 'w-3 h-3')}
                  </button>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mt-1">Organizations that have invited <strong>${escapeHtml(user.email || '')}</strong> to collaborate.</p>
              </div>

              <div class="space-y-2.5 max-h-[220px] overflow-y-auto">
                ${pendingInvites.length ? pendingInvites.map(inv => `
                  <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div class="flex items-center justify-between">
                      <strong class="text-xs font-bold text-white">${escapeHtml(inv.orgName || 'Workspace')}</strong>
                      <span class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">${escapeHtml(inv.orgKey || '')}</span>
                    </div>
                    <div class="text-[11px] text-slate-400">
                      <span>By <strong>${escapeHtml(inv.inviterName || 'Admin')}</strong> · Role: <strong>${escapeHtml(inv.roleName || 'Member')}</strong></span>
                    </div>
                    <div class="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        class="button primary btn-xs flex-1 btn-accept-onboarding-invite"
                        data-invitation-id="${escapeHtml(inv.id)}"
                        data-org-name="${escapeHtml(inv.orgName || '')}"
                      >
                        ${renderIcon('check', 'w-3 h-3')}
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        class="button ghost btn-xs text-slate-400 btn-decline-onboarding-invite"
                        data-invitation-id="${escapeHtml(inv.id)}"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                `).join('') : `
                  <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No pending invitations found for <code>${escapeHtml(user.email || '')}</code>.
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Card 3: Join with Invitation Code -->
          <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                ${renderIcon('key', 'w-6 h-6')}
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Join with Invite Code</h3>
                <p class="text-xs text-slate-400 leading-relaxed mt-1">Have an invitation code from an email or a colleague? Enter it below to join directly.</p>
              </div>

              <form id="form-onboarding-join-token" class="space-y-3 pt-2">
                <div class="form-group">
                  <label for="onboarding-invite-token" class="text-xs font-semibold text-slate-300">Invitation Token / Code</label>
                  <input
                    type="text"
                    id="onboarding-invite-token"
                    name="token"
                    placeholder="Paste your 32-character token here..."
                    required
                    class="w-full font-mono text-xs"
                  />
                </div>

                <button type="submit" class="button secondary button-block py-2.5 mt-2">
                  ${renderIcon('link', 'w-3.5 h-3.5')}
                  <span>Redeem Code & Join</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}
