'use client';

import { useEffect, useMemo } from 'react';
import { BoardColumn } from 'app/components/dashboard/BoardColumn';
import { IssueDrawer } from 'app/components/dashboard/IssueDrawer';
import { BOARD_COLUMNS } from 'app/components/dashboard/constants';
import { useDashboardStore } from 'modules/dashboard/state/dashboard-store';
import { groupIssuesByStatus, issueMatchesFilters } from 'app/components/utils/filters';
import { Issue } from 'types/domain/dashboard';

export function BoardContent({ projectId }: { projectId: string }) {
  const projects = useDashboardStore((state) => state.projects);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);
  const moveIssue = useDashboardStore((state) => state.moveIssue);
  const assignIssue = useDashboardStore((state) => state.assignIssue);
  const toggleBlocked = useDashboardStore((state) => state.toggleBlocked);
  const addComment = useDashboardStore((state) => state.addComment);
  const setProject = useDashboardStore((state) => state.setProject);
  const team = useDashboardStore((state) => state.team);
  const epics = useDashboardStore((state) => state.epics);
  const sprints = useDashboardStore((state) => state.sprints);
  const selectedIssueId = useDashboardStore((state) => state.selectedIssueId);
  const setSelectedIssue = useDashboardStore((state) => state.setSelectedIssue);

  const project = projects[projectId];

  useEffect(() => {
    if (project && filters.projectId !== projectId) {
      setProject(projectId);
    }
  }, [project, projectId, filters.projectId, setProject]);

  const projectIssues = useMemo(() => {
    if (!project) return [] as Issue[];
    return project.issueIds
      .map((issueId) => issues[issueId])
      .filter((issue): issue is Issue => Boolean(issue));
  }, [project, issues]);

  const filteredIssues = useMemo(
    () => projectIssues.filter((issue) => issueMatchesFilters(issue, { ...filters, projectId })),
    [projectIssues, filters, projectId],
  );

  const grouped = useMemo(() => groupIssuesByStatus(filteredIssues), [filteredIssues]);

  const selectedIssue = selectedIssueId ? issues[selectedIssueId] : undefined;

  const handleIssueDrop = (issueId: string, status: Issue['status']) => {
    moveIssue(issueId, status, { sprintId: filters.sprintId });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            Tablero Kanban
          </h1>
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            {project?.name} · {filteredIssues.length} issues visibles
          </p>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BOARD_COLUMNS.map((column) => {
          const items = grouped[column.key];
          const wipLimit = column.wipLimit ?? Infinity;
          return (
            <div
              key={column.key}
              className="rounded-lg border border-border-light bg-white/70 p-4 dark:border-border-dark dark:bg-neutral-900/70"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                  {column.title}
                </h2>
                <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  {items.length}/{wipLimit === Infinity ? '∞' : wipLimit}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                <BoardColumn
                  status={column.key}
                  issues={items}
                  onIssueDrop={handleIssueDrop}
                  onIssueClick={(issue) => setSelectedIssue(issue.id)}
                  team={team}
                />
              </div>
            </div>
          );
        })}
      </section>
      <IssueDrawer
        issue={selectedIssue}
        onClose={() => setSelectedIssue(undefined)}
        onStatusChange={(status) => {
          if (!selectedIssue) return;
          moveIssue(selectedIssue.id, status, { sprintId: selectedIssue.sprintId });
        }}
        onAssigneeChange={(assigneeId) => {
          if (!selectedIssue) return;
          assignIssue(selectedIssue.id, assigneeId);
        }}
        onToggleBlocked={(blocked) => {
          if (!selectedIssue) return;
          toggleBlocked(selectedIssue.id, blocked);
        }}
        onAddComment={(message) => {
          if (!selectedIssue) return;
          addComment(selectedIssue.id, 'user-1', message);
        }}
        team={team}
        epics={epics}
        sprints={sprints}
      />
    </div>
  );
}
