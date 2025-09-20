import { z } from 'zod';
import type { Database } from '../database/schema';

// Helper types para datos entre fases del orquestador
type EpicRow = Database['public']['Tables']['epics']['Row'];
type IssueRow = Database['public']['Tables']['issues']['Row'];

// Schemas Zod para importación de backlog
export const FeedbackItemSchema = z.object({
  type: z.enum(['CRITICAL', 'VALIDATION', 'SYNTAX', 'AUTO_COMPLETION', 'MISSING_FIELD', 'SUGGESTION']),
  message: z.string(),
  location: z.string().optional(),
  suggestion: z.string().optional(),
  field: z.string().optional(),
  autoValue: z.string().optional()
});

export const CompletionSchema = z.object({
  type: z.enum(['DESCRIPTION', 'STORY_POINTS', 'CRITERIA', 'DEPENDENCIES', 'TYPE', 'PROJECT_METADATA']),
  target: z.string(),
  generated: z.union([z.string(), z.number()])
});

// Nuevos schemas para estrategia híbrida
export const ProjectMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  suggestedCode: z.string(),
  estimatedDuration: z.string().optional(), // "12 weeks", "3 months", etc.
});

export const EpicBasicInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string().optional(),
  estimatedWeeks: z.number().min(1).max(12), // Para duración del sprint
  priority: z.enum(['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'PENDIENTE']) // Para orden de sprints
});

export const ProjectAnalysisSchema = z.object({
  projectMetadata: ProjectMetadataSchema,
  epics: z.array(EpicBasicInfoSchema),
  estimatedComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  suggestedTeamSize: z.number().min(1).max(10)
});

export const EpicImportSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string().optional()
});

export const StoryImportSchema = z.object({
  id: z.string(),
  epicId: z.string(),
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  storyPoints: z.number().min(1).max(21),
  persona: z.string().optional(),
  need: z.string().optional(),
  outcome: z.string().optional()
});

export const TaskImportSchema = z.object({
  id: z.string(),
  storyId: z.string().optional(),
  epicId: z.string().optional(),
  type: z.enum(['FE', 'BE', 'OPS', 'DOCS', 'TEST']),
  title: z.string(),
  description: z.string().optional(),
  labels: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([])
});

// Schema para contenido detallado (segunda llamada IA)
export const DetailedContentSchema = z.object({
  success: z.boolean(),
  stories: z.array(StoryImportSchema),
  tasks: z.array(TaskImportSchema),
  errors: z.array(FeedbackItemSchema),
  warnings: z.array(FeedbackItemSchema),
  completions: z.array(CompletionSchema)
});

// Schema para mapping de épicas a sprints
export const SprintMappingSchema = z.object({
  epicId: z.string(),
  sprintId: z.string(),
  sprintName: z.string(),
  startDate: z.string(), // ISO date
  endDate: z.string(), // ISO date
});

// Schema para resultado de creación de proyecto
export const ProjectCreationResultSchema = z.object({
  projectId: z.string(),
  projectCode: z.string(),
  projectName: z.string()
});

// Schema para resultado de creación de sprints
export const SprintCreationResultSchema = z.object({
  sprints: z.array(SprintMappingSchema),
  totalSprints: z.number()
});

// Schema consolidado para el procesamiento completo (mantener compatibilidad)
export const AIProcessedBacklogSchema = z.object({
  success: z.boolean(),
  epics: z.array(EpicImportSchema),
  stories: z.array(StoryImportSchema),
  tasks: z.array(TaskImportSchema),
  errors: z.array(FeedbackItemSchema),
  warnings: z.array(FeedbackItemSchema),
  completions: z.array(CompletionSchema)
});

// Tipos inferidos (existentes)
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
export type Completion = z.infer<typeof CompletionSchema>;
export type EpicImport = z.infer<typeof EpicImportSchema>;
export type StoryImport = z.infer<typeof StoryImportSchema>;
export type TaskImport = z.infer<typeof TaskImportSchema>;
export type AIProcessedBacklog = z.infer<typeof AIProcessedBacklogSchema>;

// Nuevos tipos para estrategia híbrida
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type EpicBasicInfo = z.infer<typeof EpicBasicInfoSchema>;
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;
export type DetailedContent = z.infer<typeof DetailedContentSchema>;
export type SprintMapping = z.infer<typeof SprintMappingSchema>;
export type ProjectCreationResult = z.infer<typeof ProjectCreationResultSchema>;
export type SprintCreationResult = z.infer<typeof SprintCreationResultSchema>;

// Interfaces para datos internos entre fases del orquestador
export interface EpicProcessingData {
  epics: EpicRow[];
  epicSprintMapping?: Record<string, string>;
}

export interface StoryProcessingData {
  stories: IssueRow[];
}

export interface TaskProcessingData {
  tasks: IssueRow[];
}

// Interfaces actualizadas para el servicio
export interface ImportRequest {
  markdown: string;
  uploaderId: string; // Cambio: ya no necesitamos projectId hardcodeado
  assigneeId?: string; // Opcional, por defecto usar el hardcodeado
}

export interface ImportResult {
  success: boolean;
  projectId?: string; // Nuevo: ID del proyecto creado
  importId?: string;
  summary?: {
    project: string;
    sprints: number;
    epics: number;
    stories: number;
    tasks: number;
  };
  feedback?: {
    errors: FeedbackItem[];
    warnings: FeedbackItem[];
    completions: Completion[];
  };
}

// Interfaces para orquestación
export interface ImportPhaseResult {
  success: boolean;
  data?: ProjectAnalysis | ProjectCreationResult | SprintCreationResult | DetailedContent | 
         EpicProcessingData | StoryProcessingData | TaskProcessingData |
         EpicImport[] | StoryImport[] | TaskImport[];
  error?: string;
  feedback?: {
    errors: FeedbackItem[];
    warnings: FeedbackItem[];
    completions: Completion[];
  };
}

export interface FullImportResult extends ImportResult {
  phases: {
    projectAnalysis: ImportPhaseResult;
    projectCreation: ImportPhaseResult;
    sprintCreation: ImportPhaseResult;
    detailedProcessing: ImportPhaseResult;
    epicProcessing: ImportPhaseResult;
    storyProcessing: ImportPhaseResult;
    taskProcessing: ImportPhaseResult;
  };
}
