'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useDroppable } from '@dnd-kit/core';
import { Issue, TeamMember, IssueStatus } from '../../../types/domain';
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
  issues,
  wipLimit,
  isOverWip,
  onIssueClick,
  team
}: BoardColumnProps) {
  // Configurar como área droppable con dnd-kit
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <motion.section
      ref={setNodeRef}
      layout
      className={`
        flex flex-col h-full bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-sm)] transition-all duration-300 relative
        ${isOver 
          ? 'bg-[var(--color-primary)]/5 shadow-[var(--shadow-lg)] scale-[1.02]' 
          : 'hover:shadow-[var(--shadow-md)]'
        }
      `}
      whileHover={{ y: isOver ? 0 : -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Drop Zone Overlay - Cubre toda la columna durante drag */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 border-4 border-[var(--color-primary)] border-dashed rounded-xl bg-[var(--color-primary)]/10 z-10 flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg"
          >
            ¡Suelta en {title}!
          </motion.div>
        </motion.div>
      )}

      {/* Contenido de la columna */}
      <div className={`flex flex-col h-full relative z-0 ${isOver ? 'opacity-80' : ''}`}>
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

      {/* Lista de issues con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 min-h-full">
          <AnimatePresence mode="popLayout">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                assigneeName={issue.assigneeId ? team[issue.assigneeId]?.name : undefined}
                onClick={onIssueClick}
              />
            ))}
          </AnimatePresence>

          {/* Estado vacío con feedback visual */}
          {issues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`
                flex flex-col items-center justify-center py-12 px-4 rounded-lg border-2 border-dashed text-center transition-all duration-300
                ${isOver 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                  : 'border-[var(--color-border)]/50 bg-[var(--color-surface-secondary)]/30'
                }
              `}
            >
              <motion.div
                animate={{ y: isOver ? [-2, 2, -2] : 0 }}
                transition={{ duration: 2, repeat: isOver ? Infinity : 0 }}
                className="text-[var(--color-text-secondary)] mb-2"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </motion.div>
              <Typography variant="caption" className="text-[var(--color-text-secondary)] font-medium">
                {isOver ? '¡Suelta aquí!' : 'Arrastra tareas aquí'}
              </Typography>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer con botón de agregar */}
      <footer className="border-t border-[var(--color-border)]/50 p-4 bg-[var(--color-surface)]/95 backdrop-blur-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200 group"
        >
          <span className="text-[var(--color-primary)] group-hover:rotate-90 transition-transform duration-200">
            {Icons.add}
          </span>
          <Typography variant="caption" className="font-medium">
            Agregar Issue
          </Typography>
        </motion.button>
      </footer>
      </div>
    </motion.section>
  );
}
