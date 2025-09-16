import { ReactNode } from 'react';
import { DashboardShell } from 'app/components/dashboard/DashboardShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
