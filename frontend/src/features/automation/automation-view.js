import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';

export function renderAutomationView(state) {
  const rules = state.automationRules || [];

  return `
    <div class="automation-view-container">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">WORKFLOW / NO-CODE AUTOMATION</p>
          <h2>Automation Rules & Event Triggers</h2>
        </div>
        <div class="header-actions">
          <button class="button primary" id="btn-create-automation-rule">
            + Create Rule
          </button>
        </div>
      </div>

      <p class="section-lead-text">
        Versioned, idempotent trigger-condition-action rules driven directly by the Outbox Pattern. Never miss handoffs or state alerts.
      </p>

      <div class="automation-rules-grid">
        ${rules.length ? rules.map(rule => renderRuleCard(rule)).join('') : `
          <div class="empty-rules-banner">
            <div class="banner-icon">⚡</div>
            <h3>No automation rules configured yet</h3>
            <p class="muted">Automate repetitive tasks like assigning issues, notifying teams on state changes, or auto-closing resolved tasks.</p>
            <button class="button primary" id="btn-create-sample-rule">+ Create Sample Automation Rule</button>
          </div>
        `}
      </div>

      <div class="automation-protocol-info">
        <h4>Transactional Safety Protocol</h4>
        <div class="protocol-grid">
          <div class="protocol-item">
            <strong>Idempotent Outbox Execution</strong>
            <p class="muted">Actions claim events with pessimistic locks and check idempotency keys to prevent duplicate execution during retries.</p>
          </div>
          <div class="protocol-item">
            <strong>Recursion Depth Guard</strong>
            <p class="muted">Rule engine limits cascading trigger depth to prevent infinite loops between transition triggers.</p>
          </div>
          <div class="protocol-item">
            <strong>Audit & Traceability</strong>
            <p class="muted">Every rule execution logs its component tree evaluation and actor context for strict compliance.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRuleCard(rule) {
  const isActive = rule.status === 'active';

  return `
    <div class="rule-card ${isActive ? 'rule-active' : 'rule-disabled'}" data-rule-id="${rule.id}">
      <div class="rule-card-top">
        <div class="rule-title-group">
          <span class="rule-badge ${isActive ? 'badge-primary' : 'badge-neutral'}">${rule.status.toUpperCase()}</span>
          <h4>${escapeHtml(rule.name)}</h4>
          <span class="rule-version">v${rule.version}</span>
        </div>
        <div class="rule-actions">
          <button class="button ghost btn-sm btn-execute-rule" data-rule-id="${rule.id}" title="Run rule manually">
            ▶ Run
          </button>
          <button class="button ghost btn-sm btn-toggle-rule" data-rule-id="${rule.id}">
            ${isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      <div class="rule-flow-diagram">
        <div class="flow-step step-trigger">
          <span class="step-tag">WHEN</span>
          <strong>${escapeHtml(rule.triggerType || 'Issue Created')}</strong>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step step-condition">
          <span class="step-tag">IF</span>
          <strong>${escapeHtml(rule.conditionSummary || 'All matching issues')}</strong>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step step-action">
          <span class="step-tag">THEN</span>
          <strong>${escapeHtml(rule.actionSummary || 'Notify participants & update state')}</strong>
        </div>
      </div>

      <div class="rule-card-footer">
        <span class="muted-small">Updated ${formatDate(rule.updatedAt)}</span>
      </div>
    </div>
  `;
}
