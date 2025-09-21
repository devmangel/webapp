/**
 * Servicio de autenticación y gestión de usuarios
 */

import { createSupabaseServerClient } from 'lib/supabase/server-client';
import type { UserRole } from '../types';
import type { Database } from 'types/database/schema';

export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserRow = Database['public']['Tables']['users']['Row'];

export interface CreateUserParams {
  email: string;
  name: string;
  role?: UserRole;
  timezone?: string;
  capacityPerSprint?: number;
  skills?: string[];
}

export interface UpdateUserProfileParams {
  id: string;
  name?: string;
  timezone?: string;
  capacityPerSprint?: number;
  skills?: string[];
  active?: boolean;
}

export type UserProfile = UserRow;

export class UserAuthService {
  private supabase;

  constructor() {
    this.supabase = createSupabaseServerClient();
  }

  /**
   * Crea un nuevo usuario en la base de datos
   */
  async createUser(params: CreateUserParams): Promise<UserProfile> {
    const { email, name, role = 'ADMIN', timezone, capacityPerSprint, skills } = params;

    // Verificar si el usuario ya existe
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Usuario ya existe con este email');
    }

    const userData: UserInsert = {
      email: email.toLowerCase(),
      name,
      role,
      timezone: timezone || 'America/Bogota',
      capacity_per_sprint: capacityPerSprint || null,
      skills: skills ? JSON.stringify(skills) : null,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: user, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return user;
  }

  /**
   * Obtiene un usuario por email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }

    return user;
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }

    return user;
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateUserProfile(params: UpdateUserProfileParams): Promise<UserProfile> {
    const { id, ...updateData } = params;

    // Verificar que el usuario existe
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    const userData: Partial<UserInsert> = {
      ...updateData,
      capacity_per_sprint: updateData.capacityPerSprint,
      skills: updateData.skills ? JSON.stringify(updateData.skills) : undefined,
      updated_at: new Date().toISOString()
    };

    // Remover campos undefined
    Object.keys(userData).forEach(key => {
      if (userData[key as keyof typeof userData] === undefined) {
        delete userData[key as keyof typeof userData];
      }
    });

    const { data: user, error } = await this.supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }

    return user;
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  async deactivateUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ 
        active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error al desactivar usuario: ${error.message}`);
    }
  }

  /**
   * Reactiva un usuario
   */
  async activateUser(id: string): Promise<UserProfile> {
    const { data: user, error } = await this.supabase
      .from('users')
      .update({ 
        active: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al reactivar usuario: ${error.message}`);
    }

    return user;
  }

  /**
   * Obtiene usuarios con filtros
   */
  async getUsers(filters?: {
    role?: UserRole;
    active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserProfile[]> {
    let query = this.supabase.from('users').select('*');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data: users, error } = await query;

    if (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }

    return users || [];
  }

  /**
   * Verifica si un email ya está en uso
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    let query = this.supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al verificar email: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    byRole: Record<UserRole, number>;
  }> {
    // Total de usuarios
    const { count: total } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Usuarios activos
    const { count: active } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Por rol
    const { data: roleData } = await this.supabase
      .from('users')
      .select('role')
      .eq('active', true);

    const byRole: Record<UserRole, number> = {
      ADMIN: 0,
      PM: 0,
      CONTRIBUTOR: 0,
      VIEWER: 0
    };

    roleData?.forEach((user: { role: string }) => {
      if (user.role in byRole) {
        byRole[user.role as UserRole]++;
      }
    });

    return {
      total: total || 0,
      active: active || 0,
      byRole
    };
  }

  /**
   * Busca usuarios por habilidades
   */
  async getUsersBySkills(skills: string[]): Promise<UserProfile[]> {
    // En PostgreSQL podemos usar el operador @> para arrays JSON
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*')
      .overlaps('skills', skills)
      .eq('active', true)
      .order('name');

    if (error) {
      throw new Error(`Error al buscar usuarios por habilidades: ${error.message}`);
    }

    return users || [];
  }

  /**
   * Obtiene usuarios de un timezone específico
   */
  async getUsersByTimezone(timezone: string): Promise<UserProfile[]> {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('timezone', timezone)
      .eq('active', true)
      .order('name');

    if (error) {
      throw new Error(`Error al buscar usuarios por timezone: ${error.message}`);
    }

    return users || [];
  }
}

// Instancia singleton para uso en la aplicación
export const userAuthService = new UserAuthService();
