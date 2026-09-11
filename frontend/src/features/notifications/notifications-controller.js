import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';

export async function loadNotifications() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const notifs = await request(`/organizations/${org}/notifications`);
    const notifications = notifs || [];
    const unreadCount = notifications.filter(n => !n.readAt).length;
    store.setState({ notifications, unreadCount });
  } catch (err) {
    console.warn('Could not load notifications:', err.message);
  }
}

export function bindNotificationsEvents() {
  document.querySelectorAll('.btn-mark-read').forEach(btn => {
    btn.addEventListener('click', async () => {
      const notifId = btn.dataset.notificationId;
      const { org } = store.getState();
      try {
        await request(`/organizations/${org}/notifications/${notifId}/read`, { method: 'PATCH' });
        await loadNotifications();
      } catch (err) {
        console.warn('Error marking read:', err);
      }
    });
  });
}
