import { escapeHtml, initials } from '../utils/formatters.js';
import { renderIcon } from './icons.js';

export function renderStatusBadge(stateOrName) {
  const name = typeof stateOrName === 'string' ? stateOrName : (stateOrName?.name || 'Open');
  const category = (typeof stateOrName === 'object' && stateOrName?.category) ? stateOrName.category : getCategoryFromName(name);

  return `<span class="badge badge-status status-${category}"><span class="badge-dot"></span>${escapeHtml(name)}</span>`;
}

function getCategoryFromName(name) {
  const lower = String(name || '').toLowerCase();
  if (lower.includes('done') || lower.includes('closed') || lower.includes('resolved')) return 'done';
  if (lower.includes('progress') || lower.includes('review') || lower.includes('testing')) return 'in_progress';
  return 'todo';
}

export function renderTypeBadge(typeOrKey) {
  const rawKey = typeof typeOrKey === 'string' ? typeOrKey : (typeOrKey?.key || 'task');
  const key = String(rawKey || 'task').toLowerCase();
  const name = typeof typeOrKey === 'string' ? typeOrKey : (typeOrKey?.name || 'Task');

  let iconName = 'typeTask';
  let className = 'type-task';

  if (key === 'bug') {
    iconName = 'typeBug';
    className = 'type-bug';
  } else if (key === 'story') {
    iconName = 'typeStory';
    className = 'type-story';
  } else if (key === 'epic') {
    iconName = 'typeEpic';
    className = 'type-epic';
  }

  return `
    <span class="badge badge-type ${className}" title="${escapeHtml(name)}">
      <span class="badge-icon">${renderIcon(iconName, 'w-3.5 h-3.5')}</span>
      <span>${escapeHtml(name)}</span>
    </span>
  `.trim();
}

export function renderPriorityBadge(priority = 'Medium') {
  const p = String(priority || 'Medium').toLowerCase();
  let iconName = 'priorityMedium';
  let className = 'priority-medium';

  if (p === 'highest' || p === 'critical' || p === 'blocker') {
    iconName = 'priorityHighest';
    className = 'priority-highest';
  } else if (p === 'high') {
    iconName = 'priorityHigh';
    className = 'priority-high';
  } else if (p === 'low') {
    iconName = 'priorityLow';
    className = 'priority-low';
  } else if (p === 'lowest') {
    iconName = 'priorityLowest';
    className = 'priority-lowest';
  }

  return `
    <span class="badge badge-priority ${className}" title="Priority: ${escapeHtml(priority || 'Medium')}">
      ${renderIcon(iconName, 'w-3.5 h-3.5')}
    </span>
  `.trim();
}

export function renderAvatar(userOrName, size = 'sm') {
  const name = typeof userOrName === 'string' ? userOrName : (userOrName?.fullName || 'User');
  const avatarUrl = typeof userOrName === 'object' ? userOrName?.avatarUrl : null;
  const init = initials(name);

  const sizeClasses = {
    xs: 'w-[22px] h-[22px] text-[10px]',
    sm: 'w-[28px] h-[28px] text-[11px]',
    md: 'w-[34px] h-[34px] text-[13px]',
    lg: 'w-[44px] h-[44px] text-[16px]',
  };
  const szCls = sizeClasses[size] || sizeClasses.sm;

  if (avatarUrl) {
    return `<img class="avatar avatar-${size} ${szCls} rounded-full object-cover shrink-0 inline-block border border-border-default/60 shadow-sm" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" />`;
  }

  // Generate deterministic modern gradient from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 45) % 360;

  return `
    <span class="avatar avatar-${size} ${szCls} rounded-full inline-flex items-center justify-center font-bold text-white select-none shrink-0 shadow-sm border border-white/10" 
          style="background: linear-gradient(135deg, hsl(${hue1}, 70%, 48%), hsl(${hue2}, 75%, 38%));" 
          title="${escapeHtml(name)}">
      ${escapeHtml(init)}
    </span>
  `.trim();
}
