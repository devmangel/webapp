'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useDashboardStore } from '../../lib/store/dashboard-store';
import { Issue, Epic } from 'types/domain/dashboard';
import { issueMatchesFilters } from '../utils/filters';
import { BacklogMetrics } from './BacklogMetrics';
import { EpicPlanningCard } from './EpicPlanningCard';

interface BacklogPlanningViewProps {
  projectId: string;
}

interface EpicGroup {
  epic?: Epic;
  stories: Array<{
    story: Issue;
    tasks: Issue[];
  }>;
  orphanTasks: Issue[];
}

export function BacklogPlanningView({ projectId }: BacklogPlanningViewProps) {
  const projects = useDashboardStore((state) => state.projects);
  const epics = useDashboardStore((state) => state.epics);
  const issues = useDashboardStore((state) => state.issues);
  const team = useDashboardStore((state) => state.team);
  const filters = useDashboardStore((state) => state.filters);
  const setProject = useDashboardStore((state) => state.setProject);
  const updateIssue = useDashboardStore((state) => state.updateIssue);
  const resetFilters = useDashboardStore((state) => state.resetFilters);

  const project = projects[projectId];

  useEffect(() => {
    if (project && filters.projectId !== projectId) {
      setProject(projectId);
    }
  }, [project, projectId, filters.projectId, setProject]);

  // Obtener issues del proyecto
  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  // Filtrar issues
  const filteredIssues = useMemo(
    () => projectIssues.filter((issue) => issueMatchesFilters(issue, { ...filters, projectId })),
    [projectIssues, filters, projectId],
  );

  // Agrupar por épicas
  const epicGroups = useMemo(() => {
    const epicMap = new Map<string, EpicGroup>();
    const storyMap = new Map<string, { story: Issue; tasks: Issue[] }>();

    // Primero, crear grupos para cada historia
    filteredIssues.forEach((issue) => {
      if (issue.type === 'STORY') {
        storyMap.set(issue.id, { story: issue, tasks: [] });
      }
    });

    // Luego, asignar tareas a sus historias o como huérfanas
    filteredIssues.forEach((issue) => {
      if (issue.type === 'TASK') {
        if (issue.storyId && storyMap.has(issue.storyId)) {
          storyMap.get(issue.storyId)!.tasks.push(issue);
        } else if (issue.epicId) {
          // Tarea huérfana con épica
          const epic = epics[issue.epicId];
          if (!epicMap.has(issue.epicId)) {
            epicMap.set(issue.epicId, {
              epic,
              stories: [],
              orphanTasks: [],
            });
          }
          epicMap.get(issue.epicId)!.orphanTasks.push(issue);
        }
      }
    });

    // Finalmente, asignar historias a épicas
    storyMap.forEach((storyGroup) => {
      const epicId = storyGroup.story.epicId ?? 'sin-epica';
      const epic = storyGroup.story.epicId ? epics[storyGroup.story.epicId] : undefined;
      
      if (!epicMap.has(epicId)) {
        epicMap.set(epicId, {
          epic,
          stories: [],
          orphanTasks: [],
        });
      }
      epicMap.get(epicId)!.stories.push(storyGroup);
    });

    // Ordenar historias dentro de cada épica por prioridad y fecha de creación
    epicMap.forEach((group) => {
      group.stories.sort((a, b) => {
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const aPriority = priorityOrder[a.story.priority];
        const bPriority = priorityOrder[b.story.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Mayor prioridad primero
        }
        
        return new Date(a.story.createdAt).getTime() - new Date(b.story.createdAt).getTime();
      });
    });

    return Array.from(epicMap.values()).sort((a, b) => {
      // Épicas sin definir van al final
      if (!a.epic && b.epic) return 1;
      if (a.epic && !b.epic) return -1;
      if (!a.epic && !b.epic) return 0;
      
      // Ordenar por nombre de épica
      return a.epic!.name.localeCompare(b.epic!.name);
    });
  }, [filteredIssues, epics]);

  // Handlers
  const handleIssueUpdate = (issueId: string, updates: Partial<Issue>) => {
    updateIssue(issueId, updates);
  };

  const handleStoryReorder = (storyId: string, direction: 'up' | 'down') => {
    // Aquí implementarías la lógica de reordenamiento
    // Por ahora solo log para desarrollo
    console.log(`Reordering story ${storyId} ${direction}`);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Métricas del backlog */}
      <BacklogMetrics
        issues={filteredIssues}
        epics={epics}
      />

      {/* Lista de épicas y historias */}
      <div className="space-y-4">
        {epicGroups.length > 0 ? (
          epicGroups.map((epicGroup, index) => (
            <motion.div
              key={epicGroup.epic?.id || 'sin-epica'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <EpicPlanningCard
                epicGroup={epicGroup}
                team={team}
                onIssueUpdate={handleIssueUpdate}
                onStoryReorder={handleStoryReorder}
              />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Backlog vacío
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No hay elementos en el backlog que coincidan con los filtros seleccionados.
              </p>
              {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
                <button
                  onClick={resetFilters}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
