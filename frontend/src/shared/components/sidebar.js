export function renderSidebar(state) {
  const currentView = state.view;

  const navItems = [
    { id: 'work', label: 'Work', icon: '◈', badge: state.issues.length ? String(state.issues.length) : '' },
    { id: 'boards', label: 'Boards', icon: '▥', badge: '' },
    { id: 'backlog', label: 'Backlog', icon: '▤', badge: state.backlog?.length ? String(state.backlog.length) : '' },
    { id: 'filters', label: 'Filters', icon: '◇', badge: '' },
    { id: 'dashboards', label: 'Dashboards', icon: '📊', badge: '' },
    { id: 'automation', label: 'Automation', icon: '⚡', badge: '' },
    { id: 'integrations', label: 'Integrations', icon: '🔌', badge: '' },
    { id: 'jobs', label: 'Jobs', icon: '▦', badge: '' },
    { id: 'admin', label: 'Admin', icon: '⚙️', badge: '' },
  ];

  return `
    <aside class="app-sidebar">
      <div class="sidebar-brand" title="Task Manager Pro">
        <div class="brand-logo">
          <span class="logo-mark">TM</span>
          <span class="brand-name">Task Manager</span>
        </div>
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
          <span class="project-pill-text">
            ${state.projects.find(p => p.id === state.selectedProjectId)?.key || 'ALL'}
          </span>
        </div>
      </div>
    </aside>
  `;
}

function renderNavItem(item, currentView) {
  const isActive = currentView === item.id;
  const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';

  return `
    <button class="nav-item ${isActive ? 'active' : ''}" data-nav-view="${item.id}" title="${item.label}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
      ${badgeHtml}
    </button>
  `;
}
