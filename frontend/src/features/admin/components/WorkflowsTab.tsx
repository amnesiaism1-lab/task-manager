import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useUIStore } from '../../../stores/useUIStore';
import { request } from '../../../lib/api-client';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import {
  GitBranch,
  Plus,
  ArrowRight,
  MessageSquare,
  Loader2,
  Layers,
} from 'lucide-react';

export const WorkflowsTab: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [selectedWfId, setSelectedWfId] = useState<string>('');

  // State Modal Form
  const [createStateOpen, setCreateStateOpen] = useState(false);
  const [stateName, setStateName] = useState('');
  const [stateKey, setStateKey] = useState('');
  const [stateCategory, setStateCategory] = useState<'todo' | 'in_progress' | 'done'>('in_progress');
  const [stateIsTerminal, setStateIsTerminal] = useState(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  // Transition Modal Form
  const [createTransOpen, setCreateTransOpen] = useState(false);
  const [transName, setTransName] = useState('');
  const [transKey, setTransKey] = useState('');
  const [fromStateId, setFromStateId] = useState('');
  const [toStateId, setToStateId] = useState('');
  const [requireComment, setRequireComment] = useState(false);
  const [isSubmittingTrans, setIsSubmittingTrans] = useState(false);

  // 1. Fetch all workflows for the organization
  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery<any[]>({
    queryKey: ['orgWorkflows', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/workflows`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!activeOrgId,
  });

  const activeWorkflowId = selectedWfId || workflows[0]?.id;

  // 2. Fetch selected workflow details (states, transitions)
  const {
    data: workflowDetail,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useQuery<any>({
    queryKey: ['workflowDetail', activeOrgId, activeWorkflowId],
    queryFn: async () => {
      if (!activeOrgId || !activeWorkflowId) return null;
      return request(`/organizations/${activeOrgId}/workflows/${activeWorkflowId}`).catch(() => null);
    },
    enabled: !!activeOrgId && !!activeWorkflowId,
  });

  const states = workflowDetail?.states || [];
  const transitions = workflowDetail?.transitions || [];

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !activeWorkflowId || !stateName.trim()) return;

    try {
      setIsSubmittingState(true);
      const generatedKey = stateKey.trim() || stateName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      await request(`/organizations/${activeOrgId}/workflows/${activeWorkflowId}/states`, {
        method: 'POST',
        body: JSON.stringify({
          key: generatedKey,
          name: stateName.trim(),
          category: stateCategory,
          isTerminal: stateIsTerminal,
          position: states.length,
        }),
      });

      showToast('Workflow state added successfully!', 'success');
      setStateName('');
      setStateKey('');
      setStateCategory('in_progress');
      setStateIsTerminal(false);
      setCreateStateOpen(false);
      refetchDetail();
      queryClient.invalidateQueries({ queryKey: ['orgWorkflows'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to add state', 'error');
    } finally {
      setIsSubmittingState(false);
    }
  };

  const handleCreateTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !activeWorkflowId || !transName.trim() || !fromStateId || !toStateId) {
      showToast('Please select source and target states.', 'warning');
      return;
    }

    try {
      setIsSubmittingTrans(true);
      const generatedKey = transKey.trim() || transName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      await request(`/organizations/${activeOrgId}/workflows/${activeWorkflowId}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          key: generatedKey,
          name: transName.trim(),
          fromStateId,
          toStateId,
          requireComment,
          sortOrder: transitions.length,
        }),
      });

      showToast('Workflow transition added successfully!', 'success');
      setTransName('');
      setTransKey('');
      setFromStateId('');
      setToStateId('');
      setRequireComment(false);
      setCreateTransOpen(false);
      refetchDetail();
      queryClient.invalidateQueries({ queryKey: ['orgWorkflows'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to add transition', 'error');
    } finally {
      setIsSubmittingTrans(false);
    }
  };

  if (isLoadingWorkflows) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
        <span className="text-xs">Loading workflow schemes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Workflow Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Enterprise Workflow Builder</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                FSM Engine
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Configure lifecycle states, transition guards, and comment requirements per organizational scheme.
            </p>
          </div>
        </div>

        {/* Workflow Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted font-medium">Scheme:</label>
          <select
            value={activeWorkflowId}
            onChange={(e) => setSelectedWfId(e.target.value)}
            className="bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border/80 focus:border-brand-500 focus:outline-none min-w-[200px]"
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name} ({wf.key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoadingDetail ? (
        <div className="flex items-center justify-center py-16 text-text-muted gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
          <span className="text-xs">Loading workflow state machine...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* States Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Lifecycle States ({states.length})
                </h3>
              </div>
              <Button
                size="xs"
                variant="primary"
                leftIcon={<Plus className="w-3 h-3" />}
                onClick={() => setCreateStateOpen(true)}
              >
                Add State
              </Button>
            </div>

            <div className="space-y-2.5">
              {states.map((st: any) => {
                const categoryColor =
                  st.category === 'done'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : st.category === 'in_progress'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30';

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-xl bg-surface-card border border-border/80 flex items-center justify-between hover:border-brand-500/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${categoryColor}`}>
                        {st.category || 'IN_PROGRESS'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{st.name}</span>
                          <span className="text-[10px] font-mono text-text-muted">({st.key})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {st.isInitial && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          Initial
                        </span>
                      )}
                      {st.isTerminal && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Terminal
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {states.length === 0 && (
                <div className="py-8 text-center text-xs text-text-muted bg-surface-card rounded-xl border border-dashed border-border/80">
                  No states defined yet. Click "Add State" to configure steps.
                </div>
              )}
            </div>
          </div>

          {/* Transitions Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Permitted Transitions ({transitions.length})
                </h3>
              </div>
              <Button
                size="xs"
                variant="secondary"
                leftIcon={<Plus className="w-3 h-3" />}
                onClick={() => {
                  if (states.length < 2) {
                    showToast('Add at least 2 states before configuring transitions.', 'info');
                    return;
                  }
                  setCreateTransOpen(true);
                }}
              >
                Add Transition
              </Button>
            </div>

            <div className="space-y-2.5">
              {transitions.map((tr: any) => {
                const fromSt = states.find((s: any) => s.id === tr.fromStateId);
                const toSt = states.find((s: any) => s.id === tr.toStateId);

                return (
                  <div
                    key={tr.id}
                    className="p-3.5 rounded-xl bg-surface-card border border-border/80 flex items-center justify-between hover:border-purple-500/40 transition-all shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{tr.name || tr.key}</span>
                        <span className="text-[10px] font-mono text-text-muted">({tr.key})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="px-1.5 py-0.5 rounded bg-surface-surface text-[11px] font-medium text-text-primary">
                          {fromSt?.name || 'Any State'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                        <span className="px-1.5 py-0.5 rounded bg-surface-surface text-[11px] font-medium text-text-primary">
                          {toSt?.name || 'Target State'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tr.requireComment && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                          title="Requires comment on transition (BR-28)"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          Comment Req
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {transitions.length === 0 && (
                <div className="py-8 text-center text-xs text-text-muted bg-surface-card rounded-xl border border-dashed border-border/80">
                  No transitions configured. Click "Add Transition" to connect states.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create State */}
      <Modal
        isOpen={createStateOpen}
        onClose={() => setCreateStateOpen(false)}
        title="Add Workflow State"
        description="Define a new operational stage for issues progressing through this workflow."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateState} className="space-y-4">
          <Input
            label="State Name *"
            placeholder="e.g. Code Review, QA Verification"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Key (Optional identifier)"
            placeholder="e.g. code-review"
            value={stateKey}
            onChange={(e) => setStateKey(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Category *</label>
            <select
              value={stateCategory}
              onChange={(e) => setStateCategory(e.target.value as any)}
              className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
            >
              <option value="todo">To Do (Initial Queue)</option>
              <option value="in_progress">In Progress (Execution)</option>
              <option value="done">Done (Completion)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={stateIsTerminal}
              onChange={(e) => setStateIsTerminal(e.target.checked)}
              className="rounded bg-surface-surface border-border text-brand-500 focus:ring-brand-500"
            />
            <span className="text-xs text-text-primary font-medium">
              Terminal State (Sets issue as resolved/closed upon entry)
            </span>
          </label>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateStateOpen(false)}
              disabled={isSubmittingState}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingState}>
              Create State
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Transition */}
      <Modal
        isOpen={createTransOpen}
        onClose={() => setCreateTransOpen(false)}
        title="Add Permitted Transition"
        description="Define a directed movement rule between two workflow states."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateTransition} className="space-y-4">
          <Input
            label="Transition Action Name *"
            placeholder="e.g. Submit for Review, Approve, Reject"
            value={transName}
            onChange={(e) => setTransName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">From State *</label>
              <select
                value={fromStateId}
                onChange={(e) => setFromStateId(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-2.5 py-2 border border-border focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">-- Source --</option>
                {states.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">To State *</label>
              <select
                value={toStateId}
                onChange={(e) => setToStateId(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-2.5 py-2 border border-border focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">-- Target --</option>
                {states.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={requireComment}
              onChange={(e) => setRequireComment(e.target.checked)}
              className="rounded bg-surface-surface border-border text-brand-500 focus:ring-brand-500"
            />
            <span className="text-xs text-text-primary font-medium">
              Require Comment (BR-28: User must enter a note when transitioning)
            </span>
          </label>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateTransOpen(false)}
              disabled={isSubmittingTrans}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingTrans}>
              Create Transition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
