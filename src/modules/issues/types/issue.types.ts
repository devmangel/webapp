/**
 * Tipos relacionados con issues
 */

export type IssueType = 'EPIC' | 'STORY' | 'TASK';
export type IssueSubType = 'FE' | 'BE' | 'OPS' | 'DOCS'; // FrontEnd, BackEnd, Operations, Docs
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Issue {
  id: string;
  project_id: string;
  epic_id?: string;
  parent_issue_id?: string;
  key: string;
  type: IssueType;
  status: string;
  priority: Priority;
  summary: string;
  description?: string;
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string;
  story_points?: number;
  blocked: boolean;
  labels?: string[];
  definition_of_done?: string[];
  acceptance_criteria?: string[];
  watchers?: string[];
  due_date?: string;
  created_at: string;
  updated_at: string;

  // Relaciones populadas (opcional)
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

export const ISSUE_TYPE_PREFIXES = {
  EPIC: 'EP',
  STORY: 'ST',
  TASK: '' // Para tasks se usa el subtype como prefijo (FE, BE, OPS, DOCS)
} as const;

export const ISSUE_SUBTYPE_LABELS = {
  FE: 'Frontend',
  BE: 'Backend', 
  OPS: 'Operations',
  DOCS: 'Documentation'
} as const;

export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
} as const;

export const PRIORITY_COLORS = {
  LOW: '#4CAF50',      // Verde
  MEDIUM: '#FF9800',   // Naranja  
  HIGH: '#F44336',     // Rojo
  CRITICAL: '#9C27B0'  // Púrpura
} as const;

// Función para generar keys de issues
export function generateIssueKey(type: IssueType, subType?: IssueSubType, number?: number): string {
  switch (type) {
    case 'EPIC':
      return `EP-${number || 1}`;
    case 'STORY':
      return `ST-${number || 1}.1`;
    case 'TASK':
      return `${subType || 'FE'}-${number || 1}`;
    default:
      return `TASK-${number || 1}`;
  }
}

// Validación de patrones de keys
export const ISSUE_KEY_PATTERNS = {
  EPIC: /^EP-\d+$/,
  STORY: /^ST-\d+\.\d+$/,
  TASK: /^(FE|BE|OPS|DOCS)-\d+$/
} as const;
