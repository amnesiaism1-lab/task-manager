import { describe, expect, it } from 'vitest';

/**
 * ISTQB Automated Test Suite: Sprint & Scrum Lifecycle
 * Mapped to Test Cases: TC-SPR-001 through TC-SPR-004 in TEST_CASE_SPECIFICATION.md
 * Standards: ISTQB CTAL-TA & ISO/IEC/IEEE 29119-3
 */

interface SprintEntity {
  id: string;
  boardId: string;
  projectId: string;
  name: string;
  state: 'planned' | 'active' | 'closed';
  startAt: Date | null;
  closedAt: Date | null;
}

interface IssueItem {
  id: string;
  sprintId: string | null;
  stateCategory: 'todo' | 'in_progress' | 'done';
}

class SprintManagerMock {
  private sprints: SprintEntity[] = [];
  private issues: IssueItem[] = [];

  createSprint(boardId: string, projectId: string, name: string): SprintEntity {
    const sprint: SprintEntity = {
      id: `sprint-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      boardId,
      projectId,
      name,
      state: 'planned',
      startAt: null,
      closedAt: null,
    };
    this.sprints.push(sprint);
    return sprint;
  }

  startSprint(sprintId: string): { success: boolean; error?: string } {
    const sprint = this.sprints.find((s) => s.id === sprintId);
    if (!sprint) return { success: false, error: 'SPRINT_NOT_FOUND' };
    if (sprint.state !== 'planned') return { success: false, error: 'ONLY_PLANNED_CAN_START' };

    // INVARIANT TB-BR-02: Only one active sprint per board
    const hasActive = this.sprints.some((s) => s.boardId === sprint.boardId && s.state === 'active');
    if (hasActive) {
      return { success: false, error: 'SPRINT_ALREADY_ACTIVE' };
    }

    sprint.state = 'active';
    sprint.startAt = new Date();
    return { success: true };
  }

  closeSprint(sprintId: string, incompleteAction: 'backlog' | 'next_sprint', nextSprintId?: string): {
    closedSprint: SprintEntity;
    rolledOverCount: number;
  } {
    const sprint = this.sprints.find((s) => s.id === sprintId);
    if (!sprint || sprint.state !== 'active') throw new Error('ONLY_ACTIVE_CAN_CLOSE');

    sprint.state = 'closed';
    sprint.closedAt = new Date();

    const sprintIssues = this.issues.filter((i) => i.sprintId === sprintId);
    let rolledOverCount = 0;

    for (const issue of sprintIssues) {
      if (issue.stateCategory !== 'done') {
        rolledOverCount++;
        if (incompleteAction === 'backlog') {
          issue.sprintId = null;
        } else if (incompleteAction === 'next_sprint' && nextSprintId) {
          issue.sprintId = nextSprintId;
        }
      }
    }

    return { closedSprint: sprint, rolledOverCount };
  }

  addIssue(sprintId: string | null, stateCategory: 'todo' | 'in_progress' | 'done'): IssueItem {
    const issue: IssueItem = {
      id: `issue-${this.issues.length + 1}`,
      sprintId,
      stateCategory,
    };
    this.issues.push(issue);
    return issue;
  }
}

describe('ISTQB Sprint Lifecycle & Rules (TC-SPR-001..004)', () => {
  it('TC-SPR-001: initializes new sprint in planned state', () => {
    const manager = new SprintManagerMock();
    const sprint = manager.createSprint('board-1', 'proj-alpha', 'Sprint 1');
    expect(sprint.state).toBe('planned');
    expect(sprint.startAt).toBeNull();
    expect(sprint.closedAt).toBeNull();
  });

  it('TC-SPR-002: starts sprint successfully when no other sprint is active on board', () => {
    const manager = new SprintManagerMock();
    const sprint = manager.createSprint('board-1', 'proj-alpha', 'Sprint 1');
    const result = manager.startSprint(sprint.id);

    expect(result.success).toBe(true);
    expect(sprint.state).toBe('active');
    expect(sprint.startAt).toBeInstanceOf(Date);
  });

  it('TC-SPR-003: enforces Single Active Sprint invariant (TB-BR-02)', () => {
    const manager = new SprintManagerMock();
    const sprint1 = manager.createSprint('board-1', 'proj-alpha', 'Sprint 1');
    const sprint2 = manager.createSprint('board-1', 'proj-alpha', 'Sprint 2');

    // Start sprint 1 -> Success
    expect(manager.startSprint(sprint1.id).success).toBe(true);

    // Start sprint 2 on same board -> Must fail with SPRINT_ALREADY_ACTIVE
    const result2 = manager.startSprint(sprint2.id);
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('SPRINT_ALREADY_ACTIVE');
    expect(sprint2.state).toBe('planned');
  });

  it('TC-SPR-004: closes active sprint and rolls over incomplete issues to backlog', () => {
    const manager = new SprintManagerMock();
    const sprint = manager.createSprint('board-1', 'proj-alpha', 'Sprint 1');
    manager.startSprint(sprint.id);

    const doneIssue = manager.addIssue(sprint.id, 'done');
    const inProgressIssue = manager.addIssue(sprint.id, 'in_progress');
    const todoIssue = manager.addIssue(sprint.id, 'todo');

    const closeResult = manager.closeSprint(sprint.id, 'backlog');

    expect(closeResult.closedSprint.state).toBe('closed');
    expect(closeResult.closedSprint.closedAt).toBeInstanceOf(Date);
    expect(closeResult.rolledOverCount).toBe(2);

    // Done issue stays in sprint
    expect(doneIssue.sprintId).toBe(sprint.id);

    // Incomplete issues are moved to backlog (sprintId = null)
    expect(inProgressIssue.sprintId).toBeNull();
    expect(todoIssue.sprintId).toBeNull();
  });
});
