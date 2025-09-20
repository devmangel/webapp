import { createSupabaseServerClient } from '../../../app/lib/supabase/server-client';
import type { Database } from 'types/database/schema';
import type { TaskImport } from 'types/domain/import';

// Helper types
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type IssueRow = Database['public']['Tables']['issues']['Row'];
type EpicRow = Database['public']['Tables']['epics']['Row'];

// Constante del desarrollador fijo
const FIXED_DEVELOPER_ID = '06aec8c6-b939-491b-b711-f04d7670e045';

/**
 * Servicio especializado para procesar tareas técnicas
 * Responsabilidad única: crear tareas y asignarlas al desarrollador fijo
 */
export class TaskProcessingService {
  private supabase = createSupabaseServerClient();

  /**
   * Procesa y crea tareas en la base de datos
   */
  async processTasks(
    tasks: TaskImport[],
    projectId: string,
    createdEpics: EpicRow[],
    createdStories: IssueRow[],
    epicSprintMapping: Record<string, string>, // epicId → sprintId
    assigneeId: string
  ): Promise<{
    tasks?: IssueRow[];
    error?: string;
  }> {
    try {
      if (tasks.length === 0) {
        return { tasks: [] };
      }

      // Crear mappings para referencias
      const epicKeyToIdMap = new Map<string, string>();
      const epicKeyToDbIdMap = new Map<string, string>();
      createdEpics.forEach(epic => {
        epicKeyToIdMap.set(epic.key, epic.id);
        epicKeyToDbIdMap.set(epic.key, epic.id);
      });

      const storyKeyToIdMap = new Map<string, string>();
      const storyKeyToSprintMap = new Map<string, string>();
      createdStories.forEach(story => {
        storyKeyToIdMap.set(story.key, story.id);
        if (story.sprint_id) {
          storyKeyToSprintMap.set(story.key, story.sprint_id);
        }
      });

      // Validar y procesar tareas
      const validatedTasks = this.validateTaskReferences(tasks, epicKeyToIdMap, storyKeyToIdMap);
      if (validatedTasks.invalidTasks.length > 0) {
        console.warn('Tareas con referencias inválidas:', validatedTasks.invalidTasks);
      }

      if (validatedTasks.validTasks.length === 0) {
        return { error: 'No hay tareas válidas para procesar' };
      }

      // Preparar datos de tareas para inserción
      const taskInserts: IssueInsert[] = validatedTasks.validTasks.map(task => {
        const { parentIssueId, epicId, sprintId } = this.resolveTaskParents(
          task,
          epicKeyToDbIdMap,
          storyKeyToIdMap,
          storyKeyToSprintMap,
          epicSprintMapping
        );

        return {
          key: task.id,
          type: 'TASK',
          status: 'TODO',
          priority: this.calculateTaskPriority(task.type),
          summary: task.title,
          description: task.description || this.generateTaskDescription(task),
          parent_issue_id: parentIssueId,
          epic_id: epicId,
          project_id: projectId,
          assignee_id: FIXED_DEVELOPER_ID, // Asignación fija
          reporter_id: assigneeId,
          sprint_id: sprintId,
          story_points: 1, // Tareas siempre valen 1 punto
          blocked: false,
          labels: [...task.labels, task.type.toLowerCase()],
          acceptance_criteria: this.generateTaskCriteria(task),
          definition_of_done: this.generateTaskDoD(task.type),
          watchers: [FIXED_DEVELOPER_ID, assigneeId],
          due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Insertar tareas en la base de datos
      const { data: createdTasks, error } = await this.supabase
        .from('issues')
        .insert(taskInserts)
        .select();

      if (error) {
        console.error('Error creando tareas:', error);
        return { error: `Error al crear tareas: ${error.message}` };
      }

      if (!createdTasks || createdTasks.length === 0) {
        return { error: 'No se pudieron crear las tareas' };
      }

      return { tasks: createdTasks };

    } catch (error) {
      console.error('Error en processTasks:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido procesando tareas'
      };
    }
  }

  /**
   * Actualiza el estado de una tarea
   */
  async updateTaskStatus(
    taskId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('issues')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('type', 'TASK');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error actualizando estado de tarea:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Reasigna una tarea (aunque por defecto van al desarrollador fijo)
   */
  async reassignTask(
    taskId: string,
    newAssigneeId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar que el usuario existe
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, active')
        .eq('id', newAssigneeId)
        .single();

      if (userError || !user || !user.active) {
        return { success: false, error: 'Usuario no encontrado o inactivo' };
      }

      // Reasignar tarea
      const { error } = await this.supabase
        .from('issues')
        .update({
          assignee_id: newAssigneeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('type', 'TASK');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Error reasignando tarea:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Resuelve los padres (historia/épica) y sprint de una tarea
   */
  private resolveTaskParents(
    task: TaskImport,
    epicKeyToDbIdMap: Map<string, string>,
    storyKeyToIdMap: Map<string, string>,
    storyKeyToSprintMap: Map<string, string>,
    epicSprintMapping: Record<string, string>
  ): {
    parentIssueId: string | undefined;
    epicId: string | undefined;
    sprintId: string | undefined;
  } {
    let parentIssueId: string | undefined;
    let epicId: string | undefined;
    let sprintId: string | undefined;

    // Prioridad 1: Si tiene historia padre
    if (task.storyId) {
      parentIssueId = storyKeyToIdMap.get(task.storyId);
      sprintId = storyKeyToSprintMap.get(task.storyId);
      
      // La épica la obtenemos de la historia padre (implícita)
      // Para simplicidad, también verificamos si tiene epicId directo
      if (task.epicId) {
        epicId = epicKeyToDbIdMap.get(task.epicId);
      }
    }
    // Prioridad 2: Si solo tiene épica
    else if (task.epicId) {
      epicId = epicKeyToDbIdMap.get(task.epicId);
      sprintId = epicSprintMapping[task.epicId];
    }

    return { parentIssueId, epicId, sprintId };
  }

  /**
   * Calcula prioridad de tarea basada en su tipo
   */
  private calculateTaskPriority(taskType: 'FE' | 'BE' | 'OPS' | 'DOCS' | 'TEST'): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (taskType) {
      case 'OPS':
        return 'HIGH'; // Infraestructura es importante
      case 'BE':
        return 'HIGH'; // Backend crítico
      case 'FE':
        return 'MEDIUM'; // Frontend importante
      case 'TEST':
        return 'MEDIUM'; // Testing importante pero no bloquea
      case 'DOCS':
        return 'LOW'; // Documentación menos urgente
      default:
        return 'MEDIUM';
    }
  }

  /**
   * Genera descripción automática para tareas sin descripción
   */
  private generateTaskDescription(task: TaskImport): string {
    const typeDescriptions = {
      FE: 'Implementar componente de frontend',
      BE: 'Desarrollar funcionalidad de backend',
      OPS: 'Configurar infraestructura y operaciones',
      DOCS: 'Crear o actualizar documentación',
      TEST: 'Implementar tests y validaciones'
    };

    const baseDescription = typeDescriptions[task.type] || 'Implementar funcionalidad requerida';
    
    return `${baseDescription}: ${task.title}`;
  }

  /**
   * Genera criterios de aceptación básicos para tareas
   */
  private generateTaskCriteria(task: TaskImport): string[] {
    const baseCriteria = ['Funcionalidad implementada según especificación'];

    switch (task.type) {
      case 'FE':
        return [
          ...baseCriteria,
          'Componente renderiza correctamente',
          'Responsive en dispositivos móviles',
          'Accesibilidad básica implementada'
        ];
      case 'BE':
        return [
          ...baseCriteria,
          'API endpoints funcionando correctamente',
          'Validación de datos implementada',
          'Manejo de errores apropiado'
        ];
      case 'OPS':
        return [
          ...baseCriteria,
          'Configuración desplegada correctamente',
          'Monitoreo básico funcionando',
          'Documentación de configuración actualizada'
        ];
      case 'DOCS':
        return [
          ...baseCriteria,
          'Documentación clara y comprensible',
          'Ejemplos incluidos donde corresponde',
          'Revisión técnica completada'
        ];
      case 'TEST':
        return [
          ...baseCriteria,
          'Tests ejecutándose correctamente',
          'Cobertura de casos principales',
          'Tests integrados en CI/CD'
        ];
      default:
        return baseCriteria;
    }
  }

  /**
   * Genera definition of done específica por tipo de tarea
   */
  private generateTaskDoD(taskType: 'FE' | 'BE' | 'OPS' | 'DOCS' | 'TEST'): string[] {
    const baseDoD = [
      'Código/cambios implementados completamente',
      'Revisión de código completada'
    ];

    switch (taskType) {
      case 'FE':
      case 'BE':
        return [
          ...baseDoD,
          'Tests unitarios pasando',
          'No rompe funcionalidad existente'
        ];
      case 'OPS':
        return [
          ...baseDoD,
          'Cambios probados en ambiente de desarrollo',
          'Rollback plan documentado'
        ];
      case 'DOCS':
        return [
          ...baseDoD,
          'Documentación actualizada en repositorio',
          'Links y referencias verificados'
        ];
      case 'TEST':
        return [
          ...baseDoD,
          'Tests ejecutándose en CI',
          'Documentación de tests actualizada'
        ];
      default:
        return baseDoD;
    }
  }

  /**
   * Valida que las tareas tengan referencias válidas
   */
  private validateTaskReferences(
    tasks: TaskImport[],
    epicKeyToIdMap: Map<string, string>,
    storyKeyToIdMap: Map<string, string>
  ): {
    validTasks: TaskImport[];
    invalidTasks: Array<{ task: TaskImport; reason: string }>;
  } {
    const validTasks: TaskImport[] = [];
    const invalidTasks: Array<{ task: TaskImport; reason: string }> = [];

    for (const task of tasks) {
      // Una tarea debe tener al menos storyId o epicId
      if (!task.storyId && !task.epicId) {
        invalidTasks.push({ task, reason: 'Sin historia ni épica asignada' });
        continue;
      }

      // Verificar referencia a historia si existe
      if (task.storyId && !storyKeyToIdMap.has(task.storyId)) {
        invalidTasks.push({ task, reason: `Historia no encontrada: ${task.storyId}` });
        continue;
      }

      // Verificar referencia a épica si existe
      if (task.epicId && !epicKeyToIdMap.has(task.epicId)) {
        invalidTasks.push({ task, reason: `Épica no encontrada: ${task.epicId}` });
        continue;
      }

      validTasks.push(task);
    }

    return { validTasks, invalidTasks };
  }

  /**
   * Obtiene tareas de un proyecto con filtros y estadísticas
   */
  async getProjectTasks(
    projectId: string,
    filters?: {
      storyId?: string;
      epicId?: string;
      sprintId?: string;
      assigneeId?: string;
      type?: 'FE' | 'BE' | 'OPS' | 'DOCS' | 'TEST';
      status?: string;
    }
  ): Promise<{
    tasks: Array<IssueRow & {
      storyName?: string;
      epicName?: string;
      sprintName?: string;
      assigneeName?: string;
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
        .eq('type', 'TASK');

      // Aplicar filtros
      if (filters?.storyId) {
        query = query.eq('parent_issue_id', filters.storyId);
      }
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
      if (filters?.type) {
        query = query.contains('labels', [filters.type.toLowerCase()]);
      }

      const { data: tasks, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { tasks: [], error: error.message };
      }

      if (!tasks || tasks.length === 0) {
        return { tasks: [] };
      }

      // Obtener nombres de historias padre si existen
      const tasksWithInfo = await Promise.all(
        tasks.map(async (task) => {
          let storyName: string | undefined;
          
          if (task.parent_issue_id) {
            const { data: parentStory } = await this.supabase
              .from('issues')
              .select('summary')
              .eq('id', task.parent_issue_id)
              .single();
            
            storyName = parentStory?.summary;
          }

          return {
            ...task,
            storyName,
            epicName: task.epics?.name,
            sprintName: task.sprints?.name,
            assigneeName: task.users?.name,
          };
        })
      );

      return { tasks: tasksWithInfo };

    } catch (error) {
      console.error('Error obteniendo tareas del proyecto:', error);
      return {
        tasks: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Valida que las tareas sean válidas para procesamiento
   */
  validateTasks(tasks: TaskImport[]): {
    isValid: boolean;
    errors: string[];
    validTasks: TaskImport[];
  } {
    const errors: string[] = [];
    const validTasks: TaskImport[] = [];

    if (tasks.length === 0) {
      return { isValid: true, errors: [], validTasks: [] }; // Válido tener 0 tareas
    }

    for (const task of tasks) {
      const taskErrors: string[] = [];

      // Validar ID
      if (!task.id || task.id.trim() === '') {
        taskErrors.push('ID vacío');
      } else if (task.id.length > 50) {
        taskErrors.push('ID demasiado largo');
      }

      // Validar título
      if (!task.title || task.title.trim() === '') {
        taskErrors.push('Título vacío');
      } else if (task.title.length > 200) {
        taskErrors.push('Título demasiado largo');
      }

      // Validar tipo
      if (!['FE', 'BE', 'OPS', 'DOCS', 'TEST'].includes(task.type)) {
        taskErrors.push(`Tipo inválido: ${task.type}`);
      }

      // Debe tener al menos storyId o epicId
      if (!task.storyId && !task.epicId) {
        taskErrors.push('Sin historia ni épica asignada');
      }

      if (taskErrors.length === 0) {
        validTasks.push(task);
      } else {
        errors.push(`Tarea ${task.id}: ${taskErrors.join(', ')}`);
      }
    }

    // Verificar IDs únicos
    const validIds = validTasks.map(t => t.id);
    const uniqueIds = new Set(validIds);
    if (validIds.length !== uniqueIds.size) {
      errors.push('IDs de tareas duplicados encontrados');
    }

    return {
      isValid: errors.length === 0,
      errors,
      validTasks
    };
  }

  /**
   * Obtiene estadísticas de tareas por tipo para un proyecto
   */
  async getTaskStatsByType(projectId: string): Promise<{
    stats: Record<string, { total: number; completed: number; inProgress: number }>;
    error?: string;
  }> {
    try {
      const { data: tasks, error } = await this.supabase
        .from('issues')
        .select('labels, status')
        .eq('project_id', projectId)
        .eq('type', 'TASK');

      if (error) {
        return { stats: {}, error: error.message };
      }

      const stats: Record<string, { total: number; completed: number; inProgress: number }> = {
        FE: { total: 0, completed: 0, inProgress: 0 },
        BE: { total: 0, completed: 0, inProgress: 0 },
        OPS: { total: 0, completed: 0, inProgress: 0 },
        DOCS: { total: 0, completed: 0, inProgress: 0 },
        TEST: { total: 0, completed: 0, inProgress: 0 },
      };

      tasks?.forEach(task => {
        const labels = task.labels || [];
        
        // Determinar tipo por labels
        let taskType = 'OTHER';
        for (const type of ['fe', 'be', 'ops', 'docs', 'test']) {
          if (labels.includes(type)) {
            taskType = type.toUpperCase();
            break;
          }
        }

        if (stats[taskType]) {
          stats[taskType].total++;
          if (task.status === 'DONE') {
            stats[taskType].completed++;
          } else if (task.status === 'IN_PROGRESS') {
            stats[taskType].inProgress++;
          }
        }
      });

      return { stats };

    } catch (error) {
      console.error('Error obteniendo estadísticas de tareas:', error);
      return {
        stats: {},
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
