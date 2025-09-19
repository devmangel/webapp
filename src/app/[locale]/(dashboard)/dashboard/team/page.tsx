'use client';

import { useMemo } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import { useDashboardStore } from 'app/lib/store/dashboard-store';
import { Issue, Sprint, TeamMember } from 'types/domain/dashboard';
import { formatPoints } from 'app/components/utils/format';
import { UTILIZATION_THRESHOLDS } from 'app/components/dashboard/constants';

interface CellData {
  member: TeamMember;
  sprint: Sprint;
  totalPoints: number;
  utilization: number;
  assignments: Issue[];
}

export default function TeamPage() {
  const projects = useDashboardStore((state) => state.projects);
  const sprints = useDashboardStore((state) => state.sprints);
  const team = useDashboardStore((state) => state.team);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);

  const project = projects[filters.projectId];
  const activeMembers = useMemo(() => Object.values(team).filter((member) => member.active), [team]);
  const projectSprints = useMemo(() => {
    if (!project) return [] as Sprint[];
    return project.sprintIds.map((id) => sprints[id]).filter((sprint): sprint is Sprint => Boolean(sprint));
  }, [project, sprints]);

  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  const heatmap = useMemo(() => {
    return activeMembers.map((member) => {
      const loadBySprint = projectSprints.map((sprint) => {
        const sprintAssignments = projectIssues.filter(
          (issue) => issue.sprintId === sprint.id && issue.assigneeId === member.id,
        );
        const totalPoints = sprintAssignments.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
        const utilization = member.capacityPerSprint === 0 ? 0 : totalPoints / member.capacityPerSprint;
        return {
          member,
          sprint,
          totalPoints,
          utilization,
          assignments: sprintAssignments,
        } satisfies CellData;
      });
      return {
        member,
        loadBySprint,
        totalAssigned: projectIssues.filter((issue) => issue.assigneeId === member.id).length,
        totalPoints: projectIssues
          .filter((issue) => issue.assigneeId === member.id)
          .reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0),
      };
    });
  }, [activeMembers, projectIssues, projectSprints]);

  const totalPointsAssigned = heatmap.reduce((acc, row) => acc + row.totalPoints, 0);

  const overallUtilization = projectSprints.map((sprint) => {
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

  const getUtilizationClass = (value: number) => {
    if (value >= UTILIZATION_THRESHOLDS.critical) return 'bg-red-500 text-white';
    if (value >= UTILIZATION_THRESHOLDS.warning) return 'bg-orange-500 text-white';
    if (value >= UTILIZATION_THRESHOLDS.normal) return 'bg-amber-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
              Capacidad activa
            </p>
            <p className="mt-3 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {activeMembers.length}
            </p>
            <p className="mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              miembros disponibles en el sprint
            </p>
          </CardBody>
        </Card>
        <Card className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
              Puntos asignados
            </p>
            <p className="mt-3 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {formatPoints(totalPointsAssigned)}
            </p>
            <p className="mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              sumatoria total en el proyecto
            </p>
          </CardBody>
        </Card>
        <Card className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
              Utilización promedio
            </p>
            <p className="mt-3 text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {projectSprints.length > 0
                ? `${Math.round(
                    (overallUtilization.reduce((acc, item) => acc + item.utilization, 0) / projectSprints.length) *
                      100,
                  )}%`
                : '—'}
            </p>
            <p className="mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              promedio de carga vs capacidad
            </p>
          </CardBody>
        </Card>
      </section>

      <section>
        <Card className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70">
          <CardBody>
            <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                  Heatmap de carga por sprint
                </h2>
                <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  Story points asignados vs capacidad disponible
                </p>
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light text-sm dark:divide-border-dark">
                <thead className="bg-neutral-100/80 text-left text-xs uppercase tracking-wide text-textSecondary-light dark:bg-neutral-900/60 dark:text-textSecondary-dark">
                  <tr>
                    <th className="px-4 py-3">Persona</th>
                    {projectSprints.map((sprint) => (
                      <th key={sprint.id} className="px-4 py-3">
                        {sprint.name}
                      </th>
                    ))}
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-textSecondary-light dark:divide-border-dark dark:text-textSecondary-dark">
                  {heatmap.map((row) => (
                    <tr key={row.member.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                          {row.member.name}
                        </div>
                        <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                          {row.member.title}
                        </p>
                      </td>
                      {row.loadBySprint.map((cell) => (
                        <td key={`${row.member.id}-${cell.sprint.id}`} className="px-4 py-3">
                          <div
                            className={`flex h-20 w-full flex-col items-center justify-center rounded-lg text-xs font-semibold ${
                              cell.assignments.length === 0
                                ? 'border border-dashed border-border-light dark:border-border-dark'
                                : getUtilizationClass(cell.utilization)
                            }`}
                          >
                            <span>{formatPoints(cell.totalPoints)}</span>
                            <span>{Math.round(cell.utilization * 100)}%</span>
                          </div>
                          {cell.assignments.length > 0 ? (
                            <ul className="mt-1 space-y-1 text-[11px]">
                              {cell.assignments.slice(0, 2).map((issue) => (
                                <li key={issue.id} className="truncate">
                                  {issue.key}
                                </li>
                              ))}
                              {cell.assignments.length > 2 ? (
                                <li className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark">
                                  +{cell.assignments.length - 2} más
                                </li>
                              ) : null}
                            </ul>
                          ) : null}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                        {formatPoints(row.totalPoints)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {overallUtilization.map((entry) => (
          <Card
            key={entry.sprint.id}
            className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70"
          >
            <CardBody>
              <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                {entry.sprint.name}
              </h3>
              <p className="mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                Capacidad total: {formatPoints(entry.capacity)}
              </p>
              <p className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                Asignado: {formatPoints(entry.totalPoints)}
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(entry.utilization * 100, 130)}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                Utilización: {Math.round(entry.utilization * 100)}%
              </p>
            </CardBody>
          </Card>
        ))}
      </section>
    </div>
  );
}
