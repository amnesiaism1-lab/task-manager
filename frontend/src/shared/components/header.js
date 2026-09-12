import { escapeHtml } from '../utils/formatters.js';
import { renderAvatar } from './badges.js';
import { renderIcon } from './icons.js';

export function renderHeader(state) {
  const currentOrg = state.organizations.find(o => o.orgId === state.org);
  const orgName = currentOrg?.name || currentOrg?.organization?.name || state.organization?.name || (state.org ? `Org: ${state.org.slice(0, 8)}...` : 'No Organization');
  const unreadBadge = state.unreadCount > 0 ? `<span class="notification-badge">${state.unreadCount}</span>` : '';
  const pendingInvites = state.userPendingInvitations || [];
  const invitesBadge = pendingInvites.length > 0 ? `
    <button class="header-invites-btn" id="btn-header-invites" title="${pendingInvites.length} pending workspace invitation(s)">
      ${renderIcon('mail', 'w-4 h-4 text-amber-400')}
      <span class="invites-count-pill">${pendingInvites.length}</span>
    </button>
  ` : '';

  return `
    <header class="app-header">
      <div class="header-left">
        <!-- Mobile Sidebar Toggle -->
        <button class="icon-button mobile-menu-toggle" id="btn-mobile-sidebar-toggle" aria-label="Toggle Navigation Menu">
          ${renderIcon('menu', 'w-5 h-5')}
        </button>

        <div class="org-badge" title="${escapeHtml(orgName)}">
          <span class="org-icon">${renderIcon('building', 'w-4 h-4 text-blue-400')}</span>
          <select id="org-switcher" class="select-clean" aria-label="Select Organization">
            ${state.organizations.map(o => `
              <option value="${escapeHtml(o.orgId)}" ${o.orgId === state.org ? 'selected' : ''}>
                ${escapeHtml(o.name || o.organization?.name || o.orgId)}
              </option>
            `).join('')}
            ${!state.organizations.some(o => o.orgId === state.org) && state.org ? `<option value="${escapeHtml(state.org)}" selected>${escapeHtml(orgName)}</option>` : ''}
            <option value="__invite__">Invite Member...</option>
            <option value="__new__">+ New Organization</option>
            <option value="__join__">Join with Code</option>
          </select>
        </div>

        <div class="project-selector-wrapper">
          <span class="project-prefix">/</span>
          <select id="project-switcher" class="select-clean project-select" aria-label="Current project">
            <option value="">All Projects</option>
            ${state.projects.map(p => `
              <option value="${escapeHtml(p.id)}" ${p.id === state.selectedProjectId ? 'selected' : ''}>
                ${escapeHtml(p.key)} · ${escapeHtml(p.name)}
              </option>
            `).join('')}
            <option value="__new_project__">+ Create Project...</option>
          </select>
        </div>

        <button class="button primary create-issue-btn" id="header-create-issue-btn">
          <span class="btn-icon">${renderIcon('plus', 'w-4 h-4')}</span>
          <span class="btn-label">Create</span>
        </button>
      </div>

      <div class="header-center">
        <div class="quick-search-box">
          <span class="search-icon">${renderIcon('search', 'w-4 h-4 text-slate-400')}</span>
          <input id="global-search-input" type="text" placeholder="Search issues, keys (e.g. CLOUD-1)..." value="${escapeHtml(state.query)}" aria-label="Quick search" />
          <kbd class="hotkey-badge">⌘K</kbd>
        </div>
      </div>

      <div class="header-right">
        <div class="sync-indicator ${state.loading ? 'syncing' : 'online'}" title="${state.loading ? 'Syncing with server...' : 'System connected'}">
          <span class="pulse-dot"></span>
          <span class="sync-label">${state.loading ? 'Syncing' : 'Ready'}</span>
        </div>

        ${invitesBadge}

        <button class="icon-button notification-btn" id="header-notifications-btn" title="View Notifications" aria-label="Notifications">
          ${renderIcon('bell', 'w-4 h-4')}
          ${unreadBadge}
        </button>

        <button class="icon-button settings-btn" id="header-settings-btn" title="API Connection Settings" aria-label="Settings">
          ${renderIcon('settings', 'w-4 h-4')}
        </button>

        <div class="user-menu-wrapper">
          <button class="avatar-button" id="header-user-btn" aria-label="User profile">
            ${renderAvatar(state.user || { fullName: 'User' }, 'sm')}
          </button>
        </div>
      </div>
    </header>
  `;
}
