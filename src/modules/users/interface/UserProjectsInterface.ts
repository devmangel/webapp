/**
 * Interface para el servicio de gestión de proyectos del usuario
 */

import type { ProjectWithMembership } from '../../projects/types';
import type { ProjectMemberWithDetails, ProjectMemberRole } from '../../projects/types';

export interface IUserProjectsService {
  /**
   * Obtiene todos los proyectos del usuario
   */
  getUserProjects(params: {
    userId: string;
    status?: 'ACTIVE' | 'ARCHIVED';
    includeRole?: boolean;
  }): Promise<ProjectWithMembership[]>;

  /**
   * Obtiene proyectos donde el usuario es owner
   */
  getOwnedProjects(userId: string): Promise<ProjectWithMembership[]>;

  /**
   * Obtiene el rol del usuario en un proyecto específico
   */
  getUserProjectRole(userId: string, projectId: string): Promise<ProjectMemberRole | null>;

  /**
   * Acepta una invitación de proyecto
   */
  acceptProjectInvitation(invitationId: string, userId: string): Promise<ProjectWithMembership>;

  /**
   * Rechaza una invitación de proyecto
   */
  declineProjectInvitation(invitationId: string, userId: string): Promise<void>;

  /**
   * Obtiene invitaciones pendientes del usuario
   */
  getPendingInvitations(userId: string): Promise<ProjectMemberWithDetails[]>;

  /**
   * Abandona un proyecto (solo si no es el owner)
   */
  leaveProject(projectId: string, userId: string): Promise<void>;

  /**
   * Verifica si el usuario tiene permisos específicos en un proyecto
   */
  hasProjectPermission(userId: string, projectId: string, permission: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de proyectos del usuario
   */
  getUserProjectStats(userId: string): Promise<{
    totalProjects: number;
    ownedProjects: number;
    activeProjects: number;
    pendingInvitations: number;
    roleDistribution: Record<ProjectMemberRole, number>;
  }>;

  /**
   * Busca proyectos disponibles para el usuario
   */
  searchAvailableProjects(
    userId: string, 
    searchTerm: string, 
    limit?: number
  ): Promise<ProjectWithMembership[]>;
}

export interface UserProjectPermissionChecker {
  /**
   * Verifica si el usuario puede crear proyectos
   */
  canCreateProjects(userId: string): Promise<boolean>;

  /**
   * Verifica si el usuario puede acceder a un proyecto específico
   */
  canAccessProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Verifica si el usuario es owner de un proyecto
   */
  isProjectOwner(userId: string, projectId: string): Promise<boolean>;

  /**
   * Obtiene el nivel de acceso del usuario en un proyecto
   */
  getUserAccessLevel(userId: string, projectId: string): Promise<{
    role: ProjectMemberRole | null;
    permissions: string[];
    canManage: boolean;
  }>;
}
