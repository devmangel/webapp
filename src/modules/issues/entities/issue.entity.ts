import { EntityStatus } from '../../../types/shared/common';
import { IssueType, IssueSubType, Priority } from './issue-types';

/**
 * Comentario de issue
 */
export interface IssueComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

/**
 * Issue principal
 */
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
