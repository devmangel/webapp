/**
 * Tipos relacionados con filtros y búsquedas del dashboard
 */

import { IssueType } from '.';
import { BaseFilters } from '../shared/api';

// Filtros específicos del dashboard
export interface DashboardFilters extends BaseFilters {
  projectId: string;
  sprintId?: string;
  assigneeId?: string;
  issueType?: IssueType | 'ALL';
  labels: string[];
}

// Opciones de ordenamiento para issues
export interface IssueSortOptions {
  field: 'priority' | 'status' | 'assignee' | 'storyPoints' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

// Filtros avanzados para issues
export interface IssueAdvancedFilters {
  blocked?: boolean;
  hasStoryPoints?: boolean;
  hasDueDate?: boolean;
  hasAssignee?: boolean;
  priorityRange?: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  storyPointsRange?: {
    min?: number;
    max?: number;
  };
  dueDateRange?: {
    from?: string;
    to?: string;
  };
}

// Estado de filtros completo
export interface FilterState {
  basic: DashboardFilters;
  advanced?: IssueAdvancedFilters;
  sort?: IssueSortOptions;
}
