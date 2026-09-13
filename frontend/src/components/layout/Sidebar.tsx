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
} from 'lucide-react';

interface NavItem {
  key: AppView;
  label: string;
  icon: React.ReactNode;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { currentView, setView, isSidebarCollapsed, toggleSidebar } = useUIStore();

  const navItems: NavItem[] = [
    { key: 'work', label: 'My Work', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'boards', label: 'Boards', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'backlog', label: 'Backlog & Sprints', icon: <Layers className="w-4 h-4" /> },
    { key: 'filters', label: 'Search & Filters', icon: <Filter className="w-4 h-4" /> },
    { key: 'dashboards', label: 'Dashboards', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'automation', label: 'Automation', icon: <Zap className="w-4 h-4" /> },
    { key: 'integrations', label: 'Integrations', icon: <PlugZap className="w-4 h-4" /> },
    { key: 'jobs', label: 'Background Jobs', icon: <Cpu className="w-4 h-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { key: 'admin', label: 'Settings & Admin', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={cn(
        'h-[calc(100vh-60px)] border-r border-border/80 bg-surface-surface/50 backdrop-blur-md flex flex-col transition-all duration-200 sticky top-[60px] z-20 select-none shrink-0',
        isSidebarCollapsed ? 'w-[64px]' : 'w-[230px]'
      )}
    >
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/80 border border-transparent'
              )}
            >
              <div className={cn('shrink-0', isActive ? 'text-brand-400' : 'text-text-muted')}>
                {item.icon}
              </div>
              {!isSidebarCollapsed && (
                <span className="truncate tracking-tight">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-border/80 flex items-center justify-end">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium px-2 py-0.5">
              <span>Collapse</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
