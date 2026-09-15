import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useUIStore } from '../../../stores/useUIStore';
import { request } from '../../../lib/api-client';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import {
  ListOrdered,
  Plus,
  CheckCircle2,
  Palette,
  Loader2,
} from 'lucide-react';

export const CatalogsTab: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  // Create Priority Modal State
  const [createPriorityOpen, setCreatePriorityOpen] = useState(false);
  const [priorityKey, setPriorityKey] = useState('');
  const [priorityName, setPriorityName] = useState('');
  const [priorityColor, setPriorityColor] = useState('#3b82f6');
  const [priorityOrder, setPriorityOrder] = useState('5');
  const [isSubmittingPriority, setIsSubmittingPriority] = useState(false);

  // Create Resolution Modal State
  const [createResolutionOpen, setCreateResolutionOpen] = useState(false);
  const [resolutionKey, setResolutionKey] = useState('');
  const [resolutionName, setResolutionName] = useState('');
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // 1. Fetch Priorities
  const {
    data: priorities = [],
    isLoading: isLoadingPriorities,
    refetch: refetchPriorities,
  } = useQuery<any[]>({
    queryKey: ['catalogPriorities', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/catalog/priorities`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId,
  });

  // 2. Fetch Resolutions
  const {
    data: resolutions = [],
    isLoading: isLoadingResolutions,
    refetch: refetchResolutions,
  } = useQuery<any[]>({
    queryKey: ['catalogResolutions', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/catalog/resolutions`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId,
  });

  const handleCreatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !priorityName.trim()) return;

    try {
      setIsSubmittingPriority(true);
      const generatedKey = priorityKey.trim() || priorityName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
      await request(`/organizations/${activeOrgId}/catalog/priorities`, {
        method: 'POST',
        body: JSON.stringify({
          key: generatedKey,
          name: priorityName.trim(),
          color: priorityColor,
          orderNum: parseInt(priorityOrder, 10) || 5,
        }),
      });

      showToast('Priority level added successfully!', 'success');
      setPriorityKey('');
      setPriorityName('');
      setPriorityColor('#3b82f6');
      setCreatePriorityOpen(false);
      refetchPriorities();
      queryClient.invalidateQueries({ queryKey: ['catalogPriorities'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to add priority', 'error');
    } finally {
      setIsSubmittingPriority(false);
    }
  };

  const handleCreateResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !resolutionName.trim()) return;

    try {
      setIsSubmittingResolution(true);
      const generatedKey = resolutionKey.trim() || resolutionName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      await request(`/organizations/${activeOrgId}/catalog/resolutions`, {
        method: 'POST',
        body: JSON.stringify({
          key: generatedKey,
          name: resolutionName.trim(),
          description: resolutionDesc.trim() || undefined,
        }),
      });

      showToast('Resolution status added successfully!', 'success');
      setResolutionKey('');
      setResolutionName('');
      setResolutionDesc('');
      setCreateResolutionOpen(false);
      refetchResolutions();
      queryClient.invalidateQueries({ queryKey: ['catalogResolutions'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to add resolution', 'error');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const isLoading = isLoadingPriorities || isLoadingResolutions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
        <span className="text-xs">Loading organizational catalogs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">System Priorities & Resolutions</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Core Catalog (F1)
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Standardize severity tiers and terminal resolution outcomes across all organization projects.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priorities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Priority Levels ({priorities.length})
              </h3>
            </div>
            <Button
              size="xs"
              variant="primary"
              leftIcon={<Plus className="w-3 h-3" />}
              onClick={() => setCreatePriorityOpen(true)}
            >
              Add Priority
            </Button>
          </div>

          <div className="space-y-2.5">
            {priorities.map((p: any) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-surface-card border border-border/80 flex items-center justify-between hover:border-brand-500/40 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: p.color || '#94a3b8' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-[10px] font-mono text-text-muted">({p.key})</span>
                    </div>
                    <span className="text-[10px] text-text-muted">Sort Rank: {p.orderNum ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      Default
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{
                      color: p.color || '#94a3b8',
                      backgroundColor: `${p.color || '#94a3b8'}20`,
                    }}
                  >
                    {p.color || '#94a3b8'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolutions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Resolution Outcomes ({resolutions.length})
              </h3>
            </div>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3 h-3" />}
              onClick={() => setCreateResolutionOpen(true)}
            >
              Add Resolution
            </Button>
          </div>

          <div className="space-y-2.5">
            {resolutions.map((r: any) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-surface-card border border-border/80 flex items-center justify-between hover:border-emerald-500/40 transition-all shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{r.name}</span>
                    <span className="text-[10px] font-mono text-text-muted">({r.key})</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    {r.description || 'Standard resolution applied upon closing an issue.'}
                  </p>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Create Priority */}
      <Modal
        isOpen={createPriorityOpen}
        onClose={() => setCreatePriorityOpen(false)}
        title="Add Priority Level"
        description="Configure a custom urgency level for tasks and incidents."
        maxWidth="sm"
      >
        <form onSubmit={handleCreatePriority} className="space-y-4">
          <Input
            label="Priority Name *"
            placeholder="e.g. Blocker, Urgent"
            value={priorityName}
            onChange={(e) => setPriorityName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Key (Unique)"
            placeholder="e.g. BLOCKER"
            value={priorityKey}
            onChange={(e) => setPriorityKey(e.target.value.toUpperCase())}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">Badge Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={priorityColor}
                  onChange={(e) => setPriorityColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={priorityColor}
                  onChange={(e) => setPriorityColor(e.target.value)}
                  className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-2.5 py-1.5 border border-border font-mono"
                />
              </div>
            </div>

            <Input
              label="Sort Rank"
              type="number"
              value={priorityOrder}
              onChange={(e) => setPriorityOrder(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreatePriorityOpen(false)}
              disabled={isSubmittingPriority}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingPriority}>
              Save Priority
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Resolution */}
      <Modal
        isOpen={createResolutionOpen}
        onClose={() => setCreateResolutionOpen(false)}
        title="Add Resolution Status"
        description="Define an outcome explaining why or how an issue was closed."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateResolution} className="space-y-4">
          <Input
            label="Resolution Name *"
            placeholder="e.g. Obsolete, Won't Fix"
            value={resolutionName}
            onChange={(e) => setResolutionName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Key"
            placeholder="e.g. obsolete"
            value={resolutionKey}
            onChange={(e) => setResolutionKey(e.target.value.toLowerCase())}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Description</label>
            <textarea
              value={resolutionDesc}
              onChange={(e) => setResolutionDesc(e.target.value)}
              rows={2}
              placeholder="Explain when this resolution applies..."
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateResolutionOpen(false)}
              disabled={isSubmittingResolution}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingResolution}>
              Save Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
