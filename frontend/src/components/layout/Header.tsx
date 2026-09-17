import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from '../../lib/api-client';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { Button } from '../ui/Button';
import { getInitials } from '../../lib/utils';
import {
  Building2,
  FolderKanban,
  Plus,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  Sparkles,
  RefreshCw,
  UserPlus,
  KeyRound,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const {
    activeOrgId,
    activeProjectId,
    organizations,
    projects,
    setActiveOrgId,
    setActiveProjectId,
  } = useWorkspaceStore();
  const {
    openModal,
    setView,
    isSyncing,
  } = useUIStore();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setOrgDropdownOpen(false);
      if (projRef.current && !projRef.current.contains(e.target as Node)) setProjectDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];
  const activeProj = projects.find((p) => p.id === activeProjectId) || projects[0];

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['notifications', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/notifications`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const unreadCount = notifications.filter((n) => !n.readAt && !n.read).length;

  return (
    <header className="h-[60px] border-b border-border/80 bg-surface-surface/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Brand Logo & Workspace Switchers */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          onClick={() => setView('work')}
          className="flex items-center gap-2.5 cursor-pointer group pr-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white hidden md:inline">
            Task<span className="text-brand-400">Pro</span>
          </span>
        </div>

        <div className="h-5 w-px bg-border/80 hidden sm:block" />

        {/* Organization Switcher Dropdown */}
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-hover text-xs font-medium text-text-primary transition-colors border border-transparent hover:border-border"
          >
            <Building2 className="w-3.5 h-3.5 text-brand-400" />
            <span className="max-w-[110px] truncate">{activeOrg?.name || 'Select Org'}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-surface-card border border-border shadow-dropdown py-1.5 z-50 animate-slide-up">
              <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Organizations
              </div>
              <div className="max-h-48 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrgId(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                      org.id === activeOrg?.id ? 'text-brand-400 font-semibold bg-brand-500/10' : 'text-text-primary'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] text-text-muted uppercase font-mono">{org.key}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border/80 mt-1 pt-1 px-1 space-y-0.5">
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    openModal('inviteMember');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-hover rounded-lg flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5 text-brand-400" />
                  Invite Team Member...
                </button>
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    openModal('joinOrg');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-hover rounded-lg flex items-center gap-2 font-medium"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  Join with Code...
                </button>
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    openModal('createOrg');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-brand-400 hover:bg-surface-hover rounded-lg flex items-center gap-2 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Organization
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Project Switcher Dropdown */}
        <div className="relative" ref={projRef}>
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-hover text-xs font-medium text-text-primary transition-colors border border-transparent hover:border-border"
          >
            <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[120px] truncate">{activeProj?.name || 'Select Project'}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-surface-card border border-border shadow-dropdown py-1.5 z-50 animate-slide-up">
              <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Projects
              </div>
              <div className="max-h-48 overflow-y-auto">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                      proj.id === activeProj?.id ? 'text-emerald-400 font-semibold bg-emerald-500/10' : 'text-text-primary'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    <span className="text-[10px] text-text-muted uppercase font-mono">{proj.key}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border/80 mt-1 pt-1 px-1">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    openModal('createProject');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-surface-hover rounded-lg flex items-center gap-2 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Button */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => openModal('createIssue')}
          className="shadow-sm font-semibold hidden sm:inline-flex"
        >
          Create
        </Button>
      </div>

      {/* Center: Global Search Bar / Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={() => openModal('commandPalette')}
          className="w-full bg-surface-surface/70 hover:bg-surface-surface text-text-primary text-xs rounded-xl px-3.5 py-2 border border-border/80 hover:border-brand-500/40 flex items-center justify-between transition-all group shadow-inner"
        >
          <div className="flex items-center gap-2.5 text-text-muted group-hover:text-text-secondary">
            <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-400 transition-colors" />
            <span className="font-normal truncate">Search issues, actions, or commands...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface-elevated/80 border border-white/10 rounded-md shadow-sm">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right: Sync Indicator, Search on Mobile, Notifications, User Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search Trigger */}
        <button
          onClick={() => openModal('commandPalette')}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover md:hidden transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Sync Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
            isSyncing
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 animate-pulse'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
          title={isSyncing ? 'Synchronizing with server...' : 'Connected and synced with Syd1 edge'}
        >
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span className="hidden sm:inline">{isSyncing ? 'Syncing' : 'Connected'}</span>
        </div>

        {/* Notifications Icon Button with Dynamic Unread Badge */}
        <button
          onClick={() => setView('notifications')}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors relative"
          aria-label="Notifications"
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notification Center'}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-surface shadow-sm animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-full hover:bg-surface-hover transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              {getInitials(user?.fullName, user?.email)}
            </div>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-surface-card border border-border shadow-dropdown py-1.5 z-50 animate-slide-up">
              <div className="px-3.5 py-2 border-b border-border/80">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    openModal('userProfile');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover flex items-center gap-2.5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-text-muted" />
                  My Profile & Security
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setView('admin');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-text-muted" />
                  Organization Settings
                </button>
              </div>

              <div className="border-t border-border/80 pt-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
