import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';
import { escapeHtml } from '../../shared/utils/formatters.js';

export async function loadIntegrations() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const [tokens, webhooks] = await Promise.all([
      request(`/organizations/${org}/api-tokens`).catch(() => []),
      request(`/organizations/${org}/webhooks`).catch(() => []),
    ]);
    store.setState({ tokens: tokens || [], webhooks: webhooks || [] });
  } catch (err) {
    console.warn('Could not load integrations:', err.message);
  }
}

export function bindIntegrationsEvents() {
  // Generate API token
  document.querySelector('#btn-create-api-token')?.addEventListener('click', openCreateApiTokenModal);

  // Revoke token
  document.querySelectorAll('.btn-revoke-token').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tokenId = btn.dataset.tokenId;
      const { org } = store.getState();
      if (!confirm('Are you sure you want to revoke this API token? Any client using it will immediately be rejected.')) return;

      try {
        await request(`/organizations/${org}/api-tokens/${tokenId}`, { method: 'DELETE' });
        showToast('API token revoked', 'success');
        await loadIntegrations();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Create Webhook
  document.querySelector('#btn-create-webhook')?.addEventListener('click', openCreateWebhookModal);
}

export function openCreateApiTokenModal() {
  const contentHtml = `
    <form id="form-create-token" class="space-y-4">
      <div>
        <label for="token-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Token Description</label>
        <input id="token-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. GitHub Actions CI" required />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Generate Token</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Generate API Token',
    subtitle: 'Scoped programmatic access',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-token');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org } = store.getState();

    try {
      const res = await request(`/organizations/${org}/api-tokens`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          scopes: ['read', 'write'],
        }),
      });

      closeModal();
      openModal({
        title: 'Save Your API Token',
        subtitle: 'This token will never be shown again!',
        contentHtml: `
          <div class="p-4 bg-background-base rounded-lg border border-border-default space-y-3">
            <code class="block p-2.5 bg-surface-base border border-border-default rounded font-mono text-xs text-status-warning break-all select-all">${escapeHtml(res.token || res.plainTextToken || res.secret || '')}</code>
            <div class="flex justify-end">
              <button class="button primary btn-sm" id="btn-copy-token">Copy Token</button>
            </div>
          </div>
        `,
        size: 'small',
      });

      document.querySelector('#btn-copy-token')?.addEventListener('click', () => {
        navigator.clipboard.writeText(res.token || res.plainTextToken || res.secret || '');
        showToast('Token copied to clipboard!', 'success');
      });

      await loadIntegrations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

export function openCreateWebhookModal() {
  const contentHtml = `
    <form id="form-create-hook" class="space-y-4">
      <div>
        <label for="hook-modal-url" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Payload URL (HTTPS)</label>
        <input id="hook-modal-url" name="url" type="url" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="https://api.example.com/webhook" required />
      </div>
      <div>
        <label for="hook-modal-secret" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Shared Secret</label>
        <input id="hook-modal-secret" name="secret" type="password" minlength="16" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="Min 16 characters" required />
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Subscribe</button>
      </div>
    </form>
  `;

  openModal({
    title: 'Add Webhook',
    subtitle: 'Signed outbound HTTPS callbacks',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-hook');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org } = store.getState();

    try {
      await request(`/organizations/${org}/webhooks`, {
        method: 'POST',
        body: JSON.stringify({
          url: formData.get('url'),
          secret: formData.get('secret'),
          events: ['issue.created', 'issue.transitioned', 'comment.created'],
        }),
      });

      closeModal();
      showToast('Webhook registered successfully', 'success');
      await loadIntegrations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
