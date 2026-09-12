import { escapeHtml, formatDate } from '../../shared/utils/formatters.js';
import { renderIcon } from '../../shared/components/icons.js';

export function renderAutomationView(state) {
  const rules = state.automationRules || [];

  return `
    <div class="automation-view-container space-y-6">
      <div class="view-header">
        <div class="header-titles">
          <p class="eyebrow warm">WORKFLOW / NO-CODE AUTOMATION</p>
          <h2>Automation Rules & Event Triggers</h2>
        </div>
        <div class="header-actions">
          <button class="button primary" id="btn-create-automation-rule">
            ${renderIcon('plus', 'w-4 h-4')}
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      <p class="text-sm text-slate-400 max-w-3xl leading-relaxed">
        Versioned, idempotent trigger-condition-action rules driven directly by the Outbox Pattern. Never miss handoffs or state alerts.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${rules.length ? rules.map(rule => renderRuleCard(rule)).join('') : `
          <div class="col-span-2 p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-3">
              ${renderIcon('bolt', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-bold text-white mb-1">No automation rules configured yet</h3>
            <p class="text-xs text-slate-400 max-w-md mx-auto mb-5">Automate repetitive tasks like assigning issues, notifying teams on state changes, or auto-closing resolved tasks.</p>
            <button class="button primary btn-sm" id="btn-create-sample-rule">
              ${renderIcon('plus', 'w-3.5 h-3.5')}
              <span>Create Sample Automation Rule</span>
            </button>
          </div>
        `}
      </div>

      <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div class="flex items-center gap-2 text-blue-400">
          ${renderIcon('shield', 'w-4 h-4')}
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">Transactional Safety Protocol</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong class="text-slate-200 block">Idempotent Outbox Execution</strong>
            <p class="text-slate-400 leading-relaxed">Actions claim events with pessimistic locks and check idempotency keys to prevent duplicate execution during retries.</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong class="text-slate-200 block">Recursion Depth Guard</strong>
            <p class="text-slate-400 leading-relaxed">Rule engine limits cascading trigger depth to prevent infinite loops between transition triggers.</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong class="text-slate-200 block">Audit & Traceability</strong>
            <p class="text-slate-400 leading-relaxed">Every rule execution logs its component tree evaluation and actor context for strict compliance.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRuleCard(rule) {
  const isActive = rule.status === 'active';

  return `
    <div class="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 space-y-4 shadow-sm" data-rule-id="${rule.id}">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="badge ${isActive ? 'badge-status status-done' : 'badge-status status-todo'} text-[10px]">${rule.status.toUpperCase()}</span>
          <h4 class="text-sm font-bold text-white">${escapeHtml(rule.name)}</h4>
          <span class="text-[10px] font-mono text-slate-500">v${rule.version}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="button ghost btn-xs btn-execute-rule" data-rule-id="${rule.id}" title="Run rule manually">
            ${renderIcon('play', 'w-3 h-3')}
            <span>Run</span>
          </button>
          <button class="button ghost btn-xs btn-toggle-rule text-slate-400" data-rule-id="${rule.id}">
            ${isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs overflow-x-auto py-1">
        <div class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
          <span class="text-[9px] font-bold uppercase tracking-wider text-blue-400 block">WHEN</span>
          <strong class="text-slate-200 text-xs">${escapeHtml(rule.triggerType || 'Issue Created')}</strong>
        </div>
        <span class="text-slate-500 shrink-0">${renderIcon('arrowRight', 'w-3.5 h-3.5')}</span>
        <div class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
          <span class="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">IF</span>
          <strong class="text-slate-200 text-xs">${escapeHtml(rule.conditionSummary || 'All matching issues')}</strong>
        </div>
        <span class="text-slate-500 shrink-0">${renderIcon('arrowRight', 'w-3.5 h-3.5')}</span>
        <div class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
          <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block">THEN</span>
          <strong class="text-slate-200 text-xs">${escapeHtml(rule.actionSummary || 'Notify participants & update state')}</strong>
        </div>
      </div>

      <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
        Updated ${formatDate(rule.updatedAt)}
      </div>
    </div>
  `;
}
