import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request } from '../../lib/api-client';

export const InviteMemberModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { activeOrgId } = useWorkspaceStore();

  const isOpen = !!modals['inviteMember'];

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [generatedToken, setGeneratedToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !email.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      const res = await request(`/organizations/${activeOrgId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), role }),
      });

      showToast(`Invitation sent to ${email.trim()}`, 'success');
      if (res?.token) {
        setGeneratedToken(res.token);
      } else {
        closeModal('inviteMember');
      }
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('inviteMember')}
      title="Invite Team Member"
      description="Invite colleagues to collaborate in your organization."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Collaborator Email"
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {generatedToken && (
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg space-y-1">
            <span className="text-[11px] font-semibold text-brand-300">Invitation Token Code:</span>
            <p className="font-mono text-xs text-brand-200 select-all break-all">{generatedToken}</p>
          </div>
        )}

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => closeModal('inviteMember')}
          >
            Close
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
