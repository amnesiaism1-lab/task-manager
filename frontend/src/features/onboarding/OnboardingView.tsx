import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Button } from '../../components/ui/Button';
import { request } from '../../lib/api-client';
import { Building2, KeyRound, LogOut, Sparkles, MailCheck, Check, X, Loader2 } from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { openModal, showToast } = useUIStore();
  const { setActiveOrgId } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending invitations for current user
  const { data: invitations = [], isLoading: isLoadingInvites } = useQuery<any[]>({
    queryKey: ['myPendingInvitations'],
    queryFn: async () => {
      const res = await request('/organizations/invitations/me').catch(() => []);
      return Array.isArray(res) ? res : [];
    },
  });

  const handleAccept = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      const res = await request('/organizations/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ invitationId }),
      });
      showToast('Successfully accepted invitation and joined workspace!', 'success');
      const joinedOrgId = res?.organization?.id || res?.member?.orgId;
      if (joinedOrgId) {
        setActiveOrgId(joinedOrgId);
      }
      queryClient.invalidateQueries({ queryKey: ['myPendingInvitations'] });
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept invitation', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      await request('/organizations/invitations/decline', {
        method: 'POST',
        body: JSON.stringify({ invitationId }),
      });
      showToast('Invitation declined', 'info');
      queryClient.invalidateQueries({ queryKey: ['myPendingInvitations'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to decline invitation', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-lg bg-surface-card border border-border/80 rounded-2xl p-8 shadow-modal backdrop-blur-xl relative z-10 text-center space-y-6 animate-slide-up">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-glow">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to Task Manager, {user?.fullName || 'there'}!
          </h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            You are currently not a member of any organization. You can accept an invitation sent to your email, create a new workspace, or join using an invitation code.
          </p>
        </div>

        {/* Pending Invitations Section */}
        {invitations.length > 0 && (
          <div className="space-y-2.5 text-left pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
              <MailCheck className="w-4 h-4" />
              <span>Pending Invitations for You ({invitations.length})</span>
            </div>
            <div className="space-y-2">
              {invitations.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {inv.orgName || 'Workspace'}
                      <span className="ml-1.5 text-[10px] font-mono text-brand-300 uppercase">
                        [{inv.orgKey}]
                      </span>
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Invited by {inv.inviterName || 'Administrator'} · Role: {inv.roleName || 'Member'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleAccept(inv.id)}
                      disabled={processingId === inv.id}
                      isLoading={processingId === inv.id}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Accept
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDecline(inv.id)}
                      disabled={processingId === inv.id}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingInvites && (
          <div className="flex items-center justify-center py-2 text-text-muted gap-2 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Checking for invitations...</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div
            onClick={() => openModal('createOrg')}
            className="p-5 rounded-xl bg-surface-surface/60 border border-border/80 hover:border-brand-500/60 hover:bg-surface-surface cursor-pointer group transition-all text-left space-y-2 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">Create Organization</h4>
            <p className="text-[11px] text-text-muted leading-snug">
              Set up a brand new company workspace and invite your teammates.
            </p>
          </div>

          <div
            onClick={() => openModal('joinOrg')}
            className="p-5 rounded-xl bg-surface-surface/60 border border-border/80 hover:border-emerald-500/60 hover:bg-surface-surface cursor-pointer group transition-all text-left space-y-2 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">Join Organization</h4>
            <p className="text-[11px] text-text-muted leading-snug">
              Enter an invitation code or token sent by your organization administrator.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center justify-center">
          <button
            onClick={logout}
            className="text-xs text-text-muted hover:text-rose-400 flex items-center gap-1.5 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
