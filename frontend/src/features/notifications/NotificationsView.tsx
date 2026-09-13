import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { request } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';
import { Bell, Check, Loader2 } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
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
    },
  });

  const unreadList = notifications.filter((n) => !n.readAt && !n.read);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Notification Center</h1>
              {unreadList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                  {unreadList.length} New
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Stay updated on status changes, assignments, mentions, and system events.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 text-xs font-semibold text-text-muted">
          All Notifications ({notifications.length})
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bell className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-sm font-semibold text-text-secondary">No notifications</p>
            <p className="text-xs text-text-muted">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {notifications.map((notif) => {
              const isUnread = !notif.readAt && !notif.read;
              return (
                <div
                  key={notif.id}
                  className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                    isUnread ? 'bg-brand-500/5' : 'hover:bg-surface-hover/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {notif.title || notif.subject || 'Task Notification'}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{notif.body || notif.message}</p>
                    <span className="text-[11px] text-text-muted">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>

                  {isUnread && (
                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => markReadMutation.mutate(notif.id)}
                    >
                      Mark read
                    </Button>
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
