'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { FiltersBar } from './FiltersBar';

interface Project {
  id: string;
  name: string;
  sprintIds: string[];
}

interface DashboardMainContentProps {
  children: ReactNode;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeProjectId: string;
  projects: Record<string, Project>;
}

// Iconos para mobile menu
const Icons = {
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

export function DashboardMainContent({
  children,
  mobileMenuOpen,
  onToggleMobileMenu,
  activeProjectId,
  projects
}: DashboardMainContentProps) {
  return (
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
            onClick={onToggleMobileMenu}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-gray-600 dark:text-gray-400">
              {mobileMenuOpen ? Icons.close : Icons.menu}
            </span>
          </Button>
        </div>

        <FiltersBar />
      </header>

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
  );
}
