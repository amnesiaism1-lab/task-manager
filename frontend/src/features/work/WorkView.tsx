import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { request } from '../../lib/api-client';
import { Issue } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate, formatStatus } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const WorkView: React.FC = () => {
  const { activeOrgId, activeProjectId } = useWorkspaceStore();
  const { openModal } = useUIStore();
  const { user } = useAuthStore();

  const [filterTab, setFilterTab] = useState<'all' | 'progress' | 'done'>('all');

  const { data: issues = [], isLoading } = useQuery<Issue[]>({
    queryKey: ['issues', activeOrgId, activeProjectId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const url = activeProjectId
        ? `/organizations/${activeOrgId}/projects/${activeProjectId}/issues?page=1&limit=100`
        : `/organizations/${activeOrgId}/issues/search?page=1&limit=100`;
      const res = await request(url);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  // Calculate work metrics
  const myIssues = issues.filter((i) => {
    if (!user) return true;
    return i.assigneeId === user.id || i.assignee?.id === user.id || !i.assigneeId;
  });

  const inProgressIssues = myIssues.filter(
    (i) => {
      const s = formatStatus(i.status).toLowerCase();
      return s.includes('progress') || s.includes('doing');
    }
  );
  const doneIssues = myIssues.filter(
    (i) => {
      const s = formatStatus(i.status).toLowerCase();
      return s.includes('done') || s.includes('resolve');
    }
  );
  const todoIssues = myIssues.filter(
    (i) => !inProgressIssues.includes(i) && !doneIssues.includes(i)
  );

  const displayedIssues = myIssues.filter((i) => {
    if (filterTab === 'progress') return inProgressIssues.includes(i);
    if (filterTab === 'done') return doneIssues.includes(i);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">My Work</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Personal Hub
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Here is everything assigned to you or recently active in your current workspace.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openModal('createIssue')}
          className="shadow-glow font-semibold"
        >
          Create Issue
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Total Assigned</span>
            <ListTodo className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{myIssues.length}</div>
        </div>

        <div className="bg-surface-card border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>To Do</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-200">{todoIssues.length}</div>
        </div>

        <div className="bg-surface-card border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>In Progress</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400">{inProgressIssues.length}</div>
        </div>

        <div className="bg-surface-card border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{doneIssues.length}</div>
        </div>
      </div>

      {/* Issues Table Container */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        {/* Table Filter Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/80 bg-surface-elevated/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTab('all')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'all'
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              All ({myIssues.length})
            </button>
            <button
              onClick={() => setFilterTab('progress')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'progress'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              In Progress ({inProgressIssues.length})
            </button>
            <button
              onClick={() => setFilterTab('done')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'done'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Completed ({doneIssues.length})
            </button>
          </div>
        </div>

        {/* Issues List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading issues...</span>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-text-secondary">No issues found</p>
            <p className="text-xs text-text-muted">
              You are all caught up, or no issues match this filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {displayedIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => openModal('issueDetail', issue)}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-hover/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <span className="font-mono text-xs font-bold text-brand-400 shrink-0">
                    {issue.key}
                  </span>
                  <span className="text-xs font-medium text-text-primary truncate group-hover:text-brand-300 transition-colors">
                    {issue.title || (issue as any).summary}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={
                      formatStatus(issue.status).toLowerCase().includes('done')
                        ? 'done'
                        : formatStatus(issue.status).toLowerCase().includes('progress')
                        ? 'progress'
                        : 'todo'
                    }
                    size="sm"
                  >
                    {formatStatus(issue.status || (issue as any).state || 'Open')}
                  </Badge>
                  <span className="text-[11px] text-text-muted hidden sm:inline">
                    {formatDate(issue.updatedAt || issue.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
