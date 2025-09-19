'use client';

import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Project } from '../../../types/domain/dashboard';

interface BoardHeaderProps {
  project: Project;
  totalIssues: number;
}

const Icons = {
  project: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  issues: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  add: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  filter: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
  )
};

export function BoardHeader({ project, totalIssues }: BoardHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Project Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
              <span className="text-[var(--color-primary)]">
                {Icons.project}
              </span>
            </div>
            <div>
              <Typography variant="h5" className="text-[var(--color-text-primary)] font-semibold">
                {project.name}
              </Typography>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] px-2 py-1 rounded-md">
                  {project.code}
                </span>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                  {Icons.issues}
                  <span>{totalIssues} issues</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white border-none shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200"
          >
            {Icons.add}
            <span>Nueva Issue</span>
          </Button>
          
          <Button
            size="sm"
            className="flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200"
          >
            {Icons.filter}
            <span className="hidden sm:inline text-black">Configurar Vista</span>
          </Button>
        </div>
      </div>

      {/* Project Description */}
      {project.description && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-3 pt-3 border-t border-[var(--color-border)]/50"
        >
          <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl line-clamp-2">
            {project.description}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
