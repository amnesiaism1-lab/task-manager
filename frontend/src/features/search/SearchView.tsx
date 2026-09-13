import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Issue } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { activeOrgId, members } = useWorkspaceStore();
  const { searchQuery, setSearchQuery, openModal } = useUIStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const { data: issues = [], isLoading, refetch, isFetching } = useQuery<Issue[]>({
    queryKey: ['searchIssues', activeOrgId, searchQuery, statusFilter, priorityFilter, assigneeFilter],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const params = new URLSearchParams({ page: '1', limit: '100' });
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (assigneeFilter) params.append('assigneeId', assigneeFilter);

      const res = await request(`/organizations/${activeOrgId}/issues/search?${params.toString()}`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-400" />
              Search & Filters
            </h1>
            <p className="text-xs text-text-secondary">
              Search across all projects, summary text, descriptions, and custom fields.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
            title="Refresh search"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>

        {/* Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keyword or JQL query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-lg pl-9 pr-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open / To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done / Resolved</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>

          <div>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName || m.user?.email || m.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
          <span>Search Results ({issues.length} issues)</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Searching issues...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-text-secondary">No issues found</p>
            <p className="text-xs text-text-muted">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {issues.map((issue) => (
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
                      (issue.status || '').toLowerCase().includes('done')
                        ? 'done'
                        : (issue.status || '').toLowerCase().includes('progress')
                        ? 'progress'
                        : 'todo'
                    }
                    size="sm"
                  >
                    {issue.status || (issue as any).state || 'Open'}
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
