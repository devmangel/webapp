'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { formatDate } from '../utils/format';
import SidebarSignOutButton from './SidebarSignOutButton';

interface Project {
  id: string;
  name: string;
  sprintIds: string[];
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeProjectId: string;
  projects: Record<string, Project>;
  sprint?: Sprint;
  navItems: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}


export function DashboardSidebar({
  collapsed,
  onToggleCollapsed,
  mobileMenuOpen,
  onToggleMobileMenu,
  sprint,
  navItems
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar Desktop */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm"
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="overline" color="secondary">Panel de control</Typography>
              {sprint && (
                <div className="mt-6">
                  <Typography variant="caption" color="secondary" className="mt-1">
                    {sprint.name} · {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                  </Typography>
                </div>
              )}
            </motion.div>
          )}

          <Button
            size="sm"
            onClick={onToggleCollapsed}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <svg
                className="h-4 w-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
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
                    <span className={collapsed ? '' : 'mr-3'}>
                      {item.icon}
                    </span>
                    {!collapsed && (
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

        {/* Footer con botón de cerrar sesión */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <SidebarSignOutButton collapsed={collapsed} />
        </div>
      </motion.aside>

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
                    onClick={onToggleMobileMenu}
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
            {/* Botón de cerrar sesión para móvil */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <SidebarSignOutButton collapsed={false} />
            </div>
          </nav>
        </motion.div>
      )}
    </>
  );
}
