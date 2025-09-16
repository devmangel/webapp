import { ReactNode } from 'react';
import { DashboardShell } from 'modules/dashboard/components/DashboardShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
