import { NextResponse } from 'next/server';
import { getCurrentUser } from 'app/lib/auth/server';
import { ProjectDashboardService } from 'modules/projects/services/project-dashboard.service';


export async function GET() {
  try {
    // 1. Obtener usuario autenticado
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json(
        { message: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // 2. Crear instancia del servicio
    const dashboardService = new ProjectDashboardService();

    // 3. Obtener snapshot filtrado por usuario
    console.log('Fetching dashboard snapshot for user:', currentUser.id);
    const dashboardData = await dashboardService.getUserDashboardSnapshot(currentUser.id);

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error('Failed to load dashboard snapshot', error);
    return NextResponse.json(
      { message: 'Error retrieving dashboard snapshot' },
      { status: 500 },
    );
  }
}
