'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { useDashboardStore } from '../../lib/store/dashboard-store';
import { uniqueLabelsFromIssues } from '../utils/filters';

export function FiltersBar() {
  const [showFilters, setShowFilters] = useState(false);
  const projects = useDashboardStore((state) => state.projects);
  const sprints = useDashboardStore((state) => state.sprints);
  const team = useDashboardStore((state) => state.team);
  const issues = useDashboardStore((state) => state.issues);
  const filters = useDashboardStore((state) => state.filters);
  const setFilters = useDashboardStore((state) => state.setFilters);
  const setProject = useDashboardStore((state) => state.setProject);
  const resetFilters = useDashboardStore((state) => state.resetFilters);

  const labelOptions = useMemo(
    () => uniqueLabelsFromIssues(Object.values(issues)),
    [issues],
  );

  const handleProjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const projectId = event.target.value;
    if (projectId) {
      setProject(projectId);
    }
  };

  const handleSprintChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const sprintId = event.target.value || undefined;
    setFilters({ sprintId });
  };

  const handleAssigneeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const assigneeId = event.target.value || undefined;
    setFilters({ assigneeId });
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const issueType = event.target.value || 'ALL';
    setFilters({ issueType: issueType as typeof filters.issueType });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchTerm: event.target.value });
  };

  const toggleLabel = (label: string) => {
    const labels = filters.labels.includes(label)
      ? filters.labels.filter((item) => item !== label)
      : [...filters.labels, label];
    setFilters({ labels });
  };

  const projectOptions = useMemo(() => Object.values(projects), [projects]);
  const sprintOptions = useMemo(() => {
    if (!filters.projectId) return [];
    const project = projects[filters.projectId];
    if (!project) return [];
    return project.sprintIds.map((id) => sprints[id]).filter(Boolean);
  }, [filters.projectId, projects, sprints]);

  const assigneeOptions = useMemo(() => Object.values(team).filter((member) => member.active), [team]);

  return (
    <div className="border-border-light/70 px-4 py-4 text-sm transition-colors dark:border-border-dark md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex flex-col gap-1 md:min-w-[200px]">
            <label className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Proyecto
            </label>
            <select
              value={filters.projectId}
              onChange={handleProjectChange}
              className="rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
            >
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 md:min-w-[160px]">
            <label className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Sprint
            </label>
            <select
              value={filters.sprintId ?? ''}
              onChange={handleSprintChange}
              className="rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
            >
              <option value="">Todos</option>
              {sprintOptions.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 md:min-w-[160px]">
            <label className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Responsable
            </label>
            <select
              value={filters.assigneeId ?? ''}
              onChange={handleAssigneeChange}
              className="rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
            >
              <option value="">Todos</option>
              {assigneeOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 md:min-w-[140px]">
            <label className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
              Tipo
            </label>
            <select
              value={filters.issueType ?? 'ALL'}
              onChange={handleTypeChange}
              className="rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
            >
              <option value="ALL">Todos</option>
              <option value="EPIC">Epic</option>
              <option value="STORY">Story</option>
              <option value="TASK">Task</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar..."
              className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-md border border-border-light px-3 py-2 text-sm font-medium text-textSecondary-light transition-colors hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark"
          >
            Etiquetas
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium text-textSecondary-light transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:text-textSecondary-dark dark:hover:bg-neutral-700"
          >
            Limpiar
          </button>
        </div>
      </div>
      {showFilters ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {labelOptions.map((label) => {
            const isActive = filters.labels.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleLabel(label)}
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-light text-textSecondary-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark',
                )}
              >
                {label}
              </button>
            );
          })}
          {labelOptions.length === 0 ? (
            <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
              Sin etiquetas disponibles
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
