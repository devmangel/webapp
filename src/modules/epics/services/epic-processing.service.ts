import { createSupabaseServerClient } from '../../../app/lib/supabase/server-client';
import type { Database } from 'types/database/schema';
import type { EpicBasicInfo, SprintMapping } from 'types/domain/import';

// Helper types
type EpicInsert = Database['public']['Tables']['epics']['Insert'];
type EpicRow = Database['public']['Tables']['epics']['Row'];

/**
 * Servicio especializado para procesar épicas
 * Responsabilidad única: crear épicas y asignarlas a sprints
 */
export class EpicProcessingService {
  private supabase = createSupabaseServerClient();

  /**
   * Procesa y crea épicas en la base de datos con asignación a sprints
   */
  async processEpics(
    epics: EpicBasicInfo[],
    projectId: string,
    sprintMappings: SprintMapping[]
  ): Promise<{
    epics?: EpicRow[];
    epicSprintMapping?: Record<string, string>; // epicId → sprintId
    error?: string;
  }> {
    try {
      if (epics.length === 0) {
        return { epics: [], epicSprintMapping: {} };
      }

      // Crear mapping de épica a sprint
      const epicToSprintMap = new Map<string, string>();
      sprintMappings.forEach(mapping => {
        epicToSprintMap.set(mapping.epicId, mapping.sprintId);
      });

      // Preparar datos de épicas para inserción
      const epicInserts: EpicInsert[] = epics.map(epic => ({
        key: epic.id,
        name: epic.title,
        objective: epic.objective || this.generateDefaultObjective(epic.title),
        project_id: projectId,
        status: 'TODO',
        health: 'ON_TRACK',
        owner_id: null, // Se puede asignar posteriormente
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insertar épicas en la base de datos
      const { data: createdEpics, error } = await this.supabase
        .from('epics')
        .insert(epicInserts)
        .select();

      if (error) {
        console.error('Error creando épicas:', error);
        return { error: `Error al crear épicas: ${error.message}` };
      }

      if (!createdEpics || createdEpics.length === 0) {
        return { error: 'No se pudieron crear las épicas' };
      }

      // Crear mapping final epicId → sprintId usando los IDs reales de la DB
      const finalEpicSprintMapping: Record<string, string> = {};
      createdEpics.forEach(epic => {
        const sprintId = epicToSprintMap.get(epic.key);
        if (sprintId) {
          finalEpicSprintMapping[epic.key] = sprintId;
        }
      });

      return {
        epics: createdEpics,
        epicSprintMapping: finalEpicSprintMapping,
      };

    } catch (error) {
      console.error('Error en processEpics:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido procesando épicas'
      };
    }
  }

  /**
   * Actualiza el estado de una épica
   */
  async updateEpicStatus(
    epicId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('epics')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', epicId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error actualizando estado de épica:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Asigna un owner a una épica
   */
  async assignEpicOwner(
    epicId: string,
    ownerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar que el usuario existe
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, active')
        .eq('id', ownerId)
        .single();

      if (userError || !user || !user.active) {
        return { success: false, error: 'Usuario no encontrado o inactivo' };
      }

      // Asignar owner a la épica
      const { error } = await this.supabase
        .from('epics')
        .update({
          owner_id: ownerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', epicId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error asignando owner a épica:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene épicas de un proyecto con sus estadísticas
   */
  async getProjectEpics(projectId: string): Promise<{
    epics: Array<EpicRow & {
      storyCount: number;
      completedStories: number;
      totalPoints: number;
      completedPoints: number;
    }>;
    error?: string;
  }> {
    try {
      // Obtener épicas básicas
      const { data: epics, error: epicsError } = await this.supabase
        .from('epics')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (epicsError) {
        return { epics: [], error: epicsError.message };
      }

      if (!epics || epics.length === 0) {
        return { epics: [] };
      }

      // Obtener estadísticas de historias por épica
      const epicsWithStats = await Promise.all(
        epics.map(async (epic) => {
          const { data: stories } = await this.supabase
            .from('issues')
            .select('status, story_points')
            .eq('epic_id', epic.id)
            .eq('type', 'STORY');

          const storyCount = stories?.length || 0;
          const completedStories = stories?.filter(s => s.status === 'DONE').length || 0;
          const totalPoints = stories?.reduce((sum, s) => sum + (s.story_points || 0), 0) || 0;
          const completedPoints = stories
            ?.filter(s => s.status === 'DONE')
            .reduce((sum, s) => sum + (s.story_points || 0), 0) || 0;

          return {
            ...epic,
            storyCount,
            completedStories,
            totalPoints,
            completedPoints,
          };
        })
      );

      return { epics: epicsWithStats };

    } catch (error) {
      console.error('Error obteniendo épicas del proyecto:', error);
      return {
        epics: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Genera objetivo por defecto para una épica sin objetivo
   */
  private generateDefaultObjective(title: string): string {
    // Limpiar título
    const cleanTitle = title
      .replace(/^(EP|EPIC|ÉPICA)[-\s]*\d*[-\s]*/i, '')
      .trim();

    return `Completar el desarrollo y entrega de: ${cleanTitle}`;
  }

  /**
   * Valida que las épicas sean válidas para procesamiento
   */
  validateEpics(epics: EpicBasicInfo[]): { 
    isValid: boolean; 
    errors: string[];
    validEpics: EpicBasicInfo[];
  } {
    const errors: string[] = [];
    const validEpics: EpicBasicInfo[] = [];

    if (epics.length === 0) {
      errors.push('No hay épicas para procesar');
      return { isValid: false, errors, validEpics };
    }

    // Verificar cada épica
    for (const epic of epics) {
      const epicErrors: string[] = [];

      // Validar ID
      if (!epic.id || epic.id.trim() === '') {
        epicErrors.push(`ID vacío o inválido`);
      } else if (epic.id.length > 50) {
        epicErrors.push(`ID demasiado largo: ${epic.id}`);
      }

      // Validar título
      if (!epic.title || epic.title.trim() === '') {
        epicErrors.push(`Título vacío`);
      } else if (epic.title.length > 200) {
        epicErrors.push(`Título demasiado largo: ${epic.title.substring(0, 50)}...`);
      }

      // Validar duración
      if (epic.estimatedWeeks < 1 || epic.estimatedWeeks > 12) {
        epicErrors.push(`Duración inválida: ${epic.estimatedWeeks} semanas`);
      }

      // Validar prioridad
      if (epic.priority != 'CRÍTICA' && epic.priority != 'ALTA' && epic.priority != 'MEDIA' && epic.priority != 'BAJA' && epic.priority != 'PENDIENTE') {
        epicErrors.push(`Prioridad inválida: ${epic.priority}`);
      }

      if (epicErrors.length === 0) {
        validEpics.push(epic);
      } else {
        errors.push(`Épica ${epic.id}: ${epicErrors.join(', ')}`);
      }
    }

    // Verificar IDs únicos entre épicas válidas
    const validIds = validEpics.map(e => e.id);
    const uniqueIds = new Set(validIds);
    if (validIds.length !== uniqueIds.size) {
      errors.push('IDs de épicas duplicados encontrados');
    }

    return {
      isValid: errors.length === 0 && validEpics.length > 0,
      errors,
      validEpics
    };
  }

  /**
   * Calcula progreso de una épica basado en sus historias
   */
  async calculateEpicProgress(epicId: string): Promise<{
    progress: number; // Porcentaje 0-100
    stats: {
      totalStories: number;
      completedStories: number;
      totalPoints: number;
      completedPoints: number;
    };
    error?: string;
  }> {
    try {
      const { data: stories, error } = await this.supabase
        .from('issues')
        .select('status, story_points')
        .eq('epic_id', epicId)
        .eq('type', 'STORY');

      if (error) {
        return {
          progress: 0,
          stats: { totalStories: 0, completedStories: 0, totalPoints: 0, completedPoints: 0 },
          error: error.message
        };
      }

      const totalStories = stories?.length || 0;
      const completedStories = stories?.filter(s => s.status === 'DONE').length || 0;
      const totalPoints = stories?.reduce((sum, s) => sum + (s.story_points || 0), 0) || 0;
      const completedPoints = stories
        ?.filter(s => s.status === 'DONE')
        .reduce((sum, s) => sum + (s.story_points || 0), 0) || 0;

      // Calcular progreso basado en puntos si hay, sino en historias
      let progress = 0;
      if (totalPoints > 0) {
        progress = Math.round((completedPoints / totalPoints) * 100);
      } else if (totalStories > 0) {
        progress = Math.round((completedStories / totalStories) * 100);
      }

      return {
        progress,
        stats: {
          totalStories,
          completedStories,
          totalPoints,
          completedPoints,
        }
      };

    } catch (error) {
      console.error('Error calculando progreso de épica:', error);
      return {
        progress: 0,
        stats: { totalStories: 0, completedStories: 0, totalPoints: 0, completedPoints: 0 },
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
