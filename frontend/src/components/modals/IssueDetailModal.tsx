import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useAuthStore } from '../../stores/useAuthStore';
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
  CornerDownRight,
  GitFork,
  Link2,
  SlidersHorizontal,
} from 'lucide-react';

export const IssueDetailModal: React.FC = () => {
  const { modals, modalData, closeModal, showToast, openModal } = useUIStore();
  const { activeOrgId, members } = useWorkspaceStore();
  const { user } = useAuthStore();

  const currentMember = members.find((m) => m.userId === user?.id || (m as any).user?.id === user?.id);
  const myMemberId = currentMember?.id;

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
  const [linkTargetKeyOrId, setLinkTargetKeyOrId] = useState('');
  const [selectedLinkTypeId, setSelectedLinkTypeId] = useState('');
  const [isLinking, setIsLinking] = useState(false);

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

  // Project Members for this issue's project
  const { data: projectMembers = [] } = useQuery<any[]>({
    queryKey: ['issueProjectMembers', activeOrgId, issue?.projectId],
    queryFn: async () => {
      if (!activeOrgId || !issue?.projectId) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${issue.projectId}/members`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!issue?.projectId && isOpen,
  });

  const availableAssignees = projectMembers.length > 0 ? projectMembers : members;

  // Link Types
  const { data: linkTypes = [] } = useQuery<any[]>({
    queryKey: ['linkTypes', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/link-types`).catch(() => []);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && isOpen,
  });

  const handleUpdateCustomField = async (contextId: string, value: any) => {
    if (!activeOrgId || !issue) return;
    try {
      await request(`/organizations/${activeOrgId}/custom-fields/issues/${issue.id}/value`, {
        method: 'POST',
        body: JSON.stringify({
          contextId,
          customFieldContextId: contextId,
          value,
          valueJson: value,
        }),
      });
      setIssue((prev: any) => ({
        ...prev,
        customFields: (prev?.customFields || []).map((cf: any) =>
          cf.contextId === contextId ? { ...cf, value } : cf
        ),
      }));
      showToast('Custom field updated', 'success', 1200);
    } catch (err: any) {
      showToast(err.message || 'Failed to update custom field', 'error');
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !issue || !selectedLinkTypeId || !linkTargetKeyOrId.trim()) return;
    try {
      setIsLinking(true);
      await request(`/organizations/${activeOrgId}/issues/${issue.id}/links`, {
        method: 'POST',
        body: JSON.stringify({
          linkTypeId: selectedLinkTypeId,
          linkedIssueId: linkTargetKeyOrId.trim(),
        }),
      });
      showToast('Issue linked successfully', 'success', 1500);
      setLinkTargetKeyOrId('');
      await fetchIssue();
    } catch (err: any) {
      showToast(err.message || 'Failed to link issue (ensure valid target issue ID)', 'error');
    } finally {
      setIsLinking(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!activeOrgId || !issue) return;
    try {
      await request(`/organizations/${activeOrgId}/issues/${issue.id}/links/${linkId}`, {
        method: 'DELETE',
      });
      showToast('Link removed', 'info', 1200);
      await fetchIssue();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove link', 'error');
    }
  };

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
      await request(`/organizations/${activeOrgId}/issues/${issue.id}/work-logs`, {
        method: 'POST',
        body: JSON.stringify({
          timeSpentSeconds: mins * 60,
          timeSpentMinutes: mins,
          comment: worklogDesc.trim() || undefined,
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
              {/* Parent Issue Link */}
              {issue.parentIssue && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-surface-surface/50 border border-border/60 rounded-lg px-3 py-1.5 w-fit">
                  <CornerDownRight className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-text-muted">Parent:</span>
                  <button
                    type="button"
                    onClick={() => openModal('issueDetail', issue.parentIssue)}
                    className="font-mono text-brand-400 hover:underline font-bold"
                  >
                    {issue.parentIssue.key}
                  </button>
                  <span className="truncate max-w-[250px] text-text-muted">· {issue.parentIssue.summary}</span>
                </div>
              )}

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

              {/* Subtasks Section */}
              {issue.subtasks && issue.subtasks.length > 0 && (
                <div className="bg-surface-surface/60 border border-border/70 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-brand-400" />
                      Subtasks ({issue.subtasks.length})
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {issue.subtasks.map((sub: any) => (
                      <div
                        key={sub.id}
                        onClick={() => openModal('issueDetail', sub)}
                        className="py-2 px-2 hover:bg-surface-hover/60 rounded-lg cursor-pointer flex items-center justify-between gap-3 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-brand-400 shrink-0">{sub.key}</span>
                          <span className="truncate text-text-primary">{sub.summary}</span>
                        </div>
                        <Badge variant="todo" size="xs">{formatStatus(sub.state || sub.status || 'Open')}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issue Links Section */}
              <div className="bg-surface-surface/60 border border-border/70 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                    Issue Links ({(issue.links || []).length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(issue.links || []).map((l: any) => {
                    const relationLabel = l.isOutward ? (l.linkType?.outwardLabel || 'relates to') : (l.linkType?.inwardLabel || 'is related to');
                    return (
                      <div
                        key={l.id}
                        className="flex items-center justify-between py-1.5 px-2.5 bg-surface-surface/80 border border-border/60 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-text-muted italic">{relationLabel}</span>
                          {l.targetIssue ? (
                            <button
                              type="button"
                              onClick={() => openModal('issueDetail', l.targetIssue)}
                              className="font-mono font-bold text-brand-400 hover:underline"
                            >
                              {l.targetIssue.key}
                            </button>
                          ) : (
                            <span className="font-mono text-text-muted">{l.linkedIssueId?.slice(0, 8)}</span>
                          )}
                          <span className="truncate text-text-primary max-w-xs">{l.targetIssue?.summary}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(l.id)}
                          title="Remove link"
                          className="text-text-muted hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {(!issue.links || issue.links.length === 0) && (
                    <p className="text-xs text-text-muted italic">No linked issues.</p>
                  )}
                </div>
                {linkTypes.length > 0 && (
                  <form onSubmit={handleCreateLink} className="flex gap-2 pt-1">
                    <select
                      value={selectedLinkTypeId}
                      onChange={(e) => setSelectedLinkTypeId(e.target.value)}
                      className="bg-surface-surface text-text-primary text-xs rounded-lg px-2 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="">Relation...</option>
                      {linkTypes.map((lt: any) => (
                        <option key={lt.id} value={lt.id}>
                          {lt.outwardLabel || lt.name || lt.key}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Target issue ID or key..."
                      value={linkTargetKeyOrId}
                      onChange={(e) => setLinkTargetKeyOrId(e.target.value)}
                      className="flex-1 bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                    />
                    <Button type="submit" size="xs" variant="secondary" isLoading={isLinking} disabled={!selectedLinkTypeId || !linkTargetKeyOrId.trim()}>
                      Link
                    </Button>
                  </form>
                )}
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Assignee
                  </label>
                  {myMemberId && (
                    <button
                      type="button"
                      onClick={() => handleUpdateField({ assigneeMemberId: myMemberId })}
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
                    >
                      Assign to me
                    </button>
                  )}
                </div>

                {(() => {
                  const currentAssignee =
                    issue.assignee ||
                    issue.assigneeMember ||
                    availableAssignees.find(
                      (m: any) =>
                        (m.orgMemberId || m.orgmemberid || m.id) ===
                        (issue.assigneeMemberId || issue.assigneeId)
                    );
                  const currentAssigneeName =
                    currentAssignee?.fullName ||
                    currentAssignee?.fullname ||
                    currentAssignee?.user?.fullName ||
                    currentAssignee?.email ||
                    currentAssignee?.user?.email;

                  return currentAssignee ? (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-surface/80 border border-border/70 mb-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] shadow-sm shrink-0">
                        {getInitials(currentAssigneeName, currentAssignee?.email || currentAssignee?.user?.email)}
                      </div>
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {currentAssigneeName}
                      </span>
                    </div>
                  ) : null;
                })()}

                <select
                  value={issue.assigneeMemberId || issue.assigneeId || ''}
                  onChange={(e) => handleUpdateField({ assigneeMemberId: e.target.value || null })}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {availableAssignees.map((m: any) => {
                    const memId = m.orgMemberId || m.orgmemberid || m.id;
                    const name = m.fullName || m.fullname || m.user?.fullName || m.email || m.user?.email || 'Member';
                    const email = m.email || m.user?.email;
                    return (
                      <option key={memId} value={memId}>
                        {name}{email && email !== name ? ` (${email})` : ''}
                      </option>
                    );
                  })}
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

              {/* Dynamic Custom Fields */}
              {issue.customFields && issue.customFields.length > 0 && (
                <div className="pt-2 border-t border-border/80 space-y-2.5">
                  <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
                    Custom Fields
                  </span>
                  {issue.customFields.map((cf: any) => (
                    <div key={cf.contextId} className="space-y-1">
                      <label className="block text-[11px] font-medium text-text-secondary">
                        {cf.name} {cf.isRequired && <span className="text-rose-400">*</span>}
                      </label>
                      {cf.fieldType === 'select' ? (
                        <select
                          value={cf.value ?? ''}
                          onChange={(e) => handleUpdateCustomField(cf.contextId, e.target.value || null)}
                          className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                        >
                          <option value="">-- None --</option>
                          {(cf.options || []).map((opt: any) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={cf.fieldType === 'number' ? 'number' : cf.fieldType === 'date' ? 'date' : 'text'}
                          defaultValue={cf.value ?? ''}
                          onBlur={(e) => {
                            const val = cf.fieldType === 'number' ? (e.target.value ? Number(e.target.value) : null) : (e.target.value || null);
                            if (val !== cf.value) handleUpdateCustomField(cf.contextId, val);
                          }}
                          className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border/80 focus:border-brand-500 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
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
