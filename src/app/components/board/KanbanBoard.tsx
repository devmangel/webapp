'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboardStore } from '../../../modules/dashboard/state/dashboard-store';
import { Issue, IssueStatus } from '../../../types/domain/dashboard';
import { BoardColumn } from './BoardColumn';
import { BoardHeader } from './BoardHeader';
import { EmptyState } from './EmptyState';
import { BoardMetrics } from './BoardMetrics';

interface KanbanBoardProps {
  className?: string;
}

const BOARD_COLUMNS: Array<{
  status: IssueStatus;
  title: string;
  description: string;
  accent: string;
  wipLimit?: number;
}> = [
  {
    status: 'TODO',
    title: 'Por Hacer',
    description: 'Tareas pendientes de iniciar',
    accent: 'border-l-4 border-l-gray-400',
    wipLimit: 10
  },
  {
    status: 'IN_PROGRESS',
    title: 'En Progreso',
    description: 'Tareas en desarrollo',
    accent: 'border-l-4 border-l-blue-500',
    wipLimit: 5
  },
  {
    status: 'IN_REVIEW',
    title: 'En Revisión',
    description: 'Tareas en proceso de revisión',
    accent: 'border-l-4 border-l-amber-500',
    wipLimit: 3
  },
  {
    status: 'DONE',
    title: 'Completadas',
    description: 'Tareas finalizadas',
    accent: 'border-l-4 border-l-green-500'
  }
];

export function KanbanBoard({ className }: KanbanBoardProps) {
  const {
    issues,
    sprints,
    team,
    projects,
    filters,
    activeProjectId,
    moveIssue,
    setSelectedIssue,
    isLoading
  } = useDashboardStore();

  // Filtrar issues según los filtros activos
  const filteredIssues = useMemo(() => {
    return Object.values(issues).filter(issue => {
      // Filtrar por proyecto usando la relación con sprints
      if (filters.projectId && issue.sprintId) {
        const issueSprint = sprints[issue.sprintId];
        if (issueSprint && issueSprint.projectId !== filters.projectId) return false;
      }
      
      // Filtros adicionales
      if (filters.sprintId && issue.sprintId !== filters.sprintId) return false;
      if (filters.assigneeId && issue.assigneeId !== filters.assigneeId) return false;
      if (filters.issueType !== 'ALL' && issue.type !== filters.issueType) return false;
      if (filters.searchTerm && !issue.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      
      // Filtrar por etiquetas si están presentes
      if (filters.labels && filters.labels.length > 0) {
        const issueLabels = issue.labels || [];
        const hasMatchingLabel = filters.labels.some(label => issueLabels.includes(label));
        if (!hasMatchingLabel) return false;
      }
      
      return true;
    });
  }, [issues, filters, sprints]);

  // Agrupar issues por estado
  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: []
    };

    filteredIssues.forEach(issue => {
      grouped[issue.status].push(issue);
    });

    return grouped;
  }, [filteredIssues]);

  const currentProject = projects[activeProjectId];
  const hasActiveProject = currentProject && activeProjectId;

  // Handlers
  const handleIssueDrop = (issueId: string, newStatus: IssueStatus) => {
    moveIssue(issueId, newStatus);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue.id);
  };

  // Estado sin proyecto seleccionado
  if (!hasActiveProject) {
    return (
      <div className={`flex flex-col h-full ${className || ''}`}>
        <EmptyState />
      </div>
    );
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className={`flex flex-col h-full ${className || ''}`}>
        <div className="flex items-center justify-center flex-1">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--color-text-secondary)] text-sm">Cargando tablero...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-[var(--color-app-background)] ${className || ''}`}>
      {/* Header del Board */}
      <BoardHeader 
        project={currentProject}
        totalIssues={filteredIssues.length}
      />

      {/* Métricas del Board */}
      <BoardMetrics issues={filteredIssues} />

      {/* Tablero Kanban */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-4 pb-4">
          <div className="flex gap-4 h-full overflow-x-auto">
            <AnimatePresence mode="wait">
              {BOARD_COLUMNS.map((column, index) => {
                const columnIssues = issuesByStatus[column.status];
                const isOverWip = column.wipLimit ? columnIssues.length > column.wipLimit : undefined;

                return (
                  <motion.div
                    key={column.status}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex-shrink-0 w-80 h-full"
                  >
                    <BoardColumn
                      status={column.status}
                      title={column.title}
                      description={column.description}
                      accent={column.accent}
                      issues={columnIssues}
                      wipLimit={column.wipLimit}
                      isOverWip={isOverWip}
                      onIssueDrop={handleIssueDrop}
                      onIssueClick={handleIssueClick}
                      team={team}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
