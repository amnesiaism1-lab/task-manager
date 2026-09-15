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
  Trash2,
  GitBranch,
  ListOrdered,
} from 'lucide-react';
import { WorkflowsTab } from './components/WorkflowsTab';
import { CatalogsTab } from './components/CatalogsTab';

export const AdminView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { activeAdminTab, setAdminTab, openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [memberFilter, setMemberFilter] = useState('');
  const [createDeptModalOpen, setCreateDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptLeadId, setDeptLeadId] = useState('');

  // Department Roster Modal State
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');
  const [memberRoleInDept, setMemberRoleInDept] = useState('MEMBER');
  const [isAddingMember, setIsAddingMember] = useState(false);

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

  // Query Department Members for Selected Department
  const {
    data: deptMembers = [],
    refetch: refetchDeptMembers,
    isLoading: isLoadingDeptMembers,
  } = useQuery<any[]>({
    queryKey: ['deptMembers', activeOrgId, selectedDept?.id],
    queryFn: async () => {
      if (!activeOrgId || !selectedDept?.id) return [];
      const res = await request(
        `/organizations/${activeOrgId}/departments/${selectedDept.id}/members`
      );
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId && !!selectedDept?.id,
  });

  const organization = adminData?.organization;
  const members = adminData?.members || [];
  const roles = adminData?.roles || [];
  const departments = adminData?.departments || [];
  const groups = adminData?.groups || [];

  const filteredMembers = members.filter((m: any) => {
    if (!memberFilter.trim()) return true;
    const query = memberFilter.toLowerCase();
    const name = (m.user?.fullName || m.fullName || '').toLowerCase();
    const email = (m.user?.email || m.email || '').toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      await request(`/organizations/${activeOrgId}/departments`, {
        method: 'POST',
        body: JSON.stringify({
          name: deptName.trim(),
          description: deptDesc.trim() || undefined,
          leadMemberId: deptLeadId || undefined,
        }),
      });
      showToast('Department created successfully!', 'success');
      setDeptName('');
      setDeptDesc('');
      setDeptLeadId('');
      setCreateDeptModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create department', 'error');
    }
  };

  const handleAddMemberToDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToAdd || !selectedDept?.id) return;
    try {
      setIsAddingMember(true);
      await request(
        `/organizations/${activeOrgId}/departments/${selectedDept.id}/members`,
        {
          method: 'POST',
          body: JSON.stringify({
            memberId: selectedMemberToAdd,
            roleInDepartment: memberRoleInDept,
          }),
        }
      );
      showToast('Member assigned to department successfully!', 'success');
      setSelectedMemberToAdd('');
      refetchDeptMembers();
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to add member to department', 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMemberFromDept = async (memberId: string) => {
    if (!selectedDept?.id) return;
    try {
      await request(
        `/organizations/${activeOrgId}/departments/${selectedDept.id}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );
      showToast('Member removed from department', 'success');
      refetchDeptMembers();
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to remove member', 'error');
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

        <button
          onClick={() => setAdminTab('workflows')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'workflows'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Workflows</span>
        </button>

        <button
          onClick={() => setAdminTab('catalogs')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeAdminTab === 'catalogs'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Priorities & Resolutions</span>
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
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                    {getInitials(member.user?.fullName || member.fullName, member.user?.email || member.email)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text-primary">
                        {member.user?.fullName || member.fullName || 'Collaborator'}
                      </p>
                      {member.title && (
                        <span className="text-[10px] text-text-muted">({member.title})</span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted font-mono">{member.user?.email || member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Department Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {member.departments && member.departments.length > 0 ? (
                      member.departments.map((d: any) => (
                        <span
                          key={d.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 flex items-center gap-1"
                          title={`Department: ${d.name} (${d.role || 'Member'})`}
                        >
                          <Building className="w-2.5 h-2.5 text-brand-400" />
                          {d.name}
                          {d.role === 'LEAD' && (
                            <span className="text-[9px] text-amber-300 font-bold ml-0.5">LEAD</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-text-muted italic px-2 py-0.5 rounded border border-white/5 bg-surface-surface">
                        No Department
                      </span>
                    )}
                  </div>

                  {/* Role Badge */}
                  <Badge
                    variant={
                      member.role === 'admin' || member.role === 'owner' || member.role === 'org-admin'
                        ? 'progress'
                        : 'todo'
                    }
                    size="xs"
                  >
                    {member.role?.toUpperCase() || 'MEMBER'}
                  </Badge>

                  <span className="text-[11px] text-text-muted hidden md:inline">
                    Joined {formatDate(member.createdAt || member.joinedAt)}
                  </span>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Department Organization Units ({departments.length})
              </h2>
              <p className="text-xs text-text-secondary">
                Structure teams into departments, assign department leads, and manage project ownership.
              </p>
            </div>
            <Button
              size="xs"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCreateDeptModalOpen(true)}
            >
              New Department
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept: any) => (
              <div
                key={dept.id}
                className="p-5 rounded-2xl bg-surface-card border border-border/80 shadow-card hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:scale-105 transition-transform">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{dept.name}</h3>
                        <p className="text-[10px] text-text-muted font-mono">ID: {dept.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-brand-300 border border-brand-500/20">
                      {dept.memberCount || 0} members
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px]">
                    {dept.description || 'Department operational unit managing assigned projects and members.'}
                  </p>

                  {/* Lead Member Display */}
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Lead / Trưởng phòng</span>
                    {dept.leadMember ? (
                      <div className="flex items-center gap-1.5" title={dept.leadMember.email}>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          {getInitials(dept.leadMember.fullName, dept.leadMember.email)}
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          {dept.leadMember.fullName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-muted italic">Unassigned Lead</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">Created {formatDate(dept.createdAt)}</span>
                  <Button
                    size="xs"
                    variant="secondary"
                    leftIcon={<Users className="w-3 h-3" />}
                    onClick={() => setSelectedDept(dept)}
                    className="text-xs"
                  >
                    Manage Roster
                  </Button>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <div className="col-span-full py-14 text-center text-xs text-text-muted italic border border-dashed border-border/80 rounded-2xl bg-surface-card">
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
      ) : activeAdminTab === 'workflows' ? (
        <WorkflowsTab />
      ) : activeAdminTab === 'catalogs' ? (
        <CatalogsTab />
      ) : (
        <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white text-sm">Security Roles & Permissions ({roles.length})</span>
              <p className="text-xs text-text-secondary">Granular role-based access control (RBAC) policies across tenant resources.</p>
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {roles.map((role: any) => (
              <div key={role.id} className="px-6 py-5 space-y-3 hover:bg-surface-hover/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{role.name || role.key}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-500/15 text-brand-300 border border-brand-500/30">
                        {role.key}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {role.description || 'System defined security role governing access privileges.'}
                    </p>
                  </div>
                </div>

                {/* Permissions Pill Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Granted Capabilities</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((perm: string) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-surface text-emerald-300 border border-emerald-500/20 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          {perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-text-muted italic">No specific permissions configured</span>
                    )}
                  </div>
                </div>
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
        description="Organize team members into organizational units with assigned leads."
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Description</label>
            <textarea
              placeholder="Department responsibilities and purpose..."
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full bg-surface-surface text-xs text-text-primary rounded-lg p-2.5 border border-border focus:border-brand-500 resize-none h-20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Department Head (Lead)</label>
            <select
              value={deptLeadId}
              onChange={(e) => setDeptLeadId(e.target.value)}
              className="w-full bg-surface-surface text-xs text-text-primary rounded-lg p-2.5 border border-border focus:border-brand-500"
            >
              <option value="">Select a department lead (optional)...</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName || m.fullName} ({m.user?.email || m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/70">
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

      {/* Department Roster Management Modal */}
      <Modal
        isOpen={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        title={`${selectedDept?.name || 'Department'} — Team Roster`}
        description={selectedDept?.description || 'Manage departmental personnel and designated roles.'}
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Add Member Form */}
          <form
            onSubmit={handleAddMemberToDept}
            className="p-3.5 rounded-xl bg-surface-surface border border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="flex-1">
              <select
                value={selectedMemberToAdd}
                onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                className="w-full bg-surface-card text-xs text-text-primary rounded-lg px-3 py-2 border border-border focus:border-brand-500"
                required
              >
                <option value="">Select an organization member...</option>
                {members
                  .filter((m: any) => !deptMembers.some((dm: any) => dm.memberId === m.id))
                  .map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.fullName || m.fullName} ({m.user?.email || m.email})
                    </option>
                  ))}
              </select>
            </div>

            <select
              value={memberRoleInDept}
              onChange={(e) => setMemberRoleInDept(e.target.value)}
              className="bg-surface-card text-xs text-text-primary rounded-lg px-3 py-2 border border-border focus:border-brand-500 w-32"
            >
              <option value="MEMBER">Member</option>
              <option value="LEAD">Lead</option>
              <option value="COORDINATOR">Coordinator</option>
            </select>

            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={isAddingMember || !selectedMemberToAdd}
              leftIcon={isAddingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            >
              Assign
            </Button>
          </form>

          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Department Members ({deptMembers.length})
            </h4>

            {isLoadingDeptMembers ? (
              <div className="py-8 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                Loading department roster...
              </div>
            ) : deptMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted italic border border-dashed border-border/80 rounded-xl">
                No members assigned to this department yet. Use the form above to add members.
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto custom-scrollbar border border-border/80 rounded-xl bg-surface-card">
                {deptMembers.map((dm: any) => (
                  <div
                    key={dm.memberId}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-surface-hover/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {getInitials(dm.fullName, dm.email)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{dm.fullName}</p>
                        <p className="text-[11px] text-text-muted font-mono">{dm.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          dm.roleInDepartment === 'LEAD'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : dm.roleInDepartment === 'COORDINATOR'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-surface-surface text-text-secondary border-border/80'
                        }`}
                      >
                        {dm.roleInDepartment || 'MEMBER'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberFromDept(dm.memberId)}
                        className="p-1 rounded text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove member from department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border/70">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDept(null)}
            >
              Close
            </Button>
          </div>
        </div>
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
