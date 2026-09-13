import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';
import {
  Cpu,
  Play,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity,
  Terminal,
} from 'lucide-react';

export const JobsView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('ALL');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const { data: jobs = [], isLoading, refetch, isFetching } = useQuery<any[]>({
    queryKey: ['jobs', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/jobs`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const processingCount = jobs.filter((j) => j.status === 'processing' || j.status === 'pending').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  const filteredJobs = jobs.filter((job) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PROCESSING') return job.status === 'processing' || job.status === 'pending';
    if (filterStatus === 'COMPLETED') return job.status === 'completed';
    if (filterStatus === 'FAILED') return job.status === 'failed';
    return true;
  });

  const handleTriggerReconciliation = async () => {
    try {
      await request(`/organizations/${activeOrgId}/jobs`, {
        method: 'POST',
        body: JSON.stringify({
          jobType: 'reconciliation',
          payload: { scope: 'full_integrity_check', triggeredBy: 'admin_dashboard' },
        }),
      });
      showToast('Integrity reconciliation task queued!', 'success');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger job', 'error');
    }
  };

  const handleCancelJob = async (id: string) => {
    try {
      await request(`/organizations/${activeOrgId}/jobs/${id}/cancel`, { method: 'POST' });
      showToast('Job execution cancelled', 'info');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel job', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Background Tasks & Outbox Worker
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Worker Pool
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Monitor asynchronous job queues, transactional outbox relays, and reconciliation cycles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            title="Refresh job queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Play className="w-3.5 h-3.5" />}
            onClick={handleTriggerReconciliation}
          >
            Run Reconciliation
          </Button>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-card/80 border border-border/70 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-muted font-medium">Total Enqueued</span>
            <div className="text-xl font-bold text-white">{jobs.length}</div>
          </div>
          <div className="p-2 rounded-lg bg-surface-surface text-text-muted">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card/80 border border-cyan-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-cyan-400 font-medium">Processing / Pending</span>
            <div className="text-xl font-bold text-cyan-300">{processingCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card/80 border border-emerald-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-medium">Completed</span>
            <div className="text-xl font-bold text-emerald-300">{completedCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card/80 border border-rose-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-rose-400 font-medium">Failed / Stalled</span>
            <div className="text-xl font-bold text-rose-300">{failedCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        {(['ALL', 'PROCESSING', 'COMPLETED', 'FAILED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === status
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs font-semibold text-text-muted">
          <span>Worker Queue ({filteredJobs.length})</span>
          <span>Status & Execution Controls</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-xs">Connecting to outbox worker queue...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-surface border border-border/80 flex items-center justify-center mx-auto text-text-muted">
              <Cpu className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">No background tasks found</p>
            <p className="text-xs text-text-muted">Queue is currently idle. Background jobs will appear here when scheduled.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredJobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              const isRunning = job.status === 'processing' || job.status === 'pending';
              return (
                <div key={job.id} className="p-5 hover:bg-surface-hover/50 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-white uppercase bg-surface-surface px-2 py-0.5 rounded border border-border/80">
                          {job.jobType || job.type || 'TASK'}
                        </span>
                        <Badge
                          variant={
                            job.status === 'completed'
                              ? 'done'
                              : isRunning
                              ? 'progress'
                              : job.status === 'failed'
                              ? 'danger'
                              : 'todo'
                          }
                          size="xs"
                        >
                          {isRunning ? (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              PROCESSING
                            </span>
                          ) : (
                            job.status?.toUpperCase() || 'QUEUED'
                          )}
                        </Badge>
                        <span className="text-[11px] text-text-muted">
                          Attempts: <strong className="text-text-secondary">{job.attempts || 1}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted">
                        Queued at: <span className="font-mono text-text-secondary">{formatDateTime(job.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-surface transition-colors text-xs flex items-center gap-1"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Payload</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isRunning && (
                        <Button
                          size="xs"
                          variant="danger"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleCancelJob(job.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Payload & Diagnostic Inspector */}
                  {isExpanded && (
                    <div className="p-3 bg-surface-base/80 border border-border/80 rounded-xl font-mono text-xs text-text-secondary overflow-x-auto space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>Job ID: {job.id}</span>
                        <span>Scope: {job.payload?.scope || 'default'}</span>
                      </div>
                      <pre className="text-cyan-300/90 text-[11px]">
                        {JSON.stringify(job.payload || { status: 'idle', queued: true }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
