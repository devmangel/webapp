/**
 * API Routes para gestionar miembros de proyecto
 * GET: Obtener miembros del proyecto
 * POST: Invitar usuario al proyecto
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProjectMembersService } from 'modules/projects/services/project-members.service';
import { z } from 'zod';

// Esquema para validar invitación de usuario
const InviteUserSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'PM', 'CONTRIBUTOR', 'VIEWER'])
});

// Obtener miembros del proyecto
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = await params;
    
    // TODO: Obtener userId del token/session de autenticación
    const userId = request.headers.get('x-user-id'); // Placeholder
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const projectMembersService = new ProjectMembersService();
    const members = await projectMembersService.getProjectMembers(projectId, userId);

    return NextResponse.json({
      success: true,
      data: members,
      meta: {
        total: members.length,
        projectId
      }
    });

  } catch (error) {
    console.error('Error al obtener miembros del proyecto:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('No tienes acceso') ? 403 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Invitar usuario al proyecto
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    
    // TODO: Obtener userId del token/session de autenticación
    const userId = request.headers.get('x-user-id'); // Placeholder
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Validar entrada
    const validation = InviteUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    const projectMembersService = new ProjectMembersService();
    const newMember = await projectMembersService.inviteUserToProject({
      projectId,
      email,
      role,
      invitedBy: userId
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario invitado exitosamente',
      data: newMember
    }, { status: 201 });

  } catch (error) {
    console.error('Error al invitar usuario:', error);
    
    if (error instanceof Error) {
      // Manejar diferentes tipos de errores
      let statusCode = 400;
      if (error.message.includes('No tienes permisos')) {
        statusCode = 403;
      } else if (error.message.includes('Usuario no encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('ya es miembro') || error.message.includes('ya tiene una invitación')) {
        statusCode = 409; // Conflict
      }

      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
