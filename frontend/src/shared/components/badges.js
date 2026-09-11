import { escapeHtml, initials } from '../utils/formatters.js';

export function renderStatusBadge(stateOrName) {
  const name = typeof stateOrName === 'string' ? stateOrName : stateOrName?.name || 'Open';
  const category = (typeof stateOrName === 'object' && stateOrName?.category) ? stateOrName.category : getCategoryFromName(name);

  return `<span class="badge badge-status status-${category}">${escapeHtml(name)}</span>`;
}

function getCategoryFromName(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('done') || lower.includes('closed') || lower.includes('resolved')) return 'done';
  if (lower.includes('progress') || lower.includes('review') || lower.includes('testing')) return 'in_progress';
  return 'todo';
}

export function renderTypeBadge(typeOrKey) {
  const key = typeof typeOrKey === 'string' ? typeOrKey.toLowerCase() : (typeOrKey?.key || 'task').toLowerCase();
  const name = typeof typeOrKey === 'string' ? typeOrKey : (typeOrKey?.name || 'Task');

  let icon = '✓';
  let className = 'type-task';

  if (key === 'bug') {
    icon = '●';
    className = 'type-bug';
  } else if (key === 'story') {
    icon = '▲';
    className = 'type-story';
  } else if (key === 'epic') {
    icon = '⚡';
    className = 'type-epic';
  }

  return `<span class="badge badge-type ${className}" title="${escapeHtml(name)}"><span class="badge-icon">${icon}</span> ${escapeHtml(name)}</span>`;
}

export function renderPriorityBadge(priority = 'Medium') {
  const p = String(priority).toLowerCase();
  let icon = '—';
  let className = 'priority-medium';

  if (p === 'highest' || p === 'critical' || p === 'blocker') {
    icon = '↑↑';
    className = 'priority-highest';
  } else if (p === 'high') {
    icon = '↑';
    className = 'priority-high';
  } else if (p === 'low') {
    icon = '↓';
    className = 'priority-low';
  } else if (p === 'lowest') {
    icon = '↓↓';
    className = 'priority-lowest';
  }

  return `<span class="badge badge-priority ${className}" title="Priority: ${escapeHtml(priority)}">${icon}</span>`;
}

export function renderAvatar(userOrName, size = 'sm') {
  const name = typeof userOrName === 'string' ? userOrName : userOrName?.fullName || 'User';
  const avatarUrl = typeof userOrName === 'object' ? userOrName?.avatarUrl : null;
  const init = initials(name);

  const sizeClasses = {
    xs: 'w-[22px] h-[22px] text-[9px]',
    sm: 'w-[28px] h-[28px] text-[11px]',
    md: 'w-[34px] h-[34px] text-[13px]',
    lg: 'w-[44px] h-[44px] text-[16px]',
  };
  const szCls = sizeClasses[size] || sizeClasses.sm;

  if (avatarUrl) {
    return `<img class="avatar avatar-${size} ${szCls} rounded-full object-cover shrink-0 inline-block" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" />`;
  }

  // Generate deterministic pastel color from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);

  return `<span class="avatar avatar-${size} ${szCls} rounded-full inline-flex items-center justify-center font-bold text-white select-none shrink-0" style="background-color: hsl(${hue}, 65%, 45%);" title="${escapeHtml(name)}">${escapeHtml(init)}</span>`;
}
