import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { request } from '../../lib/api-client';
import { queryClient } from '../../lib/query-client';
import { formatDate, formatDateTime, getInitials, formatStatus, formatIssueType } from '../../lib/utils';
import {
  MessageSquare,
  Clock,
  Send,
  Loader2,
  Trash2,
  Calendar,
  Layers,
  Box,
} from 'lucide-react';

export const IssueDetailModal: React.FC = () => {
  const { modals, modalData, closeModal, showToast } = useUIStore();
  const { activeOrgId, members } = useWorkspaceStore();

  const isOpen = !!modals['issueDetail'];
  const issueId = modalData['issueDetail']?.id || modalData['issueDetail'];

  const [issue, setIssue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'worklog'>('comments');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState('');
  const [worklogDesc, setWorklogDesc] = useState('');

  const fetchIssue = async () => {
    if (!activeOrgId || !issueId) return;
    try {
      setIsLoading(true);
      const data = await request(`/organizations/${activeOrgId}/issues/${issueId}`);
      setIssue(data);
      setSummary(data.summary || data.title || '');
      setDescription(data.description || '');
    } catch (err: any) {
      showToast(err.message || 'Failed to load issue details', 'error');
      closeModal('issueDetail');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssue();
    } else {
      setIssue(null);
    }
  }, [isOpen, issueId, activeOrgId]);

  // Sprints for this issue's project
  const { data: projectSprints = [] } = useQuery<any[]>({
    queryKey: ['issueProjectSprints', activeOrgId, issue?.projectId],
    queryFn: async () => {
      if (!activeOrgId || !issue?.projectId) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${issue.projectId}/sprints`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!issue?.projectId,
  });

  // Components for this issue's project
  const { data: projectComponents = [] } = useQuery<any[]>({
    queryKey: ['issueProjectComponents', activeOrgId, issue?.projectId],
    queryFn: async () => {
      if (!activeOrgId || !issue?.projectId) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${issue.projectId}/components`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!issue?.projectId,
  });

  const handleUpdateField = async (patch: Record<string, any>) => {
    if (!activeOrgId || !issue) return;
    try {
      const updated = await request(`/organizations/${activeOrgId}/issues/${issue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...patch, version: issue.version }),
      });
      setIssue((prev: any) => ({ ...prev, ...updated }));
      showToast('Issue updated', 'success', 1500);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
      queryClient.invalidateQueries({ queryKey: ['backlogData'] });
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleTransition = async (transitionKey: string) => {
    if (!activeOrgId || !issue || !transitionKey) return;
    try {
      await request(`/organizations/${activeOrgId}/issues/${issue.id}/transitions`, {
        method: 'POST',
        body: JSON.stringify({ transitionKey, version: issue.version }),
      });
      showToast('Status updated', 'success', 1500);
      await fetchIssue();
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
      queryClient.invalidateQueries({ queryKey: ['backlogData'] });
    } catch (err: any) {
      showToast(err.message || 'Transition failed', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !issue || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      await request(`/organizations/${activeOrgId}/issues/${issue.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: newComment.trim() }),
      });
      setNewComment('');
      showToast('Comment added', 'success', 1500);
      await fetchIssue();
    } catch (err: any) {
      showToast(err.message || 'Failed to add comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLogWork = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(timeSpentMinutes, 10);
    if (!activeOrgId || !issue || isNaN(mins) || mins <= 0) return;

    try {
      await request(`/organizations/${activeOrgId}/issues/${issue.id}/worklogs`, {
        method: 'POST',
        body: JSON.stringify({
          timeSpentMinutes: mins,
          description: worklogDesc.trim() || undefined,
          startedAt: new Date().toISOString(),
        }),
      });
      setTimeSpentMinutes('');
      setWorklogDesc('');
      showToast('Work logged successfully', 'success', 1500);
      await fetchIssue();
    } catch (err: any) {
      showToast(err.message || 'Failed to log work', 'error');
    }
  };

  const handleDeleteIssue = async () => {
    if (!activeOrgId || !issue) return;
    if (!window.confirm(`Are you sure you want to delete ${issue.key}?`)) return;

    try {
      await request(`/organizations/${activeOrgId}/issues/${issue.id}`, {
        method: 'DELETE',
      });
      showToast(`Deleted issue ${issue.key}`, 'info');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
      queryClient.invalidateQueries({ queryKey: ['backlogData'] });
      closeModal('issueDetail');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete issue', 'error');
    }
  };

  if (!isOpen) return null;

  const comments = Array.isArray(issue?.comments?.data)
    ? issue.comments.data
    : Array.isArray(issue?.comments)
    ? issue.comments
    : [];

  const worklogs = Array.isArray(issue?.workLogs?.data)
    ? issue.workLogs.data
    : Array.isArray(issue?.workLogs)
    ? issue.workLogs
    : [];

  const transitions = issue?.transitions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('issueDetail')}
      title={
        <div className="flex items-center gap-2.5">
          <Badge variant="todo" size="sm" className="font-semibold uppercase tracking-wider">
            {formatIssueType(issue?.issueType || issue?.type || 'Task')}
          </Badge>
          <span className="font-mono text-brand-400 font-bold">{issue?.key || 'Issue'}</span>
        </div>
      }
      description={
        issue
          ? `Project: ${typeof issue.project === 'object' ? issue.project?.name : (issue.project || 'Agile')} · Created ${formatDate(issue.createdAt)}`
          : ''
      }
      maxWidth="4xl"
    >
      <ErrorBoundary fallbackTitle="Error loading issue detail view" fallbackMessage="Could not render issue properties.">
        {isLoading && !issue ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-xs">Loading issue details...</span>
          </div>
        ) : issue ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Left Pane (2 cols) */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title / Summary */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  onBlur={() => {
                    if (summary.trim() && summary !== (issue.summary || issue.title)) {
                      handleUpdateField({ summary: summary.trim() });
                    }
                  }}
                  className="w-full bg-transparent hover:bg-surface-surface focus:bg-surface-surface border border-transparent focus:border-border text-lg font-bold text-white rounded-lg px-2 py-1 outline-none transition-all"
                  title="Click to edit summary"
                />
              </div>

              {/* Description */}
              <div className="bg-surface-surface/60 border border-border/70 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Description
                  </span>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => handleUpdateField({ description })}
                  >
                    Save Description
                  </Button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Add a detailed description..."
                  className="w-full bg-surface-card/70 border border-border/80 text-sm text-text-primary rounded-lg p-2.5 focus:border-brand-500 focus:outline-none resize-y"
                />
              </div>

              {/* Activity Tabs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4 border-b border-border/80 pb-2">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`text-xs font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                      activeTab === 'comments'
                        ? 'border-brand-500 text-brand-400'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('worklog')}
                    className={`text-xs font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                      activeTab === 'worklog'
                        ? 'border-brand-500 text-brand-400'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Work Logs ({worklogs.length})
                  </button>
                </div>

                {activeTab === 'comments' ? (
                  <div className="space-y-4">
                    {/* New Comment Input */}
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-surface-surface text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="primary"
                        isLoading={isSubmittingComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {comments.map((c: any) => (
                        <div
                          key={c.id}
                          className="bg-surface-surface/40 border border-border/60 rounded-lg p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-brand-600/40 text-[10px] font-bold flex items-center justify-center text-white">
                                {getInitials(c.author?.fullName || c.authorMember?.fullName, c.author?.email)}
                              </div>
                              <span className="font-semibold text-text-primary">
                                {c.author?.fullName || c.authorMember?.fullName || 'Member'}
                              </span>
                            </div>
                            <span className="text-[11px] text-text-muted">
                              {formatDateTime(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary whitespace-pre-wrap pl-7">
                            {c.body}
                          </p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-xs text-text-muted italic py-3 text-center">
                          No comments yet. Start the discussion!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Log Work Form */}
                    <form onSubmit={handleLogWork} className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Minutes (e.g. 60)"
                        value={timeSpentMinutes}
                        onChange={(e) => setTimeSpentMinutes(e.target.value)}
                        className="bg-surface-surface text-xs rounded-lg px-3 py-2 border border-border"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Work description..."
                        value={worklogDesc}
                        onChange={(e) => setWorklogDesc(e.target.value)}
                        className="bg-surface-surface text-xs rounded-lg px-3 py-2 border border-border"
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        Log Work
                      </Button>
                    </form>

                    {/* Worklog List */}
                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                      {worklogs.map((w: any) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-2.5 bg-surface-surface/40 border border-border/60 rounded-lg text-xs"
                        >
                          <div>
                            <span className="font-bold text-emerald-400">
                              {w.timeSpentMinutes || Math.round((w.timeSpentSeconds || 0) / 60)}m
                            </span>
                            <span className="text-text-muted ml-2">{w.description || 'Logged time'}</span>
                          </div>
                          <span className="text-[11px] text-text-muted">
                            {formatDateTime(w.startedAt || w.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Attributes, Sprints, Estimates & Status (1 col) */}
            <div className="space-y-4 border-l border-border/80 pl-0 lg:pl-6">
              {/* Status Transition Control */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Badge variant="progress" size="md">
                    {formatStatus(issue.state || issue.status || 'Open')}
                  </Badge>
                  {transitions.map((t: any) => (
                    <button
                      key={t.key || t.id}
                      onClick={() => handleTransition(t.key)}
                      className="text-[11px] font-medium px-2 py-1 rounded bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 border border-brand-500/30 transition-colors"
                    >
                      → {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sprint Allocation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  Sprint
                </label>
                <select
                  value={issue.sprintId || ''}
                  onChange={(e) => handleUpdateField({ sprintId: e.target.value || null })}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Backlog (No Sprint)</option>
                  {projectSprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.state?.toUpperCase() || 'PLANNED'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Assignee
                </label>
                <select
                  value={issue.assigneeMemberId || issue.assigneeId || ''}
                  onChange={(e) => handleUpdateField({ assigneeMemberId: e.target.value || null })}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.fullName || m.user?.email || m.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Priority
                </label>
                <select
                  value={issue.priority || 'Medium'}
                  onChange={(e) => handleUpdateField({ priority: e.target.value })}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                >
                  <option value="Highest">Highest</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Lowest">Lowest</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={issue.dueAt ? issue.dueAt.slice(0, 10) : ''}
                  onChange={(e) =>
                    handleUpdateField({ dueAt: e.target.value ? new Date(e.target.value).toISOString() : null })
                  }
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Original Estimate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Original Estimate (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 4"
                  value={issue.originalEstimateSeconds ? issue.originalEstimateSeconds / 3600 : ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleUpdateField({
                      originalEstimateSeconds: !isNaN(val) && val > 0 ? Math.round(val * 3600) : null,
                    });
                  }}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Component (if any) */}
              {projectComponents.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-purple-400" />
                    Component
                  </label>
                  <select
                    value={issue.componentId || ''}
                    onChange={(e) => handleUpdateField({ componentId: e.target.value || null })}
                    className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    {projectComponents.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Metadata info */}
              <div className="pt-3 border-t border-border/80 space-y-2 text-xs text-text-muted">
                <div className="flex items-center justify-between">
                  <span>Created:</span>
                  <span className="text-text-secondary">{formatDate(issue.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Updated:</span>
                  <span className="text-text-secondary">{formatDate(issue.updatedAt)}</span>
                </div>
              </div>

              {/* Danger Zone: Delete */}
              <div className="pt-4">
                <Button
                  variant="danger"
                  size="xs"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={handleDeleteIssue}
                  className="w-full"
                >
                  Delete Issue
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </ErrorBoundary>
    </Modal>
  );
};
