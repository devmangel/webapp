
'use client';

import { motion } from 'motion/react';
import { useDraggable } from '@dnd-kit/core';
import { Issue } from '../../../types/domain/dashboard';
import { Typography } from '../ui/Typography';
import { formatPoints } from '../utils/format';

interface IssueCardProps {
  issue: Issue;
  assigneeName?: string;
  onClick?: (issue: Issue) => void;
}

const Icons = {
  blocked: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
    </svg>
  ),
  epic: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  story: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  task: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  comments: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
};

// Configuración de colores y estilos
const ISSUE_TYPE_CONFIG = {
  EPIC: {
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-700',
    icon: Icons.epic,
    label: 'Epic'
  },
  STORY: {
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700',
    icon: Icons.story,
    label: 'Story'
  },
  TASK: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700',
    icon: Icons.task,
    label: 'Task'
  }
};

const PRIORITY_CONFIG = {
  LOW: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Baja' },
  MEDIUM: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200', label: 'Media' },
  HIGH: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200', label: 'Alta' },
  CRITICAL: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200', label: 'Crítica' }
};

export function IssueCard({ issue, assigneeName, onClick }: IssueCardProps) {
  // Configurar como elemento draggable con dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  });

  const typeConfig = ISSUE_TYPE_CONFIG[issue.type];
  const priorityConfig = PRIORITY_CONFIG[issue.priority];
  const hasComments = issue.comments && issue.comments.length > 0;

  const handleClick = () => {
    if (!isDragging) {
      onClick?.(issue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isDragging) {
      onClick?.(issue);
    }
  };

  // Aplicar transformación de drag
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      whileHover={{ scale: isDragging ? 1 : 1.02, y: isDragging ? 0 : -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative cursor-pointer select-none rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] 
        hover:shadow-[var(--shadow-md)] transition-all duration-200 overflow-hidden
        ${isDragging ? 'opacity-50' : ''}
        ${issue.blocked ? 'ring-2 ring-[var(--color-error)]/20 border-[var(--color-error)]/30' : ''}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Issue ${issue.key}: ${issue.title}`}
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Typography 
              variant="caption" 
              className="text-[var(--color-text-secondary)] font-mono font-semibold uppercase tracking-wide"
            >
              {issue.key}
            </Typography>
            {issue.blocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-[var(--color-error)]"
                title="Issue bloqueada"
              >
                {Icons.blocked}
              </motion.div>
            )}
          </div>
          
          {/* Issue Type Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${typeConfig.color}`}>
            {typeConfig.icon}
            <span>{typeConfig.label}</span>
          </div>
        </div>

        {/* Title */}
        <Typography 
          variant="h6" 
          className="text-[var(--color-text-primary)] font-medium leading-snug line-clamp-2 mb-2"
        >
          {issue.title}
        </Typography>

        {/* Summary */}
        {issue.summary && (
          <Typography 
            variant="caption" 
            className="text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed"
          >
            {issue.summary}
          </Typography>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Story Points */}
          {issue.storyPoints && (
            <span className="inline-flex items-center px-2 py-1 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-xs font-medium rounded-md">
              {formatPoints(issue.storyPoints)}
            </span>
          )}

          {/* Priority */}
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${priorityConfig.color}`}>
            {priorityConfig.label}
          </span>

          {/* Comments */}
          {hasComments && (
            <div className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              {Icons.comments}
              <span className="text-xs">{issue.comments.length}</span>
            </div>
          )}
        </div>

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {issue.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="inline-block px-2 py-0.5 bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] text-xs rounded-full"
              >
                #{label}
              </span>
            ))}
            {issue.labels.length > 3 && (
              <span className="inline-block px-2 py-0.5 bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] text-xs rounded-full">
                +{issue.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Assignee */}
        {assigneeName && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {assigneeName.charAt(0).toUpperCase()}
              </div>
              <Typography variant="caption" className="text-[var(--color-text-secondary)] font-medium">
                {assigneeName}
              </Typography>
            </div>
          </div>
        )}

        {/* Blocked indicator */}
        {issue.blocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 px-3 py-2 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg"
          >
            <span className="text-[var(--color-error)]">{Icons.blocked}</span>
            <Typography variant="caption" className="text-[var(--color-error)] font-semibold">
              Issue Bloqueada
            </Typography>
          </motion.div>
        )}
      </div>

      {/* Hover overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 pointer-events-none rounded-xl"
      />
    </motion.article>
  );
}
