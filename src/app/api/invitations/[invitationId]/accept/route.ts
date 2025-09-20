/**
 * API Route para aceptar invitaciones de proyecto
 * POST: Acepta una invitación de proyecto
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserProjectsService } from 'modules/users/services/user-projects.service';

// Acepta una invitación de proyecto
export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const { invitationId } = await params;
    
    // TODO: Obtener userId del token/session de autenticación
    const userId = request.headers.get('x-user-id'); // Placeholder
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const userProjectsService = new UserProjectsService();
    const project = await userProjectsService.acceptProjectInvitation(invitationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Invitación aceptada exitosamente',
      data: project
    });

  } catch (error) {
    console.error('Error al aceptar invitación:', error);
    
    if (error instanceof Error) {
      let statusCode = 400;
      if (error.message.includes('no encontrada') || error.message.includes('ya procesada')) {
        statusCode = 404;
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
