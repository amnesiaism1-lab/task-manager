import { useAuthStore } from '../stores/useAuthStore';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { useUIStore } from '../stores/useUIStore';
import { request } from '../lib/api-client';
import { queryClient } from '../lib/query-client';

export function setupTestHarness() {
  if (typeof window === 'undefined') return;

  const storeAdapter = {
    getState: () => {
      const auth = useAuthStore.getState();
      const ws = useWorkspaceStore.getState();
      const ui = useUIStore.getState();
      return {
        token: auth.token,
        user: auth.user,
        api: localStorage.getItem('tm_api') || '/api',
        org: ws.activeOrgId,
        selectedProjectId: ws.activeProjectId,
        currentOrg: ws.organizations.find((o) => o.id === ws.activeOrgId) || null,
        activeProject: ws.projects.find((p) => p.id === ws.activeProjectId) || null,
        organizations: ws.organizations,
        projects: ws.projects,
        members: ws.members,
        view: ui.currentView,
        query: ui.searchQuery,
        modals: ui.modals,
      };
    },
    setState: (updates: Record<string, any>) => {
      if (updates.token !== undefined) useAuthStore.getState().setToken(updates.token);
      if (updates.user !== undefined) useAuthStore.getState().setUser(updates.user);
      if (updates.org !== undefined) useWorkspaceStore.getState().setActiveOrgId(updates.org);
      if (updates.selectedProjectId !== undefined) useWorkspaceStore.getState().setActiveProjectId(updates.selectedProjectId);
      if (updates.view !== undefined) useUIStore.getState().setView(updates.view);
      if (updates.query !== undefined) useUIStore.getState().setSearchQuery(updates.query);
    },
    subscribe: () => () => {},
  };

  (window as any).__TM = {
    store: storeAdapter,
    request,
    showToast: (msg: string, type: any = 'info') => useUIStore.getState().showToast(msg, type),
    openModal: (nameOrOptions: string | Record<string, any>, data?: any) => {
      if (typeof nameOrOptions === 'object' && nameOrOptions !== null) {
        useUIStore.getState().openModal('customModal', nameOrOptions);
      } else {
        useUIStore.getState().openModal(nameOrOptions, data);
      }
    },
    closeModal: (name?: string) => {
      if (name) useUIStore.getState().closeModal(name);
      else useUIStore.getState().closeAllModals();
    },
    openCreateOrgModal: () => useUIStore.getState().openModal('createOrg'),
    openCreateProjectModal: () => useUIStore.getState().openModal('createProject'),
    openJoinOrgModal: () => useUIStore.getState().openModal('joinOrg'),
    openInviteMemberModal: () => useUIStore.getState().openModal('inviteMember'),
    openIssueDetailModal: (issueId: string) => useUIStore.getState().openModal('issueDetail', { id: issueId }),
    openIssueCreateModal: () => useUIStore.getState().openModal('createIssue'),
    openUserProfileModalController: () => useUIStore.getState().openModal('userProfile'),

    // Async data loaders
    loadBoards: async () => {
      await queryClient.invalidateQueries({ queryKey: ['boards'] });
      await queryClient.invalidateQueries({ queryKey: ['boardData'] });
    },
    loadSprints: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    loadBacklog: async () => {
      await queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
    loadIssues: async () => {
      await queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    loadDashboards: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
    loadAutomationRules: async () => {
      await queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
    loadIntegrations: async () => {
      await queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    loadJobs: async () => {
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    loadAdminData: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminData'] });
    },
    loadNotifications: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    loadFilters: async () => {
      await queryClient.invalidateQueries({ queryKey: ['filters'] });
    },
  };
}
