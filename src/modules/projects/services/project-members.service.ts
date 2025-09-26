/**
 * Servicio para gestionar membresías de proyectos
 */

import { createSupabaseServerClient } from 'app/lib/supabase/server-client';
import type {
  ProjectMember,
  ProjectMemberWithDetails,
  ProjectMemberRole,
} from '../types';
import { ProjectMemberEntity } from '../entities/project-member.entity';
import type {
  ProjectMemberInsert,
  ProjectMemberUpdate,
} from '../interface/ProjectMemberDatabaseTypes';
import { UuidService } from 'modules/uuid/services/uuid.service';

interface InviteUserToProjectParams {
  projectId: string;
  email: string;
  role: ProjectMemberRole;
  invitedBy: string;
}

interface UpdateUserRoleParams {
  projectId: string;
  userId: string;
  newRole: ProjectMemberRole;
  updatedBy: string;
}

interface RemoveUserFromProjectParams {
  projectId: string;
  userId: string;
  removedBy: string;
}

export class ProjectMembersService {
  private supabase = createSupabaseServerClient();
  private uuidService = new UuidService();

  /**
   * Registra automáticamente al creador del proyecto como ADMIN activo
   * Este método se usa durante la creación del proyecto, sin validaciones previas
   */
  async registerProjectOwner(projectId: string, userId: string): Promise<void> {
    try {
      // Verificar que no exista ya una membresía para este usuario en este proyecto
      const { data: existingMembership } = await this.supabase
        .schema('public')
        .from('project_members')
        .select('id, status')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (existingMembership) {
        // Si ya existe, solo actualizamos el status y rol para asegurar consistencia
        const updateData: ProjectMemberUpdate = {
          role: 'ADMIN',
          status: 'active',
          joined_at: new Date().toISOString()
        };

        await this.supabase
          .schema('public')
          .from('project_members')
          .update(updateData)
          .eq('project_id', projectId)
          .eq('user_id', userId);
      } else {
        // Crear nueva membresía como owner/admin
        const insertData: ProjectMemberInsert = {
          id: this.uuidService.generateV4(),
          project_id: projectId,
          user_id: userId,
          role: 'ADMIN',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),

        };

        const { error } = await this.supabase
          .schema('public')
          .from('project_members')
          .insert(insertData);

        if (error) {
          throw new Error(`Error al registrar owner del proyecto: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('[ProjectMembersService] Error registering project owner:', error);
      throw error;
    }
  }

  /**
   * Invita un usuario a un proyecto por email
   */
  async inviteUserToProject(params: InviteUserToProjectParams): Promise<ProjectMember> {
    const { projectId, email, role, invitedBy } = params;

    // Verificar que el usuario que invita tenga permisos
    const inviterMembership = await this.checkUserProjectAccess(invitedBy, projectId);
    if (!inviterMembership || !inviterMembership.canInviteUsers()) {
      throw new Error('No tienes permisos para invitar usuarios a este proyecto');
    }

    // Buscar el usuario por email
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      throw new Error('Usuario no encontrado con ese email');
    }

    // Verificar si ya existe membresía
    const { data: existingMembership } = await this.supabase
      .from('project_members')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        throw new Error('El usuario ya es miembro del proyecto');
      } else if (existingMembership.status === 'pending') {
        throw new Error('El usuario ya tiene una invitación pendiente');
      }
    }

    // Crear la membresía
    const { data: newMember, error } = await this.supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: user.id,
        role,
        invited_by: invitedBy,
        status: 'pending'
      })
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Error al invitar usuario: ${error.message}`);
    }

    return ProjectMemberEntity.fromDatabase(newMember);
  }

  /**
   * Acepta una invitación de proyecto
   */
  async acceptProjectInvitation(membershipId: string, userId: string): Promise<ProjectMember> {
    // Verificar que la membresía existe y está pendiente
    const { data: membership, error: fetchError } = await this.supabase
      .from('project_members')
      .select('*')
      .eq('id', membershipId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !membership) {
      throw new Error('Invitación no encontrada o ya procesada');
    }

    // Actualizar status a activo y marcar joined_at
    const { data: updatedMember, error } = await this.supabase
      .from('project_members')
      .update({
        status: 'active',
        joined_at: new Date().toISOString()
      })
      .eq('id', membershipId)
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Error al aceptar invitación: ${error.message}`);
    }

    return ProjectMemberEntity.fromDatabase(updatedMember);
  }

  /**
   * Actualiza el rol de un usuario en el proyecto
   */
  async updateUserRole(params: UpdateUserRoleParams): Promise<ProjectMember> {
    const { projectId, userId, newRole, updatedBy } = params;

    // Verificar permisos del usuario que actualiza
    const updaterMembership = await this.checkUserProjectAccess(updatedBy, projectId);
    if (!updaterMembership || !updaterMembership.canChangeUserRoles()) {
      throw new Error('No tienes permisos para cambiar roles en este proyecto');
    }

    // Verificar que el usuario a modificar existe en el proyecto
    const { data: targetMember, error: fetchError } = await this.supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError || !targetMember) {
      throw new Error('Usuario no encontrado en el proyecto');
    }

    // Actualizar rol
    const { data: updatedMember, error } = await this.supabase
      .from('project_members')
      .update({ role: newRole })
      .eq('id', targetMember.id)
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Error al actualizar rol: ${error.message}`);
    }

    return ProjectMemberEntity.fromDatabase(updatedMember);
  }

  /**
   * Remueve un usuario del proyecto
   */
  async removeUserFromProject(params: RemoveUserFromProjectParams): Promise<void> {
    const { projectId, userId, removedBy } = params;

    // Verificar permisos
    const removerMembership = await this.checkUserProjectAccess(removedBy, projectId);
    if (!removerMembership || !removerMembership.canRemoveUsers()) {
      throw new Error('No tienes permisos para remover usuarios de este proyecto');
    }

    // No permitir que el owner se remueva a sí mismo
    const { data: project } = await this.supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (project?.owner_id === userId) {
      throw new Error('El owner del proyecto no puede ser removido');
    }

    // Remover membresía
    const { error } = await this.supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error al remover usuario: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los miembros de un proyecto
   */
  async getProjectMembers(projectId: string, requestedBy: string): Promise<ProjectMemberWithDetails[]> {
    // Verificar acceso al proyecto
    const membership = await this.checkUserProjectAccess(requestedBy, projectId);
    if (!membership) {
      throw new Error('No tienes acceso a este proyecto');
    }

    const { data: members, error } = await this.supabase
      .from('project_members_with_users')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener miembros: ${error.message}`);
    }

    return members || [];
  }

  /**
   * Verifica si un usuario tiene acceso a un proyecto y retorna su membresía
   */
  async checkUserProjectAccess(userId: string, projectId: string): Promise<ProjectMemberEntity | null> {
    const { data: membership, error } = await this.supabase
      .from('project_members')
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      return null;
    }

    return ProjectMemberEntity.fromDatabase(membership);
  }

  /**
   * Obtiene invitaciones pendientes de un usuario
   */
  async getPendingInvitations(userId: string): Promise<ProjectMemberWithDetails[]> {
    const { data: invitations, error } = await this.supabase
      .from('project_members')
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email),
        project:projects(id, name, code, description)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener invitaciones: ${error.message}`);
    }

    return invitations?.map((inv) => ({
      ...inv,
      user_name: inv.user?.name || '',
      user_email: inv.user?.email || '',
      invited_by_name: inv.invited_by_user?.name
    })) || [];
  }

  /**
   * Suspende temporalmente un usuario del proyecto
   */
  async suspendUser(projectId: string, userId: string, suspendedBy: string): Promise<ProjectMember> {
    // Verificar permisos
    const suspenderMembership = await this.checkUserProjectAccess(suspendedBy, projectId);
    if (!suspenderMembership || !suspenderMembership.canRemoveUsers()) {
      throw new Error('No tienes permisos para suspender usuarios');
    }

    const { data: updatedMember, error } = await this.supabase
      .from('project_members')
      .update({ status: 'suspended' })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Error al suspender usuario: ${error.message}`);
    }

    return ProjectMemberEntity.fromDatabase(updatedMember);
  }

  /**
   * Reactiva un usuario suspendido
   */
  async reactivateUser(projectId: string, userId: string, reactivatedBy: string): Promise<ProjectMember> {
    // Verificar permisos
    const reactivatorMembership = await this.checkUserProjectAccess(reactivatedBy, projectId);
    if (!reactivatorMembership || !reactivatorMembership.canRemoveUsers()) {
      throw new Error('No tienes permisos para reactivar usuarios');
    }

    const { data: updatedMember, error } = await this.supabase
      .from('project_members')
      .update({ status: 'active' })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select(`
        *,
        user:users(id, name, email, active),
        invited_by_user:users!invited_by(id, name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Error al reactivar usuario: ${error.message}`);
    }

    return ProjectMemberEntity.fromDatabase(updatedMember);
  }
}
