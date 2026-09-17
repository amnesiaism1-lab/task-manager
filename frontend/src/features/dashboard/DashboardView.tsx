import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Issue } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatStatus, toSafeString } from '../../lib/utils';
import {
  BarChart3,
  Plus,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Building,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { activeOrgId, activeProjectId, projects } = useWorkspaceStore();
  const { showToast, openModal } = useUIStore();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [newDashDesc, setNewDashDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch Dashboards
  const { data: dashboards = [] } = useQuery<any[]>({
    queryKey: ['dashboards', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/dashboards`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const [selectedDashId, setSelectedDashId] = useState('');
  const activeDashboard = dashboards.find((d) => d.id === selectedDashId) || dashboards[0];

  // 2. Fetch Issues for stats
  const { data: issues = [] } = useQuery<Issue[]>({
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

  // 3. Fetch Departments
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['departments', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/departments`);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId,
  });

  // Calculate metrics
  const totalIssues = issues.length;
  const todoIssues = issues.filter((i) => {
    const s = formatStatus(i.status).toLowerCase();
    return s.includes('todo') || s.includes('open');
  });
  const inProgressIssues = issues.filter((i) => {
    const s = formatStatus(i.status).toLowerCase();
    return s.includes('progress') || s.includes('review');
  });
  const doneIssues = issues.filter((i) => {
    const s = formatStatus(i.status).toLowerCase();
    return s.includes('done') || s.includes('closed');
  });

  const todoPct = totalIssues ? Math.round((todoIssues.length / totalIssues) * 100) : 0;
  const inProgPct = totalIssues ? Math.round((inProgressIssues.length / totalIssues) * 100) : 0;
  const donePct = totalIssues ? Math.round((doneIssues.length / totalIssues) * 100) : 0;

  // Priority counts
  const highPriority = issues.filter(
    (i) =>
      toSafeString(i.priority).toLowerCase() === 'high' || toSafeString(i.priority).toLowerCase() === 'highest'
  ).length;
  const medPriority = issues.filter((i) => toSafeString(i.priority).toLowerCase() === 'medium').length;
  const lowPriority = issues.filter(
    (i) =>
      toSafeString(i.priority).toLowerCase() === 'low' || toSafeString(i.priority).toLowerCase() === 'lowest'
  ).length;

  const totalPoints = issues.reduce((acc, cur) => acc + (Number((cur as any).storyPoints) || 0), 0);

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDashName.trim()) return;

    try {
      setIsCreating(true);
      await request(`/organizations/${activeOrgId}/dashboards`, {
        method: 'POST',
        body: JSON.stringify({
          name: newDashName.trim(),
          description: newDashDesc.trim() || undefined,
        }),
      });
      showToast('Dashboard created successfully!', 'success');
      setNewDashName('');
      setNewDashDesc('');
      setCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create dashboard', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const currentProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {activeDashboard?.name || 'Agile Velocity & Health Dashboard'}
              </h1>
              {currentProject && (
                <Badge variant="subtle" size="xs" className="font-mono">
                  {currentProject.key}
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Live delivery metrics, sprint velocity progress, and quality indicators.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {dashboards.length > 1 && (
            <select
              value={activeDashboard?.id}
              onChange={(e) => setSelectedDashId(e.target.value)}
              className="bg-surface-surface text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 outline-none cursor-pointer"
            >
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
            className="shadow-glow font-semibold"
          >
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Bento Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Workload */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-brand-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Total Issues</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">{totalIssues}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1">
            <span className="font-mono font-semibold text-brand-400">{totalPoints}</span>
            <span>story points tracked</span>
          </div>
        </div>

        {/* Card 2: To Do */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-slate-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Backlog & To Do</span>
            <div className="p-2 rounded-xl bg-slate-500/10 text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-200 mt-2 tracking-tight">{todoIssues.length}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1">
            <span className="font-mono font-semibold text-slate-300">{todoPct}%</span>
            <span>of total backlog</span>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-blue-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400">In Progress</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-400 mt-2 tracking-tight">{inProgressIssues.length}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1">
            <span className="font-mono font-semibold text-blue-300">{inProgPct}%</span>
            <span>currently executing</span>
          </div>
        </div>

        {/* Card 4: Done */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-emerald-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Completed & Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 tracking-tight">{doneIssues.length}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1">
            <span className="font-mono font-semibold text-emerald-300">{donePct}%</span>
            <span>completion rate</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Progress Bar */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Status Allocation Pipeline
            </h3>
            <span className="text-xs text-text-muted font-mono">{totalIssues} items</span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="w-full h-3.5 bg-surface-surface rounded-full overflow-hidden flex border border-white/5 shadow-inner">
            <div
              style={{ width: `${todoPct}%` }}
              className="bg-slate-600 transition-all duration-500"
              title={`To Do: ${todoPct}%`}
            />
            <div
              style={{ width: `${inProgPct}%` }}
              className="bg-blue-500 transition-all duration-500 shadow-glow"
              title={`In Progress: ${inProgPct}%`}
            />
            <div
              style={{ width: `${donePct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Done: ${donePct}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-text-muted">To Do ({todoPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-text-muted">In Progress ({inProgPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-text-muted">Done ({donePct}%)</span>
            </div>
          </div>
        </div>

        {/* Priority Heat Distribution */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Priority Severity Distribution
            </h3>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400 font-medium">Highest & High</span>
                <span className="text-text-muted font-mono">{highPriority} issues</span>
              </div>
              <div className="w-full h-2 bg-surface-surface rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalIssues ? (highPriority / totalIssues) * 100 : 0}%` }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium">Medium</span>
                <span className="text-text-muted font-mono">{medPriority} issues</span>
              </div>
              <div className="w-full h-2 bg-surface-surface rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalIssues ? (medPriority / totalIssues) * 100 : 0}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400 font-medium">Low & Lowest</span>
                <span className="text-text-muted font-mono">{lowPriority} issues</span>
              </div>
              <div className="w-full h-2 bg-surface-surface rounded-full overflow-hidden">
                <div
                  style={{ width: `${totalIssues ? (lowPriority / totalIssues) * 100 : 0}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Delivery & Operational Units */}
      {departments.length > 0 && (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Organizational Department Units & Delivery Scope
                </h3>
                <p className="text-xs text-text-secondary">
                  Cross-functional department alignment and lead supervision.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {departments.length} units configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {departments.map((dept: any) => (
              <div
                key={dept.id}
                className="p-4 rounded-xl bg-surface-surface/60 border border-border/70 hover:border-brand-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-400" />
                    {dept.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-brand-300 border border-brand-500/20">
                    {dept.memberCount || 0} members
                  </span>
                </div>

                <p className="text-[11px] text-text-muted line-clamp-2">
                  {dept.description || 'Enterprise department unit managing project delivery.'}
                </p>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Department Lead</span>
                  <span className="text-text-primary font-medium truncate max-w-[140px]">
                    {dept.leadMember?.fullName || 'Unassigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Issues Feed */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card backdrop-blur-md">
        <div className="px-6 py-4 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Recent Project Issues</h3>
          </div>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => openModal('createIssue')}
          >
            Create Issue
          </Button>
        </div>

        <div className="divide-y divide-border/50">
          {issues.slice(0, 5).map((issue) => (
            <div
              key={issue.id}
              onClick={() => openModal('issueDetail', issue)}
              className="px-6 py-3.5 hover:bg-surface-hover/70 cursor-pointer flex items-center justify-between gap-4 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-brand-400">{issue.key}</span>
                <span className="text-xs font-medium text-text-primary truncate group-hover:text-white transition-colors">
                  {issue.title || (issue as any).summary}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="subtle" size="xs">
                  {formatStatus(issue.status || (issue as any).state || 'Open')}
                </Badge>
                <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
                  {formatDate(issue.updatedAt || issue.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {issues.length === 0 && (
            <div className="py-10 text-center text-xs text-text-muted italic">
              No issues recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Create Dashboard Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Dashboard"
        description="Add a customized analytics view for your organization."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateDashboard} className="space-y-4">
          <Input
            label="Dashboard Name *"
            placeholder="e.g. Sprint Velocity & Bug Triage"
            value={newDashName}
            onChange={(e) => setNewDashName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Description"
            placeholder="e.g. Cross-project tracking for Q3 releases"
            value={newDashDesc}
            onChange={(e) => setNewDashDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
              Create Dashboard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
