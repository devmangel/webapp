import { ReactNode } from 'react';
import { DashboardShell } from 'app/components/dashboard/DashboardShell';
import { requireAuth } from 'app/lib/auth/server';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({ 
  children, 
  params 
}: DashboardLayoutProps) {
  // Obtener el locale de los parámetros (Next.js 15)
  const { locale } = await params;
  
  // Verificar autenticación en el servidor
  await requireAuth(undefined, locale);

  return <DashboardShell>{children}</DashboardShell>;
}
