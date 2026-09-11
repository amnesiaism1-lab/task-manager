import './styles.css';
import { store } from './shared/state/store.js';
import { request, handleUnauthorized } from './shared/api/client.js';
import { showToast } from './shared/components/toast.js';
import { openModal, closeModal } from './shared/components/modal.js';
import { renderHeader } from './shared/components/header.js';
import { renderSidebar } from './shared/components/sidebar.js';
import { debounce } from './shared/utils/formatters.js';

// View renderers
import { renderAuthView } from './features/auth/auth-view.js';
import { renderWorkView } from './features/work/work-view.js';
import { renderBoardView } from './features/board/board-view.js';
import { renderBacklogView } from './features/backlog/backlog-view.js';
import { renderSearchView } from './features/search/search-view.js';
import { renderDashboardView } from './features/dashboard/dashboard-view.js';
import { renderAutomationView } from './features/automation/automation-view.js';
import { renderIntegrationsView } from './features/integrations/integrations-view.js';
import { renderAdminView } from './features/admin/admin-view.js';
import { renderNotificationsView } from './features/notifications/notifications-view.js';
import { renderJobsView } from './features/jobs/jobs-view.js';
import { renderOnboardingView } from './features/onboarding/onboarding-view.js';
import { bindOnboardingEvents } from './features/onboarding/onboarding-controller.js';

// Feature controllers
import { loadMe, bindAuthEvents } from './features/auth/auth-controller.js';
import {
  loadProjects,
  loadMembers,
  loadOrganizations,
  loadUserInvitations,
  openCreateOrgModal,
  openJoinOrgModal,
  openPendingInvitationsModal,
  openSettingsModal,
} from './features/project/project-controller.js';
import { loadBoards, loadBoardData, bindBoardEvents } from './features/board/board-controller.js';
import { loadSprints, loadBacklog, bindBacklogEvents } from './features/backlog/backlog-controller.js';
import { loadIssues, openIssueDetailModal, openIssueCreateModal } from './features/issue/issue-controller.js';
import { loadFilters, bindSearchEvents } from './features/search/search-controller.js';
import { loadDashboards, bindDashboardEvents } from './features/dashboard/dashboard-controller.js';
import { loadAutomationRules, bindAutomationEvents } from './features/automation/automation-controller.js';
import { loadIntegrations, bindIntegrationsEvents } from './features/integrations/integrations-controller.js';
import { loadJobs, bindJobsEvents } from './features/jobs/jobs-controller.js';
import { loadAdminData, bindAdminEvents } from './features/admin/admin-controller.js';
import { loadNotifications, bindNotificationsEvents } from './features/notifications/notifications-controller.js';
import { openUserProfileModalController } from './features/user-profile/user-profile-controller.js';

const app = document.querySelector('#app');

// -----------------------------------------------------------------------------
// Data Fetching & Sync Orchestration
// -----------------------------------------------------------------------------

export async function loadViewData(view) {
  switch (view) {
    case 'work':
      await Promise.all([loadProjects(), loadMembers(), loadIssues(store.getState().query)]);
      break;
    case 'boards':
      await Promise.all([loadProjects(), loadMembers(), loadBoards()]);
      break;
    case 'backlog':
      await Promise.all([loadProjects(), loadMembers(), loadSprints(), loadBacklog(), loadIssues()]);
      break;
    case 'filters':
      await Promise.all([loadProjects(), loadFilters(), loadIssues(store.getState().query)]);
      break;
    case 'dashboards':
      await Promise.all([loadProjects(), loadDashboards(), loadIssues(), loadSprints()]);
      break;
    case 'automation':
      await loadAutomationRules();
      break;
    case 'integrations':
      await loadIntegrations();
      break;
    case 'jobs':
      await loadJobs();
      break;
    case 'notifications':
      await loadNotifications();
      break;
    case 'admin':
      await loadAdminData();
      break;
  }
}

export async function loadInitialData() {
  if (!store.getState().token) return;

  try {
    store.setState({ loading: true });
    await loadMe();
    await Promise.all([loadOrganizations(), loadUserInvitations()]);

    const { org } = store.getState();
    if (org) {
      await Promise.all([loadProjects(), loadMembers(), loadNotifications()]);

      const { selectedProjectId } = store.getState();
      if (selectedProjectId) {
        await Promise.all([loadBoards(), loadSprints(), loadBacklog(), loadIssues()]);
      }
    }
  } catch (err) {
    console.error('Error initializing application:', err);
  } finally {
    store.setState({ loading: false });
  }
}

// -----------------------------------------------------------------------------
// UI Rendering
// -----------------------------------------------------------------------------

function render() {
  const state = store.getState();

  // If not authenticated, render auth view
  if (!state.token) {
    app.innerHTML = renderAuthView(state);
    bindAuthEvents(loadInitialData);
    return;
  }

  // If authenticated but has NO organizations, render Onboarding View!
  if (state.organizations.length === 0) {
    app.innerHTML = renderOnboardingView(state);
    bindOnboardingEvents(loadInitialData);
    return;
  }

  // Render full SaaS shell
  let currentViewHtml = '';
  switch (state.view) {
    case 'boards':
      currentViewHtml = renderBoardView(state);
      break;
    case 'backlog':
      currentViewHtml = renderBacklogView(state);
      break;
    case 'filters':
      currentViewHtml = renderSearchView(state);
      break;
    case 'dashboards':
      currentViewHtml = renderDashboardView(state);
      break;
    case 'automation':
      currentViewHtml = renderAutomationView(state);
      break;
    case 'integrations':
      currentViewHtml = renderIntegrationsView(state);
      break;
    case 'jobs':
      currentViewHtml = renderJobsView(state);
      break;
    case 'admin':
      currentViewHtml = renderAdminView(state);
      break;
    case 'notifications':
      currentViewHtml = renderNotificationsView(state);
      break;
    case 'work':
    default:
      currentViewHtml = renderWorkView(state);
      break;
  }

  app.innerHTML = `
    <div class="app-shell app-layout">
      ${renderSidebar(state)}
      <div class="app-main-area app-main-content">
        ${renderHeader(state)}
        <main class="app-content app-view-scroll" id="main-scroll-area">
          ${currentViewHtml}
        </main>
      </div>
    </div>
  `;

  bindShellEvents();
  bindViewEvents(state.view);
}

// -----------------------------------------------------------------------------
// Shell & Navigation Event Handlers
// -----------------------------------------------------------------------------

function bindShellEvents() {
  // Sidebar navigation items
  document.querySelectorAll('[data-nav-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetView = btn.dataset.navView;
      store.setState({ view: targetView });
      await loadViewData(targetView);
    });
  });

  // Workspace / Org Switcher
  const orgSwitcher = document.querySelector('#org-switcher');
  orgSwitcher?.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      openCreateOrgModal(loadInitialData);
      return;
    }
    if (val === '__join__') {
      openJoinOrgModal(loadInitialData);
      return;
    }
    store.setState({ org: val, selectedProjectId: '' });
    await loadInitialData();
  });

  // Header Pending Invitations Badge Button
  document.querySelector('#btn-header-invites')?.addEventListener('click', () => {
    openPendingInvitationsModal(loadInitialData);
  });

  // Project Switcher
  const projectSwitcher = document.querySelector('#project-switcher');
  projectSwitcher?.addEventListener('change', async (e) => {
    const val = e.target.value;
    store.setState({ selectedProjectId: val });
    if (val) {
      await Promise.all([loadBoards(), loadSprints(), loadBacklog(), loadIssues(store.getState().query)]);
    }
  });

  // Quick Create Issue buttons in header and views
  document.querySelector('#header-create-issue-btn')?.addEventListener('click', () => openIssueCreateModal());
  document.querySelector('#btn-quick-create-issue')?.addEventListener('click', () => openIssueCreateModal());
  document.querySelector('#btn-quick-create-work')?.addEventListener('click', () => openIssueCreateModal());

  // Global search input
  const searchInput = document.querySelector('#global-search-input');
  if (searchInput) {
    const debouncedSearch = debounce((q) => {
      store.setState({ query: q });
      loadIssues(q);
    }, 300);

    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        store.setState({ query: e.target.value, view: 'filters' });
        loadIssues(e.target.value);
      }
    });
  }

  // Header notifications button
  document.querySelector('#header-notifications-btn')?.addEventListener('click', async () => {
    store.setState({ view: 'notifications' });
    await loadNotifications();
  });

  // Header settings button
  document.querySelector('#header-settings-btn')?.addEventListener('click', () => openSettingsModal(loadInitialData));

  // User avatar profile button
  document.querySelector('#header-user-btn')?.addEventListener('click', () => openUserProfileModalController({ loadInitialData }));
}

// -----------------------------------------------------------------------------
// View-Specific Event Routing
// -----------------------------------------------------------------------------

function bindViewEvents(view) {
  // Global issue opening clicks across all views
  document.querySelectorAll('[data-open-issue]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openIssueDetailModal(el.dataset.openIssue);
    });
  });

  switch (view) {
    case 'boards':
      bindBoardEvents();
      break;
    case 'backlog':
      bindBacklogEvents();
      break;
    case 'filters':
      bindSearchEvents();
      break;
    case 'dashboards':
      bindDashboardEvents();
      break;
    case 'automation':
      bindAutomationEvents();
      break;
    case 'integrations':
      bindIntegrationsEvents();
      break;
    case 'jobs':
      bindJobsEvents();
      break;
    case 'admin':
      bindAdminEvents();
      break;
    case 'notifications':
      bindNotificationsEvents();
      break;
  }
}

// -----------------------------------------------------------------------------
// Global Keyboard Shortcuts
// -----------------------------------------------------------------------------

window.addEventListener('keydown', (e) => {
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

  // Cmd+K or Ctrl+K -> Focus global search
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('#global-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  // Press 'c' to quick create issue when not focused on an input
  if (!isInput && e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (store.getState().token) {
      e.preventDefault();
      openIssueCreateModal();
    }
  }
});

// -----------------------------------------------------------------------------
// Application Bootstrap
// -----------------------------------------------------------------------------

store.subscribe(() => render());

render();

handleUrlParameters();

if (store.getState().token) {
  loadInitialData();
}

async function handleUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const invitationToken = params.get('invitationToken');
  const invitationId = params.get('invitationId');
  const email = params.get('email');
  const verifyToken = params.get('verifyToken');
  const resetToken = params.get('resetToken');

  if (!invitationToken && !invitationId && !verifyToken && !resetToken) {
    return;
  }

  // Clean URL query string without page reload
  window.history.replaceState({}, document.title, window.location.pathname);

  if (verifyToken) {
    store.setState({
      authMode: 'verify',
      authMessage: 'Email verification token detected. Please submit to verify.',
    });
    setTimeout(() => {
      const tokenInput = document.querySelector('#verify-token');
      const emailInput = document.querySelector('#verify-email');
      if (tokenInput) tokenInput.value = verifyToken;
      if (emailInput && email) emailInput.value = email;
    }, 100);
    return;
  }

  if (resetToken) {
    store.setState({
      authMode: 'reset',
      authMessage: 'Password reset token detected. Enter your new password below.',
    });
    setTimeout(() => {
      const tokenInput = document.querySelector('#reset-token');
      if (tokenInput) tokenInput.value = resetToken;
    }, 100);
    return;
  }

  if (invitationToken || invitationId) {
    const token = store.getState().token;
    if (token) {
      openModal({
        title: 'Workspace Invitation',
        subtitle: 'ORGANIZATION INVITE DETECTED',
        size: 'small',
        contentHtml: `
          <div class="space-y-4">
            <p class="text-sm text-text-primary">
              You received an invitation${email ? ` addressed to <strong>${email}</strong>` : ''} to join an organization!
            </p>
            <p class="text-xs text-text-muted">
              Would you like to accept and join this workspace now?
            </p>
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
              <button type="button" class="button ghost btn-modal-cancel">Dismiss</button>
              <button type="button" class="button primary" id="btn-accept-invite-url">Accept & Join</button>
            </div>
          </div>
        `,
      });

      document.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
      document.querySelector('#btn-accept-invite-url')?.addEventListener('click', async () => {
        try {
          store.setState({ loading: true });
          const res = await request('/organizations/invitations/accept', {
            method: 'POST',
            body: JSON.stringify({ invitationId: invitationId || undefined, token: invitationToken || undefined }),
          });
          closeModal();
          showToast('Successfully joined organization!', 'success');
          const joinedOrgId = res.organization?.id || res.member?.orgId;
          if (joinedOrgId) {
            store.setState({ org: joinedOrgId, selectedProjectId: '' });
          }
          await loadOrganizations();
          await loadUserInvitations();
          await loadInitialData();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          store.setState({ loading: false });
        }
      });
    } else {
      store.setState({
        authMode: 'login',
        loginEmail: email || '',
        authMessage: `🎉 You have been invited to collaborate! Sign in or register with ${email || 'your email'} to join.`,
      });
      sessionStorage.setItem('pendingInvite', JSON.stringify({ invitationToken, invitationId, email }));
    }
  }
}

