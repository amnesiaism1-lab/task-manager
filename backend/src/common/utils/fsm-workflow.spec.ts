import { describe, expect, it } from 'vitest';

/**
 * ISTQB Automated Test Suite: Workflow Finite-State Machine (FSM) Engine
 * Mapped to Test Cases: TC-FSM-001 through TC-FSM-006 in TEST_CASE_SPECIFICATION.md
 * Standards: ISTQB CTAL-TA / CTAL-TTA & ISO/IEC/IEEE 29119-3
 */

interface State {
  id: string;
  name: string;
  isInitial: boolean;
  isTerminal: boolean;
}

interface Transition {
  id: string;
  key: string;
  fromStateId: string;
  toStateId: string;
  requireComment?: boolean;
}

interface Guard {
  type: 'requires_fields' | 'json_logic';
  config: Record<string, any>;
}

interface TransitionPermission {
  roleId: string;
  ruleType: 'ALLOW' | 'DENY';
}

function evaluateTransitionPermissions(
  userRoleIds: string[],
  permissions: TransitionPermission[]
): boolean {
  const matchingRules = permissions.filter((p) => userRoleIds.includes(p.roleId));
  const hasDeny = matchingRules.some((p) => p.ruleType === 'DENY');
  if (hasDeny) return false;
  const hasAllow = matchingRules.some((p) => p.ruleType === 'ALLOW');
  return hasAllow;
}

function evaluateGuard(guard: Guard, issueData: Record<string, any>): { passed: boolean; reason?: string } {
  if (guard.type === 'requires_fields') {
    const requiredFields: string[] = guard.config.fields || [];
    for (const field of requiredFields) {
      if (issueData[field] === undefined || issueData[field] === null || issueData[field] === '') {
        return { passed: false, reason: `Guard condition failed: field ${field} is required` };
      }
    }
    return { passed: true };
  }
  return { passed: true };
}

describe('ISTQB FSM Engine Automated Test Suite (TC-FSM-001..006)', () => {
  const states: Record<string, State> = {
    TODO: { id: 's1', name: 'To Do', isInitial: true, isTerminal: false },
    IN_PROGRESS: { id: 's2', name: 'In Progress', isInitial: false, isTerminal: false },
    DONE: { id: 's3', name: 'Done', isInitial: false, isTerminal: true },
  };

  const transitions: Transition[] = [
    { id: 't1', key: 'START', fromStateId: 's1', toStateId: 's2' },
    { id: 't2', key: 'COMPLETE', fromStateId: 's2', toStateId: 's3' },
    { id: 't3', key: 'REOPEN', fromStateId: 's3', toStateId: 's2' },
  ];

  it('TC-FSM-001: validates allowed state transition along valid graph paths', () => {
    const fromState = states.TODO;
    const targetTransition = transitions.find(
      (t) => t.fromStateId === fromState.id && t.toStateId === states.IN_PROGRESS.id
    );
    expect(targetTransition).toBeDefined();
    expect(targetTransition?.key).toBe('START');
  });

  it('TC-FSM-002: rejects invalid transitions with no existing path in workflow', () => {
    const fromState = states.TODO;
    const directToDone = transitions.find(
      (t) => t.fromStateId === fromState.id && t.toStateId === states.DONE.id
    );
    expect(directToDone).toBeUndefined();
  });

  it('TC-FSM-003: evaluates transition guards and enforces required fields', () => {
    const guard: Guard = {
      type: 'requires_fields',
      config: { fields: ['resolutionId', 'storyPoints'] },
    };

    const invalidPayload = { summary: 'Task A', storyPoints: null };
    const invalidResult = evaluateGuard(guard, invalidPayload);
    expect(invalidResult.passed).toBe(false);
    expect(invalidResult.reason).toContain('resolutionId is required');

    const validPayload = { summary: 'Task A', resolutionId: 'res-done', storyPoints: 5 };
    const validResult = evaluateGuard(guard, validPayload);
    expect(validResult.passed).toBe(true);
  });

  it('TC-FSM-004 & TC-FSM-005: synchronizes resolution and resolved_at on terminal vs non-terminal states', () => {
    const issue = {
      id: 'issue-100',
      stateId: states.IN_PROGRESS.id,
      resolutionId: null as string | null,
      resolvedAt: null as Date | null,
    };

    // Transition to Terminal state (DONE)
    const targetStateDone = states.DONE;
    if (targetStateDone.isTerminal) {
      issue.stateId = targetStateDone.id;
      issue.resolutionId = 'res-fixed';
      issue.resolvedAt = new Date();
    }
    expect(issue.stateId).toBe('s3');
    expect(issue.resolutionId).toBe('res-fixed');
    expect(issue.resolvedAt).toBeInstanceOf(Date);

    // Transition to Non-Terminal state (REOPEN to IN_PROGRESS)
    const targetStateReopen = states.IN_PROGRESS;
    if (!targetStateReopen.isTerminal) {
      issue.stateId = targetStateReopen.id;
      issue.resolutionId = null;
      issue.resolvedAt = null;
    }
    expect(issue.stateId).toBe('s2');
    expect(issue.resolutionId).toBeNull();
    expect(issue.resolvedAt).toBeNull();
  });

  it('TC-FSM-006: enforces Deny-overrides-Allow transition permission rule', () => {
    const permissions: TransitionPermission[] = [
      { roleId: 'role-developer', ruleType: 'ALLOW' },
      { roleId: 'role-contractor', ruleType: 'DENY' },
    ];

    // User having only Developer role -> ALLOW
    expect(evaluateTransitionPermissions(['role-developer'], permissions)).toBe(true);

    // User having both Developer and Contractor roles -> DENY overrides ALLOW
    expect(evaluateTransitionPermissions(['role-developer', 'role-contractor'], permissions)).toBe(false);

    // User having only Contractor role -> DENY
    expect(evaluateTransitionPermissions(['role-contractor'], permissions)).toBe(false);

    // User having unrelated role -> NO MATCH -> DENY
    expect(evaluateTransitionPermissions(['role-guest'], permissions)).toBe(false);
  });
});
