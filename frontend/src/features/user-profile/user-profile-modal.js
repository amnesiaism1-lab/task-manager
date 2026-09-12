import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderUserProfileModal(user, sessions, currentOrg, orgName, invites = []) {
  return `
    <div class="user-profile-modal-content space-y-6 text-slate-100">
      <div class="flex items-center gap-4 pb-4 border-b border-slate-800">
        <div class="w-14 h-14 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xl font-bold text-blue-400">
          <span>${escapeHtml(user.fullName ? user.fullName[0].toUpperCase() : 'U')}</span>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-100">${escapeHtml(user.fullName || 'User')}</h3>
          <p class="text-xs text-slate-400 font-mono">${escapeHtml(user.email || '')}</p>
          ${user.isSystemAdmin ? `
            <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
              ${renderIcon('bolt', 'w-3 h-3')}
              <span>System Admin</span>
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Change Password -->
      <form id="form-change-password" class="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Change Password</p>
        <div class="form-group">
          <label for="prof-curr-pass" class="text-xs text-slate-300 font-medium">Current Password</label>
          <input id="prof-curr-pass" name="currentPassword" type="password" class="w-full text-xs" required />
        </div>
        <div class="form-group">
          <label for="prof-new-pass" class="text-xs text-slate-300 font-medium">New Password (8+ chars)</label>
          <input id="prof-new-pass" name="newPassword" type="password" minlength="8" class="w-full text-xs" required />
        </div>
        <button type="submit" class="button ghost btn-sm">Update Password</button>
      </form>

      <!-- Active Sessions -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Sessions (${sessions.length})</p>
          <span class="text-xs text-slate-500">Auto-terminates when revoked</span>
        </div>
        <div class="sessions-list-container space-y-2">
          ${sessions.length ? sessions.map(s => `
            <div class="session-card-row p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
              <div class="session-info-main flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  ${renderIcon(s.userAgent?.includes('Mobile') ? 'deviceMobile' : 'deviceDesktop', 'w-4 h-4')}
                </div>
                <div class="session-details">
                  <strong class="text-sm font-semibold text-slate-200 block">${escapeHtml(s.userAgent || 'Desktop Browser')}</strong>
                  <span class="text-xs text-slate-400 font-mono">IP: ${escapeHtml(s.ipAddress || '127.0.0.1')} · Active: ${formatDate(s.createdAt)}</span>
                </div>
              </div>
              <div>
                ${s.current ? `
                  <span class="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Current Session</span>
                ` : `
                  <button type="button" class="button danger btn-xs btn-revoke-user-session" data-session-id="${s.id}">Revoke</button>
                `}
              </div>
            </div>
          `).join('') : '<div class="text-xs text-slate-500 p-2">No active sessions found.</div>'}
        </div>
      </div>

      <!-- Pending Invitations -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Invitations (${(invites || []).length})</p>
          <span class="text-xs text-slate-500">Sent to ${escapeHtml(user.email || '')}</span>
        </div>
        <div class="space-y-2">
          ${(invites && invites.length) ? invites.map(inv => `
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <strong class="text-sm font-semibold text-slate-200 block">${escapeHtml(inv.orgName || 'Workspace')} (${escapeHtml(inv.orgKey || '')})</strong>
                <span class="text-xs text-slate-400">Invited by ${escapeHtml(inv.inviterName || 'Admin')} · Role: ${escapeHtml(inv.roleName || 'Member')}</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="button primary btn-xs btn-prof-accept-invite" data-inv-id="${escapeHtml(inv.id)}" data-org-name="${escapeHtml(inv.orgName || '')}">Accept</button>
                <button type="button" class="button ghost btn-xs btn-prof-decline-invite" data-inv-id="${escapeHtml(inv.id)}">Decline</button>
              </div>
            </div>
          `).join('') : '<div class="text-xs text-slate-500 p-2">No pending invitations.</div>'}
        </div>
      </div>

      <!-- Current Organization & Leave Org -->
      ${currentOrg ? `
        <div class="leave-org-card p-4 rounded-xl bg-red-950/20 border border-red-900/40">
          <h4 class="text-sm font-bold text-red-400 mb-1">Leave Workspace</h4>
          <p class="text-xs text-slate-400">Voluntarily remove yourself from <strong>${escapeHtml(orgName)}</strong>. All your personal API tokens in this workspace will be immediately revoked.</p>
          <button type="button" class="button danger btn-xs mt-3" id="btn-leave-workspace">
            Leave Organization
          </button>
        </div>
      ` : ''}

      <div class="pt-2 flex justify-end">
        <button type="button" class="button danger btn-sm" id="btn-user-signout">Sign Out</button>
      </div>
    </div>
  `;
}
