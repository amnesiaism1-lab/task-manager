import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderAvatar } from '../../shared/components/badges.js';

export function renderOnboardingView(state) {
  const user = state.user || {};
  const pendingInvites = state.userPendingInvitations || [];
  const firstName = user.fullName?.split(' ')[0] || 'there';

  return `
    <div class="onboarding-container">
      <header class="onboarding-header">
        <div class="brand-logo">
          <span class="logo-mark">TM</span>
          <span class="brand-name">Task Manager Pro</span>
        </div>
        <div class="onboarding-user-nav">
          <div class="user-pill">
            ${renderAvatar(user, 'sm')}
            <span class="user-email">${escapeHtml(user.email || '')}</span>
          </div>
          <button type="button" class="button ghost btn-sm" id="btn-onboarding-signout">Sign Out</button>
        </div>
      </header>

      <main class="onboarding-main">
        <div class="onboarding-hero">
          <div class="hero-badge">WORKSPACE SETUP</div>
          <h1>Welcome to Task Manager, ${escapeHtml(firstName)}! 👋</h1>
          <p class="onboarding-subtitle">
            You don't belong to any active organization yet. Create a fresh workspace for your team or join an existing organization using an invitation.
          </p>
        </div>

        <div class="onboarding-grid">
          <!-- Card 1: Create Organization -->
          <div class="onboarding-card highlight-card">
            <div class="card-icon-bubble">🏢</div>
            <div class="card-header-group">
              <h3>Create a New Organization</h3>
              <p class="muted-small">Set up an isolated multi-tenant workspace with boards, sprints, workflows, and issue tracking.</p>
            </div>

            <form id="form-onboarding-create-org" class="onboarding-form">
              <div class="form-group">
                <label for="onboarding-org-name">Organization Name</label>
                <input
                  type="text"
                  id="onboarding-org-name"
                  name="name"
                  placeholder="e.g. Acme Technologies Inc."
                  maxlength="160"
                  required
                  class="input-clean"
                />
              </div>

              <div class="form-group">
                <label for="onboarding-org-key">Organization Key</label>
                <input
                  type="text"
                  id="onboarding-org-key"
                  name="key"
                  placeholder="e.g. ACME"
                  maxlength="32"
                  required
                  class="input-clean font-mono uppercase"
                />
                <span class="field-hint">Used as the unique tenant prefix (2-32 characters).</span>
              </div>

              <button type="submit" class="button primary full-btn" id="btn-create-org-submit">
                ✨ Create Workspace & Start
              </button>
            </form>
          </div>

          <!-- Card 2: Pending Invitations -->
          <div class="onboarding-card">
            <div class="card-icon-bubble">📬</div>
            <div class="card-header-group">
              <div class="flex items-center justify-between">
                <h3>Pending Invitations (${pendingInvites.length})</h3>
                <button type="button" class="button ghost btn-xs" id="btn-refresh-onboarding-invites" title="Refresh invitations">🔄 Refresh</button>
              </div>
              <p class="muted-small">Organizations that have invited <strong>${escapeHtml(user.email || '')}</strong> to collaborate.</p>
            </div>

            <div class="onboarding-invites-list">
              ${pendingInvites.length ? pendingInvites.map(inv => `
                <div class="invite-ticket">
                  <div class="invite-ticket-details">
                    <div class="ticket-org-name">
                      <strong>${escapeHtml(inv.orgName || 'Workspace')}</strong>
                      <span class="ticket-key-pill">${escapeHtml(inv.orgKey || '')}</span>
                    </div>
                    <div class="ticket-meta">
                      <span>Invited by <strong>${escapeHtml(inv.inviterName || 'Administrator')}</strong></span>
                      <span>· Role: <strong>${escapeHtml(inv.roleName || 'Member')}</strong></span>
                      <span>· Expires: ${formatDate(inv.expiresAt)}</span>
                    </div>
                  </div>
                  <div class="invite-ticket-actions">
                    <button
                      type="button"
                      class="button primary btn-sm btn-accept-onboarding-invite"
                      data-invitation-id="${escapeHtml(inv.id)}"
                      data-org-name="${escapeHtml(inv.orgName || '')}"
                    >
                      ✓ Accept & Join
                    </button>
                    <button
                      type="button"
                      class="button ghost btn-sm btn-decline-onboarding-invite"
                      data-invitation-id="${escapeHtml(inv.id)}"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              `).join('') : `
                <div class="empty-invites-box">
                  <span class="empty-icon">✉️</span>
                  <p>No pending invitations found for <code>${escapeHtml(user.email || '')}</code>.</p>
                  <span class="muted-small">Ask your team administrator to send an invite to your email.</span>
                </div>
              `}
            </div>
          </div>

          <!-- Card 3: Join with Invitation Code -->
          <div class="onboarding-card">
            <div class="card-icon-bubble">🔑</div>
            <div class="card-header-group">
              <h3>Join with an Invitation Code</h3>
              <p class="muted-small">Have an invitation code from an email or a colleague? Enter it below to join directly.</p>
            </div>

            <form id="form-onboarding-join-token" class="onboarding-form">
              <div class="form-group">
                <label for="onboarding-invite-token">Invitation Token / Code</label>
                <input
                  type="text"
                  id="onboarding-invite-token"
                  name="token"
                  placeholder="Paste your 32-character token here..."
                  required
                  class="input-clean font-mono"
                />
              </div>

              <button type="submit" class="button secondary full-btn">
                🤝 Redeem Code & Join Organization
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  `;
}
