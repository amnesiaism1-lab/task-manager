import { renderIcon } from './icons.js';

export function renderSidebar(state) {
  const currentView = state.view;

  const navItems = [
    { id: 'work', label: 'Work', icon: 'work', badge: state.issues.length ? String(state.issues.length) : '' },
    { id: 'boards', label: 'Boards', icon: 'board', badge: '' },
    { id: 'backlog', label: 'Backlog', icon: 'backlog', badge: state.backlog?.length ? String(state.backlog.length) : '' },
    { id: 'filters', label: 'Filters', icon: 'filter', badge: '' },
    { id: 'dashboards', label: 'Dashboards', icon: 'dashboard', badge: '' },
    { id: 'automation', label: 'Automation', icon: 'automation', badge: '' },
    { id: 'integrations', label: 'Integrations', icon: 'integration', badge: '' },
    { id: 'jobs', label: 'Jobs', icon: 'job', badge: '' },
    { id: 'admin', label: 'Admin', icon: 'admin', badge: '' },
  ];

  return `
    <aside class="app-sidebar" id="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <div class="logo-mark-wrap">
            <span class="logo-mark">TM</span>
          </div>
          <div class="brand-text-col">
            <span class="brand-name">Task Manager</span>
            <span class="brand-tier">ENTERPRISE</span>
          </div>
        </div>
        <!-- Mobile Drawer Close Button -->
        <button class="icon-button mobile-drawer-close" id="btn-mobile-sidebar-close" aria-label="Close menu">
          ${renderIcon('close', 'w-4 h-4')}
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">PLANNING & WORK</div>
        ${navItems.slice(0, 4).map(item => renderNavItem(item, currentView)).join('')}

        <div class="nav-section-label">PRODUCTIVITY</div>
        ${navItems.slice(4, 7).map(item => renderNavItem(item, currentView)).join('')}

        <div class="nav-section-label">MANAGEMENT</div>
        ${navItems.slice(7).map(item => renderNavItem(item, currentView)).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="project-pill-info" title="${state.selectedProjectId ? 'Active Project' : 'All Projects'}">
          <span class="project-dot"></span>
          <span class="project-pill-text truncate">
            ${state.projects.find(p => p.id === state.selectedProjectId)?.name || 'All Workspace Projects'}
          </span>
        </div>
      </div>
    </aside>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
  `;
}

function renderNavItem(item, currentView) {
  const isActive = currentView === item.id;
  const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';

  return `
    <button class="nav-item ${isActive ? 'active' : ''}" data-nav-view="${item.id}" title="${item.label}">
      <span class="nav-icon">${renderIcon(item.icon, 'w-4 h-4')}</span>
      <span class="nav-label">${item.label}</span>
      ${badgeHtml}
    </button>
  `;
}
