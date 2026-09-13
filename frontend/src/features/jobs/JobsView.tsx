import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';
import { Cpu, Play, RefreshCw, XCircle, Loader2 } from 'lucide-react';

export const JobsView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, refetch, isFetching } = useQuery<any[]>({
    queryKey: ['jobs', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/jobs`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const handleTriggerReconciliation = async () => {
    try {
      await request(`/organizations/${activeOrgId}/jobs`, {
        method: 'POST',
        body: JSON.stringify({
          jobType: 'reconciliation',
          payload: { scope: 'full_integrity_check' },
        }),
      });
      showToast('Integrity reconciliation job scheduled!', 'success');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger job', 'error');
    }
  };

  const handleCancelJob = async (id: string) => {
    try {
      await request(`/organizations/${activeOrgId}/jobs/${id}/cancel`, { method: 'POST' });
      showToast('Job cancelled', 'info');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel job', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Background Tasks & Outbox Worker
            </h1>
            <p className="text-xs text-text-secondary">
              Monitor asynchronous jobs, reconciliation tasks, and data synchronization queues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            title="Refresh queue"
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

      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 text-xs font-semibold text-text-muted">
          Active & Recent Jobs ({jobs.length})
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading queue status...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-text-secondary">No background jobs</p>
            <p className="text-xs text-text-muted">Queue is currently idle.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-hover/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary uppercase font-mono">
                      {job.jobType || job.type || 'TASK'}
                    </span>
                    <Badge
                      variant={
                        job.status === 'completed'
                          ? 'done'
                          : job.status === 'processing'
                          ? 'progress'
                          : job.status === 'failed'
                          ? 'danger'
                          : 'todo'
                      }
                      size="xs"
                    >
                      {job.status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Created: {formatDateTime(job.createdAt)} · Attempts: {job.attempts || 1}
                  </p>
                </div>

                {job.status === 'processing' || job.status === 'pending' ? (
                  <Button
                    size="xs"
                    variant="danger"
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleCancelJob(job.id)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
