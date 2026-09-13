import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request } from '../../lib/api-client';

export const UserProfileModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { user, setUser } = useAuthStore();

  const isOpen = !!modals['userProfile'];

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const updated = await request('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      setUser(updated);
      showToast('Profile updated successfully!', 'success');
      closeModal('userProfile');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      setIsLoading(true);
      setError('');
      await request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('userProfile')}
      title="User Profile & Security"
      description="Manage your account identity and credentials."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Profile Details Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-3.5">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Identity
          </h4>
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            className="bg-surface-surface/40 text-text-muted cursor-not-allowed"
          />
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" variant="primary" isLoading={isLoading}>
              Save Profile
            </Button>
          </div>
        </form>

        <div className="h-px bg-border/80" />

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Security & Password
          </h4>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={!currentPassword || !newPassword || isLoading}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
