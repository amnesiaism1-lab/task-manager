import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Zap,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  Power,
  Layers,
  FileCode,
  Loader2,
} from 'lucide-react';

interface ComponentDefinition {
  componentType: 'trigger' | 'condition' | 'action';
  componentKey: string;
  configJson?: Record<string, unknown>;
  position?: number;
}

export const AutomationView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [triggerKey, setTriggerKey] = useState('issue_transitioned');
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionKey, setConditionKey] = useState('priority_high');
  const [actionKey, setActionKey] = useState('add_comment');
  const [actionMessage, setActionMessage] = useState('Automated update processed.');
  const [autoActivate, setAutoActivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null);

  const { data: rules = [], isLoading } = useQuery<any[]>({
    queryKey: ['automationRules', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/automation-rules`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const activeCount = rules.filter((r) => r.status === 'active').length;
  const draftCount = rules.length - activeCount;

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    try {
      setIsSubmitting(true);
      const components: ComponentDefinition[] = [
        {
          componentType: 'trigger',
          componentKey: triggerKey,
          position: 0,
        },
      ];

      if (hasCondition) {
        components.push({
          componentType: 'condition',
          componentKey: conditionKey,
          position: 1,
        });
      }

      components.push({
        componentType: 'action',
        componentKey: actionKey,
        configJson: { message: actionMessage },
        position: components.length,
      });

      const newRule = await request(`/organizations/${activeOrgId}/automation-rules`, {
        method: 'POST',
        body: JSON.stringify({
          name: ruleName.trim(),
          components,
        }),
      });

      if (autoActivate && newRule?.id) {
        try {
          await request(`/organizations/${activeOrgId}/automation-rules/${newRule.id}/activate`, {
            method: 'POST',
          });
        } catch {
          // ignore if activation requires extra conditions
        }
      }

      showToast('Automation workflow created successfully!', 'success');
      setRuleName('');
      setCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create automation rule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateRule = async (ruleId: string) => {
    try {
      await request(`/organizations/${activeOrgId}/automation-rules/${ruleId}/activate`, {
        method: 'POST',
      });
      showToast('Rule activated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to activate rule', 'error');
    }
  };

  const handleExecuteRule = async (ruleId: string) => {
    try {
      setExecutingRuleId(ruleId);
      const idempotencyKey = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await request(`/organizations/${activeOrgId}/automation-rules/${ruleId}/execute`, {
        method: 'POST',
        body: JSON.stringify({ idempotencyKey }),
      });
      showToast('Automation rule executed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Rule execution failed', 'error');
    } finally {
      setExecutingRuleId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Automation Engine</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Rule Builder
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Configure event-driven trigger-action workflows to automate transitions, status changes, and notifications.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          New Rule
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-card/80 border border-border/70 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-muted font-medium">Total Workflows</span>
            <div className="text-xl font-bold text-white">{rules.length}</div>
          </div>
          <div className="p-2 rounded-lg bg-surface-surface text-text-muted">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card/80 border border-emerald-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-medium">Active & Listening</span>
            <div className="text-xl font-bold text-emerald-300">{activeCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Power className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card/80 border border-border/70 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-muted font-medium">Draft Rules</span>
            <div className="text-xl font-bold text-text-secondary">{draftCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-surface-surface text-text-muted">
            <FileCode className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Visual Pipeline Showcase */}
      <div className="bg-gradient-to-r from-surface-card/90 via-surface-card/60 to-surface-elevated/40 border border-border/80 rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Workflow Execution Pipeline</span>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
          {/* Node 1: Trigger */}
          <div className="flex-1 bg-surface-surface/80 border border-amber-500/30 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 1 · Trigger</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="text-xs font-semibold text-white">Event Occurs</p>
            <p className="text-[11px] text-text-muted">Issue transitioned, task created, or comment posted.</p>
          </div>

          <div className="hidden md:flex items-center justify-center text-text-muted">
            <ArrowRight className="w-4 h-4 text-brand-400/70" />
          </div>

          {/* Node 2: Condition */}
          <div className="flex-1 bg-surface-surface/80 border border-brand-500/30 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Step 2 · Condition</span>
              <span className="w-2 h-2 rounded-full bg-brand-400" />
            </div>
            <p className="text-xs font-semibold text-white">Rule Validation</p>
            <p className="text-[11px] text-text-muted">Check priority level, issue type, or assignee match.</p>
          </div>

          <div className="hidden md:flex items-center justify-center text-text-muted">
            <ArrowRight className="w-4 h-4 text-emerald-400/70" />
          </div>

          {/* Node 3: Action */}
          <div className="flex-1 bg-surface-surface/80 border border-emerald-500/30 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 3 · Action</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-white">Execute Handler</p>
            <p className="text-[11px] text-text-muted">Append comment, dispatch webhook, or reconcile state.</p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between text-xs font-semibold text-text-muted">
          <span>Configured Workflows ({rules.length})</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="text-xs">Loading automation rules...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-surface border border-border/80 flex items-center justify-center mx-auto text-text-muted">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">No automation rules created yet</p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Automate routine work like closing linked tasks or notifying stakeholders when issues move to Done.
            </p>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCreateModalOpen(true)}
            >
              Build Your First Rule
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {rules.map((rule) => {
              const isActive = rule.status === 'active';
              return (
                <div
                  key={rule.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/60 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-text-primary truncate">{rule.name}</span>
                      <Badge variant={isActive ? 'done' : 'todo'} size="xs">
                        {isActive ? (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : (
                          'DRAFT'
                        )}
                      </Badge>
                      <span className="text-[11px] font-mono text-text-muted">v{rule.version || 1}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1 font-medium text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Trigger: {rule.triggerEvent || 'issue_transitioned'}
                      </span>
                      <span>➔</span>
                      <span className="flex items-center gap-1 font-medium text-emerald-300/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Action: Comment Note
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isActive && (
                      <Button
                        size="xs"
                        variant="secondary"
                        leftIcon={<Power className="w-3.5 h-3.5 text-emerald-400" />}
                        onClick={() => handleActivateRule(rule.id)}
                      >
                        Activate
                      </Button>
                    )}

                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                      isLoading={executingRuleId === rule.id}
                      onClick={() => handleExecuteRule(rule.id)}
                      title={isActive ? 'Simulate execution' : 'Must be active to execute'}
                      disabled={!isActive}
                    >
                      Test Run
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Automation Rule"
        description="Build event-driven rules to automate workflows in this organization."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <Input
            label="Rule Name *"
            placeholder="e.g. Auto-log comment when moved to Done"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary">When this happens (Trigger) *</label>
              <select
                value={triggerKey}
                onChange={(e) => setTriggerKey(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2.5 border border-border focus:border-brand-500 focus:outline-none"
              >
                <option value="issue_transitioned">Issue Status Transitioned</option>
                <option value="issue_created">New Issue Created</option>
                <option value="comment_added">Comment Added</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary">Then perform this Action *</label>
              <select
                value={actionKey}
                onChange={(e) => setActionKey(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2.5 border border-border focus:border-brand-500 focus:outline-none"
              >
                <option value="add_comment">Append Activity Comment</option>
                <option value="sync_label">Sync Component Tag</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="enableCondition"
              checked={hasCondition}
              onChange={(e) => setHasCondition(e.target.checked)}
              className="rounded border-border text-brand-500 focus:ring-brand-500/20"
            />
            <label htmlFor="enableCondition" className="text-xs text-text-secondary select-none cursor-pointer">
              Add condition filter (e.g. only apply if priority is High)
            </label>
          </div>

          {hasCondition && (
            <div className="p-3 bg-surface-surface/60 border border-border/80 rounded-xl space-y-2">
              <label className="block text-xs font-medium text-text-secondary">Condition Match</label>
              <select
                value={conditionKey}
                onChange={(e) => setConditionKey(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
              >
                <option value="priority_high">Priority is High or Highest</option>
                <option value="type_bug">Issue type is Bug</option>
              </select>
            </div>
          )}

          <Input
            label="Action Note / Message"
            placeholder="e.g. Automated system verification: completed review."
            value={actionMessage}
            onChange={(e) => setActionMessage(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoActivate"
              checked={autoActivate}
              onChange={(e) => setAutoActivate(e.target.checked)}
              className="rounded border-border text-brand-500 focus:ring-brand-500/20"
            />
            <label htmlFor="autoActivate" className="text-xs text-text-secondary select-none cursor-pointer">
              Activate rule immediately upon saving
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Workflow
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
