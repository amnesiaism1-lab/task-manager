import React from 'react';
import { useUIStore, AppView } from '../../stores/useUIStore';
import { cn } from '../../lib/utils';
import {
  Briefcase,
  LayoutGrid,
  Layers,
  Filter,
  BarChart3,
  Zap,
  PlugZap,
  Cpu,
  Bell,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Command,
} from 'lucide-react';

interface NavGroup {
  category: string;
  items: {
    key: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    shortcut?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { currentView, setView, isSidebarCollapsed, toggleSidebar, openModal } = useUIStore();

  const navGroups: NavGroup[] = [
    {
      category: 'Planning',
      items: [
        { key: 'work', label: 'My Work', icon: <Briefcase className="w-4 h-4" />, shortcut: 'W' },
        { key: 'boards', label: 'Kanban Board', icon: <LayoutGrid className="w-4 h-4" />, shortcut: 'B' },
        { key: 'backlog', label: 'Backlog & Sprints', icon: <Layers className="w-4 h-4" />, shortcut: 'S' },
      ],
    },
    {
      category: 'Insights',
      items: [
        { key: 'filters', label: 'Search & Filters', icon: <Filter className="w-4 h-4" />, shortcut: 'F' },
        { key: 'dashboards', label: 'Dashboards', icon: <BarChart3 className="w-4 h-4" />, shortcut: 'D' },
      ],
    },
    {
      category: 'Operations',
      items: [
        { key: 'automation', label: 'Automations', icon: <Zap className="w-4 h-4" /> },
        { key: 'integrations', label: 'API & Webhooks', icon: <PlugZap className="w-4 h-4" /> },
        { key: 'jobs', label: 'Worker Jobs', icon: <Cpu className="w-4 h-4" /> },
      ],
    },
    {
      category: 'Workspace',
      items: [
        { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { key: 'admin', label: 'Settings & Admin', icon: <Sliders className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'h-[calc(100vh-60px)] border-r border-border/70 bg-surface-base/80 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out sticky top-[60px] z-20 select-none shrink-0',
        isSidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Quick Action Pill when expanded */}
      {!isSidebarCollapsed && (
        <div className="p-3 pb-1">
          <button
            onClick={() => openModal('commandPalette')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-surface-card/60 hover:bg-surface-elevated/80 border border-border/80 text-text-muted hover:text-text-primary text-xs transition-all duration-150 group shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Command menu</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-surface border border-border/80 rounded text-text-muted">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-2 px-2.5 space-y-4 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted/70 flex items-center justify-between">
                <span>{group.category}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group relative',
                      isActive
                        ? 'bg-brand-500/15 text-white font-semibold shadow-xs border border-brand-500/30'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/80 border border-transparent'
                    )}
                  >
                    {/* Active accent vertical line */}
                    {isActive && (
                      <span className="absolute left-1 top-1.5 bottom-1.5 w-1 rounded-full bg-brand-400" />
                    )}

                    <div
                      className={cn(
                        'shrink-0 transition-transform duration-150 group-hover:scale-110',
                        isActive ? 'text-brand-400' : 'text-text-muted group-hover:text-text-secondary'
                      )}
                    >
                      {item.icon}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate tracking-tight">{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[10px] font-mono text-text-muted/50 group-hover:text-text-muted group-hover:bg-surface-surface/60 px-1 py-0.2 rounded transition-colors">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2.5 border-t border-border/70 flex items-center justify-between bg-surface-card/30">
        {!isSidebarCollapsed && (
          <span className="text-[11px] font-medium text-text-muted/60 pl-2">
            v2.4.0 Pro
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-1.5 text-xs',
            isSidebarCollapsed && 'w-full justify-center'
          )}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <span className="text-xs text-text-muted">Collapse</span>
              <ChevronLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
