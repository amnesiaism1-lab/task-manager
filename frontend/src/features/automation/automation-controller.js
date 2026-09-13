/**
 * Compatibility bridge: Legacy Automation Controller
 * Bridges calls to the modern React Zustand stores and ApiClient.
 * This ensures zero errors in IDE tabs and full backward compatibility.
 */
import { apiClient } from '../../lib/api-client';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';

export async function loadAutomationRules() {
  const org = useWorkspaceStore.getState().currentOrg;
  if (!org) return;

  try {
    const rules = await apiClient.get(`/organizations/${org.id}/automation-rules`);
    useWorkspaceStore.setState({ automationRules: rules || [] });
    return rules;
  } catch (err) {
    console.warn('Could not load automation rules:', err);
    return [];
  }
}

export function bindAutomationEvents() {
  // Bound declaratively in React AutomationView component
}

export function openCreateRuleModal() {
  useUIStore.getState().openModal('createIssue');
}

export async function createSampleAutomationRule() {
  const org = useWorkspaceStore.getState().currentOrg;
  if (!org) return;

  try {
    useUIStore.getState().setLoading(true);
    await apiClient.post(`/organizations/${org.id}/automation-rules`, {
      name: 'Auto-notify Assignee on In Progress',
      definition: {
        trigger: { eventType: 'ISSUE_TRANSITIONED' },
        conditions: [{ field: 'state.name', op: 'eq', value: 'In Progress' }],
        actions: [{ actionType: 'SEND_NOTIFICATION', template: 'Issue transitioned to In Progress' }],
      },
    });
    useUIStore.getState().showToast('Sample rule created successfully!', 'success');
    await loadAutomationRules();
  } catch (err) {
    useUIStore.getState().showToast(err instanceof Error ? err.message : 'Error creating rule', 'error');
  } finally {
    useUIStore.getState().setLoading(false);
  }
}
