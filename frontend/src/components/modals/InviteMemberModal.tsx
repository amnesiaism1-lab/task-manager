import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch real org roles
  const { data: roles = [] } = useQuery<any[]>({
    queryKey: ['orgRoles', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/roles`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId && isOpen,
  });

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const defaultRole = roles.find((r: any) => r.key === 'member') || roles[0];
      if (defaultRole) {
        setSelectedRoleId(defaultRole.id);
      }
    }
  }, [roles, selectedRoleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !email.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      const payload: Record<string, any> = {
        email: email.trim(),
      };
      if (selectedRoleId) {
        payload.roleId = selectedRoleId;
      }
      const res = await request(`/organizations/${activeOrgId}/invitations`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const token = res?.token || res?.invitationToken;
      showToast(`Invitation sent to ${email.trim()}`, 'success');
      if (token) {
        setGeneratedToken(token);
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
      description="Invite colleagues to collaborate in your organization with specific roles."
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
          <label className="block text-xs font-medium text-text-secondary">Organization Role</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
          >
            {roles.length > 0 ? (
              roles.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.key})
                </option>
              ))
            ) : (
              <>
                <option value="member">Member</option>
                <option value="org-admin">Organization Administrator</option>
              </>
            )}
          </select>
        </div>

        {generatedToken && (
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-brand-300">Invitation Token Code:</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(generatedToken);
                  showToast('Invitation token copied to clipboard!', 'info', 1500);
                }}
                className="text-[10px] font-medium text-brand-300 hover:text-brand-200 underline"
              >
                Copy Code
              </button>
            </div>
            <p className="font-mono text-xs text-brand-200 select-all break-all bg-black/20 p-2 rounded">{generatedToken}</p>
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
