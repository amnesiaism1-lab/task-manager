/**
 * Compatibility bridge: Legacy Search Controller
 * Bridges search actions to modern React Zustand stores and ApiClient.
 * This ensures zero errors in IDE tabs and full backward compatibility.
 */
import { apiClient } from '../../lib/api-client';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';

export async function loadFilters() {
  const org = useWorkspaceStore.getState().currentOrg;
  if (!org) return [];

  try {
    const filters = await apiClient.get(`/organizations/${org.id}/filters`);
    useWorkspaceStore.setState({ filters: filters || [] });
    return filters;
  } catch (err) {
    console.warn('Could not load filters:', err);
    return [];
  }
}

export function bindSearchEvents() {
  // Handled declaratively in React SearchView component
}

export function openSaveFilterModal(queryText) {
  // Can be called from React UI or tests
  const org = useWorkspaceStore.getState().currentOrg;
  if (!org) return;

  apiClient.post(`/organizations/${org.id}/filters`, {
    name: `Filter: ${queryText || 'Custom'}`,
    queryText: JSON.stringify({ field: 'q', op: 'contains', value: queryText || '' }),
  }).then(() => {
    useUIStore.getState().showToast('Filter saved successfully', 'success');
    loadFilters();
  }).catch((err) => {
    useUIStore.getState().showToast(err instanceof Error ? err.message : 'Error saving filter', 'error');
  });
}
