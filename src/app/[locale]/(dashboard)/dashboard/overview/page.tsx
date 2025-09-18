'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { useDashboardStore } from 'modules/dashboard/state/dashboard-store';
import { computeEpicStats, computeKpis, issueMatchesFilters } from 'app/components/utils/filters';
import { formatDate, formatPercentage, formatPoints } from 'app/components/utils/format';
import { Issue } from 'types/domain/dashboard';
import { PRIORITY_LABELS } from 'app/components/dashboard/constants';

interface KpiCardProps {
  title: string;
  value: string;
  sublabel?: string;
  accentClass?: string;
  icon?: React.ReactNode;
  index?: number;
}

function KpiCard({ title, value, sublabel, accentClass, icon, index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      <Card variant="elevated" hover className="group">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Typography variant="overline" color="secondary">
                {title}
              </Typography>
              <Typography variant="display-sm" className="mt-2 font-bold">
                {value}
              </Typography>
              {sublabel && (
                <Typography 
                  variant="caption" 
                  color="secondary" 
                  className={`mt-2 ${accentClass || ''}`}
                >
                  {sublabel}
                </Typography>
              )}
            </div>
            {icon && (
              <div className="flex-shrink-0 ml-4 p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400">
                {icon}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Iconos para las KPI cards
const Icons = {
  total: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  progress: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  inProgress: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  blocked: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
    </svg>
  )
};

export default function OverviewPage() {
  const projects = useDashboardStore((state) => state.projects);
  const epics = useDashboardStore((state) => state.epics);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);
  const sprints = useDashboardStore((state) => state.sprints);
  const team = useDashboardStore((state) => state.team);

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

  const epicSummaries = useMemo(() => {
    if (!project) return [];
    return project.epicIds
      .map((epicId) => epics[epicId])
      .filter(Boolean)
      .map((epic) => ({
        epic,
        stats: computeEpicStats(filteredIssues, epic.id),
      }));
  }, [project, epics, filteredIssues]);

  const blockedIssues = filteredIssues.filter((issue) => issue.blocked);
  const currentSprint = filters.sprintId ? sprints[filters.sprintId] : undefined;

  return (
    <motion.div 
      className="space-y-8"
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
            title="Total de issues"
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

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                  Progreso por épica
                </h3>
                <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                  Conteo de historias y tareas por estado
                </p>
              </div>
            </header>
            <div className="space-y-4">
              {epicSummaries.map(({ epic, stats }) => {
                const completion = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
                return (
                  <article
                    key={epic?.id}
                    className="rounded-lg border border-border-light px-4 py-3 transition-colors hover:border-primary hover:shadow-sm dark:border-border-dark"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                          {epic?.name}
                        </h4>
                        <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                          {epic?.objective}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {completion}% completado
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-textSecondary-light dark:text-textSecondary-dark sm:grid-cols-4">
                      <div className="rounded-md bg-neutral-100 px-3 py-2 dark:bg-neutral-800">To Do: {stats.todo}</div>
                      <div className="rounded-md bg-neutral-100 px-3 py-2 dark:bg-neutral-800">In Progress: {stats.inProgress}</div>
                      <div className="rounded-md bg-neutral-100 px-3 py-2 dark:bg-neutral-800">In Review: {stats.inReview}</div>
                      <div className="rounded-md bg-neutral-100 px-3 py-2 dark:bg-neutral-800">Done: {stats.done}</div>
                    </div>
                  </article>
                );
              })}
              {epicSummaries.length === 0 ? (
                <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                  No hay épicas asociadas al proyecto seleccionado.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>
        <Card className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                  Bloqueos actuales
                </h3>
                <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  Seguimiento a tareas que impiden el avance
                </p>
              </div>
            </header>
            <div className="mt-4 space-y-3">
              {blockedIssues.map((issue) => {
                const assignee = issue.assigneeId ? team[issue.assigneeId] : undefined;
                return (
                  <div
                    key={issue.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-200"
                  >
                    <p className="text-sm font-semibold text-red-700 dark:text-red-200">
                      {issue.key} · {issue.title}
                    </p>
                    <p className="mt-1 text-xs">Responsable: {assignee ? assignee.name : 'Sin asignar'}</p>
                    <p className="mt-1 text-[11px] uppercase">
                      {issue.updatedAt ? `Actualizado ${formatDate(issue.updatedAt)}` : ''}
                    </p>
                  </div>
                );
              })}
              {blockedIssues.length === 0 ? (
                <p className="rounded-md border border-border-light bg-white px-3 py-4 text-xs text-textSecondary-light dark:border-border-dark dark:bg-neutral-900/60 dark:text-textSecondary-dark">
                  No hay issues bloqueados en el filtro actual.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </section>

      <section>
        <Card className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                Distribución de puntos por responsable
              </h3>
            </header>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light text-sm dark:divide-border-dark">
                <thead className="bg-neutral-100/80 text-left text-xs uppercase tracking-wide text-textSecondary-light dark:bg-neutral-900/60 dark:text-textSecondary-dark">
                  <tr>
                    <th className="px-4 py-2">Responsable</th>
                    <th className="px-4 py-2">Issues</th>
                    <th className="px-4 py-2">Puntos</th>
                    <th className="px-4 py-2">Prioridad dominante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-textSecondary-light dark:divide-border-dark dark:text-textSecondary-dark">
                  {Object.values(team)
                    .filter((member) => member.active)
                    .map((member) => {
                      const memberIssues = filteredIssues.filter((issue) => issue.assigneeId === member.id);
                      const totalPoints = memberIssues.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
                      const highestPriority = memberIssues.reduce<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null>((acc, issue) => {
                        if (!acc) return issue.priority;
                        const order: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number> = {
                          CRITICAL: 0,
                          HIGH: 1,
                          MEDIUM: 2,
                          LOW: 3,
                        };
                        return order[issue.priority] < order[acc] ? issue.priority : acc;
                      }, null);

                      if (memberIssues.length === 0) {
                        return null;
                      }

                      return (
                        <tr key={member.id}>
                          <td className="px-4 py-2 font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                            {member.name}
                          </td>
                          <td className="px-4 py-2">{memberIssues.length}</td>
                          <td className="px-4 py-2">{formatPoints(totalPoints)}</td>
                          <td className="px-4 py-2">
                            {highestPriority ? PRIORITY_LABELS[highestPriority] : '—'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </section>
    </motion.div>
  );
}
