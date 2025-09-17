import { z } from 'zod';

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
  type: z.enum(['DESCRIPTION', 'STORY_POINTS', 'CRITERIA', 'DEPENDENCIES', 'TYPE']),
  target: z.string(),
  generated: z.union([z.string(), z.number()])
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

export const AIProcessedBacklogSchema = z.object({
  success: z.boolean(),
  epics: z.array(EpicImportSchema),
  stories: z.array(StoryImportSchema),
  tasks: z.array(TaskImportSchema),
  errors: z.array(FeedbackItemSchema),
  warnings: z.array(FeedbackItemSchema),
  completions: z.array(CompletionSchema)
});

// Tipos inferidos
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
export type Completion = z.infer<typeof CompletionSchema>;
export type EpicImport = z.infer<typeof EpicImportSchema>;
export type StoryImport = z.infer<typeof StoryImportSchema>;
export type TaskImport = z.infer<typeof TaskImportSchema>;
export type AIProcessedBacklog = z.infer<typeof AIProcessedBacklogSchema>;

// Interfaces para el servicio
export interface ImportRequest {
  markdown: string;
  projectId: string;
  assigneeId: string;
}

export interface ImportResult {
  success: boolean;
  importId?: string;
  summary?: {
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
