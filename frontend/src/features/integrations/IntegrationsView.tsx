import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../lib/utils';
import {
  PlugZap,
  Key,
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [newlyCreatedToken, setNewlyCreatedToken] = useState('');
  const [copied, setCopied] = useState(false);

  const [createWebhookModalOpen, setCreateWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // 1. Fetch Tokens & Webhooks
  const { data: integrations, isLoading } = useQuery<{ tokens: any[]; webhooks: any[] }>({
    queryKey: ['integrations', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return { tokens: [], webhooks: [] };
      const [tokens, webhooks] = await Promise.all([
        request(`/organizations/${activeOrgId}/api-tokens`).catch(() => []),
        request(`/organizations/${activeOrgId}/webhooks`).catch(() => []),
      ]);
      return {
        tokens: Array.isArray(tokens) ? tokens : [],
        webhooks: Array.isArray(webhooks) ? webhooks : [],
      };
    },
    enabled: !!activeOrgId,
  });

  const tokens = integrations?.tokens || [];
  const webhooks = integrations?.webhooks || [];

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;

    try {
      const res = await request(`/organizations/${activeOrgId}/api-tokens`, {
        method: 'POST',
        body: JSON.stringify({ name: tokenName.trim() }),
      });
      setNewlyCreatedToken(res.token || res.secret || 'Token generated');
      showToast('API token created!', 'success');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create token', 'error');
    }
  };

  const handleRevokeToken = async (id: string) => {
    if (!window.confirm('Revoke this API token? Any active client will be rejected immediately.')) return;
    try {
      await request(`/organizations/${activeOrgId}/api-tokens/${id}`, { method: 'DELETE' });
      showToast('Token revoked', 'info');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke token', 'error');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    try {
      await request(`/organizations/${activeOrgId}/webhooks`, {
        method: 'POST',
        body: JSON.stringify({
          url: webhookUrl.trim(),
          eventTypes: ['issue.created', 'issue.transitioned'],
        }),
      });
      showToast('Webhook registered successfully!', 'success');
      setWebhookUrl('');
      setCreateWebhookModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to register webhook', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-sm">
            <PlugZap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Developer APIs & Integrations
            </h1>
            <p className="text-xs text-text-secondary">
              Manage personal access tokens and outbound webhooks for CI/CD pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Tokens & Webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Tokens Card */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">API Access Tokens</h3>
            </div>
            <Button
              size="xs"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewlyCreatedToken('');
                setTokenName('');
                setCreateTokenModalOpen(true);
              }}
            >
              New Token
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading tokens...</div>
            ) : tokens.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted italic">
                No active API tokens found.
              </div>
            ) : (
              tokens.map((token) => (
                <div key={token.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-text-primary">{token.name}</p>
                    <p className="text-[10px] text-text-muted">
                      Created {formatDate(token.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeToken(token.id)}
                    className="text-text-muted hover:text-rose-400 p-1.5 rounded transition-colors"
                    title="Revoke Token"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Webhooks Card */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Outbound Webhooks</h3>
            </div>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCreateWebhookModalOpen(true)}
            >
              Add Webhook
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading webhooks...</div>
            ) : webhooks.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted italic">
                No webhooks configured.
              </div>
            ) : (
              webhooks.map((wh) => (
                <div key={wh.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="text-xs font-mono text-text-primary truncate">{wh.url}</p>
                    <Badge variant="progress" size="xs">
                      {wh.status || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Token Modal */}
      <Modal
        isOpen={createTokenModalOpen}
        onClose={() => setCreateTokenModalOpen(false)}
        title="Generate API Token"
        description="Authenticate programmatic requests to Task Manager REST API."
        maxWidth="sm"
      >
        {newlyCreatedToken ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-emerald-300">
                Token generated! Copy it now as it won't be shown again:
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={newlyCreatedToken}
                  className="flex-1 bg-surface-surface text-xs font-mono text-emerald-200 p-2 rounded border border-border outline-none"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => copyToClipboard(newlyCreatedToken)}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setCreateTokenModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateToken} className="space-y-4">
            <Input
              label="Token Description *"
              placeholder="e.g. GitHub Actions Deployment"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateTokenModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Generate
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Webhook Modal */}
      <Modal
        isOpen={createWebhookModalOpen}
        onClose={() => setCreateWebhookModalOpen(false)}
        title="Register Outbound Webhook"
        description="Receive HTTP POST payloads when issue events happen."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <Input
            label="Payload URL *"
            type="url"
            placeholder="https://api.example.com/webhooks/jira"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            required
            autoFocus
          />
          <p className="text-[11px] text-text-muted">
            All events are signed using an HMAC-SHA256 signature in the X-Hub-Signature header.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateWebhookModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Webhook
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
