import { createSupabaseServerClient } from './server-client';
import type { Database } from 'types/database/schema';
import type { AIProcessedBacklog, ImportResult } from 'types/domain/dashboard/import';

// Helper types usando convenciones de Supabase
type BacklogImportInsert = Database['public']['Tables']['backlog_imports']['Insert'];
type BacklogImportUpdate = Database['public']['Tables']['backlog_imports']['Update'];
type BacklogImportRow = Database['public']['Tables']['backlog_imports']['Row'];
type EpicInsert = Database['public']['Tables']['epics']['Insert'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type EpicRow = Database['public']['Tables']['epics']['Row'];
type IssueRow = Database['public']['Tables']['issues']['Row'];

/**
 * Servicio para manejar importaciones de backlog en Supabase
 */
export class ImportService {
  private supabase = createSupabaseServerClient();

  /**
   * Valida que el proyecto y usuario existan en la base de datos
   */
  async validateProjectAndUser(projectId: string, assigneeId: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const [projectRes, userRes] = await Promise.all([
        this.supabase.from('projects').select('id').eq('id', projectId).single(),
        this.supabase.from('users').select('id').eq('id', assigneeId).single(),
      ]);

      if (projectRes.error) {
        return { isValid: false, error: 'Proyecto no encontrado' };
      }

      if (userRes.error) {
        return { isValid: false, error: 'Usuario asignado no encontrado' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validando proyecto y usuario:', error);
      return { isValid: false, error: 'Error de validación' };
    }
  }

  /**
   * Crea el registro inicial de importación
   */
  async createImportRecord(
    projectId: string,
    uploaderId: string,
    markdown: string,
    processedData: AIProcessedBacklog
  ): Promise<{ importRecord?: BacklogImportRow; error?: string }> {
    try {
      const importData: BacklogImportInsert = {
        project_id: projectId,
        uploader_id: uploaderId,
        raw_markdown: markdown,
        parsed_payload: JSON.parse(JSON.stringify(processedData)),
        status: 'processing',
        summary: `${processedData.epics.length} épicas, ${processedData.stories.length} historias, ${processedData.tasks.length} tareas`,
        created_at: new Date().toISOString(),
      };

      const { data: importRecord, error } = await this.supabase
        .from('backlog_imports')
        .insert(importData)
        .select()
        .single();

      if (error) {
        console.error('Error creando registro de importación:', error);
        return { error: 'Error al crear registro de importación' };
      }

      return { importRecord };
    } catch (error) {
      console.error('Error en createImportRecord:', error);
      return { error: 'Error interno al crear registro' };
    }
  }

  /**
   * Procesa e inserta épicas en la base de datos
   */
  async processEpics(
    processedData: AIProcessedBacklog,
    projectId: string
  ): Promise<{ epics?: EpicRow[]; error?: string }> {
    try {
      if (processedData.epics.length === 0) {
        return { epics: [] };
      }

      const epicInserts: EpicInsert[] = processedData.epics.map(epic => ({
        key: epic.id,
        name: epic.title,
        objective: epic.objective || '',
        project_id: projectId,
        status: 'TODO' as const,
        health: 'ON_TRACK' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: epics, error } = await this.supabase
        .from('epics')
        .insert(epicInserts)
        .select();

      if (error) {
        throw new Error(`Error creando épicas: ${error.message}`);
      }

      return { epics: epics || [] };
    } catch (error) {
      console.error('Error procesando épicas:', error);
      return { error: error instanceof Error ? error.message : 'Error procesando épicas' };
    }
  }

  /**
   * Procesa e inserta historias como issues en la base de datos
   */
  async processStories(
    processedData: AIProcessedBacklog,
    projectId: string,
    assigneeId: string,
    createdEpics: EpicRow[]
  ): Promise<{ stories?: IssueRow[]; error?: string }> {
    try {
      if (processedData.stories.length === 0) {
        return { stories: [] };
      }

      const storyInserts: IssueInsert[] = processedData.stories.map(story => {
        const epic = createdEpics.find(e => e.key === story.epicId);
        
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

      const { data: stories, error } = await this.supabase
        .from('issues')
        .insert(storyInserts)
        .select();

      if (error) {
        throw new Error(`Error creando historias: ${error.message}`);
      }

      return { stories: stories || [] };
    } catch (error) {
      console.error('Error procesando historias:', error);
      return { error: error instanceof Error ? error.message : 'Error procesando historias' };
    }
  }

  /**
   * Procesa e inserta tareas como issues en la base de datos
   */
  async processTasks(
    processedData: AIProcessedBacklog,
    projectId: string,
    assigneeId: string,
    createdStories: IssueRow[],
    createdEpics: EpicRow[]
  ): Promise<{ error?: string }> {
    try {
      if (processedData.tasks.length === 0) {
        return {};
      }

      const taskInserts: IssueInsert[] = processedData.tasks.map(task => {
        // Buscar historia padre primero, si no existe buscar épica
        let parentIssueId: string | undefined;
        let epicId: string | undefined;

        if (task.storyId) {
          const story = createdStories.find(s => s.key === task.storyId);
          parentIssueId = story?.id;
          epicId = story?.epic_id || undefined;
        } else if (task.epicId) {
          const epic = createdEpics.find(e => e.key === task.epicId);
          epicId = epic?.id;
        }

        return {
          key: task.id,
          type: 'TASK' as const,
          status: 'TODO' as const,
          priority: 'MEDIUM' as const,
          summary: task.title,
          description: task.description || `Tarea de ${task.type.toLowerCase()} para implementar funcionalidad.`,
          parent_issue_id: parentIssueId,
          epic_id: epicId,
          project_id: projectId,
          assignee_id: assigneeId, // Asignación automática
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

      const { error } = await this.supabase
        .from('issues')
        .insert(taskInserts);

      if (error) {
        throw new Error(`Error creando tareas: ${error.message}`);
      }

      return {};
    } catch (error) {
      console.error('Error procesando tareas:', error);
      return { error: error instanceof Error ? error.message : 'Error procesando tareas' };
    }
  }

  /**
   * Actualiza el registro de importación con el resultado final
   */
  async updateImportRecord(
    importId: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: BacklogImportUpdate = {
        status: success ? 'completed' : 'failed',
        processed_at: new Date().toISOString(),
        ...(errorMessage && { error_message: errorMessage })
      };

      await this.supabase
        .from('backlog_imports')
        .update(updateData)
        .eq('id', importId);
    } catch (error) {
      console.error('Error actualizando registro de importación:', error);
      // No lanzamos error aquí para no afectar la respuesta principal
    }
  }

  /**
   * Método principal para procesar una importación completa
   */
  async processImport(
    markdown: string,
    processedData: AIProcessedBacklog,
    projectId: string,
    assigneeId: string
  ): Promise<ImportResult> {
    // Crear registro de importación
    const { importRecord, error: importError } = await this.createImportRecord(
      projectId,
      assigneeId,
      markdown,
      processedData
    );

    if (importError || !importRecord) {
      return {
        success: false,
        feedback: {
          errors: [{
            type: 'CRITICAL',
            message: importError || 'Error al crear registro de importación'
          }],
          warnings: [],
          completions: []
        }
      };
    }

    try {
      // Procesar épicas
      const { epics, error: epicsError } = await this.processEpics(processedData, projectId);
      if (epicsError) {
        await this.updateImportRecord(importRecord.id, false, epicsError);
        return {
          success: false,
          importId: importRecord.id,
          feedback: {
            errors: [{ type: 'CRITICAL', message: epicsError }],
            warnings: processedData.warnings,
            completions: processedData.completions
          }
        };
      }

      // Procesar historias
      const { stories, error: storiesError } = await this.processStories(
        processedData,
        projectId,
        assigneeId,
        epics || []
      );
      if (storiesError) {
        await this.updateImportRecord(importRecord.id, false, storiesError);
        return {
          success: false,
          importId: importRecord.id,
          feedback: {
            errors: [{ type: 'CRITICAL', message: storiesError }],
            warnings: processedData.warnings,
            completions: processedData.completions
          }
        };
      }

      // Procesar tareas
      const { error: tasksError } = await this.processTasks(
        processedData,
        projectId,
        assigneeId,
        stories || [],
        epics || []
      );
      if (tasksError) {
        await this.updateImportRecord(importRecord.id, false, tasksError);
        return {
          success: false,
          importId: importRecord.id,
          feedback: {
            errors: [{ type: 'CRITICAL', message: tasksError }],
            warnings: processedData.warnings,
            completions: processedData.completions
          }
        };
      }

      // Éxito total
      await this.updateImportRecord(importRecord.id, true);
      
      return {
        success: true,
        importId: importRecord.id,
        summary: {
          epics: processedData.epics.length,
          stories: processedData.stories.length,
          tasks: processedData.tasks.length,
        },
        feedback: {
          errors: processedData.errors,
          warnings: processedData.warnings,
          completions: processedData.completions
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      await this.updateImportRecord(importRecord.id, false, errorMessage);
      
      return {
        success: false,
        importId: importRecord.id,
        feedback: {
          errors: [{
            type: 'CRITICAL',
            message: `Error procesando importación: ${errorMessage}`
          }],
          warnings: processedData.warnings,
          completions: processedData.completions
        }
      };
    }
  }
}
