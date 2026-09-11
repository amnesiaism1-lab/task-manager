export var MemberStatus;
(function (MemberStatus) {
    MemberStatus["INVITED"] = "invited";
    MemberStatus["ACTIVE"] = "active";
    MemberStatus["SUSPENDED"] = "suspended";
})(MemberStatus || (MemberStatus = {}));
export var ProjectMemberStatus;
(function (ProjectMemberStatus) {
    ProjectMemberStatus["ACTIVE"] = "active";
    ProjectMemberStatus["REMOVED"] = "removed";
})(ProjectMemberStatus || (ProjectMemberStatus = {}));
export var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["ACCEPTED"] = "accepted";
    InvitationStatus["REVOKED"] = "revoked";
    InvitationStatus["EXPIRED"] = "expired";
})(InvitationStatus || (InvitationStatus = {}));
export var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["REVOKED"] = "revoked";
    SessionStatus["EXPIRED"] = "expired";
})(SessionStatus || (SessionStatus = {}));
export var OrgStatus;
(function (OrgStatus) {
    OrgStatus["ACTIVE"] = "active";
    OrgStatus["SUSPENDED"] = "suspended";
})(OrgStatus || (OrgStatus = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["DEACTIVATED"] = "deactivated";
})(UserStatus || (UserStatus = {}));
export var ProjectVisibility;
(function (ProjectVisibility) {
    ProjectVisibility["PRIVATE"] = "private";
    ProjectVisibility["ORG"] = "org";
    ProjectVisibility["PUBLIC"] = "public";
})(ProjectVisibility || (ProjectVisibility = {}));
export var BoardType;
(function (BoardType) {
    BoardType["KANBAN"] = "kanban";
    BoardType["SCRUM"] = "scrum";
})(BoardType || (BoardType = {}));
export var SprintState;
(function (SprintState) {
    SprintState["PLANNED"] = "planned";
    SprintState["ACTIVE"] = "active";
    SprintState["CLOSED"] = "closed";
})(SprintState || (SprintState = {}));
export var VersionStatus;
(function (VersionStatus) {
    VersionStatus["UNRELEASED"] = "unreleased";
    VersionStatus["RELEASED"] = "released";
    VersionStatus["ARCHIVED"] = "archived";
})(VersionStatus || (VersionStatus = {}));
export var WorkflowStateCategory;
(function (WorkflowStateCategory) {
    WorkflowStateCategory["TODO"] = "todo";
    WorkflowStateCategory["IN_PROGRESS"] = "in_progress";
    WorkflowStateCategory["DONE"] = "done";
})(WorkflowStateCategory || (WorkflowStateCategory = {}));
export var TransitionEffect;
(function (TransitionEffect) {
    TransitionEffect["ALLOW"] = "allow";
    TransitionEffect["DENY"] = "deny";
})(TransitionEffect || (TransitionEffect = {}));
export var GuardType;
(function (GuardType) {
    GuardType["REQUIRES_FIELDS"] = "requires_fields";
    GuardType["JSON_LOGIC"] = "json_logic";
    GuardType["DSL"] = "dsl";
    GuardType["CUSTOM"] = "custom";
})(GuardType || (GuardType = {}));
export var LinkDirectionality;
(function (LinkDirectionality) {
    LinkDirectionality["DIRECTED"] = "directed";
    LinkDirectionality["SYMMETRIC"] = "symmetric";
})(LinkDirectionality || (LinkDirectionality = {}));
export var CustomFieldType;
(function (CustomFieldType) {
    CustomFieldType["TEXT"] = "text";
    CustomFieldType["NUMBER"] = "number";
    CustomFieldType["DATE"] = "date";
    CustomFieldType["SELECT"] = "select";
    CustomFieldType["USER"] = "user";
    CustomFieldType["JSON"] = "json";
})(CustomFieldType || (CustomFieldType = {}));
export var OutboxStatus;
(function (OutboxStatus) {
    OutboxStatus["PENDING"] = "pending";
    OutboxStatus["PUBLISHED"] = "published";
    OutboxStatus["FAILED"] = "failed";
})(OutboxStatus || (OutboxStatus = {}));
export var ActorType;
(function (ActorType) {
    ActorType["MEMBER"] = "member";
    ActorType["SYSTEM"] = "system";
})(ActorType || (ActorType = {}));
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "in_app";
    NotificationChannel["EMAIL"] = "email";
})(NotificationChannel || (NotificationChannel = {}));
export var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["QUEUED"] = "queued";
    DeliveryStatus["SENT"] = "sent";
    DeliveryStatus["FAILED"] = "failed";
})(DeliveryStatus || (DeliveryStatus = {}));
export var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["CANCELLED"] = "cancelled";
})(JobStatus || (JobStatus = {}));
export var JobType;
(function (JobType) {
    JobType["WORKFLOW_MIGRATION"] = "workflow_migration";
    JobType["BULK_ISSUE"] = "bulk_issue";
    JobType["EXPORT"] = "export";
    JobType["IMPORT"] = "import";
    JobType["RECONCILIATION"] = "reconciliation";
})(JobType || (JobType = {}));
export var RequesterType;
(function (RequesterType) {
    RequesterType["MEMBER"] = "member";
    RequesterType["SYSTEM"] = "system";
})(RequesterType || (RequesterType = {}));
export var StorageProvider;
(function (StorageProvider) {
    StorageProvider["LOCAL"] = "local";
    StorageProvider["S3"] = "s3";
    StorageProvider["GCS"] = "gcs";
    StorageProvider["AZURE_BLOB"] = "azure_blob";
})(StorageProvider || (StorageProvider = {}));
export var ScreenOperation;
(function (ScreenOperation) {
    ScreenOperation["CREATE"] = "create";
    ScreenOperation["VIEW"] = "view";
    ScreenOperation["EDIT"] = "edit";
})(ScreenOperation || (ScreenOperation = {}));
export var SecurityGrantType;
(function (SecurityGrantType) {
    SecurityGrantType["MEMBER"] = "member";
    SecurityGrantType["GROUP"] = "group";
    SecurityGrantType["PROJECT_ROLE"] = "project_role";
    SecurityGrantType["REPORTER"] = "reporter";
    SecurityGrantType["ASSIGNEE"] = "assignee";
})(SecurityGrantType || (SecurityGrantType = {}));
export var ShareType;
(function (ShareType) {
    ShareType["MEMBER"] = "member";
    ShareType["GROUP"] = "group";
    ShareType["PROJECT"] = "project";
    ShareType["ORG"] = "org";
})(ShareType || (ShareType = {}));
export var AutomationComponentType;
(function (AutomationComponentType) {
    AutomationComponentType["TRIGGER"] = "trigger";
    AutomationComponentType["CONDITION"] = "condition";
    AutomationComponentType["BRANCH"] = "branch";
    AutomationComponentType["ACTION"] = "action";
})(AutomationComponentType || (AutomationComponentType = {}));
export var AutomationRuleStatus;
(function (AutomationRuleStatus) {
    AutomationRuleStatus["DRAFT"] = "draft";
    AutomationRuleStatus["ACTIVE"] = "active";
    AutomationRuleStatus["DISABLED"] = "disabled";
})(AutomationRuleStatus || (AutomationRuleStatus = {}));
export var AutomationExecutionStatus;
(function (AutomationExecutionStatus) {
    AutomationExecutionStatus["RUNNING"] = "running";
    AutomationExecutionStatus["COMPLETED"] = "completed";
    AutomationExecutionStatus["FAILED"] = "failed";
})(AutomationExecutionStatus || (AutomationExecutionStatus = {}));
export var NotificationRecipientType;
(function (NotificationRecipientType) {
    NotificationRecipientType["ASSIGNEE"] = "assignee";
    NotificationRecipientType["REPORTER"] = "reporter";
    NotificationRecipientType["WATCHERS"] = "watchers";
    NotificationRecipientType["PROJECT_ROLE"] = "project_role";
    NotificationRecipientType["GROUP"] = "group";
    NotificationRecipientType["MEMBER"] = "member";
})(NotificationRecipientType || (NotificationRecipientType = {}));
export var WebhookStatus;
(function (WebhookStatus) {
    WebhookStatus["ACTIVE"] = "active";
    WebhookStatus["PAUSED"] = "paused";
    WebhookStatus["DISABLED"] = "disabled";
})(WebhookStatus || (WebhookStatus = {}));
export var WebhookDeliveryStatus;
(function (WebhookDeliveryStatus) {
    WebhookDeliveryStatus["PENDING"] = "pending";
    WebhookDeliveryStatus["SUCCESS"] = "success";
    WebhookDeliveryStatus["FAILED"] = "failed";
})(WebhookDeliveryStatus || (WebhookDeliveryStatus = {}));
//# sourceMappingURL=index.js.map