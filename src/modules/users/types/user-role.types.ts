/**
 * Tipos relacionados con roles de usuario
 */

export type UserRole = 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';

export const USER_ROLE_DESCRIPTIONS = {
  ADMIN: 'Administrador del sistema con permisos completos',
  PM: 'Project Manager, puede gestionar proyectos y equipos',
  CONTRIBUTOR: 'Desarrollador/Contribuidor, puede trabajar en issues',
  VIEWER: 'Solo lectura, puede ver proyectos asignados'
} as const;

export const USER_ROLE_PERMISSIONS = {
  ADMIN: ['create_project', 'manage_users', 'manage_settings'],
  PM: ['create_project', 'invite_users', 'manage_sprints', 'manage_epics'],
  CONTRIBUTOR: ['create_issues', 'update_issues', 'comment'],
  VIEWER: ['view_only']
} as const;
