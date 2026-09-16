import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { useUIStore } from '../stores/useUIStore';
import { request } from '../lib/api-client';
import { BootstrapResponse } from '../types';

// Layout & Global Overlays
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout';
import { ModalContainer } from '../components/modals/ModalContainer';
import { ToastContainer } from '../components/ui/ToastContainer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Views
import { AuthView } from '../features/auth/AuthView';
import { OnboardingView } from '../features/onboarding/OnboardingView';
import { WorkView } from '../features/work/WorkView';
import { BoardView } from '../features/board/BoardView';
import { BacklogView } from '../features/backlog/BacklogView';
import { SearchView } from '../features/search/SearchView';
import { DashboardView } from '../features/dashboard/DashboardView';
import { AutomationView } from '../features/automation/AutomationView';
import { IntegrationsView } from '../features/integrations/IntegrationsView';
import { JobsView } from '../features/jobs/JobsView';
import { NotificationsView } from '../features/notifications/NotificationsView';
import { AdminView } from '../features/admin/AdminView';

export const App: React.FC = () => {
  const { token, setUser } = useAuthStore();
  const {
    activeOrgId,
    activeProjectId,
    organizations,
    isBootstrapped,
    applyBootstrap,
  } = useWorkspaceStore();
  const { currentView, setSyncing, openModal } = useUIStore();

  // Fast single roundtrip bootstrap
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const fetchBootstrap = async () => {
      try {
        setSyncing(true);
        const queryParams = new URLSearchParams();
        if (activeOrgId) queryParams.set('orgId', activeOrgId);
        if (activeProjectId) queryParams.set('projectId', activeProjectId);
        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const data: BootstrapResponse = await request(`/workspace/bootstrap${queryStr}`);
        if (!isMounted) return;

        if (data?.user) {
          setUser(data.user);
        }
        applyBootstrap(data);
      } catch (err) {
        console.warn('Bootstrap fallback:', err);
      } finally {
        if (isMounted) setSyncing(false);
      }
    };

    fetchBootstrap();

    return () => {
      isMounted = false;
    };
  }, [token, activeOrgId, activeProjectId]);

  // Handle invitationToken from URL if authenticated
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const iToken = searchParams.get('invitationToken');
    if (iToken) {
      sessionStorage.setItem('pending_invitation_token', iToken);
      openModal('joinOrg');
      if (window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [token, openModal]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'boards':
        return <BoardView />;
      case 'backlog':
        return <BacklogView />;
      case 'filters':
        return <SearchView />;
      case 'dashboards':
        return <DashboardView />;
      case 'automation':
        return <AutomationView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'jobs':
        return <JobsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'admin':
        return <AdminView />;
      case 'work':
      default:
        return <WorkView />;
    }
  };

  const renderContent = () => {
    // 1. Not Authenticated -> Render AuthView
    if (!token) {
      return <AuthView />;
    }

    // 2. Loading initial bootstrap state
    if (!isBootstrapped) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      );
    }

    // 3. Authenticated but has NO organizations -> Render OnboardingView
    if (organizations.length === 0) {
      return <OnboardingView />;
    }

    // 4. Authenticated & Has Workspaces -> Render Workspace View
    return <WorkspaceLayout>{renderCurrentView()}</WorkspaceLayout>;
  };

  return (
    <>
      {renderContent()}
      <ErrorBoundary fallbackTitle="Modal System Error" fallbackMessage="Could not open the requested dialog.">
        <ModalContainer />
      </ErrorBoundary>
      <ToastContainer />
    </>
  );
};
