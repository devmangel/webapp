'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { useDashboardStore } from '../state/dashboard-store';
import { FiltersBar } from './FiltersBar';
import { formatDate } from '../utils/format';

interface DashboardShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon?: JSX.Element;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const activeProjectId = useDashboardStore((state) => state.activeProjectId);
  const filters = useDashboardStore((state) => state.filters);
  const projects = useDashboardStore((state) => state.projects);
  const sprints = useDashboardStore((state) => state.sprints);

  const localePrefix = useMemo(() => {
    const segments = pathname?.split('/').filter(Boolean) ?? [];
    const localeCandidate = segments[0] ?? 'en';
    return `/${localeCandidate}`;
  }, [pathname]);

  const sprint = filters.sprintId ? sprints[filters.sprintId] : undefined;

  const navItems: NavItem[] = useMemo(() => {
    const projectBoardPath = activeProjectId
      ? `${localePrefix}/dashboard/project/${activeProjectId}/board`
      : `${localePrefix}/dashboard`;
    const projectBacklogPath = activeProjectId
      ? `${localePrefix}/dashboard/project/${activeProjectId}/backlog`
      : `${localePrefix}/dashboard`;

    return [
      { label: 'Overview', href: `${localePrefix}/dashboard/overview` },
      { label: 'Team', href: `${localePrefix}/dashboard/team` },
      { label: 'Board', href: projectBoardPath },
      { label: 'Backlog', href: projectBacklogPath },
      { label: 'Import', href: `${localePrefix}/dashboard/import` },
      { label: 'AI Preview', href: `${localePrefix}/dashboard/ai/preview` },
    ];
  }, [activeProjectId, localePrefix]);

  return (
    <div className="flex min-h-screen bg-neutral-light text-textPrimary-light dark:bg-neutral-dark dark:text-textPrimary-dark">
      <aside className="hidden w-64 flex-col border-r border-border-light bg-white/80 p-6 dark:border-border-dark dark:bg-neutral-900/80 md:flex">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
            Panel de control
          </p>
          <h1 className="mt-1 text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            {projects[activeProjectId]?.name ?? 'Selecciona proyecto'}
          </h1>
          {sprint ? (
            <p className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              {sprint.name} · {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
            </p>
          ) : null}
        </div>
        <nav className="mt-4 space-y-2 text-sm">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-textSecondary-light hover:bg-neutral-100 hover:text-textPrimary-light dark:text-textSecondary-dark dark:hover:bg-neutral-800 dark:hover:text-textPrimary-dark'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border-light bg-white/70 backdrop-blur dark:border-border-dark dark:bg-neutral-900/70">
          <FiltersBar />
          <div className="border-t border-border-light/70 bg-white/80 px-2 py-2 dark:border-border-dark/70 dark:bg-neutral-900 md:hidden">
            <nav className="flex gap-2 overflow-x-auto text-sm">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-neutral-200 text-textSecondary-light hover:bg-neutral-300 dark:bg-neutral-800 dark:text-textSecondary-dark dark:hover:bg-neutral-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 bg-neutral-light/60 px-4 py-6 dark:bg-neutral-950/60 md:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
