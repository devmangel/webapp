/**
 * API Route: /api/users
 * Gestión de usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth/config';
import { userAuthService } from '../../../modules/users/services/user-auth.service';
import { z } from 'zod';

// Schema de validación para crear usuario
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['ADMIN', 'PM', 'CONTRIBUTOR', 'VIEWER']).optional(),
  timezone: z.string().optional(),
  capacityPerSprint: z.number().positive().optional(),
  skills: z.array(z.string()).optional()
});

// Schema para filtros de búsqueda
const getUsersSchema = z.object({
  role: z.enum(['ADMIN', 'PM', 'CONTRIBUTOR', 'VIEWER']).optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

/**
 * GET /api/users
 * Obtiene lista de usuarios con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins y PMs pueden ver lista completa de usuarios
    if (!['ADMIN', 'PM'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Parsear parámetros de consulta
    const filters = {
      role: searchParams.get('role') || undefined,
      active: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // Validar filtros
    const validatedFilters = getUsersSchema.parse(filters);

    const users = await userAuthService.getUsers(validatedFilters);

    return NextResponse.json({
      data: users,
      pagination: {
        limit: validatedFilters.limit,
        offset: validatedFilters.offset,
        total: users.length // En producción, necesitarías una query separada para el total
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error en GET /api/users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Crea un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins pueden crear usuarios directamente
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo los administradores pueden crear usuarios' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Verificar que el email no esté en uso
    const emailTaken = await userAuthService.isEmailTaken(validatedData.email);
    if (emailTaken) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 409 }
      );
    }

    const newUser = await userAuthService.createUser({
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role || 'CONTRIBUTOR',
      timezone: validatedData.timezone,
      capacityPerSprint: validatedData.capacityPerSprint,
      skills: validatedData.skills
    });

    // No retornar información sensible
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      timezone: newUser.timezone,
      skills: newUser.skills
    };

    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente',
        data: userResponse
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

    console.error('Error en POST /api/users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
