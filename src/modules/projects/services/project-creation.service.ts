import { createSupabaseServerClient } from 'app/lib/supabase/server-client';
import type { Database } from 'types/database/schema';
import type { ProjectMetadata, ProjectCreationResult } from 'types/domain/import';

// Helper types
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

/**
 * Servicio para crear proyectos automáticamente desde markdown
 */
export class ProjectCreationService {
  private supabase = createSupabaseServerClient();

  /**
   * Crea un nuevo proyecto basado en metadatos extraídos por IA
   */
  async createProject(
    metadata: ProjectMetadata,
    ownerId: string
  ): Promise<{ result?: ProjectCreationResult; error?: string }> {
    try {
      // Generar código único del proyecto
      const uniqueCode = await this.generateUniqueCode(metadata.suggestedCode);

      // Preparar datos del proyecto
      const projectData: ProjectInsert = {
        name: metadata.name,
        code: uniqueCode,
        description: metadata.description || `Proyecto generado automáticamente: ${metadata.name}`,
        owner_id: ownerId,
        status: 'ACTIVE',
        color: this.generateProjectColor(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insertar proyecto en la base de datos
      const { data: project, error } = await this.supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error creando proyecto:', error);
        return { error: `Error al crear el proyecto: ${error.message}` };
      }

      if (!project) {
        return { error: 'No se pudo crear el proyecto' };
      }

      return {
        result: {
          projectId: project.id,
          projectCode: project.code,
          projectName: project.name
        }
      };

    } catch (error) {
      console.error('Error en createProject:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido al crear proyecto'
      };
    }
  }

  /**
   * Genera un código único para el proyecto
   */
  private async generateUniqueCode(suggestedCode: string): Promise<string> {
    try {
      // Limpiar y normalizar el código sugerido
      let baseCode = suggestedCode
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8); // Máximo 8 caracteres

      // Si está vacío o muy corto, usar fallback
      if (baseCode.length < 3) {
        baseCode = 'PROJ';
      }

      // Verificar si ya existe
      const { data: existing } = await this.supabase
        .from('projects')
        .select('code')
        .eq('code', baseCode)
        .single();

      // Si no existe, usar el código base
      if (!existing) {
        return baseCode;
      }

      // Si existe, agregar sufijo numérico
      let counter = 1;
      let uniqueCode = `${baseCode}${counter}`;

      while (counter <= 999) {
        const { data: existingWithSuffix } = await this.supabase
          .from('projects')
          .select('code')
          .eq('code', uniqueCode)
          .single();

        if (!existingWithSuffix) {
          return uniqueCode;
        }

        counter++;
        uniqueCode = `${baseCode}${counter}`;
      }

      // Si llegamos aquí, usar timestamp como fallback
      return `${baseCode}${Date.now().toString().slice(-4)}`;

    } catch (error) {
      console.error('Error generando código único:', error);
      // Fallback completo
      return `PROJ${Date.now().toString().slice(-6)}`;
    }
  }

  /**
   * Genera un color aleatorio para el proyecto
   */
  private generateProjectColor(): string {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#8B5CF6', // Purple
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#EC4899', // Pink
      '#6366F1', // Indigo
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Valida que el usuario tenga permisos para crear proyectos
   */
  async validateUserPermissions(userId: string): Promise<{ canCreate: boolean; error?: string }> {
    try {

      // Verificar que el usuario existe y está activo
      const { data: user, error } = await this.supabase
        .from('users')
        .select('id, active, role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { canCreate: false, error: 'Usuario no encontrado' };
      }

      if (!user.active) {
        return { canCreate: false, error: 'Usuario inactivo' };
      }

      // Todos los usuarios activos pueden crear proyectos por ahora
      // En el futuro se puede implementar lógica de roles más específica
      return { canCreate: true };

    } catch (error) {
      console.error('Error validando permisos:', error);
      return { canCreate: false, error: 'Error validando permisos de usuario' };
    }
  }

  /**
   * Obtiene estadísticas del proyecto creado para logging
   */
  async getProjectStats(projectId: string): Promise<{
    epicCount: number;
    storyCount: number;
    taskCount: number;
  }> {
    try {
      const [epicsResult, issuesResult] = await Promise.all([
        this.supabase
          .from('epics')
          .select('id')
          .eq('project_id', projectId),
        this.supabase
          .from('issues')
          .select('type')
          .eq('project_id', projectId)
      ]);

      const epicCount = epicsResult.data?.length || 0;
      const storyCount = issuesResult.data?.filter(i => i.type === 'STORY').length || 0;
      const taskCount = issuesResult.data?.filter(i => i.type === 'TASK').length || 0;

      return { epicCount, storyCount, taskCount };

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { epicCount: 0, storyCount: 0, taskCount: 0 };
    }
  }
}
