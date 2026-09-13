import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Issue } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  BarChart3,
  Plus,
  TrendingUp,
  PieChart,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { activeOrgId, activeProjectId } = useWorkspaceStore();
  const { showToast } = useUIStore();
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

  // Calculate metrics
  const totalIssues = issues.length;
  const todoIssues = issues.filter(
    (i) =>
      (i.status || '').toLowerCase().includes('todo') ||
      (i.status || '').toLowerCase().includes('open')
  );
  const inProgressIssues = issues.filter(
    (i) =>
      (i.status || '').toLowerCase().includes('progress') ||
      (i.status || '').toLowerCase().includes('review')
  );
  const doneIssues = issues.filter((i) => (i.status || '').toLowerCase().includes('done'));

  const todoPct = totalIssues ? Math.round((todoIssues.length / totalIssues) * 100) : 0;
  const inProgPct = totalIssues ? Math.round((inProgressIssues.length / totalIssues) * 100) : 0;
  const donePct = totalIssues ? Math.round((doneIssues.length / totalIssues) * 100) : 0;

  // Priority counts
  const highPriority = issues.filter(
    (i) =>
      (i.priority || '').toLowerCase() === 'high' || (i.priority || '').toLowerCase() === 'highest'
  ).length;
  const medPriority = issues.filter((i) => (i.priority || '').toLowerCase() === 'medium').length;
  const lowPriority = issues.filter(
    (i) =>
      (i.priority || '').toLowerCase() === 'low' || (i.priority || '').toLowerCase() === 'lowest'
  ).length;

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDashName.trim()) return;

    try {
      setIsCreating(true);
      const res = await request(`/organizations/${activeOrgId}/dashboards`, {
        method: 'POST',
        body: JSON.stringify({
          name: newDashName.trim(),
          description: newDashDesc.trim() || undefined,
        }),
      });
      showToast('Dashboard created!', 'success');
      setNewDashName('');
      setNewDashDesc('');
      setCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      if (res?.id) setSelectedDashId(res.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to create dashboard', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {activeDashboard?.name || 'Agile Metrics & Analytics'}
              </h1>
            </div>
            <p className="text-xs text-text-secondary">
              {activeDashboard?.description || 'Team workload, velocity, and completion trends.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {dashboards.length > 1 && (
            <select
              value={activeDashboard?.id}
              onChange={(e) => setSelectedDashId(e.target.value)}
              className="bg-surface-surface text-xs rounded-lg px-3 py-2 border border-border outline-none cursor-pointer"
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
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
          >
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-text-muted">Total Workload</span>
          <div className="text-3xl font-extrabold text-white">{totalIssues}</div>
          <p className="text-[11px] text-text-muted">Active issues tracked</p>
        </div>

        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">To Do</span>
          <div className="text-3xl font-extrabold text-slate-300">{todoIssues.length}</div>
          <p className="text-[11px] text-text-muted">{todoPct}% of total volume</p>
        </div>

        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-blue-400">In Progress</span>
          <div className="text-3xl font-extrabold text-blue-400">{inProgressIssues.length}</div>
          <p className="text-[11px] text-text-muted">{inProgPct}% being executed</p>
        </div>

        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-emerald-400">Completed</span>
          <div className="text-3xl font-extrabold text-emerald-400">{doneIssues.length}</div>
          <p className="text-[11px] text-text-muted">{donePct}% resolution rate</p>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Progress Bar */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Status Breakdown
            </h3>
            <span className="text-xs text-text-muted">{totalIssues} items</span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="w-full h-4 bg-surface-surface rounded-full overflow-hidden flex border border-border/60">
            <div
              style={{ width: `${todoPct}%` }}
              className="bg-slate-600 transition-all duration-500"
              title={`To Do: ${todoPct}%`}
            />
            <div
              style={{ width: `${inProgPct}%` }}
              className="bg-blue-500 transition-all duration-500"
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
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Priority Distribution
            </h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400 font-medium">High & Critical</span>
                <span className="text-text-muted">{highPriority}</span>
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
                <span className="text-text-muted">{medPriority}</span>
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
                <span className="text-text-muted">{lowPriority}</span>
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

      {/* Create Dashboard Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Dashboard"
        description="Add a customizable reporting board for your workspace."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateDashboard} className="space-y-4">
          <Input
            label="Dashboard Name *"
            placeholder="e.g. Executive Overview"
            value={newDashName}
            onChange={(e) => setNewDashName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Description"
            placeholder="e.g. Velocity and burnup metrics"
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
