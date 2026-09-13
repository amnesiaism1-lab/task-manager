// ============================================
// Shared Enums — Task Manager
// ============================================

// --- Identity & Organization ---

export enum MemberStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum ProjectMemberStatus {
  ACTIVE = 'active',
  REMOVED = 'removed',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum SessionStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum OrgStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum UserStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
}

// --- Project ---

export enum ProjectVisibility {
  PRIVATE = 'private',
  ORG = 'org',
  PUBLIC = 'public',
}

export enum BoardType {
  KANBAN = 'kanban',
  SCRUM = 'scrum',
}

export enum SprintState {
  PLANNED = 'planned',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export enum VersionStatus {
  UNRELEASED = 'unreleased',
  RELEASED = 'released',
  ARCHIVED = 'archived',
}

// --- Workflow ---

export enum WorkflowStateCategory {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TransitionEffect {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum GuardType {
  REQUIRES_FIELDS = 'requires_fields',
  JSON_LOGIC = 'json_logic',
  DSL = 'dsl',
  CUSTOM = 'custom',
}

export enum LinkDirectionality {
  DIRECTED = 'directed',
  SYMMETRIC = 'symmetric',
}

// --- Custom Fields ---

export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  USER = 'user',
  JSON = 'json',
}

// --- Audit & Events ---

export enum OutboxStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export enum ActorType {
  MEMBER = 'member',
  SYSTEM = 'system',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
}

export enum DeliveryStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
}

// --- Background Jobs ---

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobType {
  WORKFLOW_MIGRATION = 'workflow_migration',
  BULK_ISSUE = 'bulk_issue',
  EXPORT = 'export',
  IMPORT = 'import',
  RECONCILIATION = 'reconciliation',
}

export enum RequesterType {
  MEMBER = 'member',
  SYSTEM = 'system',
}

// --- Storage ---

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  GCS = 'gcs',
  AZURE_BLOB = 'azure_blob',
}

// --- Screens ---

export enum ScreenOperation {
  CREATE = 'create',
  VIEW = 'view',
  EDIT = 'edit',
}

// --- Security Grants ---

export enum SecurityGrantType {
  MEMBER = 'member',
  GROUP = 'group',
  PROJECT_ROLE = 'project_role',
  REPORTER = 'reporter',
  ASSIGNEE = 'assignee',
}

// --- Shares ---

export enum ShareType {
  MEMBER = 'member',
  GROUP = 'group',
  PROJECT = 'project',
  ORG = 'org',
}

// --- Automation ---

export enum AutomationComponentType {
  TRIGGER = 'trigger',
  CONDITION = 'condition',
  BRANCH = 'branch',
  ACTION = 'action',
}

export enum AutomationRuleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum AutomationExecutionStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// --- Notification Scheme ---

export enum NotificationRecipientType {
  ASSIGNEE = 'assignee',
  REPORTER = 'reporter',
  WATCHERS = 'watchers',
  PROJECT_ROLE = 'project_role',
  GROUP = 'group',
  MEMBER = 'member',
}

// --- Webhook ---

export enum WebhookStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

export enum WebhookDeliveryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}
