export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssueType = 'EPIC' | 'STORY' | 'TASK';
export type IssueSubType = 'FE' | 'BE' | 'OPS' | 'DOCS';

export interface IssueComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface IssueActivity {
  id: string;
  issueId: string;
  actorId: string;
  action:
    | 'status_changed'
    | 'comment_added'
    | 'assignee_changed'
    | 'points_updated'
    | 'description_updated'
    | 'label_added'
    | 'label_removed';
  from?: string;
  to?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  type: IssueType;
  subtype?: IssueSubType;
  status: IssueStatus;
  summary: string;
  description: string;
  epicId?: string;
  storyId?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  storyPoints?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  labels: string[];
  dependencies: string[];
  watchers: string[];
  blocked: boolean;
  dueDate?: string;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  createdAt: string;
  updatedAt: string;
  comments: IssueComment[];
}

export interface Epic {
  id: string;
  key: string;
  name: string;
  objective: string;
  projectId: string;
  ownerId?: string;
  status: IssueStatus;
  storyIds: string[];
  health: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  capacity: number;
  startDate: string;
  endDate: string;
  projectId: string;
  issueIds: string[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  ownerId: string;
  epicIds: string[];
  issueIds: string[];
  sprintIds: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';
  title: string;
  avatarUrl?: string;
  timezone: string;
  capacityPerSprint: number;
  skills: string[];
  active: boolean;
  focusAreas: string[];
}

export interface AssignmentRule {
  id: string;
  labelPattern: string;
  preferredRoles: ('PM' | 'CONTRIBUTOR')[];
  preferredSkills: string[];
  fallbackAssigneeId?: string;
}

export interface DashboardFilters {
  projectId: string;
  sprintId?: string;
  assigneeId?: string;
  issueType?: IssueType | 'ALL';
  labels: string[];
  searchTerm: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  scope: 'ISSUE' | 'SPRINT' | 'PROJECT' | 'RULE';
  targetId: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

export interface MarkdownImportResult {
  epics: EpicDraft[];
  stories: StoryDraft[];
  tasks: TaskDraft[];
  warnings: string[];
  errors: string[];
}

export interface EpicDraft {
  id: string;
  title: string;
  objective?: string;
}

export interface StoryDraft {
  id: string;
  epicId: string;
  persona?: string;
  need?: string;
  outcome?: string;
  acceptanceCriteria: string[];
}

export interface TaskDraft {
  id: string;
  storyId?: string;
  type: IssueSubType;
  labels: string[];
  dependencies: string[];
}

export interface AiSuggestion {
  issueId: string;
  summarySuggestion?: string;
  descriptionSuggestion?: string;
  acceptanceCriteriaSuggestion?: string[];
  definitionOfDoneSuggestion?: string[];
  suggestedStoryPoints?: number;
  suggestedDependencies?: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  mode: 'CONSERVATIVE' | 'BALANCED' | 'CREATIVE';
}

export interface DashboardStateSnapshot {
  projects: Record<string, Project>;
  epics: Record<string, Epic>;
  issues: Record<string, Issue>;
  sprints: Record<string, Sprint>;
  team: Record<string, TeamMember>;
  assignmentRules: Record<string, AssignmentRule>;
  activity: AuditLogEntry[];
}
