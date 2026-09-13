import { create } from 'zustand';
import { Organization, Project, OrgMember, BootstrapResponse } from '../types';

interface WorkspaceState {
  activeOrgId: string;
  activeProjectId: string;
  organizations: Organization[];
  projects: Project[];
  members: OrgMember[];
  isBootstrapped: boolean;
  isLoading: boolean;

  setActiveOrgId: (orgId: string) => void;
  setActiveProjectId: (projectId: string) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setProjects: (projects: Project[]) => void;
  setMembers: (members: OrgMember[]) => void;
  setIsLoading: (loading: boolean) => void;
  applyBootstrap: (data: BootstrapResponse) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  const initialOrg = typeof localStorage !== 'undefined' ? localStorage.getItem('tm_org') || '' : '';
  const initialProject = typeof localStorage !== 'undefined' ? localStorage.getItem('tm_project') || '' : '';

  return {
    activeOrgId: initialOrg,
    activeProjectId: initialProject,
    organizations: [],
    projects: [],
    members: [],
    isBootstrapped: false,
    isLoading: false,

    setActiveOrgId: (orgId: string) => {
      if (orgId) localStorage.setItem('tm_org', orgId);
      else localStorage.removeItem('tm_org');
      set({ activeOrgId: orgId });
    },

    setActiveProjectId: (projectId: string) => {
      if (projectId) localStorage.setItem('tm_project', projectId);
      else localStorage.removeItem('tm_project');
      set({ activeProjectId: projectId });
    },

    setOrganizations: (organizations) => set({ organizations }),
    setProjects: (projects) => set({ projects }),
    setMembers: (members) => set({ members }),
    setIsLoading: (isLoading) => set({ isLoading }),

    applyBootstrap: (data: BootstrapResponse) => {
      const state = get();
      const orgId = data.activeOrgId || state.activeOrgId || data.organizations?.[0]?.id || '';
      const projId = data.activeProjectId || state.activeProjectId || data.projects?.[0]?.id || '';

      if (orgId) localStorage.setItem('tm_org', orgId);
      if (projId) localStorage.setItem('tm_project', projId);

      set({
        organizations: data.organizations || [],
        activeOrgId: orgId,
        projects: data.projects || [],
        activeProjectId: projId,
        members: data.members || [],
        isBootstrapped: true,
        isLoading: false,
      });
    },
  };
});
