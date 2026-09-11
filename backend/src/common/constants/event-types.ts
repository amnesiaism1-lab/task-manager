export const EVENT_TYPES = {
  // --- Organization ---
  ORG_CREATED: 'org.created',
  ORG_UPDATED: 'org.updated',
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_SUSPENDED: 'member.suspended',
  MEMBER_REACTIVATED: 'member.reactivated',

  // --- Project ---
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_ARCHIVED: 'project.archived',
  PROJECT_MEMBER_ADDED: 'project.member.added',
  PROJECT_MEMBER_REMOVED: 'project.member.removed',

  // --- Issue ---
  ISSUE_CREATED: 'issue.created',
  ISSUE_UPDATED: 'issue.updated',
  ISSUE_TRANSITIONED: 'issue.transitioned',
  ISSUE_ASSIGNED: 'issue.assigned',
  ISSUE_ARCHIVED: 'issue.archived',
  ISSUE_DELETED: 'issue.deleted',
  ISSUE_RESTORED: 'issue.restored',

  // --- Collaboration ---
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
  ATTACHMENT_UPLOADED: 'attachment.uploaded',
  ATTACHMENT_DELETED: 'attachment.deleted',
  WORKLOG_CREATED: 'worklog.created',
  WORKLOG_UPDATED: 'worklog.updated',
  WORKLOG_DELETED: 'worklog.deleted',
  ISSUE_LINKED: 'issue.linked',
  ISSUE_UNLINKED: 'issue.unlinked',
  WATCHER_ADDED: 'watcher.added',

  // --- Sprint ---
  SPRINT_CREATED: 'sprint.created',
  SPRINT_STARTED: 'sprint.started',
  SPRINT_CLOSED: 'sprint.closed',
  ISSUE_ADDED_TO_SPRINT: 'issue.sprint.added',
  ISSUE_REMOVED_FROM_SPRINT: 'issue.sprint.removed',

  // --- Workflow ---
  WORKFLOW_CREATED: 'workflow.created',
  WORKFLOW_ACTIVATED: 'workflow.activated',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
