import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Layers,
  Plus,
  Play,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const BacklogView: React.FC = () => {
  const { activeOrgId, activeProjectId, projects } = useWorkspaceStore();
  const { openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createSprintModalOpen, setCreateSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);

  // 1. Fetch Sprints
  const { data: sprints = [], isLoading: isLoadingSprints } = useQuery<any[]>({
    queryKey: ['sprints', activeOrgId, activeProjectId],
    queryFn: async () => {
      if (!activeOrgId || !activeProjectId) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${activeProjectId}/sprints`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!activeProjectId,
  });

  // 2. Fetch Backlog items
  const { data: backlogIssues = [], isLoading: isLoadingBacklog } = useQuery<any[]>({
    queryKey: ['backlog', activeOrgId, activeProjectId],
    queryFn: async () => {
      if (!activeOrgId || !activeProjectId) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${activeProjectId}/backlog`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!activeProjectId,
  });

  // 3. Sprint Actions
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim()) return;
    try {
      setIsCreatingSprint(true);
      await request(`/organizations/${activeOrgId}/projects/${activeProjectId}/sprints`, {
        method: 'POST',
        body: JSON.stringify({
          name: sprintName.trim(),
          goal: sprintGoal.trim() || undefined,
        }),
      });
      showToast('Sprint created successfully!', 'success');
      setSprintName('');
      setSprintGoal('');
      setCreateSprintModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create sprint', 'error');
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await request(
        `/organizations/${activeOrgId}/projects/${activeProjectId}/sprints/${sprintId}/start`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      showToast('Sprint started!', 'success');
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to start sprint', 'error');
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!window.confirm('Complete this sprint? Unfinished items will return to the backlog.')) return;
    try {
      await request(
        `/organizations/${activeOrgId}/projects/${activeProjectId}/sprints/${sprintId}/close`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      showToast('Sprint completed!', 'success');
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to complete sprint', 'error');
    }
  };

  const handleMoveToSprint = async (issueId: string, sprintId: string | null, version: number) => {
    try {
      await request(`/organizations/${activeOrgId}/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ sprintId: sprintId || null, version }),
      });
      showToast(sprintId ? 'Moved to sprint' : 'Moved to backlog', 'success', 1500);
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to move issue', 'error');
    }
  };

  const currentProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Backlog & Sprints
            </h1>
            <p className="text-xs text-text-secondary">
              Plan iterations, prioritize stories, and allocate tasks for {currentProject?.name} ({currentProject?.key}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateSprintModalOpen(true)}
          >
            Create Sprint
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => openModal('createIssue')}
          >
            Create Issue
          </Button>
        </div>
      </div>

      {/* Sprints Section */}
      <div className="space-y-4">
        {isLoadingSprints ? (
          <div className="flex items-center justify-center py-12 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading sprints...</span>
          </div>
        ) : (
          sprints.map((sprint) => {
            const sprintIssues = sprint.issues || [];
            const isActive = sprint.state === 'active';
            const isPlanned = sprint.state === 'planned';

            return (
              <div
                key={sprint.id}
                className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Sprint Header */}
                <div className="p-4 border-b border-border/70 flex items-center justify-between bg-surface-elevated/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {sprint.name}
                    </span>
                    <Badge
                      variant={isActive ? 'progress' : isPlanned ? 'todo' : 'done'}
                      size="xs"
                    >
                      {sprint.state?.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      ({sprintIssues.length} issues)
                    </span>
                    {sprint.goal && (
                      <span className="text-xs text-text-secondary italic hidden md:inline">
                        — Goal: {sprint.goal}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPlanned && (
                      <Button
                        size="xs"
                        variant="primary"
                        leftIcon={<Play className="w-3 h-3" />}
                        onClick={() => handleStartSprint(sprint.id)}
                      >
                        Start Sprint
                      </Button>
                    )}
                    {isActive && (
                      <Button
                        size="xs"
                        variant="secondary"
                        leftIcon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        onClick={() => handleCompleteSprint(sprint.id)}
                      >
                        Complete Sprint
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sprint Issues List */}
                <div className="divide-y divide-border/60">
                  {sprintIssues.map((issue: any) => (
                    <div
                      key={issue.id}
                      className="px-5 py-3 hover:bg-surface-hover/60 flex items-center justify-between gap-4 transition-colors group"
                    >
                      <div
                        onClick={() => openModal('issueDetail', issue)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <span className="font-mono text-xs font-bold text-brand-400">
                          {issue.key}
                        </span>
                        <span className="text-xs font-medium text-text-primary truncate group-hover:text-brand-300">
                          {issue.title || issue.summary}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="todo" size="xs">
                          {issue.status || issue.state || 'To Do'}
                        </Badge>
                        <button
                          onClick={() => handleMoveToSprint(issue.id, null, issue.version)}
                          title="Move back to Backlog"
                          className="text-xs text-text-muted hover:text-text-primary px-2 py-0.5 rounded bg-surface-surface hover:bg-surface-hover border border-border"
                        >
                          Send to Backlog
                        </button>
                      </div>
                    </div>
                  ))}
                  {sprintIssues.length === 0 && (
                    <div className="py-6 text-center text-xs text-text-muted italic">
                      Plan this sprint by dragging or sending issues from the backlog below.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backlog Section */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/70 flex items-center justify-between bg-surface-elevated/40">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-white tracking-tight">Backlog</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-hover text-text-secondary border border-border">
              {backlogIssues.length} issues
            </span>
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {isLoadingBacklog ? (
            <div className="flex items-center justify-center py-12 text-text-muted gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Loading backlog...</span>
            </div>
          ) : backlogIssues.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted italic">
              Your backlog is completely empty! Click "Create Issue" to add tasks.
            </div>
          ) : (
            backlogIssues.map((issue: any) => (
              <div
                key={issue.id}
                className="px-5 py-3 hover:bg-surface-hover/60 flex items-center justify-between gap-4 transition-colors group"
              >
                <div
                  onClick={() => openModal('issueDetail', issue)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <span className="font-mono text-xs font-bold text-brand-400">
                    {issue.key}
                  </span>
                  <span className="text-xs font-medium text-text-primary truncate group-hover:text-brand-300">
                    {issue.title || issue.summary}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="todo" size="xs">
                    {issue.status || issue.state || 'To Do'}
                  </Badge>

                  {/* Dropdown to assign to a sprint */}
                  {sprints.filter((s) => s.state !== 'closed').length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMoveToSprint(issue.id, e.target.value, issue.version);
                        }
                      }}
                      defaultValue=""
                      className="bg-surface-surface text-text-muted hover:text-text-primary text-xs rounded px-2 py-1 border border-border outline-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Move to Sprint...
                      </option>
                      {sprints
                        .filter((s) => s.state !== 'closed')
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.state})
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={createSprintModalOpen}
        onClose={() => setCreateSprintModalOpen(false)}
        title="Create Sprint"
        description="Define an iteration period for your team."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <Input
            label="Sprint Name *"
            placeholder="e.g. Sprint 1 - Core MVP"
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Sprint Goal"
            placeholder="e.g. Complete User Registration & Board drag-drop"
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateSprintModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreatingSprint}>
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
