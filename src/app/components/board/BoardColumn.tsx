'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue, TeamMember, IssueStatus } from '../../../types/domain/dashboard';
import { IssueCard } from './IssueCard';
import { Typography } from '../ui/Typography';

interface BoardColumnProps {
  status: IssueStatus;
  title: string;
  description: string;
  accent: string;
  issues: Issue[];
  wipLimit?: number;
  isOverWip?: boolean;
  onIssueDrop: (issueId: string, status: IssueStatus) => void;
  onIssueClick: (issue: Issue) => void;
  team: Record<string, TeamMember>;
}

const Icons = {
  add: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  warning: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
};

export function BoardColumn({
  status,
  title,
  description,
  accent,
  issues,
  wipLimit,
  isOverWip,
  onIssueDrop,
  onIssueClick,
  team
}: BoardColumnProps) {
  const [isTargeted, setIsTargeted] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsTargeted(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Solo quitar el estado si realmente salimos del contenedor
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsTargeted(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const issueId = event.dataTransfer.getData('text/issue-id');
    if (issueId) {
      onIssueDrop(issueId, status);
    }
    setIsTargeted(false);
    setIsDragActive(false);
  };

  const handleDragStart = () => {
    setIsDragActive(true);
  };

  const handleDragEnd = () => {
    setIsDragActive(false);
  };

  return (
    <motion.section
      layout
      className={`
        flex flex-col h-full bg-[var(--color-surface)] border-2 border-dashed rounded-xl shadow-[var(--shadow-sm)] transition-all duration-300
        ${isTargeted 
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[var(--shadow-lg)] scale-105' 
          : 'border-[var(--color-border)] hover:border-[var(--color-border)]/80'
        }
        ${accent}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header de la columna */}
      <header className="p-4 border-b border-[var(--color-border)]/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Typography variant="h6" className="text-[var(--color-text-primary)] font-semibold">
              {title}
            </Typography>
            <motion.span 
              key={issues.length}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[var(--color-surface-secondary)] text-xs font-medium text-[var(--color-text-secondary)] rounded-full"
            >
              {issues.length}
            </motion.span>
          </div>

          {/* Indicador WIP */}
          {isOverWip && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-1 px-2 py-1 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-md"
            >
              <span className="text-xs">{Icons.warning}</span>
              <span className="text-xs font-medium">WIP Excedido</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="caption" className="text-[var(--color-text-secondary)]">
            {description}
          </Typography>
          
          {wipLimit && (
            <Typography variant="caption" className="text-[var(--color-text-secondary)]">
              Límite: {wipLimit}
            </Typography>
          )}
        </div>
      </header>

      {/* Contenido de la columna */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3 min-h-full">
          <AnimatePresence mode="popLayout">
            {issues.map((issue, index) => (
              <div
                key={issue.id}
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.setData('text/issue-id', issue.id);
                  handleDragStart();
                }}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.05,
                    layout: { duration: 0.3 }
                  }}
                >
                  <IssueCard
                    issue={issue}
                    assigneeName={issue.assigneeId ? team[issue.assigneeId]?.name : undefined}
                    onClick={onIssueClick}
                    isDragActive={isDragActive}
                  />
                </motion.div>
              </div>
            ))}
          </AnimatePresence>

          {/* Estado vacío */}
          {issues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`
                flex flex-col items-center justify-center py-12 px-4 rounded-lg border-2 border-dashed text-center transition-all duration-300
                ${isTargeted 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                  : 'border-[var(--color-border)]/50 bg-[var(--color-surface-secondary)]/30'
                }
              `}
            >
              <motion.div
                animate={{ y: isTargeted ? [-2, 2, -2] : 0 }}
                transition={{ duration: 2, repeat: isTargeted ? Infinity : 0 }}
                className="text-[var(--color-text-secondary)] mb-2"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </motion.div>
              <Typography variant="caption" className="text-[var(--color-text-secondary)] font-medium">
                {isTargeted ? '¡Suelta aquí!' : 'Arrastra tareas aquí'}
              </Typography>
            </motion.div>
          )}

          {/* Botón para agregar nueva issue */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 p-3 mt-4 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200 group"
          >
            <span className="text-[var(--color-primary)] group-hover:rotate-90 transition-transform duration-200">
              {Icons.add}
            </span>
            <Typography variant="caption" className="font-medium">
              Agregar Issue
            </Typography>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
