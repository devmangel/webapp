/**
 * Entidades principales del dominio dashboard
 */

import { 
  EntityStatus, 
  IssueType, 
  IssueSubType, 
  Priority, 
  HealthStatus, 
  SprintStatus, 
  UserRole 
} from '../../shared/common';

// Comentario de issue
export interface IssueComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

// Issue principal
export interface Issue {
  id: string;
  key: string;
  title: string;
  type: IssueType;
  subtype?: IssueSubType;
  status: EntityStatus;
  summary: string;
  description: string;
  epicId?: string;
  storyId?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  storyPoints?: number;
  priority: Priority;
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

// Epic
export interface Epic {
  id: string;
  key: string;
  name: string;
  objective: string;
  projectId: string;
  ownerId?: string;
  status: EntityStatus;
  storyIds: string[];
  health: HealthStatus;
}

// Sprint
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: SprintStatus;
  capacity: number;
  startDate: string;
  endDate: string;
  projectId: string;
  issueIds: string[];
}

// Proyecto
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

// Miembro del equipo
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  timezone: string;
  capacityPerSprint: number;
  skills: string[];
  active: boolean;
  focusAreas: string[];
}

// Regla de asignación
export interface AssignmentRule {
  id: string;
  labelPattern: string;
  preferredRoles: ('PM' | 'CONTRIBUTOR')[];
  preferredSkills: string[];
  fallbackAssigneeId?: string;
}
