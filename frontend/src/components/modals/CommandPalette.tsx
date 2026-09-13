import React, { useState, useEffect, useRef } from 'react';
import { useUIStore, AppView } from '../../stores/useUIStore';
import {
  Search,
  LayoutDashboard,
  Kanban,
  ListTodo,
  SlidersHorizontal,
  Zap,
  Cable,
  Briefcase,
  Shield,
  Plus,
  UserPlus,
  FolderPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Issues';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const { modals, closeModal, setView, openModal } = useUIStore();
  const isOpen = Boolean(modals['commandPalette']);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeModal('commandPalette');
        } else {
          useUIStore.getState().openModal('commandPalette');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (view: AppView) => {
    setView(view);
    closeModal('commandPalette');
  };

  const commands: CommandItem[] = [
    // Actions
    {
      id: 'act-create-issue',
      title: 'Create new issue...',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-brand-400" />,
      shortcut: 'C',
      action: () => {
        closeModal('commandPalette');
        openModal('createIssue');
      },
    },
    {
      id: 'act-create-project',
      title: 'Create new project...',
      category: 'Actions',
      icon: <FolderPlus className="w-4 h-4 text-emerald-400" />,
      action: () => {
        closeModal('commandPalette');
        openModal('createProject');
      },
    },
    {
      id: 'act-invite-member',
      title: 'Invite member to organization...',
      category: 'Actions',
      icon: <UserPlus className="w-4 h-4 text-purple-400" />,
      action: () => {
        closeModal('commandPalette');
        openModal('inviteMember');
      },
    },

    // Navigation
    {
      id: 'nav-boards',
      title: 'Go to Kanban Boards',
      category: 'Navigation',
      icon: <Kanban className="w-4 h-4 text-blue-400" />,
      shortcut: 'G B',
      action: () => navigateTo('boards'),
    },
    {
      id: 'nav-backlog',
      title: 'Go to Backlog & Sprints',
      category: 'Navigation',
      icon: <ListTodo className="w-4 h-4 text-indigo-400" />,
      shortcut: 'G L',
      action: () => navigateTo('backlog'),
    },
    {
      id: 'nav-dashboards',
      title: 'Go to Dashboards & Analytics',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />,
      shortcut: 'G D',
      action: () => navigateTo('dashboards'),
    },
    {
      id: 'nav-filters',
      title: 'Go to Search & Filter Explorer',
      category: 'Navigation',
      icon: <SlidersHorizontal className="w-4 h-4 text-cyan-400" />,
      shortcut: 'G F',
      action: () => navigateTo('filters'),
    },
    {
      id: 'nav-automation',
      title: 'Go to Automation Rules Engine',
      category: 'Navigation',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      shortcut: 'G A',
      action: () => navigateTo('automation'),
    },
    {
      id: 'nav-integrations',
      title: 'Go to Integrations & Webhooks',
      category: 'Navigation',
      icon: <Cable className="w-4 h-4 text-pink-400" />,
      action: () => navigateTo('integrations'),
    },
    {
      id: 'nav-jobs',
      title: 'Go to Background Jobs & Tasks',
      category: 'Navigation',
      icon: <Briefcase className="w-4 h-4 text-orange-400" />,
      action: () => navigateTo('jobs'),
    },
    {
      id: 'nav-admin',
      title: 'Go to Organization Administration',
      category: 'Navigation',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G S',
      action: () => navigateTo('admin'),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      closeModal('commandPalette');
    }
  };

  return (
    <div
      id="tm-command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4 overflow-y-auto bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={() => closeModal('commandPalette')}
    >
      <div
        className="relative w-full max-w-xl bg-surface-card border border-white/10 rounded-2xl shadow-modal overflow-hidden animate-slide-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-cyan-400 to-indigo-500" />

        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-surface-elevated/40">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none p-0"
            placeholder="Type a command or search (e.g. Backlog, Create, Admin)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface-surface/60 border border-white/10 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-brand-600/20 text-white border border-brand-500/30'
                      : 'text-text-secondary hover:bg-surface-hover/60 hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-surface-surface/70 border border-white/5">
                      {cmd.icon}
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">{cmd.title}</span>
                      <span className="ml-2 text-[10px] text-text-muted">({cmd.category})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-surface/70 border border-white/5 rounded">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-brand-400 animate-pulse" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-surface-surface/40 text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1 py-0.5 bg-surface-card rounded text-[10px]">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-surface-card rounded text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-surface-card rounded text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-brand-400 font-medium">
            <Sparkles className="w-3 h-3" />
            TaskPro Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
