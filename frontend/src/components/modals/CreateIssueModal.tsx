import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request, ApiError } from '../../lib/api-client';
import { queryClient } from '../../lib/query-client';

export const CreateIssueModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { activeOrgId, activeProjectId, projects, members } = useWorkspaceStore();

  const [projectId, setProjectId] = useState(activeProjectId);
  const [issueTypeKey, setIssueTypeKey] = useState('task');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeMemberId, setAssigneeMemberId] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = !!modals['createIssue'];

  const selectedProj = projectId || activeProjectId || projects[0]?.id;

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
            originalEstimateSeconds,
          }),
        }
      );

      showToast(`Created issue ${newIssue.key || 'successfully'}!`, 'success');
      // Invalidate queries so boards and backlog update immediately
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });

      setSummary('');
      setDescription('');
      setEstimateHours('');
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
      description="Capture work, set estimates, and assign team members."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Project *</label>
            <select
              value={selectedProj}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
            <label className="block text-xs font-medium text-text-secondary">Issue Type *</label>
            <select
              value={issueTypeKey}
              onChange={(e) => setIssueTypeKey(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            >
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>
        </div>

        <Input
          label="Summary *"
          placeholder="What needs to be done?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Provide context, acceptance criteria, steps to reproduce..."
            className="w-full bg-surface-surface text-text-primary placeholder:text-text-muted text-sm rounded-lg px-3.5 py-2.5 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Assignee</label>
            <select
              value={assigneeMemberId}
              onChange={(e) => setAssigneeMemberId(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
            <label className="block text-xs font-medium text-text-secondary">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>

          <Input
            label="Original Estimate (Hours)"
            type="number"
            step="0.5"
            placeholder="e.g. 4"
            value={estimateHours}
            onChange={(e) => setEstimateHours(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

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
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Create Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
};
