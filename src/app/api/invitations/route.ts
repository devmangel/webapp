/**
 * API Route: /api/invitations
 * Gestión de invitaciones de usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth/config';
import { userInvitationService } from '../../../modules/users/services/user-invitation.service';
import { z } from 'zod';

// Schema de validación para crear invitación
const createInvitationSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'PM', 'CONTRIBUTOR', 'VIEWER']),
  projectId: z.string().uuid().optional(),
  expiresInDays: z.number().min(1).max(30).optional()
});

// Schema para filtros de invitaciones
const getInvitationsSchema = z.object({
  invitedBy: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  role: z.enum(['ADMIN', 'PM', 'CONTRIBUTOR', 'VIEWER']).optional(),
  limit: z.number().min(1).max(100).optional()
});

/**
 * GET /api/invitations
 * Obtiene invitaciones pendientes del sistema
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins y PMs pueden ver invitaciones
    if (!['ADMIN', 'PM'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parsear parámetros de consulta
    const filters = {
      invitedBy: searchParams.get('invitedBy') || undefined,
      projectId: searchParams.get('projectId') || undefined,
      role: searchParams.get('role') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    };

    // Validar filtros
    const validatedFilters = getInvitationsSchema.parse(filters);

    const invitations = await userInvitationService.getPendingInvitations(validatedFilters);
    
    return NextResponse.json({
      data: invitations,
      total: invitations.length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error en GET /api/invitations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations
 * Crea una nueva invitación
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins y PMs pueden crear invitaciones
    if (!['ADMIN', 'PM'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Solo administradores y PMs pueden enviar invitaciones' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createInvitationSchema.parse(body);

    const newInvitation = await userInvitationService.createInvitation({
      email: validatedData.email,
      role: validatedData.role,
      invitedBy: session.user.id,
      projectId: validatedData.projectId,
      expiresInDays: validatedData.expiresInDays
    });

    return NextResponse.json(
      {
        message: 'Invitación enviada exitosamente',
        data: newInvitation
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/invitations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
