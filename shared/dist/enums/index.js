"use strict";
// ============================================
// Shared Enums — Task Manager
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDeliveryStatus = exports.WebhookStatus = exports.NotificationRecipientType = exports.AutomationExecutionStatus = exports.AutomationRuleStatus = exports.AutomationComponentType = exports.ShareType = exports.SecurityGrantType = exports.ScreenOperation = exports.StorageProvider = exports.RequesterType = exports.JobType = exports.JobStatus = exports.DeliveryStatus = exports.NotificationChannel = exports.ActorType = exports.OutboxStatus = exports.CustomFieldType = exports.LinkDirectionality = exports.GuardType = exports.TransitionEffect = exports.WorkflowStateCategory = exports.VersionStatus = exports.SprintState = exports.BoardType = exports.ProjectVisibility = exports.UserStatus = exports.OrgStatus = exports.SessionStatus = exports.InvitationStatus = exports.ProjectMemberStatus = exports.MemberStatus = void 0;
// --- Identity & Organization ---
var MemberStatus;
(function (MemberStatus) {
    MemberStatus["INVITED"] = "invited";
    MemberStatus["ACTIVE"] = "active";
    MemberStatus["SUSPENDED"] = "suspended";
})(MemberStatus || (exports.MemberStatus = MemberStatus = {}));
var ProjectMemberStatus;
(function (ProjectMemberStatus) {
    ProjectMemberStatus["ACTIVE"] = "active";
    ProjectMemberStatus["REMOVED"] = "removed";
})(ProjectMemberStatus || (exports.ProjectMemberStatus = ProjectMemberStatus = {}));
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["ACCEPTED"] = "accepted";
    InvitationStatus["REVOKED"] = "revoked";
    InvitationStatus["EXPIRED"] = "expired";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["REVOKED"] = "revoked";
    SessionStatus["EXPIRED"] = "expired";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var OrgStatus;
(function (OrgStatus) {
    OrgStatus["ACTIVE"] = "active";
    OrgStatus["SUSPENDED"] = "suspended";
})(OrgStatus || (exports.OrgStatus = OrgStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["DEACTIVATED"] = "deactivated";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// --- Project ---
var ProjectVisibility;
(function (ProjectVisibility) {
    ProjectVisibility["PRIVATE"] = "private";
    ProjectVisibility["ORG"] = "org";
    ProjectVisibility["PUBLIC"] = "public";
})(ProjectVisibility || (exports.ProjectVisibility = ProjectVisibility = {}));
var BoardType;
(function (BoardType) {
    BoardType["KANBAN"] = "kanban";
    BoardType["SCRUM"] = "scrum";
})(BoardType || (exports.BoardType = BoardType = {}));
var SprintState;
(function (SprintState) {
    SprintState["PLANNED"] = "planned";
    SprintState["ACTIVE"] = "active";
    SprintState["CLOSED"] = "closed";
})(SprintState || (exports.SprintState = SprintState = {}));
var VersionStatus;
(function (VersionStatus) {
    VersionStatus["UNRELEASED"] = "unreleased";
    VersionStatus["RELEASED"] = "released";
    VersionStatus["ARCHIVED"] = "archived";
})(VersionStatus || (exports.VersionStatus = VersionStatus = {}));
// --- Workflow ---
var WorkflowStateCategory;
(function (WorkflowStateCategory) {
    WorkflowStateCategory["TODO"] = "todo";
    WorkflowStateCategory["IN_PROGRESS"] = "in_progress";
    WorkflowStateCategory["DONE"] = "done";
})(WorkflowStateCategory || (exports.WorkflowStateCategory = WorkflowStateCategory = {}));
var TransitionEffect;
(function (TransitionEffect) {
    TransitionEffect["ALLOW"] = "allow";
    TransitionEffect["DENY"] = "deny";
})(TransitionEffect || (exports.TransitionEffect = TransitionEffect = {}));
var GuardType;
(function (GuardType) {
    GuardType["REQUIRES_FIELDS"] = "requires_fields";
    GuardType["JSON_LOGIC"] = "json_logic";
    GuardType["DSL"] = "dsl";
    GuardType["CUSTOM"] = "custom";
})(GuardType || (exports.GuardType = GuardType = {}));
var LinkDirectionality;
(function (LinkDirectionality) {
    LinkDirectionality["DIRECTED"] = "directed";
    LinkDirectionality["SYMMETRIC"] = "symmetric";
})(LinkDirectionality || (exports.LinkDirectionality = LinkDirectionality = {}));
// --- Custom Fields ---
var CustomFieldType;
(function (CustomFieldType) {
    CustomFieldType["TEXT"] = "text";
    CustomFieldType["NUMBER"] = "number";
    CustomFieldType["DATE"] = "date";
    CustomFieldType["SELECT"] = "select";
    CustomFieldType["USER"] = "user";
    CustomFieldType["JSON"] = "json";
})(CustomFieldType || (exports.CustomFieldType = CustomFieldType = {}));
// --- Audit & Events ---
var OutboxStatus;
(function (OutboxStatus) {
    OutboxStatus["PENDING"] = "pending";
    OutboxStatus["PUBLISHED"] = "published";
    OutboxStatus["FAILED"] = "failed";
})(OutboxStatus || (exports.OutboxStatus = OutboxStatus = {}));
var ActorType;
(function (ActorType) {
    ActorType["MEMBER"] = "member";
    ActorType["SYSTEM"] = "system";
})(ActorType || (exports.ActorType = ActorType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "in_app";
    NotificationChannel["EMAIL"] = "email";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["QUEUED"] = "queued";
    DeliveryStatus["SENT"] = "sent";
    DeliveryStatus["FAILED"] = "failed";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
// --- Background Jobs ---
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["CANCELLED"] = "cancelled";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var JobType;
(function (JobType) {
    JobType["WORKFLOW_MIGRATION"] = "workflow_migration";
    JobType["BULK_ISSUE"] = "bulk_issue";
    JobType["EXPORT"] = "export";
    JobType["IMPORT"] = "import";
    JobType["RECONCILIATION"] = "reconciliation";
})(JobType || (exports.JobType = JobType = {}));
var RequesterType;
(function (RequesterType) {
    RequesterType["MEMBER"] = "member";
    RequesterType["SYSTEM"] = "system";
})(RequesterType || (exports.RequesterType = RequesterType = {}));
// --- Storage ---
var StorageProvider;
(function (StorageProvider) {
    StorageProvider["LOCAL"] = "local";
    StorageProvider["S3"] = "s3";
    StorageProvider["GCS"] = "gcs";
    StorageProvider["AZURE_BLOB"] = "azure_blob";
})(StorageProvider || (exports.StorageProvider = StorageProvider = {}));
// --- Screens ---
var ScreenOperation;
(function (ScreenOperation) {
    ScreenOperation["CREATE"] = "create";
    ScreenOperation["VIEW"] = "view";
    ScreenOperation["EDIT"] = "edit";
})(ScreenOperation || (exports.ScreenOperation = ScreenOperation = {}));
// --- Security Grants ---
var SecurityGrantType;
(function (SecurityGrantType) {
    SecurityGrantType["MEMBER"] = "member";
    SecurityGrantType["GROUP"] = "group";
    SecurityGrantType["PROJECT_ROLE"] = "project_role";
    SecurityGrantType["REPORTER"] = "reporter";
    SecurityGrantType["ASSIGNEE"] = "assignee";
})(SecurityGrantType || (exports.SecurityGrantType = SecurityGrantType = {}));
// --- Shares ---
var ShareType;
(function (ShareType) {
    ShareType["MEMBER"] = "member";
    ShareType["GROUP"] = "group";
    ShareType["PROJECT"] = "project";
    ShareType["ORG"] = "org";
})(ShareType || (exports.ShareType = ShareType = {}));
// --- Automation ---
var AutomationComponentType;
(function (AutomationComponentType) {
    AutomationComponentType["TRIGGER"] = "trigger";
    AutomationComponentType["CONDITION"] = "condition";
    AutomationComponentType["BRANCH"] = "branch";
    AutomationComponentType["ACTION"] = "action";
})(AutomationComponentType || (exports.AutomationComponentType = AutomationComponentType = {}));
var AutomationRuleStatus;
(function (AutomationRuleStatus) {
    AutomationRuleStatus["DRAFT"] = "draft";
    AutomationRuleStatus["ACTIVE"] = "active";
    AutomationRuleStatus["DISABLED"] = "disabled";
})(AutomationRuleStatus || (exports.AutomationRuleStatus = AutomationRuleStatus = {}));
var AutomationExecutionStatus;
(function (AutomationExecutionStatus) {
    AutomationExecutionStatus["RUNNING"] = "running";
    AutomationExecutionStatus["COMPLETED"] = "completed";
    AutomationExecutionStatus["FAILED"] = "failed";
})(AutomationExecutionStatus || (exports.AutomationExecutionStatus = AutomationExecutionStatus = {}));
// --- Notification Scheme ---
var NotificationRecipientType;
(function (NotificationRecipientType) {
    NotificationRecipientType["ASSIGNEE"] = "assignee";
    NotificationRecipientType["REPORTER"] = "reporter";
    NotificationRecipientType["WATCHERS"] = "watchers";
    NotificationRecipientType["PROJECT_ROLE"] = "project_role";
    NotificationRecipientType["GROUP"] = "group";
    NotificationRecipientType["MEMBER"] = "member";
})(NotificationRecipientType || (exports.NotificationRecipientType = NotificationRecipientType = {}));
// --- Webhook ---
var WebhookStatus;
(function (WebhookStatus) {
    WebhookStatus["ACTIVE"] = "active";
    WebhookStatus["PAUSED"] = "paused";
    WebhookStatus["DISABLED"] = "disabled";
})(WebhookStatus || (exports.WebhookStatus = WebhookStatus = {}));
var WebhookDeliveryStatus;
(function (WebhookDeliveryStatus) {
    WebhookDeliveryStatus["PENDING"] = "pending";
    WebhookDeliveryStatus["SUCCESS"] = "success";
    WebhookDeliveryStatus["FAILED"] = "failed";
})(WebhookDeliveryStatus || (exports.WebhookDeliveryStatus = WebhookDeliveryStatus = {}));
//# sourceMappingURL=index.js.map