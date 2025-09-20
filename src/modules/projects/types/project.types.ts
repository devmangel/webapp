/**
 * Tipos relacionados con proyectos
 */

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  owner_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  
  // Relaciones populadas (opcional)
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProjectWithMembership extends Project {
  user_role?: string;
  membership_status?: string;
  joined_at?: string;
}

export const PROJECT_CODE_PATTERN = /^[A-Z]{2,10}$/;

export const PROJECT_STATUS_LABELS = {
  ACTIVE: 'Activo',
  ARCHIVED: 'Archivado'
} as const;
