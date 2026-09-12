import { escapeHtml, formatRelativeTime } from '../../shared/utils/formatters.js';

export function renderNotificationsView(state) {
  const notifs = state.notifications || [];
  const unreadCount = notifs.filter(n => !n.readAt).length;

  return `
    <div class="notifications-view-container space-y-6">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">ACTIVITY INBOX</p>
          <h2>Notifications & Signals</h2>
        </div>
        <div class="header-actions">
          <span class="count-badge">${unreadCount} unread</span>
        </div>
      </div>

      <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800">
        <div class="space-y-3">
          ${notifs.length ? notifs.map(n => `
            <div class="p-4 rounded-xl transition-colors flex items-start justify-between gap-4 ${n.readAt ? 'bg-slate-950/40 border border-slate-800/40 opacity-75' : 'bg-slate-950/80 border border-blue-500/30'}" data-notification-id="${n.id}">
              <div class="flex items-start gap-3">
                <span class="w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.readAt ? 'bg-transparent' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}"></span>
                <div class="space-y-1">
                  <strong class="text-xs font-bold text-white block">${escapeHtml(n.title)}</strong>
                  <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(n.body)}</p>
                  <small class="text-[11px] text-slate-500 block font-mono">${formatRelativeTime(n.createdAt)}</small>
                </div>
              </div>
              ${!n.readAt ? `
                <button class="button ghost btn-xs btn-mark-read text-blue-400 border-blue-500/30 shrink-0" data-notification-id="${n.id}">
                  Mark read
                </button>
              ` : ''}
            </div>
          `).join('') : `
            <div class="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No notifications yet. You're up to date!
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
