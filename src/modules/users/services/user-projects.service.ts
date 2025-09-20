/**
 * Servicio para gestionar proyectos del usuario
 */

import { createClient } from '@supabase/supabase-js';
import type { ProjectWithMembership } from '../../projects/types';
import type { ProjectMemberWithDetails, ProjectMemberRole } from '../../projects/types';

interface GetUserProjectsParams {
  userId: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  includeRole?: boolean;
}

export class UserProjectsService {
  private supabase;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * Obtiene todos los proyectos del usuario
   */
  async getUserProjects(params: GetUserProjectsParams): Promise<ProjectWithMembership[]> {
    const { userId, status = 'ACTIVE' } = params;

    let query = this.supabase
      .from('user_projects') // Vista creada en la migración
      .select('*')
      .eq('user_id', userId)
      .eq('membership_status', 'active');

    if (status) {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener proyectos: ${error.message}`);
    }

    return projects || [];
  }

  /**
   * Obtiene proyectos donde el usuario es owner
   */
  async getOwnedProjects(userId: string): Promise<ProjectWithMembership[]> {
    const { data: projects, error } = await this.supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', userId)
      .eq('user_role', 'ADMIN')
      .eq('owner_id', userId) // Solo proyectos donde es el owner original
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener proyectos propios: ${error.message}`);
    }

    return projects || [];
  }

  /**
   * Obtiene el rol del usuario en un proyecto específico
   */
  async getUserProjectRole(userId: string, projectId: string): Promise<ProjectMemberRole | null> {
    const { data: membership, error } = await this.supabase
      .from('project_members')
      .select('role')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      return null;
    }

    return membership.role;
  }

  /**
   * Acepta una invitación de proyecto
   */
  async acceptProjectInvitation(invitationId: string, userId: string): Promise<ProjectWithMembership> {
    // Verificar que la invitación existe y pertenece al usuario
    const { data: invitation, error: fetchError } = await this.supabase
      .from('project_members')
      .select(`
        *,
        project:projects(id, name, code, description, status, created_at, updated_at)
      `)
      .eq('id', invitationId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invitación no encontrada o ya procesada');
    }

    // Actualizar status a activo
    const { error: updateError } = await this.supabase
      .from('project_members')
      .update({
        status: 'active',
        joined_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (updateError) {
      throw new Error(`Error al aceptar invitación: ${updateError.message}`);
    }

    // Retornar el proyecto con la membresía actualizada
    return {
      ...invitation.project,
      user_role: invitation.role,
      membership_status: 'active',
      joined_at: new Date().toISOString()
    };
  }

  /**
   * Rechaza una invitación de proyecto
   */
  async declineProjectInvitation(invitationId: string, userId: string): Promise<void> {
    // Verificar que la invitación existe y pertenece al usuario
    const { data: invitation, error: fetchError } = await this.supabase
      .from('project_members')
      .select('id')
      .eq('id', invitationId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invitación no encontrada o ya procesada');
    }

    // Eliminar la invitación
    const { error } = await this.supabase
      .from('project_members')
      .delete()
      .eq('id', invitationId);

    if (error) {
      throw new Error(`Error al rechazar invitación: ${error.message}`);
    }
  }

  /**
   * Obtiene invitaciones pendientes del usuario
   */
  async getPendingInvitations(userId: string): Promise<ProjectMemberWithDetails[]> {
    const { data: invitations, error } = await this.supabase
      .from('project_members')
      .select(`
        *,
        project:projects(id, name, code, description, color, status),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener invitaciones: ${error.message}`);
    }

    return invitations?.map((inv) => ({
      ...inv,
      user_name: '', // El usuario actual
      user_email: '', // El email del usuario actual
      invited_by_name: inv.invited_by_user?.name
    })) || [];
  }

  /**
   * Abandona un proyecto (solo si no es el owner)
   */
  async leaveProject(projectId: string, userId: string): Promise<void> {
    // Verificar que el usuario no es el owner del proyecto
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw new Error('Proyecto no encontrado');
    }

    if (project.owner_id === userId) {
      throw new Error('El owner del proyecto no puede abandonarlo. Debe transferir la propiedad primero.');
    }

    // Verificar que el usuario es miembro del proyecto
    const { data: membership, error: membershipError } = await this.supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      throw new Error('No eres miembro de este proyecto');
    }

    // Remover membresía
    const { error } = await this.supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error al abandonar proyecto: ${error.message}`);
    }
  }

  /**
   * Verifica si el usuario tiene permisos específicos en un proyecto
   */
  async hasProjectPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
    const { data: membership, error } = await this.supabase
      .from('project_members')
      .select('role')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      return false;
    }

    // Importar permisos dinámicamente para evitar imports circulares
    const { PROJECT_MEMBER_PERMISSIONS } = await import('../../projects/types');
    const permissions = PROJECT_MEMBER_PERMISSIONS[membership.role as ProjectMemberRole] as readonly string[];
    
    return permissions.includes(permission);
  }

  /**
   * Obtiene estadísticas de proyectos del usuario
   */
  async getUserProjectStats(userId: string): Promise<{
    totalProjects: number;
    ownedProjects: number;
    activeProjects: number;
    pendingInvitations: number;
    roleDistribution: Record<ProjectMemberRole, number>;
  }> {
    // Contar proyectos totales
    const { count: totalProjects } = await this.supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Contar proyectos propios
    const { count: ownedProjects } = await this.supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'ACTIVE');

    // Contar proyectos activos
    const { count: activeProjects } = await this.supabase
      .from('user_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .eq('membership_status', 'active');

    // Contar invitaciones pendientes
    const { count: pendingInvitations } = await this.supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Obtener distribución de roles
    const { data: roleData } = await this.supabase
      .from('project_members')
      .select('role')
      .eq('user_id', userId)
      .eq('status', 'active');

    const roleDistribution: Record<ProjectMemberRole, number> = {
      ADMIN: 0,
      PM: 0,
      CONTRIBUTOR: 0,
      VIEWER: 0
    };

    roleData?.forEach((item) => {
      if (item.role in roleDistribution) {
        roleDistribution[item.role as ProjectMemberRole]++;
      }
    });

    return {
      totalProjects: totalProjects || 0,
      ownedProjects: ownedProjects || 0,
      activeProjects: activeProjects || 0,
      pendingInvitations: pendingInvitations || 0,
      roleDistribution
    };
  }

  /**
   * Busca proyectos disponibles para el usuario (públicos o por invitación)
   */
  async searchAvailableProjects(
    userId: string, 
    searchTerm: string, 
    limit: number = 10
  ): Promise<ProjectWithMembership[]> {
    // Buscar proyectos donde el usuario NO es miembro y coinciden con el término de búsqueda
    const { data: projects, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        owner:users!owner_id(id, name, email)
      `)
      .eq('status', 'ACTIVE')
      .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Error al buscar proyectos: ${error.message}`);
    }

    // Filtrar proyectos donde el usuario no es miembro
    const projectIds = projects?.map(p => p.id) || [];
    
    const { data: memberships } = await this.supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
      .in('project_id', projectIds);

    const memberProjectIds = new Set(memberships?.map(m => m.project_id) || []);

    return projects?.filter(p => !memberProjectIds.has(p.id)) || [];
  }
}
