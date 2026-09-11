/**
 * Detect cycles in a parent-child tree (departments, issue hierarchy).
 * Per SRS BR-03/18: department parent and issue parent must not create cycles.
 */
export function detectCycle(
  nodeId: string,
  parentId: string | null,
  getParent: (id: string) => string | null,
  maxDepth = 100,
): boolean {
  if (!parentId) return false;
  if (nodeId === parentId) return true;

  let current: string | null = parentId;
  let depth = 0;

  while (current && depth < maxDepth) {
    if (current === nodeId) return true;
    current = getParent(current);
    depth++;
  }

  return false;
}

/**
 * Build a map of node -> parent for cycle detection in batch.
 */
export function buildParentMap<T extends { id: string; parentId?: string | null }>(
  nodes: T[],
): Map<string, string | null> {
  const map = new Map<string, string | null>();
  for (const node of nodes) {
    map.set(node.id, node.parentId ?? null);
  }
  return map;
}
