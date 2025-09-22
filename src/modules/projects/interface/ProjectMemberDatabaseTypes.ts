/**
 * Tipos de base de datos para la tabla project_members
 * Interfaces personalizadas para evitar dependencias de tipos generados de Supabase
 */

export interface ProjectMemberRow {
  id: string;
  project_id: string;
  user_id: string;
  role: 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';
  invited_by?: string | null;
  invited_at?: string | null;
  joined_at?: string | null;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberInsert {
  id?: string;
  project_id: string;
  user_id: string;
  role: 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';
  invited_by?: string | null;
  invited_at?: string | null;
  joined_at?: string | null;
  status?: 'pending' | 'active' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface ProjectMemberUpdate {
  role?: 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';
  invited_by?: string | null;
  invited_at?: string | null;
  joined_at?: string | null;
  status?: 'pending' | 'active' | 'suspended';
  updated_at?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  active?: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface ProjectMemberWithUser extends ProjectMemberRow {
  user?: UserData;
  invited_by_user?: UserData;
  project?: ProjectData;
}

/**
 * Tipo para el resultado de queries con joins complejos
 */
export interface ProjectMemberQueryResult {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  invited_by?: string | null;
  invited_at?: string | null;
  joined_at?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    active?: boolean;
  };
  invited_by_user?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
  };
}

/**
 * Helper types para operaciones Supabase
 */
export type SupabaseProjectMemberTable = {
  Row: ProjectMemberRow;
  Insert: ProjectMemberInsert;
  Update: ProjectMemberUpdate;
};
