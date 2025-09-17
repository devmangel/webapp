import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from 'app/lib/supabase/server-client';
import { parseBacklogMarkdown } from 'app/components/utils/markdown-parser';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { StoryDraft } from 'types/domain/dashboard';
import type { Database } from 'types/database/schema';

// Helper types using Supabase conventions
type BacklogImportInsert = Database['public']['Tables']['backlog_imports']['Insert'];
type BacklogImportUpdate = Database['public']['Tables']['backlog_imports']['Update'];
type EpicInsert = Database['public']['Tables']['epics']['Insert'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type EpicRow = Database['public']['Tables']['epics']['Row'];
type IssueRow = Database['public']['Tables']['issues']['Row'];

interface ImportRequest {
  markdown: string;
  projectId: string;
  assigneeId: string;
}

interface AIEnhancedStory {
  id: string;
  epicId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  persona?: string;
  need?: string;
  outcome?: string;
}

// Schema Zod para structured output
const enhancedStorySchema = z.object({
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  storyPoints: z.number()
});

async function enhanceStoryWithAI(story: StoryDraft): Promise<AIEnhancedStory> {
  const prompt = `
Como Product Owner, necesito crear una historia de usuario completa y detallada basada en la siguiente información:

ID: ${story.id}
Epic ID: ${story.epicId}
Persona: ${story.persona || 'Usuario'}
Necesidad: ${story.need || 'No especificada'}
Resultado esperado: ${story.outcome || 'No especificado'}
Criterios existentes: ${story.acceptanceCriteria.join(', ') || 'Ninguno'}

Por favor genera:
1. Un título claro para la historia (formato: "Como [persona] quiero [acción] para [beneficio]")
2. Una descripción detallada de la funcionalidad
3. Criterios de aceptación específicos y medibles (3-5 criterios)
4. Estimación en story points (1, 2, 3, 5, 8)

Responde en formato JSON:
{
  "title": "título de la historia",
  "description": "descripción detallada",
  "acceptanceCriteria": ["criterio 1", "criterio 2", "criterio 3"],
  "storyPoints": 3
}
`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: enhancedStorySchema,
      schemaName: 'enhancedStory',
      schemaDescription: 'Historia de usuario enriquecida con IA',
      prompt,
      temperature: 0.1,
    });

    const enhanced = result.object;
    
    return {
      id: story.id,
      epicId: story.epicId,
      title: enhanced.title,
      description: enhanced.description,
      acceptanceCriteria: enhanced.acceptanceCriteria,
      storyPoints: enhanced.storyPoints,
      persona: story.persona,
      need: story.need,
      outcome: story.outcome,
    };
  } catch (error) {
    console.error('Error enhancing story with AI:', error);
    // Fallback to original data
    return {
      id: story.id,
      epicId: story.epicId,
      title: story.persona || `Historia ${story.id}`,
      description: `${story.need || 'Funcionalidad requerida'} para ${story.outcome || 'mejorar el sistema'}`,
      acceptanceCriteria: story.acceptanceCriteria.length > 0 ? story.acceptanceCriteria : ['Implementar funcionalidad básica'],
      storyPoints: 3, // Default
      persona: story.persona,
      need: story.need,
      outcome: story.outcome,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { markdown, projectId, assigneeId } = body;

    if (!markdown || !projectId || !assigneeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Validar que el proyecto y usuario existen
    const [projectRes, userRes] = await Promise.all([
      supabase.from('projects').select('id').eq('id', projectId).single(),
      supabase.from('users').select('id').eq('id', assigneeId).single(),
    ]);

    if (projectRes.error) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    if (userRes.error) {
      return NextResponse.json(
        { error: 'Usuario asignado no encontrado' },
        { status: 404 }
      );
    }

    // 1. Parsear markdown
    const parseResult = parseBacklogMarkdown(markdown);
    
    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Errores en el markdown', details: parseResult.errors },
        { status: 400 }
      );
    }

    // 2. Crear registro de importación
    const importData: BacklogImportInsert = {
      project_id: projectId,
      uploader_id: assigneeId,
      raw_markdown: markdown,
      parsed_payload: JSON.parse(JSON.stringify(parseResult)), // Convert to Json
      status: 'processing',
      summary: `${parseResult.epics.length} épicas, ${parseResult.stories.length} historias, ${parseResult.tasks.length} tareas`,
      created_at: new Date().toISOString(),
    };

    const { data: importRecord, error: importError } = await supabase
      .from('backlog_imports')
      .insert(importData)
      .select()
      .single();

    if (importError) {
      console.error('Error creating import record:', importError);
      return NextResponse.json(
        { error: 'Error al crear registro de importación' },
        { status: 500 }
      );
    }

    try {
      // 3. Procesar épicas
      const epicInserts: EpicInsert[] = parseResult.epics.map(epic => ({
        key: epic.id,
        name: epic.title,
        objective: epic.objective || '',
        project_id: projectId,
        status: 'TODO' as const,
        health: 'ON_TRACK' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: createdEpics, error: epicsError } = await supabase
        .from('epics')
        .insert(epicInserts)
        .select();

      if (epicsError) {
        throw new Error(`Error creando épicas: ${epicsError.message}`);
      }

      // 4. Enriquecer historias con IA
      const enhancedStories = await Promise.all(
        parseResult.stories.map(story => enhanceStoryWithAI(story))
      );

      // 5. Crear historias como issues
      const storyInserts: IssueInsert[] = enhancedStories.map(story => {
        const epic = createdEpics?.find((e: EpicRow) => e.key === story.epicId);
        return {
          key: story.id,
          type: 'STORY' as const,
          status: 'TODO' as const,
          priority: 'MEDIUM' as const,
          summary: story.title,
          description: story.description,
          epic_id: epic?.id,
          project_id: projectId,
          reporter_id: assigneeId,
          story_points: story.storyPoints,
          blocked: false,
          labels: [],
          acceptance_criteria: story.acceptanceCriteria,
          definition_of_done: ['Código implementado', 'Tests unitarios', 'Revisión de código'],
          watchers: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { data: createdStories, error: storiesError } = await supabase
        .from('issues')
        .insert(storyInserts)
        .select();

      if (storiesError) {
        throw new Error(`Error creando historias: ${storiesError.message}`);
      }

      // 6. Crear tareas como issues
      const taskInserts: IssueInsert[] = parseResult.tasks.map(task => {
        const story = createdStories?.find((s: IssueRow) => s.key === task.storyId);
        return {
          key: task.id,
          type: 'TASK' as const,
          status: 'TODO' as const,
          priority: 'MEDIUM' as const,
          summary: `${task.type} - ${task.id}`,
          description: `Tarea de ${task.type.toLowerCase()} para implementar funcionalidad.`,
          parent_issue_id: story?.id,
          project_id: projectId,
          assignee_id: assigneeId,
          reporter_id: assigneeId,
          story_points: 1,
          blocked: false,
          labels: task.labels,
          acceptance_criteria: ['Implementar funcionalidad solicitada'],
          definition_of_done: ['Código completado', 'Tests pasando'],
          watchers: [assigneeId],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: tasksError } = await supabase
        .from('issues')
        .insert(taskInserts)
        .select();

      if (tasksError) {
        throw new Error(`Error creando tareas: ${tasksError.message}`);
      }

      // 7. Actualizar registro de importación como completado
      if (importRecord) {
        const updateData: BacklogImportUpdate = {
          status: 'completed',
          processed_at: new Date().toISOString(),
        };
        
        await supabase
          .from('backlog_imports')
          .update(updateData)
          .eq('id', importRecord.id);
      }

      return NextResponse.json({
        success: true,
        importId: importRecord?.id || '',
        summary: {
          epics: parseResult.epics.length,
          stories: parseResult.stories.length,
          tasks: parseResult.tasks.length,
        },
      });

    } catch (processingError) {
      // Actualizar registro de importación con error
      if (importRecord) {
        const errorUpdateData: BacklogImportUpdate = {
          status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Error desconocido',
          processed_at: new Date().toISOString(),
        };
        
        await supabase
          .from('backlog_imports')
          .update(errorUpdateData)
          .eq('id', importRecord.id);
      }

      throw processingError;
    }

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { 
        error: 'Error procesando importación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
