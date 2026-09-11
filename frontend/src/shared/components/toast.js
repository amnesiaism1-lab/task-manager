/**
 * Toast Notification System
 */

export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('tm-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tm-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close">×</button>
  `;

  const close = () => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('.toast-close').addEventListener('click', close);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(close, duration);
  }
}

function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}
