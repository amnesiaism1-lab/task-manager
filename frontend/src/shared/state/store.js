/**
 * Central Reactive Store for Task Manager
 */

const initialState = {
  api: localStorage.getItem('tm_api') || 'http://localhost:3001/api',
  token: localStorage.getItem('tm_token') || '',
  user: null,
  authMode: 'login', // 'login' | 'register' | 'forgot' | 'verify' | 'reset' | 'reactivate'
  authMessage: '',
  sessions: [],

  // Multi-tenancy & Workspace
  org: localStorage.getItem('tm_org') || '',
  organizations: [],
  organization: null,
  members: [],
  invitations: [],
  orgRoles: [],
  departments: [],
  groups: [],

  // Projects
  projects: [],
  selectedProjectId: localStorage.getItem('tm_project') || '',
  projectDetail: null,
  projectMembers: [],
  projectRoles: [],
  permissionScheme: null,
  components: [],
  versions: [],
  projectWorkflow: null,

  // Navigation & Views
  view: 'work', // 'work' | 'boards' | 'backlog' | 'filters' | 'dashboards' | 'automation' | 'integrations' | 'admin' | 'notifications' | 'jobs'
  adminTab: 'org', // 'org' | 'members' | 'roles' | 'departments' | 'groups' | 'project'

  // Issues & Agile
  query: '',
  issues: [],
  selectedIssue: null,
  issueDetail: null,
  filters: [],

  // Boards & Sprints
  boards: [],
  selectedBoardId: '',
  boardData: null,
  sprints: [],
  backlog: [],

  // Productivity, Audit, Worker
  notifications: [],
  unreadCount: 0,
  dashboards: [],
  selectedDashboard: null,
  dashboardWidgets: [],
  automationRules: [],
  tokens: [],
  webhooks: [],
  jobs: [],

  // App UI State
  loading: false,
  error: '',
  toasts: [],
};

class Store {
  constructor() {
    this.state = { ...initialState };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    const prevState = this.state;
    this.state = { ...prevState, ...updates };

    // Handle persistent keys
    if (updates.api !== undefined) localStorage.setItem('tm_api', this.state.api);
    if (updates.token !== undefined) {
      if (this.state.token) localStorage.setItem('tm_token', this.state.token);
      else localStorage.removeItem('tm_token');
    }
    if (updates.org !== undefined) {
      if (this.state.org) localStorage.setItem('tm_org', this.state.org);
      else localStorage.removeItem('tm_org');
    }
    if (updates.selectedProjectId !== undefined) {
      if (this.state.selectedProjectId) localStorage.setItem('tm_project', this.state.selectedProjectId);
      else localStorage.removeItem('tm_project');
    }

    this.notify(prevState);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(prevState) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, prevState);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    }
  }
}

export const store = new Store();
