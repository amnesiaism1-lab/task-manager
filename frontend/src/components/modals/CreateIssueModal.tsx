import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request, ApiError } from '../../lib/api-client';
import { queryClient } from '../../lib/query-client';
import { Layers, Calendar, Box, SlidersHorizontal } from 'lucide-react';

export const CreateIssueModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { activeOrgId, activeProjectId, projects, members } = useWorkspaceStore();

  const [projectId, setProjectId] = useState(activeProjectId);
  const [issueTypeKey, setIssueTypeKey] = useState('task');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeMemberId, setAssigneeMemberId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [componentId, setComponentId] = useState('');
  const [fixVersionId, setFixVersionId] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = !!modals['createIssue'];
  const selectedProj = projectId || activeProjectId || projects[0]?.id;

  // Query Sprints for Selected Project
  const { data: projectSprints = [] } = useQuery<any[]>({
    queryKey: ['createIssueSprints', activeOrgId, selectedProj],
    queryFn: async () => {
      if (!activeOrgId || !selectedProj) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${selectedProj}/sprints`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!selectedProj && isOpen,
  });

  // Query Components for Selected Project
  const { data: projectComponents = [] } = useQuery<any[]>({
    queryKey: ['createIssueComponents', activeOrgId, selectedProj],
    queryFn: async () => {
      if (!activeOrgId || !selectedProj) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${selectedProj}/components`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!selectedProj && isOpen,
  });

  // Query Fix Versions for Selected Project
  const { data: projectVersions = [] } = useQuery<any[]>({
    queryKey: ['createIssueVersions', activeOrgId, selectedProj],
    queryFn: async () => {
      if (!activeOrgId || !selectedProj) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${selectedProj}/versions`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!selectedProj && isOpen,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !selectedProj) {
      setError('Please select a project first.');
      return;
    }
    if (!summary.trim()) {
      setError('Issue summary is required.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const hours = parseFloat(estimateHours);
      const originalEstimateSeconds = !isNaN(hours) && hours > 0 ? Math.round(hours * 3600) : undefined;

      const newIssue = await request(
        `/organizations/${activeOrgId}/projects/${selectedProj}/issues`,
        {
          method: 'POST',
          body: JSON.stringify({
            issueTypeKey,
            summary: summary.trim(),
            description: description.trim() || undefined,
            priority,
            assigneeMemberId: assigneeMemberId || undefined,
            sprintId: sprintId || undefined,
            dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
            originalEstimateSeconds,
            componentId: componentId || undefined,
            fixVersionId: fixVersionId || undefined,
          }),
        }
      );

      showToast(`Created issue ${newIssue.key || 'successfully'}!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
      queryClient.invalidateQueries({ queryKey: ['backlogData'] });
      queryClient.invalidateQueries({ queryKey: ['searchRawIssues'] });

      // Reset form
      setSummary('');
      setDescription('');
      setEstimateHours('');
      setSprintId('');
      setDueAt('');
      setComponentId('');
      setFixVersionId('');
      closeModal('createIssue');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create issue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('createIssue')}
      title="Create Issue"
      description="Capture work, allocate sprints, set estimates, and assign team members."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project & Issue Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Project *</label>
            <select
              value={selectedProj}
              onChange={(e) => {
                setProjectId(e.target.value);
                setSprintId('');
                setComponentId('');
                setFixVersionId('');
              }}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none shadow-sm"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} · {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Issue Type *</label>
            <select
              value={issueTypeKey}
              onChange={(e) => setIssueTypeKey(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none shadow-sm"
              required
            >
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <Input
          label="Summary *"
          placeholder="What needs to be done?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          autoFocus
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide context, acceptance criteria, steps to reproduce..."
            className="w-full bg-surface-surface text-text-primary placeholder:text-text-muted text-xs rounded-xl px-3.5 py-2.5 border border-border/80 focus:border-brand-500 focus:outline-none resize-y shadow-inner"
          />
        </div>

        {/* Core Attributes: Assignee, Priority, Sprint */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Assignee</label>
            <select
              value={assigneeMemberId}
              onChange={(e) => setAssigneeMemberId(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName || m.user?.email || m.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              Sprint
            </label>
            <select
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Backlog (No Sprint)</option>
              {projectSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.state?.toUpperCase() || 'PLANNED'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Advanced Fields */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showAdvanced ? 'Hide Additional Fields' : 'Show More Planning Options (Due Date, Estimate, Components)'}
          </button>
        </div>

        {/* Advanced Options Grid */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60 animate-fade-in">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Due Date
              </label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Original Estimate */}
            <Input
              label="Estimate (Hours)"
              type="number"
              step="0.5"
              placeholder="e.g. 4"
              value={estimateHours}
              onChange={(e) => setEstimateHours(e.target.value)}
            />

            {/* Component */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-purple-400" />
                Component
              </label>
              <select
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
              >
                <option value="">None</option>
                {projectComponents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fix Version (if project has versions) */}
            {projectVersions.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Fix Version
                </label>
                <select
                  value={fixVersionId}
                  onChange={(e) => setFixVersionId(e.target.value)}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">None</option>
                  {projectVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => closeModal('createIssue')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} className="font-semibold shadow-glow">
            Create Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
};
