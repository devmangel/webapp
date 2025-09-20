/**
 * Tipos relacionados con membresías de proyecto
 */

import type { UserRole } from '../../users/types';

export type ProjectMemberStatus = 'pending' | 'active' | 'suspended';
export type ProjectMemberRole = UserRole;

export interface ProjectMemberInvitation {
  id: string;
  project_id: string;
  user_email: string;
  role: ProjectMemberRole;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface ProjectMember {
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
}

export interface ProjectMemberWithDetails extends ProjectMember {
  user_name: string;
  user_email: string;
  invited_by_name?: string;
}

export const PROJECT_MEMBER_ROLE_HIERARCHY = {
  VIEWER: 1,
  CONTRIBUTOR: 2,
  PM: 3,
  ADMIN: 4
} as const;

export const PROJECT_MEMBER_PERMISSIONS = {
  ADMIN: [
    'invite_users',
    'remove_users', 
    'change_user_roles',
    'manage_project_settings',
    'delete_project',
    'manage_sprints',
    'manage_epics',
    'manage_issues'
  ],
  PM: [
    'invite_users',
    'remove_contributors',
    'manage_sprints', 
    'manage_epics',
    'manage_issues',
    'assign_issues'
  ],
  CONTRIBUTOR: [
    'create_issues',
    'update_issues',
    'comment_issues',
    'update_own_assignments'
  ],
  VIEWER: [
    'view_project',
    'view_issues',
    'view_sprints',
    'view_epics'
  ]
} as const;
