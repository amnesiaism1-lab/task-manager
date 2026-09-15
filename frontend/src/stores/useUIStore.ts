import { create } from 'zustand';

export type AppView =
  | 'work'
  | 'boards'
  | 'backlog'
  | 'filters'
  | 'dashboards'
  | 'automation'
  | 'integrations'
  | 'jobs'
  | 'admin'
  | 'notifications';

export type AdminTab = 'org' | 'members' | 'roles' | 'departments' | 'groups' | 'project' | 'workflows' | 'catalogs';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface UIState {
  currentView: AppView;
  activeAdminTab: AdminTab;
  searchQuery: string;
  isSidebarCollapsed: boolean;
  isSyncing: boolean;

  // Modals & Selected items
  modals: Record<string, boolean>;
  modalData: Record<string, any>;
  selectedIssueId: string | null;

  // Toasts
  toasts: ToastItem[];

  setView: (view: AppView) => void;
  setAdminTab: (tab: AdminTab) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSyncing: (syncing: boolean) => void;

  openModal: (name: string, data?: any) => void;
  closeModal: (name: string) => void;
  closeAllModals: () => void;

  setSelectedIssueId: (id: string | null) => void;

  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'work',
  activeAdminTab: 'org',
  searchQuery: '',
  isSidebarCollapsed: false,
  isSyncing: false,

  modals: {},
  modalData: {},
  selectedIssueId: null,
  toasts: [],

  setView: (currentView) => set({ currentView }),
  setAdminTab: (activeAdminTab) => set({ activeAdminTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setSyncing: (isSyncing) => set({ isSyncing }),

  openModal: (name, data = null) =>
    set((s) => ({
      modals: { ...s.modals, [name]: true },
      modalData: data !== undefined ? { ...s.modalData, [name]: data } : s.modalData,
    })),

  closeModal: (name) =>
    set((s) => ({
      modals: { ...s.modals, [name]: false },
    })),

  closeAllModals: () => set({ modals: {}, modalData: {} }),

  setSelectedIssueId: (selectedIssueId) => set({ selectedIssueId }),

  showToast: (message, type = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({
      toasts: [...s.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}));

// Quick global toast helper
export const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 4000) => {
  useUIStore.getState().showToast(message, type, duration);
};
