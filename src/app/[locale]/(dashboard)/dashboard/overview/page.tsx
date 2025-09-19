'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { useDashboardStore } from 'modules/dashboard/state/dashboard-store';
import { computeEpicStats, computeKpis, issueMatchesFilters } from 'app/components/utils/filters';
import { formatDate, formatPercentage } from 'app/components/utils/format';
import { Issue, DashboardFilters, Epic } from 'types/domain/dashboard';
import { KpiCard } from 'app/components/overview/KpiCard';
import { EpicProgressCard } from 'app/components/overview/EpicProgressCard';
import { BlockedIssueCard } from 'app/components/overview/BlockedIssueCard';
import { TeamMemberCard } from 'app/components/overview/TeamMemberCard';
import { ActivityTimeline } from 'app/components/overview/ActivityTimeline';
import { Icons } from 'app/components/overview/icons';

export default function OverviewPage() {
  const projects = useDashboardStore((state) => state.projects);
  const epics = useDashboardStore((state) => state.epics);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);
  const sprints = useDashboardStore((state) => state.sprints);
  const team = useDashboardStore((state) => state.team);
  const activity = useDashboardStore((state) => state.activity);

  const project = projects[filters.projectId];

  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  const filteredIssues = useMemo(
    () => projectIssues.filter((issue) => issueMatchesFilters(issue, filters)),
    [projectIssues, filters],
  );

  const kpis = useMemo(() => computeKpis(filteredIssues), [filteredIssues]);

  // Función helper para filtrar épicas
  const filterEpicsByFilters = (epic: Epic, filters: DashboardFilters, filteredIssues: Issue[]) => {
    // Si hay búsqueda, verificar si coincide con nombre o objetivo de la épica
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      const epicText = `${epic.name} ${epic.objective}`.toLowerCase();
      const epicMatches = epicText.includes(searchTerm);

      // Si la épica coincide por nombre, mostrarla siempre
      if (epicMatches) return true;

      // Si no coincide por nombre, mostrar solo si tiene issues que coinciden con los filtros
      const epicIssues = filteredIssues.filter(issue => issue.epicId === epic.id);
      return epicIssues.length > 0;
    }

    // Si hay otros filtros activos (sprint, assignee, tipo), mostrar solo épicas con issues relevantes
    const hasActiveFilters = filters.sprintId || filters.assigneeId ||
      (filters.issueType && filters.issueType !== 'ALL') ||
      filters.labels.length > 0;

    if (hasActiveFilters) {
      const epicIssues = filteredIssues.filter(issue => issue.epicId === epic.id);
      return epicIssues.length > 0;
    }

    // Sin filtros activos, mostrar todas las épicas
    return true;
  };

  const epicSummaries = useMemo(() => {
    if (!project) return [];

    return project.epicIds
      .map((epicId) => epics[epicId])
      .filter(Boolean)
      .filter((epic) => filterEpicsByFilters(epic, filters, filteredIssues))
      .map((epic) => ({
        epic,
        stats: computeEpicStats(filteredIssues, epic.id),
      }));
  }, [project, epics, filteredIssues, filters]);

  const blockedIssues = filteredIssues.filter((issue) => issue.blocked);
  const currentSprint = filters.sprintId ? sprints[filters.sprintId] : undefined;

  const activeTeamMembers = useMemo(() => {
    return Object.values(team)
      .filter((member) => member.active)
      .map((member) => ({
        member,
        memberIssues: filteredIssues.filter((issue) => issue.assigneeId === member.id)
      }))
      .filter(({ memberIssues }) => memberIssues.length > 0);
  }, [team, filteredIssues]);

  return (
    <motion.div
      className="space-y-8 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography variant="h2" className="mb-2">
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle" color="secondary">
          {currentSprint ? `Sprint: ${currentSprint.name}` : 'Métricas generales del proyecto'}
        </Typography>
        {currentSprint && (
          <Typography variant="caption" color="secondary" className="mt-1">
            {formatDate(currentSprint.startDate)} – {formatDate(currentSprint.endDate)}
          </Typography>
        )}
      </motion.section>

      {/* KPIs Grid */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total de tareas"
            value={kpis.total.toString()}
            sublabel={`${kpis.todo} pendientes`}
            icon={Icons.total}
            index={0}
          />
          <KpiCard
            title="Progreso"
            value={formatPercentage(kpis.completionRate)}
            sublabel={`${kpis.done} completados`}
            accentClass="!text-emerald-600 dark:!text-emerald-400"
            icon={Icons.progress}
            index={1}
          />
          <KpiCard
            title="En curso"
            value={`${kpis.inProgress}`}
            sublabel={`${kpis.inReview} en revisión`}
            icon={Icons.inProgress}
            index={2}
          />
          <KpiCard
            title="Bloqueados"
            value={kpis.blocked.toString()}
            accentClass={kpis.blocked > 0 ? "!text-red-600 dark:!text-red-400" : "!text-emerald-600 dark:!text-emerald-400"}
            sublabel={kpis.blocked > 0 ? 'Atender en daily' : 'Sin bloqueos'}
            icon={Icons.blocked}
            index={3}
          />
        </div>
      </section>

      {/* Layout Principal: Bloqueos y Distribución del Equipo */}
      <section className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:items-start">

        {/* Distribución de Carga del Equipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="mb-5">
            <Typography variant="h3" className="mb-2">
              👥 Distribución de Carga del Equipo
            </Typography>
            <Typography variant="caption" color="secondary">
              Balance de trabajo y capacidad disponible por desarrollador
            </Typography>
          </div>

          <div className="grid gap-4 sm:grid-cols-1  min-h-[220px]">
            {activeTeamMembers.map(({ member, memberIssues }, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                memberIssues={memberIssues}
                index={index}
              />
            ))}
            {activeTeamMembers.length === 0 && (
              <div className="col-span-full">
                <Card className="border-dashed border-2 h-[200px] flex items-center justify-center">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <Typography variant="body" color="secondary" className="font-medium">
                      No hay miembros del equipo con issues asignados
                    </Typography>
                    <Typography variant="caption" color="secondary" className="mt-1">
                      Los desarrolladores aparecerán aquí cuando tengan tareas asignadas
                    </Typography>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bloqueos Críticos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="h-fit"
        >
          <div className="mb-4">
            <Typography variant="h3" className="mb-2 flex items-center">
              🚨 Bloqueos Críticos
              {blockedIssues.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {blockedIssues.length}
                </span>
              )}
            </Typography>
            <Typography variant="caption" color="secondary">
              Tareas que requieren atención inmediata
            </Typography>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {blockedIssues.map((issue, index) => {
              const assignee = issue.assigneeId ? team[issue.assigneeId] : undefined;
              return (
                <BlockedIssueCard
                  key={issue.id}
                  issue={issue}
                  assignee={assignee}
                  index={index}
                />
              );
            })}
            {blockedIssues.length === 0 && (
              <Card className="border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10 h-[180px] flex items-center justify-center">
                <CardBody className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <Typography variant="body" className="text-green-700 dark:text-green-300 font-medium">
                    ¡Excelente!
                  </Typography>
                  <Typography variant="caption" className="text-green-600 dark:text-green-400 mt-1">
                    No hay issues bloqueados actualmente
                  </Typography>
                </CardBody>
              </Card>
            )}
          </div>
        </motion.div>

      </section>

      {/* Progreso por Épicas */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="h3" className="flex items-center">
                🎯 Progreso por Épicas
                {project && project.epicIds.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    {epicSummaries.length} de {project.epicIds.length}
                  </span>
                )}
              </Typography>
            </div>
            <Typography variant="caption" color="secondary">
              Vista visual del progreso y estado de cada épica del proyecto
            </Typography>
          </div>

          <div className="space-y-4">
            {epicSummaries.map(({ epic, stats }, index) => (
              <EpicProgressCard
                key={epic?.id}
                epic={epic}
                stats={stats}
                index={index}
              />
            ))}
            {epicSummaries.length === 0 && (
              <Card className="border-dashed border-2">
                <CardBody className="p-8 text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <Typography variant="body" color="secondary">
                    No hay épicas asociadas al proyecto seleccionado
                  </Typography>
                </CardBody>
              </Card>
            )}
          </div>
        </motion.div>
      </section>

      {/* Actividad Reciente del Proyecto */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="mb-6">
            <Typography variant="h3" className="mb-2">
              📊 Actividad Reciente del Proyecto
            </Typography>
            <Typography variant="caption" color="secondary">
              Timeline de las últimas actividades y movimientos en el proyecto
            </Typography>
          </div>

          <Card className="overflow-hidden">
            <CardBody className="p-6">
              <ActivityTimeline
                activities={activity}
                team={team}
                issues={issues}
              />
            </CardBody>
          </Card>
        </motion.div>
      </section>
    </motion.div>
  );
}
