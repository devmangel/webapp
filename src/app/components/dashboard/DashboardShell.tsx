'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useDashboardStore } from '../../../modules/dashboard/state/dashboard-store';
import { useDashboardInit } from '../../../hooks/useDashboardInit';
import { FiltersBar } from './FiltersBar';
import { formatDate } from '../utils/format';
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
  menu: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  close: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
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
      { label: 'Team', href: `${localePrefix}/dashboard/team`, icon: Icons.team },
      { label: 'Board', href: projectBoardPath, icon: Icons.board },
      { label: 'Backlog', href: projectBacklogPath, icon: Icons.backlog },
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
      {/* Sidebar Desktop */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm"
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="overline" color="secondary">Panel de control</Typography>
              <Typography variant="h4" className="mt-1">
                {projects[activeProjectId]?.name ?? 'Selecciona proyecto'}
              </Typography>
              {sprint && (
                <Typography variant="caption" color="secondary" className="mt-1">
                  {sprint.name} · {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                </Typography>
              )}
            </motion.div>
          )}
          
          <Button
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.div>
          </Button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span className={sidebarCollapsed ? '' : 'mr-3'}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      </motion.aside>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Mobile menu button */}
          <div className="flex items-center justify-between px-4 py-4 lg:hidden">
            <Typography variant="h4">
              {projects[activeProjectId]?.name ?? 'Dashboard'}
            </Typography>
            <Button
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? Icons.close : Icons.menu}
            </Button>
          </div>

          <FiltersBar />
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 lg:hidden overflow-hidden"
          >
            <nav className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className={`
                        flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                        }
                      `}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
          <div className="h-full px-4 py-6 lg:px-8">
            <div className="mx-auto h-full max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
