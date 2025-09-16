'use client';

import { useEffect, useMemo } from 'react';
import { Card, CardBody } from 'components/ui/Card';
import { BOARD_COLUMNS, ISSUE_STATUS_LABEL, ISSUE_TYPE_COLOR, PRIORITY_LABELS } from 'modules/dashboard/constants';
import { Issue, IssueStatus } from 'modules/dashboard/types';
import { useDashboardStore } from 'modules/dashboard/state/dashboard-store';
import { issueMatchesFilters } from 'modules/dashboard/utils/filters';
import { formatDate } from 'modules/dashboard/utils/format';

interface EpicGroup {
  epicId: string;
  name: string;
  objective: string;
  stories: StoryGroup[];
  orphanTasks: Issue[];
}

interface StoryGroup {
  story: Issue;
  tasks: Issue[];
}

const statusOptions = BOARD_COLUMNS.map((column) => column.key);

export function BacklogContent({ projectId }: { projectId: string }) {
  const projects = useDashboardStore((state) => state.projects);
  const epics = useDashboardStore((state) => state.epics);
  const issues = useDashboardStore((state) => state.issues);
  const team = useDashboardStore((state) => state.team);
  const filters = useDashboardStore((state) => state.filters);
  const setProject = useDashboardStore((state) => state.setProject);
  const moveIssue = useDashboardStore((state) => state.moveIssue);
  const updateIssue = useDashboardStore((state) => state.updateIssue);
  const assignIssue = useDashboardStore((state) => state.assignIssue);

  const project = projects[projectId];

  useEffect(() => {
    if (project && filters.projectId !== projectId) {
      setProject(projectId);
    }
  }, [project, projectId, filters.projectId, setProject]);

  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((id) => issues[id])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  const filteredIssues = useMemo(
    () => projectIssues.filter((issue) => issueMatchesFilters(issue, { ...filters, projectId })),
    [projectIssues, filters, projectId],
  );

  const epicGroups = useMemo(() => {
    const epicMap = new Map<string, EpicGroup>();
    const storyMap = new Map<string, StoryGroup>();

    filteredIssues.forEach((issue) => {
      if (issue.type === 'STORY') {
        storyMap.set(issue.id, { story: issue, tasks: [] });
      }
    });

    filteredIssues.forEach((issue) => {
      if (issue.type === 'TASK') {
        if (issue.storyId && storyMap.has(issue.storyId)) {
          storyMap.get(issue.storyId)!.tasks.push(issue);
        } else if (issue.epicId) {
          const epic = epics[issue.epicId];
          if (!epicMap.has(issue.epicId)) {
            epicMap.set(issue.epicId, {
              epicId: issue.epicId,
              name: epic?.name ?? 'Sin épica',
              objective: epic?.objective ?? '',
              stories: [],
              orphanTasks: [],
            });
          }
          epicMap.get(issue.epicId)!.orphanTasks.push(issue);
        }
      }
    });

    storyMap.forEach((group) => {
      const epicId = group.story.epicId ?? 'sin-epica';
      const epic = group.story.epicId ? epics[group.story.epicId] : undefined;
      if (!epicMap.has(epicId)) {
        epicMap.set(epicId, {
          epicId,
          name: epic?.name ?? 'Sin épica asociada',
          objective: epic?.objective ?? '',
          stories: [],
          orphanTasks: [],
        });
      }
      epicMap.get(epicId)!.stories.push(group);
    });

    return Array.from(epicMap.values());
  }, [filteredIssues, epics]);

  const handlePointsChange = (issue: Issue, value: number | undefined) => {
    updateIssue(issue.id, { storyPoints: value ?? undefined });
  };

  const handleStatusChange = (issue: Issue, status: IssueStatus) => {
    moveIssue(issue.id, status, { sprintId: issue.sprintId });
  };

  const handleAssigneeChange = (issue: Issue, assigneeId?: string) => {
    assignIssue(issue.id, assigneeId);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          Backlog
        </h1>
        <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
          Gestiona épicas, historias y tareas con edición rápida
        </p>
      </header>
      <div className="space-y-4">
        {epicGroups.map((group) => (
          <Card
            key={group.epicId}
            className="border border-border-light/70 bg-white/95 dark:border-border-dark/60 dark:bg-neutral-900/70"
          >
            <CardBody>
              <header className="flex flex-col gap-2 border-b border-border-light pb-3 dark:border-border-dark md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    {group.name}
                  </h2>
                  <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                    {group.objective}
                  </p>
                </div>
                <span className="text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark">
                  {group.stories.length} historias · {group.orphanTasks.length} tareas directas
                </span>
              </header>
              <div className="mt-4 space-y-3">
                {group.stories.map((storyGroup) => (
                  <article key={storyGroup.story.id} className="rounded-lg border border-border-light bg-white/80 p-4 dark:border-border-dark dark:bg-neutral-900/60">
                    <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
                          {storyGroup.story.key}
                        </p>
                        <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                          {storyGroup.story.title}
                        </h3>
                        <p className="mt-1 text-xs text-textSecondary-light dark:text-textSecondary-dark">
                          {storyGroup.story.summary}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${ISSUE_TYPE_COLOR[storyGroup.story.type]}`}>
                            {storyGroup.story.type}
                          </span>
                          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark">
                            Prioridad {PRIORITY_LABELS[storyGroup.story.priority]}
                          </span>
                          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark">
                            Actualizado {formatDate(storyGroup.story.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col items-end gap-2 text-xs md:flex-row md:items-center md:gap-4">
                        <label className="flex flex-col text-textSecondary-light dark:text-textSecondary-dark">
                          SP
                          <input
                            type="number"
                            defaultValue={storyGroup.story.storyPoints ?? ''}
                            onBlur={(event) => {
                              const value = event.target.value ? Number(event.target.value) : undefined;
                              handlePointsChange(storyGroup.story, value);
                            }}
                            className="mt-1 w-20 rounded-md border border-border-light bg-white px-2 py-1 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                          />
                        </label>
                        <label className="flex flex-col text-textSecondary-light dark:text-textSecondary-dark">
                          Estado
                          <select
                            value={storyGroup.story.status}
                            onChange={(event) => handleStatusChange(storyGroup.story, event.target.value as IssueStatus)}
                            className="mt-1 w-32 rounded-md border border-border-light bg-white px-2 py-1 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {ISSUE_STATUS_LABEL[status]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col text-textSecondary-light dark:text-textSecondary-dark">
                          Responsable
                          <select
                            value={storyGroup.story.assigneeId ?? ''}
                            onChange={(event) => handleAssigneeChange(storyGroup.story, event.target.value || undefined)}
                            className="mt-1 w-40 rounded-md border border-border-light bg-white px-2 py-1 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                          >
                            <option value="">Sin asignar</option>
                            {Object.values(team)
                              .filter((member) => member.active)
                              .map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                          </select>
                        </label>
                      </div>
                    </header>
                    <div className="mt-3 border-t border-border-light pt-3 dark:border-border-dark">
                      <h4 className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                        Tareas
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {storyGroup.tasks.map((task) => (
                          <li key={task.id} className="rounded-md border border-border-light bg-neutral-50 px-3 py-2 text-sm text-textSecondary-light transition-colors hover:border-primary hover:text-textPrimary-light dark:border-border-dark dark:bg-neutral-900/50 dark:text-textSecondary-dark">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
                                  {task.key}
                                </p>
                                <p className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                                  {task.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${ISSUE_TYPE_COLOR[task.type]}`}>
                                  {task.type}
                                </span>
                                <span>{task.storyPoints ?? '—'} pts</span>
                                <select
                                  value={task.status}
                                  onChange={(event) => handleStatusChange(task, event.target.value as IssueStatus)}
                                  className="rounded-md border border-border-light bg-white px-2 py-1 text-xs text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {ISSUE_STATUS_LABEL[status]}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={task.assigneeId ?? ''}
                                  onChange={(event) => handleAssigneeChange(task, event.target.value || undefined)}
                                  className="rounded-md border border-border-light bg-white px-2 py-1 text-xs text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                                >
                                  <option value="">Sin asignar</option>
                                  {Object.values(team)
                                    .filter((member) => member.active)
                                    .map((member) => (
                                      <option key={member.id} value={member.id}>
                                        {member.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          </li>
                        ))}
                        {storyGroup.tasks.length === 0 ? (
                          <li className="text-xs italic text-textSecondary-light dark:text-textSecondary-dark">
                            No hay tareas asignadas a esta historia.
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </article>
                ))}
                {group.orphanTasks.length > 0 ? (
                  <div className="rounded-lg border border-dashed border-border-light bg-neutral-50 px-4 py-3 text-xs text-textSecondary-light dark:border-border-dark dark:bg-neutral-900/40 dark:text-textSecondary-dark">
                    <p className="font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                      Tareas independientes
                    </p>
                    <ul className="mt-2 space-y-2">
                      {group.orphanTasks.map((task) => (
                        <li key={task.id} className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
                              {task.key}
                            </p>
                            <p className="text-sm text-textPrimary-light dark:text-textPrimary-dark">
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${ISSUE_TYPE_COLOR[task.type]}`}>
                              {task.type}
                            </span>
                            <span>{task.storyPoints ?? '—'} pts</span>
                            <select
                              value={task.status}
                              onChange={(event) => handleStatusChange(task, event.target.value as IssueStatus)}
                              className="rounded-md border border-border-light bg-white px-2 py-1 text-xs text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {ISSUE_STATUS_LABEL[status]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ))}
        {epicGroups.length === 0 ? (
          <Card className="border border-border-light/70 bg-white/90 dark:border-border-dark/60 dark:bg-neutral-900/70">
            <CardBody>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                No hay items en el backlog con los filtros seleccionados.
              </p>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
