// ============================================================================
// Frontend Type Contracts & Shared Domain Types
// ============================================================================

export * from '@task-manager/shared';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  status?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  key: string;
  logoUrl?: string;
  createdAt?: string;
  role?: string;
}

export interface OrgMember {
  id: string;
  userId: string;
  orgId: string;
  role: string;
  status: string;
  user: User;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  orgId: string;
  description?: string;
  leadId?: string;
  lead?: User;
  createdAt?: string;
}

export interface WorkflowState {
  id: string;
  name: string;
  category: 'todo' | 'in_progress' | 'done';
  color?: string;
}

export interface WorkflowTransition {
  id: string;
  name: string;
  fromStateId?: string;
  toStateId: string;
  toState: WorkflowState;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: string;
  required?: boolean;
  options?: string[];
}

export interface CustomFieldValue {
  id?: string;
  fieldId: string;
  field?: CustomFieldDefinition;
  value: any;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  projectId: string;
  project?: Project;
  assigneeId?: string;
  assignee?: User;
  reporterId?: string;
  reporter?: User;
  boardId?: string;
  sprintId?: string;
  parentId?: string;
  parent?: { id: string; key: string; title: string };
  order: string; // LexoRank string
  storyPoints?: number;
  originalEstimateMinutes?: number;
  remainingEstimateMinutes?: number;
  loggedMinutes?: number;
  customFieldValues?: CustomFieldValue[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  status: string;
  wipLimit?: number;
}

export interface Board {
  id: string;
  name: string;
  type: 'kanban' | 'scrum';
  projectId: string;
  columns: BoardColumn[];
  createdAt?: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  state: 'planned' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  projectId: string;
  createdAt?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  author: User;
  body: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  issueId: string;
  uploaderId: string;
  uploader?: User;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

export interface Worklog {
  id: string;
  issueId: string;
  authorId: string;
  author?: User;
  timeSpentMinutes: number;
  startedAt: string;
  description?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardItem {
  id: string;
  name: string;
  description?: string;
  orgId: string;
  widgets?: any[];
  createdAt?: string;
}

export interface AutomationRuleItem {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  enabled: boolean;
  triggerType: string;
  triggerConfig?: any;
  conditions?: any[];
  actions?: any[];
  createdAt?: string;
}

export interface JobItem {
  id: string;
  type: string;
  status: string;
  payload?: any;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BootstrapResponse {
  user: User;
  activeOrgId?: string;
  activeProjectId?: string;
  organizations: Organization[];
  projects: Project[];
  members: OrgMember[];
  initialIssues: Issue[];
  unreadNotificationsCount: number;
}
