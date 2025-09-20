/**
 * Tipos relacionados con flujos de trabajo, importación, IA y actividad del dashboard
 */

import {
  ActivityAction,
  AuditScope,
  ConfidenceLevel,
  AiMode,
  IssueSubType,
  Epic,
  Issue,
  Sprint,
  Project,
  TeamMember,
  AssignmentRule,
} from '.';

// Actividad de issue
export interface IssueActivity {
  id: string;
  issueId: string;
  actorId: string;
  action: ActivityAction;
  from?: string;
  to?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// Entrada de log de auditoría
export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  scope: AuditScope;
  targetId: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

// Resultados de importación de markdown
export interface MarkdownImportResult {
  epics: EpicDraft[];
  stories: StoryDraft[];
  tasks: TaskDraft[];
  warnings: string[];
  errors: string[];
}

// Draft de epic durante importación
export interface EpicDraft {
  id: string;
  title: string;
  objective?: string;
}

// Draft de story durante importación
export interface StoryDraft {
  id: string;
  epicId: string;
  persona?: string;
  need?: string;
  outcome?: string;
  acceptanceCriteria: string[];
}

// Draft de task durante importación
export interface TaskDraft {
  id: string;
  storyId?: string;
  type: IssueSubType;
  labels: string[];
  dependencies: string[];
}

// Sugerencia de IA para issues
export interface AiSuggestion {
  issueId: string;
  summarySuggestion?: string;
  descriptionSuggestion?: string;
  acceptanceCriteriaSuggestion?: string[];
  definitionOfDoneSuggestion?: string[];
  suggestedStoryPoints?: number;
  suggestedDependencies?: string[];
  confidence: ConfidenceLevel;
  mode: AiMode;
}

// Snapshot completo del estado del dashboard
export interface DashboardStateSnapshot {
  projects: Record<string, Project>;
  epics: Record<string, Epic>;
  issues: Record<string, Issue>;
  sprints: Record<string, Sprint>;
  team: Record<string, TeamMember>;
  assignmentRules: Record<string, AssignmentRule>;
  activity: AuditLogEntry[];
}

// Estado de progreso para operaciones largas
export interface WorkflowProgress {
  id: string;
  type: 'import' | 'export' | 'ai_analysis' | 'bulk_update';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
