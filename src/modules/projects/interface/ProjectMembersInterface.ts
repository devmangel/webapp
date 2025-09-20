/**
 * Interface para el servicio de gestión de miembros de proyecto
 */

import type { 
  ProjectMember, 
  ProjectMemberWithDetails, 
  ProjectMemberRole 
} from '../types';

export interface IProjectMembersService {
  /**
   * Invita un usuario a un proyecto por email
   */
  inviteUserToProject(params: {
    projectId: string;
    email: string;
    role: ProjectMemberRole;
    invitedBy: string;
  }): Promise<ProjectMember>;

  /**
   * Acepta una invitación de proyecto
   */
  acceptProjectInvitation(membershipId: string, userId: string): Promise<ProjectMember>;

  /**
   * Actualiza el rol de un usuario en el proyecto
   */
  updateUserRole(params: {
    projectId: string;
    userId: string;
    newRole: ProjectMemberRole;
    updatedBy: string;
  }): Promise<ProjectMember>;

  /**
   * Remueve un usuario del proyecto
   */
  removeUserFromProject(params: {
    projectId: string;
    userId: string;
    removedBy: string;
  }): Promise<void>;

  /**
   * Obtiene todos los miembros de un proyecto
   */
  getProjectMembers(projectId: string, requestedBy: string): Promise<ProjectMemberWithDetails[]>;

  /**
   * Verifica si un usuario tiene acceso a un proyecto
   */
  checkUserProjectAccess(userId: string, projectId: string): Promise<ProjectMember | null>;

  /**
   * Obtiene invitaciones pendientes de un usuario
   */
  getPendingInvitations(userId: string): Promise<ProjectMemberWithDetails[]>;

  /**
   * Suspende temporalmente un usuario del proyecto
   */
  suspendUser(projectId: string, userId: string, suspendedBy: string): Promise<ProjectMember>;

  /**
   * Reactiva un usuario suspendido
   */
  reactivateUser(projectId: string, userId: string, reactivatedBy: string): Promise<ProjectMember>;
}

export interface ProjectMemberPermissionChecker {
  /**
   * Verifica si un usuario puede invitar otros usuarios
   */
  canInviteUsers(userId: string, projectId: string): Promise<boolean>;

  /**
   * Verifica si un usuario puede remover otros usuarios
   */
  canRemoveUsers(userId: string, projectId: string): Promise<boolean>;

  /**
   * Verifica si un usuario puede cambiar roles
   */
  canChangeUserRoles(userId: string, projectId: string): Promise<boolean>;

  /**
   * Verifica si un usuario puede gestionar el proyecto
   */
  canManageProject(userId: string, projectId: string): Promise<boolean>;
}
