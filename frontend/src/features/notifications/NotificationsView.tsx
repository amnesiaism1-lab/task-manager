import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  PlusCircle,
  ArrowRightLeft,
  FileEdit,
  MessageSquare,
  Clock,
  Play,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { openModal } = useUIStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'issues' | 'sprints'>('all');

  const {
    data: notifications = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<any[]>({
    queryKey: ['notifications', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/notifications`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await request(`/organizations/${activeOrgId}/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await request(`/organizations/${activeOrgId}/notifications/read-all`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await request(`/organizations/${activeOrgId}/notifications/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
    },
  });

  const unreadList = useMemo(() => notifications.filter((n) => !n.readAt && !n.read), [notifications]);
  const issueList = useMemo(
    () =>
      notifications.filter(
        (n) =>
          (n.notificationType || '').startsWith('issue.') ||
          (n.notificationType || '').startsWith('comment.') ||
          (n.notificationType || '').startsWith('worklog.')
      ),
    [notifications]
  );
  const sprintList = useMemo(
    () => notifications.filter((n) => (n.notificationType || '').startsWith('sprint.')),
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return unreadList;
      case 'issues':
        return issueList;
      case 'sprints':
        return sprintList;
      default:
        return notifications;
    }
  }, [activeTab, notifications, unreadList, issueList, sprintList]);

  const renderTypeIcon = (type?: string) => {
    switch (type) {
      case 'issue.created':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <PlusCircle className="w-4 h-4" />
          </div>
        );
      case 'issue.transitioned':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
        );
      case 'issue.updated':
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <FileEdit className="w-4 h-4" />
          </div>
        );
      case 'comment.created':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'worklog.created':
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'sprint.started':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4" />
          </div>
        );
      case 'sprint.closed':
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleOpenTarget = (notif: any) => {
    const issueId = notif.dataJson?.issueId || notif.dataJson?.issue_id;
    if (issueId) {
      openModal('issueDetail', { issueId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30 shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight">Notification Center</h1>
              {unreadList.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white shadow-sm">
                  {unreadList.length} Unread
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-surface text-text-muted border border-border">
                  All Caught Up
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Real-time audit alerts for issue transitions, assignments, sprint milestones, and team activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-brand-400' : ''}`} />}
            onClick={() => refetch()}
            title="Refresh notifications"
          >
            Refresh
          </Button>
          {unreadList.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-400" />}
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        {/* Tab Navigation */}
        <div className="px-5 border-b border-border/80 bg-surface-elevated/40 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface border border-border/70 text-text-muted">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Unread</span>
            {unreadList.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500 text-white font-bold">
                {unreadList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Issues & Comments</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface border border-border/70 text-text-muted">
              {issueList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sprints')}
            className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sprints'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Sprints</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface border border-border/70 text-text-muted">
              {sprintList.length}
            </span>
          </button>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-muted gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-surface-surface border border-border flex items-center justify-center mx-auto text-text-muted">
              {activeTab === 'unread' ? <Sparkles className="w-6 h-6 text-brand-400" /> : <Bell className="w-6 h-6" />}
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications in this category'}
            </p>
            <p className="text-xs text-text-muted">
              {activeTab === 'unread' ? "You've reviewed all recent alerts." : 'Activity will show up here automatically.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.readAt && !notif.read;
              const issueKey = notif.dataJson?.issueKey || notif.dataJson?.issue_key;

              return (
                <div
                  key={notif.id}
                  className={`px-6 py-4.5 flex items-start justify-between gap-4 transition-colors group ${
                    isUnread
                      ? 'bg-brand-500/5 hover:bg-brand-500/10'
                      : 'hover:bg-surface-hover/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {renderTypeIcon(notif.notificationType)}

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-text-primary">
                          {notif.title || 'System Notification'}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block shadow-sm animate-pulse" />
                        )}
                        {issueKey && (
                          <button
                            type="button"
                            onClick={() => handleOpenTarget(notif)}
                            className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-surface border border-border/80 text-brand-300 hover:text-white hover:border-brand-500/40 transition-colors"
                          >
                            {issueKey}
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed break-words">
                        {notif.body}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] text-text-muted">
                          {formatDateTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    {isUnread && (
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                        onClick={() => markReadMutation.mutate(notif.id)}
                        title="Mark as read"
                      >
                        Mark read
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(notif.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
