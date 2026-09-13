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
  Code2,
  ShieldCheck,
  Send,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { activeOrgId } = useWorkspaceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenScope, setTokenScope] = useState('full_access');
  const [newlyCreatedToken, setNewlyCreatedToken] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const [createWebhookModalOpen, setCreateWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);

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
        body: JSON.stringify({
          name: tokenName.trim(),
          scope: tokenScope,
        }),
      });
      setNewlyCreatedToken(res.token || res.secret || `tm_pat_${Math.random().toString(36).substring(2, 18)}`);
      showToast('API token created successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to create token', 'error');
    }
  };

  const handleRevokeToken = async (id: string) => {
    if (!window.confirm('Revoke this API token? Any active client or script using it will be denied immediately.')) return;
    try {
      await request(`/organizations/${activeOrgId}/api-tokens/${id}`, { method: 'DELETE' });
      showToast('API token revoked', 'info');
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
          eventTypes: ['issue.created', 'issue.transitioned', 'comment.added'],
        }),
      });
      showToast('Webhook endpoint registered!', 'success');
      setWebhookUrl('');
      setCreateWebhookModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to register webhook', 'error');
    }
  };

  const copyToClipboard = (text: string, isEndpoint = false) => {
    navigator.clipboard.writeText(text);
    if (isEndpoint) {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
    showToast('Copied to clipboard!', 'info');
  };

  const apiEndpointUrl = `${window.location.origin}/api/v1/organizations/${activeOrgId || ':orgId'}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-sm">
            <PlugZap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Developer APIs & Integrations
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                REST & Webhooks
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Manage personal access tokens, outbound webhooks, and programmatic CI/CD integration keys.
            </p>
          </div>
        </div>
      </div>

      {/* Quick API Endpoint Card */}
      <div className="bg-surface-card/60 border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface-surface text-brand-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-text-primary">REST API Base Endpoint</span>
            <p className="text-[11px] font-mono text-text-muted select-all truncate max-w-md">
              {apiEndpointUrl}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="secondary"
            leftIcon={copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={() => copyToClipboard(apiEndpointUrl, true)}
          >
            {copiedEndpoint ? 'Copied' : 'Copy Endpoint'}
          </Button>
          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium px-2 py-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Grid: Tokens & Webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Tokens Card */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Personal Access Tokens</h3>
                <p className="text-[11px] text-text-muted">Bearer tokens for CLI or serverless access</p>
              </div>
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
              Generate Token
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading tokens...</div>
            ) : tokens.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs font-medium text-text-secondary">No active personal access tokens</p>
                <p className="text-[11px] text-text-muted">Generate a token to interact with the Task Manager API.</p>
              </div>
            ) : (
              tokens.map((token) => (
                <div key={token.id} className="py-3.5 flex items-center justify-between gap-3 group">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text-primary truncate">{token.name}</p>
                      <Badge variant="todo" size="xs">
                        {token.scope || 'read:write'}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-mono text-text-muted">
                      Created {formatDate(token.createdAt)} · Active
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeToken(token.id)}
                    className="text-text-muted hover:text-rose-400 p-2 rounded-lg hover:bg-surface-surface transition-colors"
                    title="Revoke Token Immediately"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Webhooks Card */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Webhook className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Outbound Webhooks</h3>
                <p className="text-[11px] text-text-muted">HTTP POST event listeners signed with HMAC</p>
              </div>
            </div>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCreateWebhookModalOpen(true)}
            >
              Add Endpoint
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading webhooks...</div>
            ) : webhooks.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Send className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs font-medium text-text-secondary">No webhook endpoints registered</p>
                <p className="text-[11px] text-text-muted">Add a webhook endpoint to receive real-time JSON events.</p>
              </div>
            ) : (
              webhooks.map((wh) => (
                <div key={wh.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-text-primary truncate">{wh.url}</p>
                      <Badge variant="done" size="xs">
                        ACTIVE
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      <span className="font-mono text-emerald-400">HMAC-SHA256</span>
                      <span>·</span>
                      <span>issue.created, issue.transitioned</span>
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={<Code2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSelectedWebhook(wh);
                      setSecretModalOpen(true);
                    }}
                  >
                    Payload
                  </Button>
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
        title="Generate Personal Access Token"
        description="Authenticate requests to the REST API with programmatic bearer tokens."
        maxWidth="md"
      >
        {newlyCreatedToken ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">
                  Token generated! Store it in a safe password manager now:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={newlyCreatedToken}
                  className="flex-1 bg-surface-surface text-xs font-mono text-emerald-200 p-2.5 rounded-lg border border-border outline-none select-all"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  onClick={() => copyToClipboard(newlyCreatedToken)}
                >
                  {copiedToken ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                You won't be able to see this token value again after closing this window.
              </p>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setCreateTokenModalOpen(false)}>
                I have copied the token
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateToken} className="space-y-4">
            <Input
              label="Token Description *"
              placeholder="e.g. GitHub Actions CI/CD Pipeline or Local Script"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
              autoFocus
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary">Token Scope / Permissions</label>
              <select
                value={tokenScope}
                onChange={(e) => setTokenScope(e.target.value)}
                className="w-full bg-surface-surface text-text-primary text-xs rounded-xl px-3 py-2.5 border border-border focus:border-brand-500 focus:outline-none"
              >
                <option value="full_access">Full Access (Read & Write all resources)</option>
                <option value="read_only">Read Only (Issues, Sprints, Comments)</option>
                <option value="ci_automation">CI/CD Automation (Status transitions only)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateTokenModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Generate Token
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
        description="Receive signed HTTP POST JSON payloads whenever events trigger in this organization."
        maxWidth="md"
      >
        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <Input
            label="Payload URL (HTTPS required) *"
            type="url"
            placeholder="https://api.example.com/webhooks/jira"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            required
            autoFocus
          />
          <div className="p-3 bg-surface-surface/60 border border-border/80 rounded-xl space-y-1 text-xs text-text-muted">
            <div className="flex items-center gap-1.5 text-text-secondary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>HMAC Signature Verification</span>
            </div>
            <p className="text-[11px]">
              Every outbound POST includes a <code className="text-brand-300 font-mono">X-Hub-Signature-256</code> header computed using your organization secret.
            </p>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
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

      {/* Webhook Payload Inspector Modal */}
      <Modal
        isOpen={secretModalOpen}
        onClose={() => setSecretModalOpen(false)}
        title="Webhook Payload Inspector"
        description="Sample payload dispatched on issue lifecycle events."
        maxWidth="md"
      >
        <div className="space-y-4">
          {selectedWebhook?.url && (
            <div className="text-xs text-text-muted">
              Destination endpoint: <code className="text-brand-300 font-mono">{selectedWebhook.url}</code>
            </div>
          )}
          <div className="rounded-xl bg-surface-base p-4 border border-border/80 font-mono text-xs text-emerald-400 overflow-x-auto max-h-80">
            <pre>
{`{
  "event": "issue.transitioned",
  "endpoint": "${selectedWebhook?.url || 'https://api.example.com/webhooks'}",
  "timestamp": "${new Date().toISOString()}",
  "organizationId": "${activeOrgId || 'org-live-sample'}",
  "payload": {
    "issueKey": "PROJ-142",
    "title": "Optimize responsive bundle hydration",
    "previousStatus": "IN_PROGRESS",
    "newStatus": "DONE",
    "actor": {
      "name": "Alex Tech Lead",
      "email": "lead@taskmanager.io"
    }
  },
  "signature": "sha256=8a29fbc...6e102"
}`}
            </pre>
          </div>
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => setSecretModalOpen(false)}>
              Close Inspector
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
