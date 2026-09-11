import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';

export function renderIntegrationsView(state) {
  const tokens = state.tokens || [];
  const webhooks = state.webhooks || [];

  return `
    <div class="integrations-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">SECURITY & EXTENSIONS</p>
          <h2>API Tokens & Webhooks</h2>
        </div>
      </div>

      <p class="section-lead-text">
        Connect external CI/CD pipelines, Slack bots, and developer tools using cryptographically secure API tokens and signed HTTPS webhooks.
      </p>

      <div class="integrations-grid">
        <!-- Panel 1: API Tokens -->
        <div class="integration-panel">
          <div class="panel-header-row">
            <div>
              <p class="eyebrow">AUTHENTICATION</p>
              <h3>Personal API Tokens</h3>
            </div>
            <button class="button primary btn-sm" id="btn-create-api-token">+ Generate Token</button>
          </div>

          <p class="panel-desc">API tokens authenticate REST requests without exposing your personal password. Tokens are hashed with SHA-256 before storage.</p>

          <div class="tokens-list">
            ${tokens.length ? tokens.map(t => `
              <div class="token-row">
                <div class="token-info">
                  <strong>${escapeHtml(t.name)}</strong>
                  <div class="token-meta">
                    <span class="token-scopes">${escapeHtml((t.scopes || ['read']).join(', '))}</span>
                    <span class="muted-small">Created ${formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <button class="button danger btn-sm btn-revoke-token" data-token-id="${t.id}">Revoke</button>
              </div>
            `).join('') : `
              <div class="empty-hint-text">No active API tokens. Generate one to interact with the API via CLI or scripts.</div>
            `}
          </div>
        </div>

        <!-- Panel 2: Webhooks -->
        <div class="integration-panel">
          <div class="panel-header-row">
            <div>
              <p class="eyebrow">OUTBOUND EVENTS</p>
              <h3>Webhook Subscriptions</h3>
            </div>
            <button class="button primary btn-sm" id="btn-create-webhook">+ Add Webhook</button>
          </div>

          <p class="panel-desc">Webhooks dispatch HMAC-signed JSON payloads to external URLs whenever issue or project events occur.</p>

          <div class="webhooks-list">
            ${webhooks.length ? webhooks.map(w => `
              <div class="webhook-row">
                <div class="webhook-info">
                  <span class="webhook-url">🔗 ${escapeHtml(w.url)}</span>
                  <div class="webhook-meta">
                    <span class="badge badge-status status-${w.status === 'active' ? 'done' : 'todo'}">${escapeHtml(w.status || 'active')}</span>
                    <span class="muted-small">Events: ${escapeHtml((w.events || ['issue.*']).join(', '))}</span>
                  </div>
                </div>
                <button class="icon-button btn-delete-webhook" data-webhook-id="${w.id}" title="Remove webhook">×</button>
              </div>
            `).join('') : `
              <div class="empty-hint-text">No webhooks registered. Create a subscription to stream real-time events.</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}
