import { createSupabaseServerClient } from '../../../app/lib/supabase/server-client';
import type { Database } from 'types/database/schema';
import type { EpicBasicInfo, SprintCreationResult, SprintMapping } from 'types/domain/import';

// Helper types
type SprintInsert = Database['public']['Tables']['sprints']['Insert'];

/**
 * Servicio para generar sprints automáticamente basados en épicas
 * Estrategia: 1 sprint por épica (Opción A)
 */
export class SprintGenerationService {
  private supabase = createSupabaseServerClient();

  /**
   * Genera sprints basados en épicas usando estrategia "1 sprint por épica"
   */
  async generateSprintsFromEpics(
    projectId: string,
    epics: EpicBasicInfo[]
  ): Promise<{ result?: SprintCreationResult; error?: string }> {
    try {
      if (epics.length === 0) {
        return {
          result: {
            sprints: [],
            totalSprints: 0
          }
        };
      }

      // Ordenar épicas por prioridad textual
      const sortedEpics = [...epics].sort((a, b) => this.comparePriorities(a.priority, b.priority));
      
      // Generar fechas secuenciales para sprints
      const sprintDates = this.generateSprintDates(sortedEpics);
      
      // Preparar datos de sprints
      const sprintInserts: SprintInsert[] = sortedEpics.map((epic, index) => {
        const dates = sprintDates[index];
        
        return {
          name: this.generateSprintName(epic, index + 1),
          project_id: projectId,
          start_date: dates.startDate,
          end_date: dates.endDate,
          status: index === 0 ? 'PLANNED' : 'DRAFT', // Primer sprint planeado, resto en draft
          goal: this.generateSprintGoal(epic),
          capacity: this.estimateSprintCapacity(epic),
          velocity_snapshot: null, // Se calculará después
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Insertar sprints en la base de datos
      const { data: createdSprints, error } = await this.supabase
        .from('sprints')
        .insert(sprintInserts)
        .select();

      if (error) {
        console.error('Error creando sprints:', error);
        return { error: `Error al crear sprints: ${error.message}` };
      }

      if (!createdSprints || createdSprints.length === 0) {
        return { error: 'No se pudieron crear los sprints' };
      }

      // Crear mappings épica → sprint
      const sprintMappings: SprintMapping[] = sortedEpics.map((epic, index) => {
        const sprint = createdSprints[index];
        const dates = sprintDates[index];
        
        return {
          epicId: epic.id,
          sprintId: sprint.id,
          sprintName: sprint.name,
          startDate: dates.startDate,
          endDate: dates.endDate,
        };
      });

      return {
        result: {
          sprints: sprintMappings,
          totalSprints: createdSprints.length
        }
      };

    } catch (error) {
      console.error('Error en generateSprintsFromEpics:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido generando sprints'
      };
    }
  }

  /**
   * Compara prioridades textuales para ordenamiento
   */
  private comparePriorities(a: string, b: string): number {
    const priorityOrder = {
      'CRÍTICA': 1,
      'ALTA': 2,
      'MEDIA': 3,
      'BAJA': 4,
      'PENDIENTE': 5
    };
    
    const orderA = priorityOrder[a as keyof typeof priorityOrder] || 6;
    const orderB = priorityOrder[b as keyof typeof priorityOrder] || 6;
    
    return orderA - orderB;
  }

  /**
   * Genera fechas secuenciales para los sprints
   */
  private generateSprintDates(epics: EpicBasicInfo[]): Array<{
    startDate: string;
    endDate: string;
  }> {
    const dates: Array<{ startDate: string; endDate: string }> = [];
    
    // Comenzar el lunes siguiente
    const startDate = this.getNextMonday();
    let currentDate = new Date(startDate);

    for (const epic of epics) {
      const sprintStart = new Date(currentDate);
      
      // Calcular duración del sprint (épica.estimatedWeeks, mínimo 2 semanas)
      const sprintWeeks = Math.max(2, Math.min(epic.estimatedWeeks, 4)); // Entre 2-4 semanas
      const sprintEnd = new Date(sprintStart);
      sprintEnd.setDate(sprintEnd.getDate() + (sprintWeeks * 7) - 1); // -1 para terminar el viernes
      
      dates.push({
        startDate: sprintStart.toISOString().split('T')[0], // YYYY-MM-DD
        endDate: sprintEnd.toISOString().split('T')[0],
      });

      // Siguiente sprint empieza el lunes siguiente al fin del anterior
      currentDate = new Date(sprintEnd);
      currentDate.setDate(currentDate.getDate() + 3); // Viernes + 3 días = Lunes
    }

    return dates;
  }

  /**
   * Obtiene el próximo lunes como fecha de inicio
   */
  private getNextMonday(): Date {
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7; // Si es domingo = 7, si es lunes = 7
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0); // Inicio del día
    
    return nextMonday;
  }

  /**
   * Genera nombre descriptivo para el sprint
   */
  private generateSprintName(epic: EpicBasicInfo, sprintNumber: number): string {
    // Limpiar título de la épica
    const cleanTitle = epic.title
      .replace(/^(EP|EPIC|ÉPICA)[-\s]*\d*[-\s]*/i, '') // Remover prefijos
      .replace(/[^\w\s]/g, '') // Remover caracteres especiales
      .trim()
      .substring(0, 30); // Máximo 30 caracteres

    return `Sprint ${sprintNumber}: ${cleanTitle}`;
  }

  /**
   * Genera objetivo del sprint basado en la épica
   */
  private generateSprintGoal(epic: EpicBasicInfo): string {
    if (epic.objective) {
      return epic.objective.length > 200 
        ? epic.objective.substring(0, 200) + '...'
        : epic.objective;
    }

    return `Completar desarrollo de: ${epic.title}`;
  }

  /**
   * Estima la capacidad del sprint basada en la épica
   */
  private estimateSprintCapacity(epic: EpicBasicInfo): number {
    // Capacidad base por semanas estimadas
    const baseCapacity = epic.estimatedWeeks * 20; // 20 puntos por semana
    
    // Ajustar por prioridad textual
    const priorityMultiplier = this.getPriorityMultiplier(epic.priority);
    
    return Math.round(baseCapacity * priorityMultiplier);
  }

  /**
   * Obtiene multiplicador de capacidad basado en prioridad textual
   */
  private getPriorityMultiplier(priority: string): number {
    switch (priority) {
      case 'CRÍTICA':
        return 1.3; // +30% más capacidad
      case 'ALTA':
        return 1.1; // +10% más capacidad
      case 'MEDIA':
        return 1.0; // Capacidad normal
      case 'BAJA':
        return 0.9; // -10% capacidad
      case 'PENDIENTE':
        return 0.8; // -20% capacidad
      default:
        return 1.0;
    }
  }

  /**
   * Obtiene el mapping de épicas a sprints para un proyecto
   */
  async getEpicSprintMapping(projectId: string): Promise<{
    mapping: Record<string, string>; // epicId → sprintId
    error?: string;
  }> {
    try {
      const { error } = await this.supabase
        .from('sprints')
        .select(`
          id,
          name,
          epics (
            id,
            key
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        return { mapping: {}, error: error.message };
      }

      // Por ahora, crear mapping simple basado en orden
      // En el futuro se puede mejorar con una tabla de relación
      const mapping: Record<string, string> = {};
      
      // Implementación simple: asumir que el orden de sprints corresponde al orden de épicas
      // Esto se mejorará cuando se implemente la tabla de relación epic_sprint_assignments
      
      return { mapping };

    } catch (error) {
      console.error('Error obteniendo mapping épica-sprint:', error);
      return { 
        mapping: {}, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza las fechas de un sprint
   */
  async updateSprintDates(
    sprintId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('sprints')
        .update({
          start_date: startDate,
          end_date: endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sprintId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error actualizando fechas de sprint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Valida que las épicas sean válidas para generar sprints
   */
  validateEpics(epics: EpicBasicInfo[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (epics.length === 0) {
      errors.push('No hay épicas para generar sprints');
      return { isValid: false, errors };
    }

    // Verificar que todas las épicas tengan datos requeridos
    for (const epic of epics) {
      if (!epic.id || epic.id.trim() === '') {
        errors.push(`Épica sin ID válido: ${epic.title}`);
      }

      if (!epic.title || epic.title.trim() === '') {
        errors.push(`Épica sin título: ${epic.id}`);
      }

      if (epic.estimatedWeeks < 1 || epic.estimatedWeeks > 12) {
        errors.push(`Duración inválida para épica ${epic.id}: ${epic.estimatedWeeks} semanas`);
      }

      const validPriorities = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'PENDIENTE'];
      if (!validPriorities.includes(epic.priority)) {
        errors.push(`Prioridad inválida para épica ${epic.id}: ${epic.priority}. Debe ser una de: ${validPriorities.join(', ')}`);
      }
    }

    // Verificar IDs únicos
    const epicIds = epics.map(e => e.id);
    const uniqueIds = new Set(epicIds);
    if (epicIds.length !== uniqueIds.size) {
      errors.push('Se encontraron IDs de épicas duplicados');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
