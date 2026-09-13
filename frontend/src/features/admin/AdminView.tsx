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
  Search,
  CheckCircle2,
  KeyRound,
  Fingerprint,
  Calendar,
  Loader2,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { activeAdminTab, setAdminTab, openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [memberFilter, setMemberFilter] = useState('');
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

  const filteredMembers = members.filter((m: any) => {
    if (!memberFilter.trim()) return true;
    const query = memberFilter.toLowerCase();
    const name = m.user?.fullName?.toLowerCase() || '';
    const email = m.user?.email?.toLowerCase() || '';
    return name.includes(query) || email.includes(query);
  });

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      await request(`/organizations/${activeOrgId}/departments`, {
        method: 'POST',
        body: JSON.stringify({ name: deptName.trim() }),
      });
      showToast('Department created successfully!', 'success');
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
      showToast('User group created successfully!', 'success');
      setGroupName('');
      setCreateGroupModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create group', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Organization Administration
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Manage organization boundaries, access control, team memberships, and security policies.
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
      <div className="flex items-center gap-2 border-b border-border/70 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setAdminTab('org')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'org'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setAdminTab('members')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'members'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface text-text-secondary">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'roles'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Custom Roles</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface text-text-secondary">
            {roles.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'departments'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Departments</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface text-text-secondary">
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('groups')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'groups'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Groups</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-surface text-text-secondary">
            {groups.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-text-muted gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
          <span className="text-xs">Loading admin details...</span>
        </div>
      ) : activeAdminTab === 'org' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Org Info */}
          <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Organization Details
                </h3>
              </div>
              <Badge variant="done" size="xs">
                VERIFIED TENANT
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-text-muted font-medium">Organization Name</span>
                <p className="text-text-primary font-bold text-sm">
                  {organization?.name || 'Main Workspace'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted font-medium">Key Prefix</span>
                <p className="font-mono text-brand-400 font-bold text-sm">
                  {organization?.key || 'ORG'}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-text-muted font-medium">Unique Tenant ID</span>
                <p className="font-mono text-text-secondary text-xs select-all bg-surface-surface p-2 rounded-lg border border-border/80">
                  {organization?.id}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted font-medium">Created On</span>
                <p className="text-text-secondary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  {formatDate(organization?.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted font-medium">Security Guard</span>
                <p className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Role-Based Isolation
                </p>
              </div>
            </div>
          </div>

          {/* Quota & Security Cards */}
          <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Plan & Resource Quota
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Tier: Enterprise
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-text-muted">
                  <span>Workspace Members</span>
                  <span className="text-text-primary font-mono">{members.length} / 50 seats</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-surface overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (members.length / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-text-muted">
                  <span>Storage & Attachments</span>
                  <span className="text-text-primary font-mono">1.2 GB / 250 GB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-surface overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '4%' }} />
                </div>
              </div>

              <div className="pt-2 border-t border-border/70 flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-brand-400" />
                  Single Sign-On (SSO / SAML)
                </span>
                <Badge variant="done" size="xs">ENABLED</Badge>
              </div>
            </div>
          </div>
        </div>
      ) : activeAdminTab === 'members' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-border/80 bg-surface-elevated/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search team members by name or email..."
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500"
              />
            </div>
            <Button
              size="xs"
              variant="primary"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => openModal('inviteMember')}
            >
              Add Member
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {filteredMembers.map((member: any) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-hover/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                    {getInitials(member.user?.fullName, member.user?.email)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      {member.user?.fullName || 'Collaborator'}
                    </p>
                    <p className="text-[11px] text-text-muted font-mono">{member.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-text-muted hidden sm:inline">
                    Joined {formatDate(member.createdAt)}
                  </span>
                  <Badge
                    variant={
                      member.role === 'admin' || member.role === 'owner' ? 'progress' : 'todo'
                    }
                    size="xs"
                  >
                    {member.role?.toUpperCase() || 'MEMBER'}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="py-12 text-center text-xs text-text-muted">
                No members found matching "{memberFilter}".
              </div>
            )}
          </div>
        </div>
      ) : activeAdminTab === 'departments' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold">Department Units ({departments.length})</span>
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
              <div key={dept.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary">{dept.name}</span>
                  <p className="text-[11px] text-text-muted">ID: {dept.id}</p>
                </div>
                <span className="text-[11px] text-text-muted">{formatDate(dept.createdAt)}</span>
              </div>
            ))}
            {departments.length === 0 && (
              <div className="py-12 text-center text-xs text-text-muted italic">
                No departments defined yet. Click "New Department" to create one.
              </div>
            )}
          </div>
        </div>
      ) : activeAdminTab === 'groups' ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold">User Permission Groups ({groups.length})</span>
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
              <div key={group.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary">{group.name}</span>
                  <p className="text-[11px] text-text-muted">ID: {group.id}</p>
                </div>
                <span className="text-[11px] text-text-muted">{formatDate(group.createdAt)}</span>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="py-12 text-center text-xs text-text-muted italic">
                No user groups defined yet. Click "New Group" to create one.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 text-xs font-semibold text-text-muted">
            Custom Security Roles ({roles.length})
          </div>
          <div className="divide-y divide-border/60">
            {roles.map((role: any) => (
              <div key={role.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary">{role.name || role.key}</span>
                  <p className="text-[11px] text-text-muted">Role Key: {role.key}</p>
                </div>
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
        description="Organize team members into organizational units."
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
        description="Group users for collective issue assignment and visibility."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name *"
            placeholder="e.g. Frontend Engineers, QA Leads"
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
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
