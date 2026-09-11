import { escapeHtml, formatRelativeTime } from '../../shared/utils/formatters.js';

export function renderNotificationsView(state) {
  const notifs = state.notifications || [];
  const unreadCount = notifs.filter(n => !n.readAt).length;

  return `
    <div class="notifications-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">ACTIVITY INBOX</p>
          <h2>Notifications & Signals</h2>
        </div>
        <div class="header-actions">
          <span class="count-badge">${unreadCount} unread</span>
        </div>
      </div>

      <div class="notifications-panel-card">
        <div class="notifications-list">
          ${notifs.length ? notifs.map(n => `
            <div class="notification-item ${n.readAt ? 'read' : 'unread'}" data-notification-id="${n.id}">
              <span class="notif-dot"></span>
              <div class="notif-content">
                <strong>${escapeHtml(n.title)}</strong>
                <p class="notif-body">${escapeHtml(n.body)}</p>
                <small class="muted-small">${formatRelativeTime(n.createdAt)}</small>
              </div>
              ${!n.readAt ? `
                <button class="button ghost btn-sm btn-mark-read" data-notification-id="${n.id}">
                  Mark read
                </button>
              ` : ''}
            </div>
          `).join('') : `
            <div class="empty-hint-text">No notifications yet. You're up to date!</div>
          `}
        </div>
      </div>
    </div>
  `;
}
