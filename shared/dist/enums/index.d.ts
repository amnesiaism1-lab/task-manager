export declare enum MemberStatus {
    INVITED = "invited",
    ACTIVE = "active",
    SUSPENDED = "suspended"
}
export declare enum ProjectMemberStatus {
    ACTIVE = "active",
    REMOVED = "removed"
}
export declare enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REVOKED = "revoked",
    EXPIRED = "expired"
}
export declare enum SessionStatus {
    ACTIVE = "active",
    REVOKED = "revoked",
    EXPIRED = "expired"
}
export declare enum OrgStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended"
}
export declare enum UserStatus {
    ACTIVE = "active",
    DEACTIVATED = "deactivated"
}
export declare enum ProjectVisibility {
    PRIVATE = "private",
    ORG = "org",
    PUBLIC = "public"
}
export declare enum BoardType {
    KANBAN = "kanban",
    SCRUM = "scrum"
}
export declare enum SprintState {
    PLANNED = "planned",
    ACTIVE = "active",
    CLOSED = "closed"
}
export declare enum VersionStatus {
    UNRELEASED = "unreleased",
    RELEASED = "released",
    ARCHIVED = "archived"
}
export declare enum WorkflowStateCategory {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    DONE = "done"
}
export declare enum TransitionEffect {
    ALLOW = "allow",
    DENY = "deny"
}
export declare enum GuardType {
    REQUIRES_FIELDS = "requires_fields",
    JSON_LOGIC = "json_logic",
    DSL = "dsl",
    CUSTOM = "custom"
}
export declare enum LinkDirectionality {
    DIRECTED = "directed",
    SYMMETRIC = "symmetric"
}
export declare enum CustomFieldType {
    TEXT = "text",
    NUMBER = "number",
    DATE = "date",
    SELECT = "select",
    USER = "user",
    JSON = "json"
}
export declare enum OutboxStatus {
    PENDING = "pending",
    PUBLISHED = "published",
    FAILED = "failed"
}
export declare enum ActorType {
    MEMBER = "member",
    SYSTEM = "system"
}
export declare enum NotificationChannel {
    IN_APP = "in_app",
    EMAIL = "email"
}
export declare enum DeliveryStatus {
    QUEUED = "queued",
    SENT = "sent",
    FAILED = "failed"
}
export declare enum JobStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum JobType {
    WORKFLOW_MIGRATION = "workflow_migration",
    BULK_ISSUE = "bulk_issue",
    EXPORT = "export",
    IMPORT = "import",
    RECONCILIATION = "reconciliation"
}
export declare enum RequesterType {
    MEMBER = "member",
    SYSTEM = "system"
}
export declare enum StorageProvider {
    LOCAL = "local",
    S3 = "s3",
    GCS = "gcs",
    AZURE_BLOB = "azure_blob"
}
export declare enum ScreenOperation {
    CREATE = "create",
    VIEW = "view",
    EDIT = "edit"
}
export declare enum SecurityGrantType {
    MEMBER = "member",
    GROUP = "group",
    PROJECT_ROLE = "project_role",
    REPORTER = "reporter",
    ASSIGNEE = "assignee"
}
export declare enum ShareType {
    MEMBER = "member",
    GROUP = "group",
    PROJECT = "project",
    ORG = "org"
}
export declare enum AutomationComponentType {
    TRIGGER = "trigger",
    CONDITION = "condition",
    BRANCH = "branch",
    ACTION = "action"
}
export declare enum AutomationRuleStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    DISABLED = "disabled"
}
export declare enum AutomationExecutionStatus {
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum NotificationRecipientType {
    ASSIGNEE = "assignee",
    REPORTER = "reporter",
    WATCHERS = "watchers",
    PROJECT_ROLE = "project_role",
    GROUP = "group",
    MEMBER = "member"
}
export declare enum WebhookStatus {
    ACTIVE = "active",
    PAUSED = "paused",
    DISABLED = "disabled"
}
export declare enum WebhookDeliveryStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed"
}
//# sourceMappingURL=index.d.ts.map