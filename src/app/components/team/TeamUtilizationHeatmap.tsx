'use client';

import { useMemo } from 'react';
import { Card, CardBody } from '../ui/Card';
import Image from 'next/image';
import { useDashboardStore } from 'app/lib/store/dashboard-store';
import { TeamMember, Issue, Sprint } from 'types/domain';
import { formatPoints } from '../utils/format';
import { UTILIZATION_THRESHOLDS } from '../dashboard/constants';

interface CellData {
  member: TeamMember;
  sprint: Sprint;
  totalPoints: number;
  utilization: number;
  assignments: Issue[];
}

interface TeamUtilizationHeatmapProps {
  className?: string;
}

export function TeamUtilizationHeatmap({ className = '' }: TeamUtilizationHeatmapProps) {
  const projects = useDashboardStore((state) => state.projects);
  const sprints = useDashboardStore((state) => state.sprints);
  const team = useDashboardStore((state) => state.team);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);

  const project = projects[filters.projectId];
  
  const activeMembers = useMemo(() => 
    Object.values(team).filter((member) => member.active), 
    [team]
  );

  const projectSprints = useMemo(() => {
    if (!project) return [] as Sprint[];
    return project.sprintIds
      .map((id) => sprints[id])
      .filter((sprint): sprint is Sprint => Boolean(sprint));
  }, [project, sprints]);

  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  // Calcular heatmap de datos
  const heatmapData = useMemo(() => {
    return activeMembers.map((member) => {
      const loadBySprint = projectSprints.map((sprint) => {
        const sprintAssignments = projectIssues.filter(
          (issue) => issue.sprintId === sprint.id && issue.assigneeId === member.id,
        );
        const totalPoints = sprintAssignments.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
        
        // Corregir cálculo de utilización para casos edge
        let utilization: number;
        if (member.capacityPerSprint === 0) {
          utilization = totalPoints > 0 ? Infinity : 0;
        } else {
          utilization = totalPoints / member.capacityPerSprint;
        }
        
        return {
          member,
          sprint,
          totalPoints,
          utilization,
          assignments: sprintAssignments,
        } satisfies CellData;
      });
      
      const totalAssigned = projectIssues.filter((issue) => issue.assigneeId === member.id).length;
      const totalPoints = projectIssues
        .filter((issue) => issue.assigneeId === member.id)
        .reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
      
      return {
        member,
        loadBySprint,
        totalAssigned,
        totalPoints,
      };
    });
  }, [activeMembers, projectIssues, projectSprints]);

  // Calcular utilización por sprint (resumen)
  const overallUtilization = useMemo(() => {
    return projectSprints.map((sprint) => {
      const issuesForSprint = projectIssues.filter((issue) => issue.sprintId === sprint.id);
      const totalPoints = issuesForSprint.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
      const capacity = activeMembers.reduce((acc, member) => acc + member.capacityPerSprint, 0);
      
      return {
        sprint,
        totalPoints,
        capacity,
        utilization: capacity === 0 ? 0 : totalPoints / capacity,
      };
    });
  }, [projectSprints, projectIssues, activeMembers]);

  const getUtilizationClass = (value: number) => {
    if (value >= UTILIZATION_THRESHOLDS.critical) 
      return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg';
    if (value >= UTILIZATION_THRESHOLDS.warning) 
      return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md';
    if (value >= UTILIZATION_THRESHOLDS.normal) 
      return 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md';
    return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md';
  };

  const getUtilizationBorder = (value: number) => {
    if (value >= UTILIZATION_THRESHOLDS.critical) 
      return 'border-red-400';
    if (value >= UTILIZATION_THRESHOLDS.warning) 
      return 'border-orange-400';
    if (value >= UTILIZATION_THRESHOLDS.normal) 
      return 'border-amber-400';
    return 'border-emerald-400';
  };

  const getUtilizationIcon = (value: number) => {
    if (value >= UTILIZATION_THRESHOLDS.critical) 
      return '⚠️';
    if (value >= UTILIZATION_THRESHOLDS.warning) 
      return '🔥';
    if (value >= UTILIZATION_THRESHOLDS.normal) 
      return '⚡';
    return '✅';
  };

  if (!project || projectSprints.length === 0) {
    return (
      <Card className={`border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70 ${className}`}>
        <CardBody className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-textSecondary-light dark:text-textSecondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-textPrimary-light dark:text-textPrimary-dark mb-2">
            No hay sprints disponibles
          </h3>
          <p className="text-textSecondary-light dark:text-textSecondary-dark">
            Agrega sprints al proyecto para ver el heatmap de utilización
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            Heatmap de Utilización por Sprint
          </h2>
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            Visualización de la carga de trabajo asignada vs capacidad disponible
          </p>
        </div>
        
        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-textSecondary-light dark:text-textSecondary-dark">&lt;70%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-textSecondary-light dark:text-textSecondary-dark">70-89%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-textSecondary-light dark:text-textSecondary-dark">90-119%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-textSecondary-light dark:text-textSecondary-dark">≥120%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70 overflow-hidden">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header de sprints */}
              <div className="grid grid-cols-1" style={{ gridTemplateColumns: `280px repeat(${projectSprints.length}, 140px) 100px` }}>
                {/* Header row */}
                <div className="bg-neutral-100 dark:bg-neutral-900 px-6 py-4 border-b border-border-light dark:border-border-dark">
                  <span className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    Miembro del Equipo
                  </span>
                </div>
                {projectSprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="bg-neutral-100 dark:bg-neutral-900 px-4 py-4 border-b border-l border-border-light dark:border-border-dark text-center"
                  >
                    <div className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark mb-1">
                      {sprint.name}
                    </div>
                    <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                      Capacidad: {formatPoints(overallUtilization.find(u => u.sprint.id === sprint.id)?.capacity || 0)}
                    </div>
                  </div>
                ))}
                <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-4 border-b border-l border-border-light dark:border-border-dark text-center">
                  <span className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    Total
                  </span>
                </div>

                {/* Filas de miembros */}
                {heatmapData.map((row, rowIndex) => (
                  <>
                    {/* Celda del miembro */}
                    <div
                      key={`member-${row.member.id}`}
                      className={`px-6 py-6 border-b border-border-light dark:border-border-dark ${
                        rowIndex % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-800/30'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          {row.member.avatarUrl ? (
                            <Image
                              src={row.member.avatarUrl}
                              alt={row.member.name}
                              className="w-10 h-10 rounded-full border-2 border-primary/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/20">
                              <span className="text-sm font-semibold text-primary">
                                {row.member.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark truncate">
                            {row.member.name}
                          </div>
                          <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark truncate">
                            {row.member.title}
                          </div>
                          <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-1">
                            Capacidad: {formatPoints(row.member.capacityPerSprint)}/sprint
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Celdas por sprint */}
                    {row.loadBySprint.map((cell) => (
                      <div
                        key={`${row.member.id}-${cell.sprint.id}`}
                        className={`p-4 border-b border-l border-border-light dark:border-border-dark ${
                          rowIndex % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-800/30'
                        }`}
                      >
                        <div className="h-full flex flex-col">
                          {cell.assignments.length === 0 ? (
                            <div className="flex-1 border-2 border-dashed border-border-light dark:border-border-dark rounded-lg flex items-center justify-center min-h-[80px]">
                              <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                                Sin asignación
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`flex-1 rounded-lg border-2 ${getUtilizationBorder(cell.utilization)} ${getUtilizationClass(
                                cell.utilization,
                              )} flex flex-col items-center justify-center min-h-[80px] p-3 text-center transition-all duration-200 hover:scale-105 cursor-default`}
                            >
                              <div className="text-lg font-bold mb-1">
                                {getUtilizationIcon(cell.utilization)}
                              </div>
                              <div className="text-lg font-bold">
                                {formatPoints(cell.totalPoints)}
                              </div>
                              <div className="text-sm opacity-90">
                                {cell.utilization === Infinity ? 'Sobrecargado' : `${Math.round(cell.utilization * 100)}%`}
                              </div>
                            </div>
                          )}
                          
                          {/* Lista de issues */}
                          {cell.assignments.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {cell.assignments.slice(0, 2).map((issue) => (
                                <div
                                  key={issue.id}
                                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-textSecondary-light dark:text-textSecondary-dark truncate"
                                  title={`${issue.key}: ${issue.title}`}
                                >
                                  {issue.key}
                                </div>
                              ))}
                              {cell.assignments.length > 2 && (
                                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded text-center">
                                  +{cell.assignments.length - 2} más
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Celda total */}
                    <div
                      key={`total-${row.member.id}`}
                      className={`px-4 py-6 border-b border-l border-border-light dark:border-border-dark text-center ${
                        rowIndex % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-800/30'
                      }`}
                    >
                      <div className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {formatPoints(row.totalPoints)}
                      </div>
                      <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                        {row.totalAssigned} issues
                      </div>
                    </div>
                  </>
                ))}

                {/* Footer row con totales por sprint */}
                <div className="bg-neutral-100 dark:bg-neutral-900 px-6 py-4 border-t-2 border-border-light dark:border-border-dark">
                  <span className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    Total por Sprint
                  </span>
                </div>
                {overallUtilization.map((entry) => (
                  <div
                    key={`footer-${entry.sprint.id}`}
                    className="bg-neutral-100 dark:bg-neutral-900 px-4 py-4 border-t-2 border-l border-border-light dark:border-border-dark text-center"
                  >
                    <div className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {formatPoints(entry.totalPoints)}
                    </div>
                    <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                      {Math.round(entry.utilization * 100)}% util.
                    </div>
                  </div>
                ))}
                <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-4 border-t-2 border-l border-border-light dark:border-border-dark text-center">
                  <div className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
                    {formatPoints(heatmapData.reduce((acc, row) => acc + row.totalPoints, 0))}
                  </div>
                  <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                    Total global
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resumen por sprint */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {overallUtilization.map((entry) => (
          <Card
            key={entry.sprint.id}
            className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70"
          >
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark truncate">
                  {entry.sprint.name}
                </h3>
                <span className="text-xl">
                  {getUtilizationIcon(entry.utilization)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-textSecondary-light dark:text-textSecondary-dark">Capacidad:</span>
                  <span className="font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    {formatPoints(entry.capacity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary-light dark:text-textSecondary-dark">Asignado:</span>
                  <span className="font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    {formatPoints(entry.totalPoints)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark">
                    Utilización del Sprint
                  </span>
                  <span className={`text-xs font-bold ${
                    entry.utilization >= UTILIZATION_THRESHOLDS.critical ? 'text-red-600' :
                    entry.utilization >= UTILIZATION_THRESHOLDS.warning ? 'text-orange-600' :
                    entry.utilization >= UTILIZATION_THRESHOLDS.normal ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    {Math.round(entry.utilization * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      entry.utilization >= UTILIZATION_THRESHOLDS.critical ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      entry.utilization >= UTILIZATION_THRESHOLDS.warning ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      entry.utilization >= UTILIZATION_THRESHOLDS.normal ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${Math.min(entry.utilization * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
