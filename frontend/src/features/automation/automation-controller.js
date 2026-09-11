import { store } from '../../shared/state/store.js';
import { request } from '../../shared/api/client.js';
import { showToast } from '../../shared/components/toast.js';
import { openModal, closeModal } from '../../shared/components/modal.js';

export async function loadAutomationRules() {
  const { org, token } = store.getState();
  if (!org || !token) return;

  try {
    const rules = await request(`/organizations/${org}/automation-rules`);
    store.setState({ automationRules: rules || [] });
  } catch (err) {
    console.warn('Could not load automation rules:', err.message);
  }
}

export function bindAutomationEvents() {
  document.querySelector('#btn-create-automation-rule')?.addEventListener('click', openCreateRuleModal);
  document.querySelector('#btn-create-sample-rule')?.addEventListener('click', createSampleAutomationRule);
}

export function openCreateRuleModal() {
  const contentHtml = `
    <form id="form-create-rule" class="space-y-4">
      <div>
        <label for="rule-modal-name" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Rule Name</label>
        <input id="rule-modal-name" name="name" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary" placeholder="Auto-assign on In Progress" required />
      </div>
      <div>
        <label for="rule-modal-trigger" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Trigger Event</label>
        <select id="rule-modal-trigger" name="triggerEvent" class="w-full px-3 py-2 bg-surface-hover/50 border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-brand-primary">
          <option value="ISSUE_TRANSITIONED">Issue Transitioned</option>
          <option value="ISSUE_CREATED">Issue Created</option>
          <option value="COMMENT_ADDED">Comment Added</option>
        </select>
      </div>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
        <button type="button" class="button ghost btn-modal-cancel">Cancel</button>
        <button type="submit" class="button primary">Create Rule</button>
      </div>
    </form>
  `;

  openModal({
    title: 'New Automation Rule',
    subtitle: 'Event outbox triggered workflow automation',
    contentHtml,
    size: 'small',
  });

  const form = document.querySelector('#form-create-rule');
  form?.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { org } = store.getState();

    const body = {
      name: formData.get('name'),
      definition: {
        trigger: { eventType: formData.get('triggerEvent') },
        conditions: [],
        actions: [{ actionType: 'NOTIFY_REPORTER' }],
      },
    };

    try {
      await request(`/organizations/${org}/automation-rules`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      closeModal();
      showToast('Automation rule created', 'success');
      await loadAutomationRules();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

export async function createSampleAutomationRule() {
  const { org } = store.getState();
  try {
    store.setState({ loading: true });
    await request(`/organizations/${org}/automation-rules`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Auto-notify Assignee on In Progress',
        definition: {
          trigger: { eventType: 'ISSUE_TRANSITIONED' },
          conditions: [{ field: 'state.name', op: 'eq', value: 'In Progress' }],
          actions: [{ actionType: 'SEND_NOTIFICATION', template: 'Issue transitioned to In Progress' }],
        },
      }),
    });
    showToast('Sample rule created!', 'success');
    await loadAutomationRules();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    store.setState({ loading: false });
  }
}
