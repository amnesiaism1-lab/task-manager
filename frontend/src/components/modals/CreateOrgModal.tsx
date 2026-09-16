import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request, ApiError } from '../../lib/api-client';

export const CreateOrgModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { organizations, setOrganizations, setActiveOrgId } = useWorkspaceStore();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = !!modals['createOrg'];

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key === name.slice(0, 4).toUpperCase()) {
      const generated = val.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
      setKey(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization name is required.');
      return;
    }
    if (!key.trim()) {
      setError('Organization key is required.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const newOrg = await request('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), key: key.trim().toUpperCase() }),
      });

      setActiveOrgId(newOrg.id);
      setOrganizations([...organizations, newOrg]);
      try {
        const bootData = await request(`/workspace/bootstrap?orgId=${newOrg.id}`);
        if (bootData) {
          useWorkspaceStore.getState().applyBootstrap(bootData);
        }
      } catch {
        // Continue with optimistic state
      }
      showToast('Organization created successfully!', 'success');
      setName('');
      setKey('');
      closeModal('createOrg');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create organization.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('createOrg')}
      title="Create New Organization"
      description="Create a multi-tenant workspace for your company or team."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Organization Name"
          placeholder="e.g. Acme Corporation"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
          required
        />
        <Input
          label="Organization Key"
          placeholder="e.g. ACME"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          maxLength={10}
          required
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => closeModal('createOrg')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Create Organization
          </Button>
        </div>
      </form>
    </Modal>
  );
};
