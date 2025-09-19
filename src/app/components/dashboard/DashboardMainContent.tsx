'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { EnhancedHeader } from './EnhancedHeader';

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

export function DashboardMainContent({
  children,
  mobileMenuOpen,
  onToggleMobileMenu,
}: DashboardMainContentProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Enhanced Header */}
      <EnhancedHeader
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={onToggleMobileMenu}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--color-app-background)' }}>
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
