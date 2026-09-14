import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { getInitials, formatStatus } from '../../lib/utils';
import {
  Layers,
  Plus,
  Play,
  CheckCircle2,
  Loader2,
  Bug,
  Bookmark,
  CheckSquare,
  Zap,
  ChevronUp,
  ChevronsUp,
  ChevronDown,
  Equal,
  ChevronRight,
} from 'lucide-react';

export const BacklogView: React.FC = () => {
  const { activeOrgId, activeProjectId, projects } = useWorkspaceStore();
  const { openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createSprintModalOpen, setCreateSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});

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
      showToast('Sprint started successfully!', 'success');
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
      showToast('Sprint completed! Unfinished items moved to backlog.', 'success');
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

  const toggleSprintCollapse = (id: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentProject = projects.find((p) => p.id === activeProjectId);

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

  const calculateTotalPoints = (issues: any[]) => {
    return issues.reduce((acc, cur) => acc + (Number(cur.storyPoints) || 0), 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600/20 to-indigo-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Backlog & Sprint Planning
              </h1>
              {currentProject && (
                <Badge variant="subtle" size="xs" className="font-mono">
                  {currentProject.key}
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Plan iterations, estimate story points, and prioritize issues for {currentProject?.name}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateSprintModalOpen(true)}
            className="shadow-sm"
          >
            Create Sprint
          </Button>
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
      </div>

      {/* Sprints Section */}
      <div className="space-y-4">
        {isLoadingSprints ? (
          <div className="flex items-center justify-center py-12 text-text-muted gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-xs font-medium">Loading sprints...</span>
          </div>
        ) : sprints.length === 0 ? (
          <div className="bg-surface-card border border-white/5 rounded-2xl p-8 text-center space-y-2">
            <p className="text-xs text-text-secondary">No sprints created yet for this project.</p>
            <Button size="xs" variant="primary" onClick={() => setCreateSprintModalOpen(true)}>
              Create First Sprint
            </Button>
          </div>
        ) : (
          sprints.map((sprint) => {
            const sprintIssues = sprint.issues || [];
            const isActive = sprint.state === 'active';
            const isPlanned = sprint.state === 'planned';
            const isCollapsed = Boolean(collapsedSprints[sprint.id]);
            const totalPoints = calculateTotalPoints(sprintIssues);

            return (
              <div
                key={sprint.id}
                className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card backdrop-blur-sm transition-all"
              >
                {/* Sprint Header */}
                <div className="p-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/40">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => toggleSprintCollapse(sprint.id)}
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-text-muted transition-transform ${
                        !isCollapsed ? 'rotate-90' : ''
                      }`}
                    />
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {sprint.name}
                      </span>
                      <Badge
                        variant={isActive ? 'progress' : isPlanned ? 'todo' : 'done'}
                        size="xs"
                        className="uppercase font-mono tracking-wider font-semibold"
                      >
                        {sprint.state}
                      </Badge>
                      <span className="text-xs text-text-muted font-mono">
                        ({sprintIssues.length} issues · {totalPoints} pts)
                      </span>
                    </div>

                    {sprint.goal && (
                      <span className="text-xs text-text-secondary italic hidden md:inline ml-2">
                        — Goal: {sprint.goal}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isPlanned && (
                      <Button
                        size="xs"
                        variant="primary"
                        leftIcon={<Play className="w-3 h-3" />}
                        onClick={() => handleStartSprint(sprint.id)}
                        className="shadow-glow font-semibold"
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
                        className="font-semibold text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        Complete Sprint
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sprint Issues List */}
                {!isCollapsed && (
                  <div className="divide-y divide-border/50">
                    {sprintIssues.map((issue: any) => (
                      <div
                        key={issue.id}
                        className="px-5 py-3 hover:bg-surface-hover/70 flex items-center justify-between gap-4 transition-colors group cursor-pointer"
                        onClick={() => openModal('issueDetail', issue)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {renderIssueTypeIcon(issue.issueType || issue.type)}
                          <span className="font-mono text-xs font-bold text-brand-400 shrink-0">
                            {issue.key}
                          </span>
                          <span className="text-xs font-medium text-text-primary truncate group-hover:text-white transition-colors">
                            {issue.title || issue.summary}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {renderPriorityIcon(issue.priority)}

                          {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                            <span className="px-2 py-0.5 rounded-full bg-surface-surface border border-white/5 text-[10px] font-mono font-semibold text-text-secondary">
                              {issue.storyPoints} pts
                            </span>
                          )}

                          <Badge variant="todo" size="xs">
                            {formatStatus(issue.status || issue.state || 'To Do')}
                          </Badge>

                          {/* Assignee avatar */}
                          {issue.assignee || issue.assigneeMember ? (
                            <div
                              className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] ring-1 ring-white/10"
                              title={issue.assignee?.fullName || issue.assigneeMember?.fullName}
                            >
                              {getInitials(
                                issue.assignee?.fullName || issue.assigneeMember?.fullName,
                                issue.assignee?.email
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-muted italic">Unassigned</span>
                          )}

                          <button
                            onClick={() => handleMoveToSprint(issue.id, null, issue.version)}
                            title="Move back to Backlog"
                            className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1 rounded-lg bg-surface-surface hover:bg-surface-hover border border-border/80 transition-colors"
                          >
                            Backlog
                          </button>
                        </div>
                      </div>
                    ))}

                    {sprintIssues.length === 0 && (
                      <div className="py-8 text-center text-xs text-text-muted italic flex flex-col items-center gap-1">
                        <span>Sprint is currently empty.</span>
                        <span className="text-[10px] text-text-muted/70">
                          Move issues from the backlog section below to allocate tasks for this sprint.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Backlog Section */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card backdrop-blur-sm">
        <div className="p-4 border-b border-border/70 flex items-center justify-between bg-surface-elevated/40">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white tracking-tight">Product Backlog</span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-surface-hover text-text-secondary border border-border">
              {backlogIssues.length} issues · {calculateTotalPoints(backlogIssues)} pts
            </span>
          </div>

          <Button
            size="xs"
            variant="ghost"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openModal('createIssue')}
          >
            Create Issue
          </Button>
        </div>

        <div className="divide-y divide-border/50">
          {isLoadingBacklog ? (
            <div className="flex items-center justify-center py-12 text-text-muted gap-2.5">
              <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
              <span className="text-xs">Loading backlog issues...</span>
            </div>
          ) : backlogIssues.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted italic space-y-1">
              <p>Your backlog is completely empty!</p>
              <p className="text-[10px] text-text-muted/60">Click "Create Issue" above to add work items.</p>
            </div>
          ) : (
            backlogIssues.map((issue: any) => (
              <div
                key={issue.id}
                className="px-5 py-3 hover:bg-surface-hover/70 flex items-center justify-between gap-4 transition-colors group cursor-pointer"
                onClick={() => openModal('issueDetail', issue)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {renderIssueTypeIcon(issue.issueType || issue.type)}
                  <span className="font-mono text-xs font-bold text-brand-400 shrink-0">
                    {issue.key}
                  </span>
                  <span className="text-xs font-medium text-text-primary truncate group-hover:text-white transition-colors">
                    {issue.title || issue.summary}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {renderPriorityIcon(issue.priority)}

                  {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-surface border border-white/5 text-[10px] font-mono font-semibold text-text-secondary">
                      {issue.storyPoints} pts
                    </span>
                  )}

                  <Badge variant="todo" size="xs">
                    {formatStatus(issue.status || issue.state || 'To Do')}
                  </Badge>

                  {/* Assignee avatar */}
                  {issue.assignee || issue.assigneeMember ? (
                    <div
                      className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] ring-1 ring-white/10"
                      title={issue.assignee?.fullName || issue.assigneeMember?.fullName}
                    >
                      {getInitials(
                        issue.assignee?.fullName || issue.assigneeMember?.fullName,
                        issue.assignee?.email
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-text-muted italic">Unassigned</span>
                  )}

                  {/* Dropdown to assign to a sprint */}
                  {sprints.filter((s) => s.state !== 'closed').length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMoveToSprint(issue.id, e.target.value, issue.version);
                        }
                      }}
                      defaultValue=""
                      className="bg-surface-surface text-text-muted hover:text-text-primary text-xs rounded-lg px-2.5 py-1 border border-border/80 outline-none cursor-pointer hover:border-brand-500/40 transition-colors"
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
