import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request } from '../../lib/api-client';

export const JoinOrgModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { setActiveOrgId } = useWorkspaceStore();

  const isOpen = !!modals['joinOrg'];
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const pending = sessionStorage.getItem('pending_invitation_token');
      if (pending) {
        setToken(pending);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      const res = await request('/organizations/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token: token.trim() }),
      });

      showToast('Successfully joined organization!', 'success');
      const joinedOrgId = res?.organization?.id || res?.member?.orgId;
      if (joinedOrgId) {
        setActiveOrgId(joinedOrgId);
      }
      setToken('');
      closeModal('joinOrg');
      try {
        const bootData = await request(`/workspace/bootstrap${joinedOrgId ? `?orgId=${joinedOrgId}` : ''}`);
        if (bootData) {
          useWorkspaceStore.getState().applyBootstrap(bootData);
        } else {
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to redeem invitation code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('joinOrg')}
      title="Join Organization"
      description="Redeem an invitation code to access a workspace."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Invitation Code / Token"
          placeholder="Paste invitation token..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => closeModal('joinOrg')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Join Organization
          </Button>
        </div>
      </form>
    </Modal>
  );
};
