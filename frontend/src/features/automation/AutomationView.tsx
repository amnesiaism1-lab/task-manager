import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Zap, Plus, Loader2 } from 'lucide-react';

export const AutomationView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('ISSUE_TRANSITIONED');
  const [actionMessage, setActionMessage] = useState('Automated update processed.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rules = [], isLoading } = useQuery<any[]>({
    queryKey: ['automationRules', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await request(`/organizations/${activeOrgId}/automation-rules`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId,
  });

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    try {
      setIsSubmitting(true);
      await request(`/organizations/${activeOrgId}/automation-rules`, {
        method: 'POST',
        body: JSON.stringify({
          name: ruleName.trim(),
          triggerEvent,
          actions: [{ type: 'ADD_COMMENT', payload: { message: actionMessage } }],
        }),
      });
      showToast('Automation rule created!', 'success');
      setRuleName('');
      setCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create automation rule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Automation Engine</h1>
            <p className="text-xs text-text-secondary">
              Configure event-driven trigger-action workflows to automate repetitive tasks.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Rule
        </Button>
      </div>

      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-3 border-b border-border/80 bg-surface-elevated/40 text-xs font-semibold text-text-muted">
          Active Automation Rules ({rules.length})
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="text-xs">Loading rules...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Zap className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-sm font-semibold text-text-secondary">No automation rules configured</p>
            <p className="text-xs text-text-muted">
              Create your first rule to automate transitions, assignments, or notifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-hover/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{rule.name}</span>
                    <Badge variant="progress" size="xs">
                      ACTIVE
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>When: <strong className="text-brand-300">{rule.triggerEvent || 'ISSUE_TRANSITIONED'}</strong></span>
                    <span>→</span>
                    <span>Then: <strong className="text-emerald-300">Add Automated Note</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="done" size="xs">
                    Enabled
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Automation Rule"
        description="Trigger actions automatically when issue events occur."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <Input
            label="Rule Name *"
            placeholder="e.g. Notify on In Progress"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Trigger Event</label>
            <select
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="w-full bg-surface-surface text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:border-brand-500 focus:outline-none"
            >
              <option value="ISSUE_TRANSITIONED">Issue Transitioned</option>
              <option value="ISSUE_CREATED">Issue Created</option>
              <option value="COMMENT_ADDED">Comment Added</option>
            </select>
          </div>

          <Input
            label="Action Note"
            placeholder="Message to attach to issue"
            value={actionMessage}
            onChange={(e) => setActionMessage(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
