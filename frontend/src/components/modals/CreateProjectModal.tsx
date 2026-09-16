import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../stores/useUIStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { request, ApiError } from '../../lib/api-client';

export const CreateProjectModal: React.FC = () => {
  const { modals, closeModal, showToast } = useUIStore();
  const { activeOrgId, projects, setProjects, setActiveProjectId } = useWorkspaceStore();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [projectType, setProjectType] = useState<'scrum' | 'kanban'>('scrum');
  const [visibility, setVisibility] = useState<'org' | 'private' | 'public'>('org');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = !!modals['createProject'];

  // Fetch departments for active organization
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['createProjectDepts', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/departments`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId && isOpen,
  });

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key === name.slice(0, 4).toUpperCase()) {
      const generated = val.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
      setKey(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) {
      setError('Please select or create an organization first.');
      return;
    }
    if (!name.trim() || !key.trim()) {
      setError('Project name and key are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res: any = await request(`/organizations/${activeOrgId}/projects`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          key: key.trim().toUpperCase(),
          boardType: projectType,
          projectType,
          visibility,
          departmentId: departmentId || undefined,
          description: description.trim() || undefined,
        }),
      });

      const createdProject = res?.project || res;
      setProjects([...projects, createdProject]);
      setActiveProjectId(createdProject.id);

      try {
        const bootData = await request(`/workspace/bootstrap?orgId=${activeOrgId}&projectId=${createdProject.id}`);
        if (bootData) {
          useWorkspaceStore.getState().applyBootstrap(bootData);
        }
      } catch {
        // Ignore fallback
      }

      showToast(`Project "${createdProject.name || name}" created successfully!`, 'success');
      setName('');
      setKey('');
      setDepartmentId('');
      setDescription('');
      closeModal('createProject');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create project.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('createProject')}
      title="Create New Project"
      description="Initialize an agile board, default workflow, and permission scheme."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Input
              label="Project Key"
              placeholder="e.g. ALPHA"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Project Name"
              placeholder="e.g. Alpha Platform Services"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Methodology</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as any)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="scrum">Scrum (Sprints & Backlog)</option>
              <option value="kanban">Kanban (Continuous Flow)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="org">Organization-wide</option>
              <option value="private">Private (Restricted)</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        {/* Department Selection (SRS UC-ORG-08) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Owning Department (Optional)</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">-- No Department (Direct Org Ownership) --</option>
            {departments.map((dept: any) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief description of the project..."
            className="w-full bg-surface-surface text-text-primary placeholder:text-text-muted text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => closeModal('createProject')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
