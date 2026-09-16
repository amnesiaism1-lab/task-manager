import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Issue } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate, formatStatus, getInitials } from '../../lib/utils';
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Download,
  LayoutList,
  LayoutGrid,
  X,
  Bug,
  Bookmark,
  CheckSquare,
  Zap,
  ChevronUp,
  ChevronsUp,
  ChevronDown,
  Equal,
} from 'lucide-react';

export const SearchView: React.FC = () => {
  const { activeOrgId, activeProjectId, projects, members } = useWorkspaceStore();
  const { searchQuery, setSearchQuery, openModal, showToast } = useUIStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const currentProjectId = activeProjectId || projects[0]?.id;

  const { data: rawIssues = [], isLoading, refetch, isFetching } = useQuery<Issue[]>({
    queryKey: ['searchRawIssues', activeOrgId, currentProjectId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const url = currentProjectId
        ? `/organizations/${activeOrgId}/projects/${currentProjectId}/issues?page=1&limit=100`
        : `/organizations/${activeOrgId}/issues`;
      const res = await request(url).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const issues = useMemo(() => {
    return rawIssues.filter((issue) => {
      // 1. Keyword search (title, summary, key, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const keyMatch = (issue.key || '').toLowerCase().includes(q);
        const titleMatch = (issue.title || (issue as any).summary || '').toLowerCase().includes(q);
        const descMatch = (issue.description || '').toLowerCase().includes(q);
        if (!keyMatch && !titleMatch && !descMatch) return false;
      }

      // 2. Status filter
      if (statusFilter) {
        const s = formatStatus(issue.status || (issue as any).state).toLowerCase();
        const filterLower = statusFilter.toLowerCase();
        if (filterLower.includes('progress') && !s.includes('progress') && !s.includes('doing')) return false;
        if (filterLower.includes('done') && !s.includes('done') && !s.includes('closed') && !s.includes('resolve')) return false;
        if (filterLower.includes('open') && !s.includes('todo') && !s.includes('open') && !s.includes('backlog')) return false;
        if (filterLower.includes('review') && !s.includes('review') && !s.includes('qa')) return false;
      }

      // 3. Priority filter
      if (priorityFilter) {
        const p = (issue.priority || '').toLowerCase();
        if (!p.includes(priorityFilter.toLowerCase())) return false;
      }

      // 4. Assignee filter
      if (assigneeFilter) {
        const aId = issue.assigneeId || issue.assignee?.id || (issue as any).assigneeMember?.id || (issue as any).assigneeMemberId;
        if (aId !== assigneeFilter) return false;
      }

      return true;
    });
  }, [rawIssues, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssigneeFilter('');
  };

  const hasActiveFilters = Boolean(searchQuery || statusFilter || priorityFilter || assigneeFilter);

  const exportCsv = () => {
    if (issues.length === 0) return;
    const headers = ['Key', 'Summary', 'Status', 'Priority', 'Type', 'Updated At'];
    const rows = issues.map((i) => [
      i.key,
      `"${(i.title || (i as any).summary || '').replace(/"/g, '""')}"`,
      i.status || (i as any).state || '',
      i.priority || '',
      i.type || (i as any).issueType || '',
      formatDate(i.updatedAt || i.createdAt),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `task-manager-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported issues to CSV!', 'success', 2000);
  };

  const renderIssueTypeIcon = (type?: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('bug')) return <span title="Bug" className="inline-flex items-center"><Bug className="w-3.5 h-3.5 text-rose-400 shrink-0" /></span>;
    if (lower.includes('story')) return <span title="Story" className="inline-flex items-center"><Bookmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" /></span>;
    if (lower.includes('epic')) return <span title="Epic" className="inline-flex items-center"><Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" /></span>;
    return <span title="Task" className="inline-flex items-center"><CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" /></span>;
  };

  const renderPriorityIcon = (priority?: string) => {
    const lower = (priority || '').toLowerCase();
    if (lower === 'highest') return <span title="Highest" className="inline-flex items-center"><ChevronsUp className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>;
    if (lower === 'high') return <span title="High" className="inline-flex items-center"><ChevronUp className="w-3.5 h-3.5 text-amber-400 shrink-0" /></span>;
    if (lower === 'low' || lower === 'lowest') return <span title="Low" className="inline-flex items-center"><ChevronDown className="w-3.5 h-3.5 text-blue-400 shrink-0" /></span>;
    return <span title="Medium" className="inline-flex items-center"><Equal className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-sm">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Search & Filter Explorer
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Full-text search, multi-criteria filtering, and export across organization issues.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportCsv}
              disabled={issues.length === 0}
            >
              Export CSV
            </Button>
            <button
              onClick={() => refetch()}
              className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-hover border border-border/80 transition-colors"
              title="Refresh search"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mr-1">
            Quick Filters:
          </span>
          <button
            onClick={() => {
              clearAllFilters();
            }}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              !hasActiveFilters
                ? 'bg-brand-600/20 text-brand-300 border-brand-500/40 font-semibold'
                : 'text-text-secondary hover:text-text-primary bg-surface-surface border-border'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setStatusFilter('In Progress')}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              statusFilter === 'In Progress'
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 font-semibold'
                : 'text-text-secondary hover:text-text-primary bg-surface-surface border-border'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('Done')}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              statusFilter === 'Done'
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'text-text-secondary hover:text-text-primary bg-surface-surface border-border'
            }`}
          >
            Done
          </button>
          <button
            onClick={() => setPriorityFilter('High')}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              priorityFilter === 'High'
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 font-semibold'
                : 'text-text-secondary hover:text-text-primary bg-surface-surface border-border'
            }`}
          >
            High Priority
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* Search Controls Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keyword in summary or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl pl-9 pr-8 py-2 border border-border/80 focus:border-brand-500 focus:outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Open">To Do / Open</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done / Resolved</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Assignees</option>
              {members.map((m) => {
                const name = m.fullName || m.user?.fullName || m.email || m.user?.email || 'Member';
                const email = m.email || m.user?.email;
                return (
                  <option key={m.id} value={m.id}>
                    {name}{email && email !== name ? ` (${email})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card backdrop-blur-sm">
        <div className="px-6 py-3.5 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">Search Results</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-surface-hover text-text-secondary border border-border">
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'} found
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-brand-600/20 text-brand-300' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Table view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-brand-600/20 text-brand-300' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-muted gap-2.5">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            <span className="text-sm">Searching across organization issues...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-20 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-surface-surface flex items-center justify-center mx-auto text-text-muted">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">No matching issues found</p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Try modifying your search keywords, clear priority/status filters, or create a new issue.
            </p>
            {hasActiveFilters && (
              <Button size="xs" variant="secondary" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="divide-y divide-border/50">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => openModal('issueDetail', issue)}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-hover/70 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4 flex-1">
                  {renderIssueTypeIcon(issue.type || (issue as any).issueType)}
                  <span className="font-mono text-xs font-bold text-brand-400 shrink-0">
                    {issue.key}
                  </span>
                  <span className="text-xs font-medium text-text-primary truncate group-hover:text-white transition-colors">
                    {issue.title || (issue as any).summary}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  {renderPriorityIcon(issue.priority)}

                  {/* Assignee Avatar & Name */}
                  {(() => {
                    const assignee =
                      issue.assignee ||
                      (issue as any).assigneeMember ||
                      members.find(
                        (m) =>
                          (m.orgMemberId || m.orgmemberid || m.id) ===
                          ((issue as any).assigneeMemberId || issue.assigneeId)
                      );
                    const name =
                      assignee?.fullName ||
                      assignee?.fullname ||
                      assignee?.user?.fullName ||
                      assignee?.email ||
                      assignee?.user?.email;

                    return assignee && name ? (
                      <div
                        className="hidden md:flex items-center gap-1.5 max-w-[130px]"
                        title={name}
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white/10 shrink-0">
                          {getInitials(name, assignee?.email || assignee?.user?.email)}
                        </div>
                        <span className="text-[11px] font-medium text-text-secondary truncate">
                          {name}
                        </span>
                      </div>
                    ) : (
                      <span className="hidden md:inline text-[10px] text-text-muted italic">
                        Unassigned
                      </span>
                    );
                  })()}

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

                  <span className="text-[11px] text-text-muted hidden sm:inline font-mono">
                    {formatDate(issue.updatedAt || issue.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => openModal('issueDetail', issue)}
                className="p-4 rounded-xl border border-white/5 bg-surface-surface/60 hover:bg-surface-hover/80 hover:border-brand-500/40 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {renderIssueTypeIcon(issue.type || (issue as any).issueType)}
                    <span className="font-mono text-xs font-bold text-brand-400">{issue.key}</span>
                  </div>
                  {renderPriorityIcon(issue.priority)}
                </div>

                <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-relaxed">
                  {issue.title || (issue as any).summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-text-muted">
                  <Badge variant="subtle" size="xs">
                    {formatStatus(issue.status || (issue as any).state || 'Open')}
                  </Badge>
                  {(() => {
                    const assignee =
                      issue.assignee ||
                      (issue as any).assigneeMember ||
                      members.find(
                        (m) =>
                          (m.orgMemberId || m.orgmemberid || m.id) ===
                          ((issue as any).assigneeMemberId || issue.assigneeId)
                      );
                    const name =
                      assignee?.fullName ||
                      assignee?.fullname ||
                      assignee?.user?.fullName ||
                      assignee?.email ||
                      assignee?.user?.email;

                    return assignee && name ? (
                      <div className="flex items-center gap-1 max-w-[110px]" title={name}>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[8px] shrink-0">
                          {getInitials(name, assignee?.email || assignee?.user?.email)}
                        </div>
                        <span className="text-[10px] text-text-secondary truncate">{name}</span>
                      </div>
                    ) : null;
                  })()}
                  <span className="font-mono">{formatDate(issue.updatedAt || issue.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
