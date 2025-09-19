'use client';

import { ReactNode, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDashboardStore } from '../../lib/store/dashboard-store';
import { useDashboardInit } from '../../../hooks/useDashboardInit';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardMainContent } from './DashboardMainContent';
import Spinner from '../ui/Spinner';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface DashboardShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

// Iconos minimalistas estilo Apple (SVG inline)
const Icons = {
  overview: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  team: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  board: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  backlog: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  import: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  ai: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isHydrated, isLoading, loadError } = useDashboardInit();

  const activeProjectId = useDashboardStore((state) => state.activeProjectId);
  const filters = useDashboardStore((state) => state.filters);
  const projects = useDashboardStore((state) => state.projects);
  const sprints = useDashboardStore((state) => state.sprints);

  const localePrefix = useMemo(() => {
    const segments = pathname?.split('/').filter(Boolean) ?? [];
    const localeCandidate = segments[0] ?? 'en';
    return `/${localeCandidate}`;
  }, [pathname]);

  const navItems: NavItem[] = useMemo(() => {
    const projectBoardPath = activeProjectId
      ? `${localePrefix}/dashboard/project/${activeProjectId}/board`
      : `${localePrefix}/dashboard/board`;
    const projectBacklogPath = activeProjectId
      ? `${localePrefix}/dashboard/project/${activeProjectId}/backlog`
      : `${localePrefix}/dashboard/backlog`;

    return [
      { label: 'Overview', href: `${localePrefix}/dashboard/overview`, icon: Icons.overview },
      { label: 'Board', href: projectBoardPath, icon: Icons.board },
      { label: 'Backlog', href: projectBacklogPath, icon: Icons.backlog },
      { label: 'Team', href: `${localePrefix}/dashboard/team`, icon: Icons.team },
      { label: 'Import', href: `${localePrefix}/dashboard/import`, icon: Icons.import },
      { label: 'AI Preview', href: `${localePrefix}/dashboard/ai/preview`, icon: Icons.ai },
    ];
  }, [activeProjectId, localePrefix]);

  // Estados de error y carga
  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <Typography variant="h3" className="mb-2">Error al cargar el dashboard</Typography>
          <Typography variant="body" color="secondary" className="mb-6">{loadError}</Typography>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Spinner height={48} width={48} />
          <Typography variant="body" color="secondary" className="mt-4">
            Cargando dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  const sprint = filters.sprintId ? sprints[filters.sprintId] : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        activeProjectId={activeProjectId}
        projects={projects}
        sprint={sprint}
        navItems={navItems}
      />

      <DashboardMainContent
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        activeProjectId={activeProjectId}
        projects={projects}
      >
        {children}
      </DashboardMainContent>
    </div>
  );
}
