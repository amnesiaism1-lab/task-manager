import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderIntegrationsView(state) {
  const tokens = state.tokens || [];
  const webhooks = state.webhooks || [];

  return `
    <div class="integrations-view-container space-y-6">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">SECURITY & EXTENSIONS</p>
          <h2>API Tokens & Webhooks</h2>
        </div>
      </div>

      <p class="text-sm text-slate-400 max-w-3xl leading-relaxed">
        Connect external CI/CD pipelines, Slack bots, and developer tools using cryptographically secure API tokens and signed HTTPS webhooks.
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Panel 1: API Tokens -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <p class="eyebrow warm">Authentication</p>
              <h3 class="text-base font-bold text-white">Personal API Tokens</h3>
            </div>
            <button class="button primary btn-sm" id="btn-create-api-token">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Generate Token</span>
            </button>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            API tokens authenticate REST requests without exposing your personal password. Tokens are hashed with SHA-256 before storage.
          </p>

          <div class="space-y-2.5">
            ${tokens.length ? tokens.map(t => `
              <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    ${renderIcon('key', 'w-3.5 h-3.5 text-blue-400 shrink-0')}
                    <strong class="text-xs font-bold text-white truncate">${escapeHtml(t.name)}</strong>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400">
                    <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">${escapeHtml((t.scopes || ['read']).join(', '))}</span>
                    <span>Created ${formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <button class="button danger btn-xs btn-revoke-token" data-token-id="${t.id}">Revoke</button>
              </div>
            `).join('') : `
              <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No active API tokens. Generate one to interact with the API via CLI or scripts.
              </div>
            `}
          </div>
        </div>

        <!-- Panel 2: Webhooks -->
        <div class="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <p class="eyebrow warm">Outbound Events</p>
              <h3 class="text-base font-bold text-white">Webhook Subscriptions</h3>
            </div>
            <button class="button primary btn-sm" id="btn-create-webhook">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Add Webhook</span>
            </button>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            Webhooks dispatch HMAC-signed JSON payloads to external URLs whenever issue or project events occur.
          </p>

          <div class="space-y-2.5">
            ${webhooks.length ? webhooks.map(w => `
              <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    ${renderIcon('link', 'w-3.5 h-3.5 text-blue-400 shrink-0')}
                    <span class="text-xs font-mono text-blue-400 truncate">${escapeHtml(w.url)}</span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400">
                    <span class="badge badge-status status-${w.status === 'active' ? 'done' : 'todo'} text-[10px]">${escapeHtml(w.status || 'active')}</span>
                    <span>Events: ${escapeHtml((w.events || ['issue.*']).join(', '))}</span>
                  </div>
                </div>
                <button class="icon-button btn-delete-webhook text-slate-500 hover:text-red-400" data-webhook-id="${w.id}" title="Remove webhook">
                  ${renderIcon('trash', 'w-3.5 h-3.5')}
                </button>
              </div>
            `).join('') : `
              <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No webhooks registered. Create a subscription to stream real-time events.
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}
