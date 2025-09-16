'use client';

import { useMemo } from 'react';
import { Card, CardBody } from 'components/ui/Card';
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
}

function KpiCard({ title, value, sublabel, accentClass }: KpiCardProps) {
  return (
    <Card className="border border-border-light/60 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
      <CardBody>
        <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
          {title}
        </p>
        <p className="mt-3 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
          {value}
        </p>
        {sublabel ? (
          <p className={`mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark ${accentClass ?? ''}`}>
            {sublabel}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

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
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          KPIs del sprint {currentSprint ? currentSprint.name : ''}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total de issues"
            value={kpis.total.toString()}
            sublabel={`${kpis.todo} pendientes`}
          />
          <KpiCard
            title="Progreso"
            value={formatPercentage(kpis.completionRate)}
            sublabel={`${kpis.done} completados`}
            accentClass="text-emerald-600 dark:text-emerald-400"
          />
          <KpiCard
            title="En curso"
            value={`${kpis.inProgress}`}
            sublabel={`${kpis.inReview} en revisión`}
          />
          <KpiCard
            title="Bloqueados"
            value={kpis.blocked.toString()}
            accentClass="text-red-600 dark:text-red-400"
            sublabel={kpis.blocked > 0 ? 'Atender en daily' : 'Sin bloqueos'}
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
    </div>
  );
}
