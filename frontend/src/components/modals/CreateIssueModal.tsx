import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request, ApiError } from '../../lib/api-client';
import { queryClient } from '../../lib/query-client';
import { Layers, Calendar, Box, SlidersHorizontal, GitFork, Sparkles } from 'lucide-react';

export const CreateIssueModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { activeOrgId, activeProjectId, projects, members } = useWorkspaceStore();
  const { user } = useAuthStore();

  const currentMember = members.find((m) => m.userId === user?.id || (m as any).user?.id === user?.id);
  const myMemberId = currentMember?.id;

  const [projectId, setProjectId] = useState(activeProjectId);
  const [issueTypeKey, setIssueTypeKey] = useState('task');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeMemberId, setAssigneeMemberId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [parentIssueId, setParentIssueId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [componentId, setComponentId] = useState('');
  const [fixVersionId, setFixVersionId] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
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

  // Query Candidate Parent Issues
  const { data: parentCandidates = [] } = useQuery<any[]>({
    queryKey: ['createIssueParentCandidates', activeOrgId, selectedProj],
    queryFn: async () => {
      if (!activeOrgId || !selectedProj) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${selectedProj}/issues?limit=50`).catch(() => []);
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId && !!selectedProj && isOpen,
  });

  // Query Project Members for Selected Project
  const { data: projectMembers = [] } = useQuery<any[]>({
    queryKey: ['createIssueProjectMembers', activeOrgId, selectedProj],
    queryFn: async () => {
      if (!activeOrgId || !selectedProj) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${selectedProj}/members`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!selectedProj && isOpen,
  });

  const availableAssignees = projectMembers.length > 0 ? projectMembers : members;

  // Query Custom Field Contexts configured for this project (FR-CONF-02)
  const { data: customFieldContexts = [] } = useQuery<any[]>({
    queryKey: ['createIssueCustomFields', activeOrgId, selectedProj],
    queryFn: async () => {
      if (!activeOrgId || !selectedProj) return [];
      const res = await request(`/organizations/${activeOrgId}/custom-fields/contexts/project/${selectedProj}`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId && !!selectedProj && isOpen,
  });

  const handleCustomFieldChange = (contextId: string, val: any) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [contextId]: val,
    }));
  };

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

    // Client-side validate mandatory custom fields
    for (const ctx of customFieldContexts) {
      if (ctx.isRequired) {
        const val = customFieldValues[ctx.id];
        if (val === undefined || val === null || val === '') {
          setError(`Custom field "${ctx.field?.name || ctx.id}" is mandatory.`);
          return;
        }
      }
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
            parentIssueId: parentIssueId || undefined,
            dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
            originalEstimateSeconds,
            componentId: componentId || undefined,
            fixVersionId: fixVersionId || undefined,
          }),
        }
      );

      // Save custom field values if provided
      for (const [contextId, val] of Object.entries(customFieldValues)) {
        if (val !== undefined && val !== null && val !== '') {
          await request(`/organizations/${activeOrgId}/custom-fields/issues/${newIssue.id}/value`, {
            method: 'POST',
            body: JSON.stringify({ contextId, value: val }),
          }).catch((err) => console.warn('Failed to set custom field value', err));
        }
      }

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
      setParentIssueId('');
      setDueAt('');
      setComponentId('');
      setFixVersionId('');
      setCustomFieldValues({});
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
                setParentIssueId('');
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-text-secondary">Assignee</label>
              {myMemberId && (
                <button
                  type="button"
                  onClick={() => setAssigneeMemberId(myMemberId)}
                  className="text-[10px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Assign to me
                </button>
              )}
            </div>
            <select
              value={assigneeMemberId}
              onChange={(e) => setAssigneeMemberId(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {availableAssignees.map((m: any) => {
                const memId = m.orgMemberId || m.id;
                const name = m.fullName || m.user?.fullName || m.email || m.user?.email || 'Member';
                const email = m.email || m.user?.email;
                return (
                  <option key={memId} value={memId}>
                    {name}{email && email !== name ? ` (${email})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
            >
              <option value="Highest">Highest (P0)</option>
              <option value="High">High (P1)</option>
              <option value="Medium">Medium (P2)</option>
              <option value="Low">Low (P3)</option>
              <option value="Lowest">Lowest (P4)</option>
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

        {/* Parent Issue Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-blue-400" />
            Parent Issue (Optional)
          </label>
          <select
            value={parentIssueId}
            onChange={(e) => setParentIssueId(e.target.value)}
            className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none"
          >
            <option value="">-- None (Standalone Issue) --</option>
            {parentCandidates.map((candidate: any) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.key}: {candidate.summary}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Fields Section (FR-CONF-02) */}
        {customFieldContexts.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-text-primary">Project Custom Fields</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customFieldContexts.map((ctx: any) => {
                const field = ctx.field;
                if (!field) return null;
                const isReq = ctx.isRequired;
                const val = customFieldValues[ctx.id] ?? '';

                if (field.fieldType === 'select') {
                  return (
                    <div key={ctx.id} className="space-y-1">
                      <label className="block text-[11px] font-medium text-text-secondary">
                        {field.name} {isReq && <span className="text-rose-400">*</span>}
                      </label>
                      <select
                        value={val}
                        onChange={(e) => handleCustomFieldChange(ctx.id, e.target.value)}
                        className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                        required={isReq}
                      >
                        <option value="">-- Select {field.name} --</option>
                        {(ctx.options || []).map((opt: any) => (
                          <option key={opt.id} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={ctx.id} className="space-y-1">
                    <label className="block text-[11px] font-medium text-text-secondary">
                      {field.name} {isReq && <span className="text-rose-400">*</span>}
                    </label>
                    <input
                      type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                      value={val}
                      placeholder={`Enter ${field.name}...`}
                      onChange={(e) => handleCustomFieldChange(ctx.id, e.target.value)}
                      className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                      required={isReq}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
