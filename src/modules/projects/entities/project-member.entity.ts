/**
 * Entidad ProjectMember - Representa la membresía de un usuario en un proyecto
 */

import type {
  ProjectMember,
  ProjectMemberWithDetails,
  ProjectMemberStatus,
  ProjectMemberRole
} from '../types';
import { PROJECT_MEMBER_PERMISSIONS } from '../types';

interface ProjectMemberDatabaseRow {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    active: boolean;
  };
  invited_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export class ProjectMemberEntity implements ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  status: ProjectMemberStatus;
  created_at: string;
  updated_at: string;

  // Relaciones populadas (opcional)
  user?: {
    id: string;
    name: string;
    email: string;
    active: boolean;
  };
  invited_by_user?: {
    id: string;
    name: string;
    email: string;
  };

  constructor(data: ProjectMember) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.user_id = data.user_id;
    this.role = data.role;
    this.invited_by = data.invited_by;
    this.invited_at = data.invited_at;
    this.joined_at = data.joined_at;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.user = data.user;
    this.invited_by_user = data.invited_by_user;
  }

  /**
   * Verifica si el miembro tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const permissions = PROJECT_MEMBER_PERMISSIONS[this.role] as readonly string[];
    return permissions.includes(permission);
  }

  /**
   * Verifica si el miembro está activo
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Verifica si el miembro tiene una invitación pendiente
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Verifica si el miembro está suspendido
   */
  isSuspended(): boolean {
    return this.status === 'suspended';
  }

  /**
   * Verifica si puede invitar otros usuarios
   */
  canInviteUsers(): boolean {
    return this.hasPermission('invite_users') && this.isActive();
  }

  /**
   * Verifica si puede remover otros usuarios
   */
  canRemoveUsers(): boolean {
    return this.hasPermission('remove_users') && this.isActive();
  }

  /**
   * Verifica si puede cambiar roles de otros usuarios
   */
  canChangeUserRoles(): boolean {
    return this.hasPermission('change_user_roles') && this.isActive();
  }

  /**
   * Verifica si puede gestionar el proyecto (settings, sprints, epics)
   */
  canManageProject(): boolean {
    return (this.hasPermission('manage_project_settings') ||
      this.hasPermission('manage_sprints')) && this.isActive();
  }

  /**
   * Obtiene el nombre para mostrar del usuario
   */
  getDisplayName(): string {
    return this.user?.name || `User ${this.user_id}`;
  }

  /**
   * Obtiene el email del usuario
   */
  getEmail(): string {
    return this.user?.email || '';
  }

  /**
   * Convierte a formato con detalles para API
   */
  toWithDetails(): ProjectMemberWithDetails {
    return {
      ...this,
      user_name: this.user?.name || '',
      user_email: this.user?.email || '',
      invited_by_name: this.invited_by_user?.name
    };
  }

  /**
   * Crea una instancia desde datos de la base de datos
   */
  static fromDatabase(data: ProjectMemberDatabaseRow): ProjectMemberEntity {
    return new ProjectMemberEntity({
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      role: data.role as ProjectMemberRole,
      invited_by: data.invited_by,
      invited_at: data.invited_at,
      joined_at: data.joined_at,
      status: data.status as ProjectMemberStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: data.user ? {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        active: data.user.active
      } : undefined,
      invited_by_user: data.invited_by_user ? {
        id: data.invited_by_user.id,
        name: data.invited_by_user.name,
        email: data.invited_by_user.email
      } : undefined
    });
  }

  /**
   * Valida que los datos del miembro sean correctos
   */
  static validate(data: Partial<ProjectMember>): string[] {
    const errors: string[] = [];

    if (!data.project_id) {
      errors.push('project_id es requerido');
    }

    if (!data.user_id) {
      errors.push('user_id es requerido');
    }

    if (!data.role) {
      errors.push('role es requerido');
    } else if (!['ADMIN', 'PM', 'CONTRIBUTOR', 'VIEWER'].includes(data.role)) {
      errors.push('role debe ser ADMIN, PM, CONTRIBUTOR o VIEWER');
    }

    if (data.status && !['pending', 'active', 'suspended'].includes(data.status)) {
      errors.push('status debe ser pending, active o suspended');
    }

    return errors;
  }
}
