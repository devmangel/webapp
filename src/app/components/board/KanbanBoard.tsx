'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { useDashboardStore } from '../../lib/store/dashboard-store';
import { Issue, IssueStatus } from '../../../types/domain';
import { BoardColumn } from './BoardColumn';
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

  // Estados para dnd-kit
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Configurar sensores para dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere mover 8px para activar drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handlers para DndContext
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Encontrar el issue que se está arrastrando
    const draggedIssue = filteredIssues.find(issue => issue.id === active.id);
    setActiveIssue(draggedIssue || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveIssue(null);
    
    if (!over) return;
    
    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;
    
    // Solo mover si el estado es diferente
    const currentIssue = filteredIssues.find(issue => issue.id === issueId);
    if (currentIssue && currentIssue.status !== newStatus) {
      moveIssue(issueId, newStatus);
    }
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex flex-col h-full bg-[var(--color-app-background)] ${className || ''}`}>

        {/* Métricas del Board */}
        <BoardMetrics issues={filteredIssues} />

        {/* Tablero Kanban */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full px-4 pb-4">
            <div className="flex gap-4 h-full overflow-x-auto relative">
              {/* Separadores verticales de altura completa */}
              <div className="absolute inset-y-0 pointer-events-none">
                {BOARD_COLUMNS.map((column, index) => {
                  // No mostrar separador después de la última columna
                  if (index === BOARD_COLUMNS.length - 1) return null;
                  
                  const separatorPosition = (index + 1) * 336; // w-80 = 320px + gap-4 = 16px = 336px
                  
                  let separatorColor = '';
                  switch (column.status) {
                    case 'TODO':
                      separatorColor = activeId ? 'border-gray-400' : 'border-gray-300';
                      break;
                    case 'IN_PROGRESS':
                      separatorColor = activeId ? 'border-blue-500' : 'border-blue-400';
                      break;
                    case 'IN_REVIEW':
                      separatorColor = activeId ? 'border-amber-500' : 'border-amber-400';
                      break;
                    default:
                      separatorColor = activeId ? 'border-gray-400' : 'border-gray-300';
                  }
                  
                  return (
                    <motion.div
                      key={`separator-${column.status}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`
                        absolute top-0 bottom-0 w-1 transition-all duration-300
                        ${separatorColor}
                        border-r-2 border-dashed
                        ${activeId ? 'opacity-100 border-r-4' : 'opacity-60 border-r-2'}
                      `}
                      style={{
                        left: `${separatorPosition - 8}px` // Centrar en el gap
                      }}
                    />
                  );
                })}
              </div>

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
                      className="flex-shrink-0 w-80 h-full relative z-10"
                    >
                      <BoardColumn
                        status={column.status}
                        title={column.title}
                        description={column.description}
                        accent={column.accent}
                        issues={columnIssues}
                        wipLimit={column.wipLimit}
                        isOverWip={isOverWip}
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

        {/* Drag Overlay para mostrar el elemento durante el drag */}
        <DragOverlay>
          {activeIssue ? (
            <div className="opacity-80 rotate-6 transform">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 shadow-lg">
                <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                  {activeIssue.title}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {activeIssue.key}
                </p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
