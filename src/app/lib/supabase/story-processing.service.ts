import { createSupabaseServerClient } from './server-client';
import type { Database } from 'types/database/schema';
import type { StoryImport } from 'types/domain/import';

// Helper types
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type IssueRow = Database['public']['Tables']['issues']['Row'];
type EpicRow = Database['public']['Tables']['epics']['Row'];

/**
 * Servicio especializado para procesar historias de usuario
 * Responsabilidad única: crear historias y vincularlas a épicas/sprints
 */
export class StoryProcessingService {
  private supabase = createSupabaseServerClient();

  /**
   * Procesa y crea historias en la base de datos
   */
  async processStories(
    stories: StoryImport[],
    projectId: string,
    createdEpics: EpicRow[],
    epicSprintMapping: Record<string, string>, // epicId → sprintId
    assigneeId: string
  ): Promise<{
    stories?: IssueRow[];
    error?: string;
  }> {
    try {
      if (stories.length === 0) {
        return { stories: [] };
      }

      // Crear mapping de epic key a epic DB ID
      const epicKeyToIdMap = new Map<string, string>();
      createdEpics.forEach(epic => {
        epicKeyToIdMap.set(epic.key, epic.id);
      });

      // Validar que todas las historias tengan épicas válidas
      const validatedStories = this.validateStoryEpics(stories, epicKeyToIdMap);
      if (validatedStories.invalidStories.length > 0) {
        console.warn('Historias con épicas inválidas:', validatedStories.invalidStories);
      }

      if (validatedStories.validStories.length === 0) {
        return { error: 'No hay historias válidas para procesar' };
      }

      // Preparar datos de historias para inserción
      const storyInserts: IssueInsert[] = validatedStories.validStories.map(story => {
        const epicDbId = epicKeyToIdMap.get(story.epicId);
        const sprintId = epicSprintMapping[story.epicId];

        return {
          key: story.id,
          type: 'STORY',
          status: 'TODO',
          priority: this.calculateStoryPriority(story.storyPoints),
          summary: story.title,
          description: story.description,
          epic_id: epicDbId,
          project_id: projectId,
          reporter_id: assigneeId,
          assignee_id: null, // Historias sin asignar inicialmente
          sprint_id: sprintId || null,
          story_points: story.storyPoints,
          blocked: false,
          labels: this.extractLabelsFromStory(story),
          acceptance_criteria: story.acceptanceCriteria || [],
          definition_of_done: this.generateDefinitionOfDone(story.storyPoints),
          watchers: [assigneeId],
          parent_issue_id: null,
          due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Insertar historias en la base de datos
      const { data: createdStories, error } = await this.supabase
        .from('issues')
        .insert(storyInserts)
        .select();

      if (error) {
        console.error('Error creando historias:', error);
        return { error: `Error al crear historias: ${error.message}` };
      }

      if (!createdStories || createdStories.length === 0) {
        return { error: 'No se pudieron crear las historias' };
      }

      return { stories: createdStories };

    } catch (error) {
      console.error('Error en processStories:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido procesando historias'
      };
    }
  }

  /**
   * Actualiza el estado de una historia
   */
  async updateStoryStatus(
    storyId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('issues')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyId)
        .eq('type', 'STORY');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error actualizando estado de historia:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Asigna una historia a un usuario
   */
  async assignStory(
    storyId: string,
    assigneeId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar que el usuario existe
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, active')
        .eq('id', assigneeId)
        .single();

      if (userError || !user || !user.active) {
        return { success: false, error: 'Usuario no encontrado o inactivo' };
      }

      // Asignar historia
      const { error } = await this.supabase
        .from('issues')
        .update({
          assignee_id: assigneeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyId)
        .eq('type', 'STORY');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error asignando historia:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Mueve una historia a un sprint diferente
   */
  async moveToSprint(
    storyId: string,
    sprintId: string | null
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Si se proporciona sprintId, verificar que existe
      if (sprintId) {
        const { data: sprint, error: sprintError } = await this.supabase
          .from('sprints')
          .select('id')
          .eq('id', sprintId)
          .single();

        if (sprintError || !sprint) {
          return { success: false, error: 'Sprint no encontrado' };
        }
      }

      // Mover historia
      const { error } = await this.supabase
        .from('issues')
        .update({
          sprint_id: sprintId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyId)
        .eq('type', 'STORY');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error moviendo historia a sprint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Calcula la prioridad de una historia basada en story points
   */
  private calculateStoryPriority(storyPoints: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (storyPoints <= 2) return 'LOW';
    if (storyPoints <= 5) return 'MEDIUM';
    if (storyPoints <= 8) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Extrae labels de una historia basado en su contenido
   */
  private extractLabelsFromStory(story: StoryImport): string[] {
    const labels: string[] = [];

    // Label basado en story points
    if (story.storyPoints <= 2) labels.push('small');
    else if (story.storyPoints <= 5) labels.push('medium');
    else if (story.storyPoints >= 8) labels.push('large');

    // Label basado en persona
    if (story.persona) {
      const cleanPersona = story.persona.toLowerCase().replace(/[^a-z]/g, '');
      labels.push(`persona-${cleanPersona}`);
    }

    // Label si tiene criterios de aceptación definidos
    if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
      labels.push('well-defined');
    }

    return labels;
  }

  /**
   * Genera definition of done basada en story points
   */
  private generateDefinitionOfDone(storyPoints: number): string[] {
    const baseDod = [
      'Funcionalidad implementada completamente',
      'Código revisado por al menos un compañero',
    ];

    // DoD más riguroso para historias grandes
    if (storyPoints >= 5) {
      baseDod.push(
        'Tests unitarios implementados',
        'Documentación actualizada',
      );
    }

    if (storyPoints >= 8) {
      baseDod.push(
        'Tests de integración implementados',
        'Validación con stakeholder completada',
      );
    }

    return baseDod;
  }

  /**
   * Valida que las historias tengan épicas válidas
   */
  private validateStoryEpics(
    stories: StoryImport[],
    epicKeyToIdMap: Map<string, string>
  ): {
    validStories: StoryImport[];
    invalidStories: Array<{ story: StoryImport; reason: string }>;
  } {
    const validStories: StoryImport[] = [];
    const invalidStories: Array<{ story: StoryImport; reason: string }> = [];

    for (const story of stories) {
      if (!story.epicId) {
        invalidStories.push({ story, reason: 'Sin épica asignada' });
        continue;
      }

      if (!epicKeyToIdMap.has(story.epicId)) {
        invalidStories.push({ story, reason: `Épica no encontrada: ${story.epicId}` });
        continue;
      }

      validStories.push(story);
    }

    return { validStories, invalidStories };
  }

  /**
   * Obtiene historias de un proyecto con estadísticas
   */
  async getProjectStories(
    projectId: string,
    filters?: {
      epicId?: string;
      sprintId?: string;
      assigneeId?: string;
      status?: string;
    }
  ): Promise<{
    stories: Array<IssueRow & {
      epicName?: string;
      sprintName?: string;
      assigneeName?: string;
      taskCount: number;
      completedTasks: number;
    }>;
    error?: string;
  }> {
    try {
      let query = this.supabase
        .from('issues')
        .select(`
          *,
          epics (name),
          sprints (name),
          users!assignee_id (name)
        `)
        .eq('project_id', projectId)
        .eq('type', 'STORY');

      // Aplicar filtros
      if (filters?.epicId) {
        query = query.eq('epic_id', filters.epicId);
      }
      if (filters?.sprintId) {
        query = query.eq('sprint_id', filters.sprintId);
      }
      if (filters?.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: stories, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { stories: [], error: error.message };
      }

      if (!stories || stories.length === 0) {
        return { stories: [] };
      }

      // Obtener estadísticas de tareas por historia
      const storiesWithStats = await Promise.all(
        stories.map(async (story) => {
          const { data: tasks } = await this.supabase
            .from('issues')
            .select('status')
            .eq('parent_issue_id', story.id)
            .eq('type', 'TASK');

          const taskCount = tasks?.length || 0;
          const completedTasks = tasks?.filter(t => t.status === 'DONE').length || 0;

          return {
            ...story,
            epicName: story.epics?.name,
            sprintName: story.sprints?.name,
            assigneeName: story.users?.name,
            taskCount,
            completedTasks,
          };
        })
      );

      return { stories: storiesWithStats };

    } catch (error) {
      console.error('Error obteniendo historias del proyecto:', error);
      return {
        stories: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Valida que las historias sean válidas para procesamiento
   */
  validateStories(stories: StoryImport[]): {
    isValid: boolean;
    errors: string[];
    validStories: StoryImport[];
  } {
    const errors: string[] = [];
    const validStories: StoryImport[] = [];

    if (stories.length === 0) {
      return { isValid: true, errors: [], validStories: [] }; // Válido tener 0 historias
    }

    for (const story of stories) {
      const storyErrors: string[] = [];

      // Validar ID
      if (!story.id || story.id.trim() === '') {
        storyErrors.push('ID vacío');
      } else if (story.id.length > 50) {
        storyErrors.push('ID demasiado largo');
      }

      // Validar título
      if (!story.title || story.title.trim() === '') {
        storyErrors.push('Título vacío');
      } else if (story.title.length > 200) {
        storyErrors.push('Título demasiado largo');
      }

      // Validar descripción
      if (!story.description || story.description.trim() === '') {
        storyErrors.push('Descripción vacía');
      }

      // Validar story points
      if (story.storyPoints < 1 || story.storyPoints > 21) {
        storyErrors.push(`Story points inválidos: ${story.storyPoints}`);
      }

      // Validar epic ID
      if (!story.epicId || story.epicId.trim() === '') {
        storyErrors.push('Sin épica asignada');
      }

      if (storyErrors.length === 0) {
        validStories.push(story);
      } else {
        errors.push(`Historia ${story.id}: ${storyErrors.join(', ')}`);
      }
    }

    // Verificar IDs únicos
    const validIds = validStories.map(s => s.id);
    const uniqueIds = new Set(validIds);
    if (validIds.length !== uniqueIds.size) {
      errors.push('IDs de historias duplicados encontrados');
    }

    return {
      isValid: errors.length === 0,
      errors,
      validStories
    };
  }
}
