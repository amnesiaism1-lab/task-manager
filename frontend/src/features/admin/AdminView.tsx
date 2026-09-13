import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatDate, getInitials } from '../../lib/utils';
import {
  Sliders,
  Users,
  Building,
  Shield,
  UserPlus,
  Plus,
  Loader2,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { activeAdminTab, setAdminTab, openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createDeptModalOpen, setCreateDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');

  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');

  // 1. Fetch Organization Admin Data
  const { data: adminData, isLoading } = useQuery<any>({
    queryKey: ['adminData', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return null;
      const [organization, members, roles, departments, groups] = await Promise.all([
        request(`/organizations/${activeOrgId}`).catch(() => null),
        request(`/organizations/${activeOrgId}/members`).catch(() => []),
        request(`/organizations/${activeOrgId}/roles`).catch(() => []),
        request(`/organizations/${activeOrgId}/departments`).catch(() => []),
        request(`/organizations/${activeOrgId}/groups`).catch(() => []),
      ]);
      return {
        organization,
        members: Array.isArray(members) ? members : [],
        roles: Array.isArray(roles) ? roles : [],
        departments: Array.isArray(departments) ? departments : [],
        groups: Array.isArray(groups) ? groups : [],
      };
    },
    enabled: !!activeOrgId,
  });

  const organization = adminData?.organization;
  const members = adminData?.members || [];
  const roles = adminData?.roles || [];
  const departments = adminData?.departments || [];
  const groups = adminData?.groups || [];

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      await request(`/organizations/${activeOrgId}/departments`, {
        method: 'POST',
        body: JSON.stringify({ name: deptName.trim() }),
      });
      showToast('Department created!', 'success');
      setDeptName('');
      setCreateDeptModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create department', 'error');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    try {
      await request(`/organizations/${activeOrgId}/groups`, {
        method: 'POST',
        body: JSON.stringify({ name: groupName.trim() }),
      });
      showToast('Group created!', 'success');
      setGroupName('');
      setCreateGroupModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create group', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/20 text-slate-300 flex items-center justify-center border border-slate-700/40 shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Administration & Settings
            </h1>
            <p className="text-xs text-text-secondary">
              Manage organization membership, roles, departments, and project boundaries.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => openModal('inviteMember')}
        >
          Invite Member
        </Button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('org')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'org'
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Organization Profile
        </button>

        <button
          onClick={() => setAdminTab('members')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'members'
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Members ({members.length})
        </button>

        <button
          onClick={() => setAdminTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'roles'
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Custom Roles ({roles.length})
        </button>

        <button
          onClick={() => setAdminTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'departments'
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Departments ({departments.length})
        </button>

        <button
          onClick={() => setAdminTab('groups')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'groups'
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          User Groups ({groups.length})
        </button>
      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-text-muted gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs">Loading admin details...</span>
        </div>
      ) : activeAdminTab === 'org' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Workspace Boundary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Organization Name</span>
              <p className="text-text-primary font-semibold text-sm">
                {organization?.name || 'Workspace'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Organization Key</span>
              <p className="font-mono text-brand-400 font-semibold text-sm">
                {organization?.key || 'ORG'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Organization ID</span>
              <p className="font-mono text-text-secondary text-[11px] select-all">
                {organization?.id}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted font-medium">Created On</span>
              <p className="text-text-secondary">{formatDate(organization?.createdAt)}</p>
            </div>
          </div>
        </div>
      ) : activeAdminTab === 'members' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
            <span>Registered Team Members</span>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openModal('inviteMember')}
            >
              Add Member
            </Button>
          </div>
          <div className="divide-y divide-border/60">
            {members.map((member: any) => (
              <div
                key={member.id}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-surface-hover/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center font-bold text-white text-xs">
                    {getInitials(member.user?.fullName, member.user?.email)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      {member.user?.fullName || 'Collaborator'}
                    </p>
                    <p className="text-[11px] text-text-muted">{member.user?.email}</p>
                  </div>
                </div>
                <Badge variant="progress" size="xs">
                  {member.role?.toUpperCase() || 'MEMBER'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ) : activeAdminTab === 'departments' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
            <span>Departments</span>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCreateDeptModalOpen(true)}
            >
              New Department
            </Button>
          </div>
          <div className="divide-y divide-border/60">
            {departments.map((dept: any) => (
              <div key={dept.id} className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{dept.name}</span>
                <span className="text-[11px] text-text-muted">{formatDate(dept.createdAt)}</span>
              </div>
            ))}
            {departments.length === 0 && (
              <div className="py-8 text-center text-xs text-text-muted italic">
                No departments defined.
              </div>
            )}
          </div>
        </div>
      ) : activeAdminTab === 'groups' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
            <span>User Groups</span>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCreateGroupModalOpen(true)}
            >
              New Group
            </Button>
          </div>
          <div className="divide-y divide-border/60">
            {groups.map((group: any) => (
              <div key={group.id} className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{group.name}</span>
                <span className="text-[11px] text-text-muted">{formatDate(group.createdAt)}</span>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="py-8 text-center text-xs text-text-muted italic">
                No user groups defined.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 text-xs font-semibold text-text-muted">
            Custom Organization Roles ({roles.length})
          </div>
          <div className="divide-y divide-border/60">
            {roles.map((role: any) => (
              <div key={role.id} className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{role.name || role.key}</span>
                <Badge variant="todo" size="xs">
                  {role.key}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      <Modal
        isOpen={createDeptModalOpen}
        onClose={() => setCreateDeptModalOpen(false)}
        title="Create Department"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <Input
            label="Department Name *"
            placeholder="e.g. Engineering, Product, QA"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateDeptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Group Modal */}
      <Modal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        title="Create User Group"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name *"
            placeholder="e.g. Developers, Leads"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateGroupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
