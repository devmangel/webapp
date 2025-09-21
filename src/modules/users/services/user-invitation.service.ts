/**
 * Servicio para gestión de invitaciones de usuarios
 */

import { createSupabaseServerClient } from '../../../app/lib/supabase/server-client';
import type { UserRole } from '../types';
import type { UserProfile } from './user-auth.service';

interface ProjectInfo {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

interface InvitationData {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedByName?: string;
  projectId?: string;
  projectName?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

export interface CreateInvitationParams {
  email: string;
  role: UserRole;
  invitedBy: string;
  projectId?: string;
  expiresInDays?: number;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedByName: string;
  invitedByEmail: string;
  projectName?: string;
  createdAt: string;
  expiresAt?: string;
}

export class UserInvitationService {
  private supabase;

  constructor() {
    this.supabase = createSupabaseServerClient();
  }

  /**
   * Crea una nueva invitación para un usuario
   */
  async createInvitation(params: CreateInvitationParams): Promise<InvitationData> {
    const { email, role, invitedBy, projectId, expiresInDays = 7 } = params;

    // Verificar que el usuario que invita existe y tiene permisos
    const inviter = await this.supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', invitedBy)
      .eq('active', true)
      .single();

    if (inviter.error || !inviter.data) {
      throw new Error('Usuario que invita no encontrado o inactivo');
    }

    // Solo ADMINs y PMs pueden invitar usuarios
    if (!['ADMIN', 'PM'].includes(inviter.data.role)) {
      throw new Error('No tienes permisos para invitar usuarios');
    }

    // Verificar si el email ya tiene una invitación pendiente
    const existingInvitation = await this.getPendingInvitationByEmail(email);
    if (existingInvitation) {
      throw new Error('Ya existe una invitación pendiente para este email');
    }

    // Verificar si ya existe un usuario con este email
    const existingUser = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser.data) {
      throw new Error('Ya existe un usuario registrado con este email');
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Si se especifica un proyecto, verificar que existe y el usuario tiene permisos
    let project = null;
    if (projectId) {
      const projectResult = await this.supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .eq('status', 'ACTIVE')
        .single();

      if (projectResult.error || !projectResult.data) {
        throw new Error('Proyecto no encontrado o inactivo');
      }

      project = projectResult.data;

      // Verificar que el invitador es miembro del proyecto
      const memberResult = await this.supabase
        .from('project_members')
        .select('role')
        .eq('user_id', invitedBy)
        .eq('project_id', projectId)
        .eq('status', 'active')
        .single();

      if (memberResult.error || !memberResult.data) {
        throw new Error('No eres miembro de este proyecto');
      }
    }

    // Crear la invitación temporal (tabla que necesitaremos crear)
    const invitationId = crypto.randomUUID();
    const invitationData = {
      id: invitationId,
      email: email.toLowerCase(),
      role,
      invited_by: invitedBy,
      project_id: projectId || null,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    };

    console.log('Invitación creada:', invitationData);

    // Para esta implementación inicial, almacenaremos las invitaciones en una tabla temporal
    // o las manejaremos de manera directa. Por ahora simularemos el almacenamiento.

    return {
      id: invitationId,
      email: email.toLowerCase(),
      role,
      invitedBy,
      invitedByName: inviter.data.name,
      projectId,
      projectName: project?.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };
  }

  /**
   * Acepta una invitación y crea el usuario
   */
  async acceptInvitation(invitationId: string, userInfo: {
    name: string;
    timezone?: string;
    capacityPerSprint?: number;
    skills?: string[];
  }): Promise<{ user: UserProfile; project?: ProjectInfo }> {
    // En una implementación real, recuperaríamos la invitación de la base de datos
    // Por ahora simularemos que tenemos la información de la invitación

    // Verificar que la invitación existe y no ha expirado
    const invitation = await this.getInvitationById(invitationId);
    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Esta invitación ya ha sido procesada');
    }

    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
      throw new Error('Esta invitación ha expirado');
    }

    // Crear el usuario con el rol de la invitación
    const { userAuthService } = await import('./user-auth.service');

    const newUser = await userAuthService.createUser({
      email: invitation.email,
      name: userInfo.name,
      role: invitation.role,
      timezone: userInfo.timezone,
      capacityPerSprint: userInfo.capacityPerSprint,
      skills: userInfo.skills
    });

    let project = null;

    // Si la invitación incluye un proyecto, agregar al usuario como miembro
    if (invitation.projectId) {
      project = await this.addUserToProject(newUser.id, invitation.projectId, invitation.role);
    }

    // Marcar la invitación como aceptada
    await this.updateInvitationStatus(invitationId, 'accepted');

    return { user: newUser, project };
  }

  /**
   * Declina una invitación
   */
  async declineInvitation(invitationId: string): Promise<void> {
    await this.updateInvitationStatus(invitationId, 'declined');
  }

  /**
   * Obtiene una invitación por ID
   */
  private async getInvitationById(id: string): Promise<InvitationData | null> {
    // En una implementación real, esto consultaría la tabla de invitaciones
    // Por ahora retornamos null ya que es una simulación
    console.log('Buscando invitación por ID:', id);
    return null;
  }

  /**
   * Obtiene invitación pendiente por email
   */
  private async getPendingInvitationByEmail(email: string): Promise<InvitationData | null> {
    // En una implementación real, esto consultaría la tabla de invitaciones
    // Por ahora retornamos null ya que es una simulación
    console.log('Buscando invitación pendiente por email:', email);
    return null;
  }

  /**
   * Actualiza el estado de una invitación
   */
  private async updateInvitationStatus(id: string, status: 'accepted' | 'declined' | 'expired'): Promise<void> {
    // En una implementación real, esto actualizaría la tabla de invitaciones
    console.log(`Invitación ${id} marcada como ${status}`);
  }

  /**
   * Agrega un usuario como miembro de un proyecto
   */
  private async addUserToProject(userId: string, projectId: string, role: UserRole): Promise<ProjectInfo> {
    const memberData = {
      user_id: userId,
      project_id: projectId,
      role,
      status: 'active' as const,
      joined_at: new Date().toISOString()
    };

    const { data: membership, error } = await this.supabase
      .from('project_members')
      .insert(memberData)
      .select(`
        *,
        project:projects(id, name, code, description)
      `)
      .single();

    if (error) {
      throw new Error(`Error al agregar usuario al proyecto: ${error.message}`);
    }

    return membership.project;
  }

  /**
   * Obtiene todas las invitaciones pendientes del sistema
   */
  async getPendingInvitations(filters?: {
    invitedBy?: string;
    projectId?: string;
    role?: UserRole;
    limit?: number;
  }): Promise<PendingInvitation[]> {
    // En una implementación real, esto consultaría la tabla de invitaciones
    // Por ahora retornamos un array vacío
    console.log('Obteniendo invitaciones pendientes con filtros:', filters);
    return [];
  }

  /**
   * Cancela una invitación (solo el que invitó o un admin)
   */
  async cancelInvitation(invitationId: string, cancelledBy: string): Promise<void> {
    const invitation = await this.getInvitationById(invitationId);
    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    // Verificar permisos: solo quien invitó o un admin puede cancelar
    const user = await this.supabase
      .from('users')
      .select('role')
      .eq('id', cancelledBy)
      .single();

    if (user.error || !user.data) {
      throw new Error('Usuario no encontrado');
    }

    const canCancel = invitation.invitedBy === cancelledBy || user.data.role === 'ADMIN';
    if (!canCancel) {
      throw new Error('No tienes permisos para cancelar esta invitación');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Solo se pueden cancelar invitaciones pendientes');
    }

    await this.updateInvitationStatus(invitationId, 'expired');
  }

  /**
   * Limpia invitaciones expiradas
   */
  async cleanupExpiredInvitations(): Promise<number> {
    // En una implementación real, esto eliminaría invitaciones expiradas de la BD
    // Por ahora retornamos 0
    return 0;
  }

  /**
   * Obtiene estadísticas de invitaciones
   */
  async getInvitationStats(filters?: {
    invitedBy?: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    expired: number;
    byRole: Record<UserRole, number>;
  }> {
    console.log('Obteniendo estadísticas de invitaciones con filtros:', filters);
    // En una implementación real, esto consultaría la tabla de invitaciones
    return {
      total: 0,
      pending: 0,
      accepted: 0,
      declined: 0,
      expired: 0,
      byRole: {
        ADMIN: 0,
        PM: 0,
        CONTRIBUTOR: 0,
        VIEWER: 0
      }
    };
  }

  /**
   * Reenvía una invitación (actualiza fecha de expiración)
   */
  async resendInvitation(invitationId: string, resentBy: string): Promise<InvitationData> {
    const invitation = await this.getInvitationById(invitationId);
    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    // Verificar permisos
    const user = await this.supabase
      .from('users')
      .select('role')
      .eq('id', resentBy)
      .single();

    if (user.error || !user.data) {
      throw new Error('Usuario no encontrado');
    }

    const canResend = invitation.invitedBy === resentBy || user.data.role === 'ADMIN';
    if (!canResend) {
      throw new Error('No tienes permisos para reenviar esta invitación');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Solo se pueden reenviar invitaciones pendientes');
    }

    // Actualizar fecha de expiración (7 días más)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    // En una implementación real, actualizaríamos la fecha de expiración en la BD

    return {
      ...invitation,
      expiresAt: newExpiresAt.toISOString()
    };
  }
}

// Instancia singleton para uso en la aplicación
export const userInvitationService = new UserInvitationService();
