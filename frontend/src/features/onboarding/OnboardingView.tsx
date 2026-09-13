import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { Building2, KeyRound, LogOut, Sparkles } from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { openModal } = useUIStore();

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
            You are currently not a member of any organization. You can create a new workspace for your team or join an existing one using an invitation code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
