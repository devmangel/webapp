'use client';

import { FormEvent, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { BOARD_COLUMNS, ISSUE_STATUS_LABEL, ISSUE_TYPE_COLOR } from '../constants';
import { Epic, Issue, IssueStatus, Sprint, TeamMember } from '../types';
import { formatDateTime, formatPoints } from '../utils/format';
import { IssueStatusBadge } from './IssueStatusBadge';

interface IssueDrawerProps {
  issue?: Issue;
  onClose: () => void;
  onStatusChange: (status: IssueStatus) => void;
  onAssigneeChange: (assigneeId?: string) => void;
  onToggleBlocked: (blocked: boolean) => void;
  onAddComment: (message: string) => void;
  team: Record<string, TeamMember>;
  epics: Record<string, Epic>;
  sprints: Record<string, Sprint>;
}

const statusOptions = BOARD_COLUMNS.map((column) => column.key);

export function IssueDrawer({
  issue,
  onClose,
  onStatusChange,
  onAssigneeChange,
  onToggleBlocked,
  onAddComment,
  team,
  epics,
  sprints,
}: IssueDrawerProps) {
  const [comment, setComment] = useState('');

  const assigneeOptions = useMemo(
    () => Object.values(team).filter((member) => member.active),
    [team],
  );

  if (!issue) return null;

  const epic = issue.epicId ? epics[issue.epicId] : undefined;
  const sprint = issue.sprintId ? sprints[issue.sprintId] : undefined;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    onAddComment(comment.trim());
    setComment('');
  };

  return (
    <aside className="fixed inset-0 z-40 flex items-start justify-end overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40"
        role="presentation"
        onClick={onClose}
      />
      <div className="relative z-50 h-full w-full max-w-xl overflow-y-auto border-l border-border-light bg-white shadow-xl transition-transform dark:border-border-dark dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
              {issue.key}
            </p>
            <h2 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              {issue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-light px-3 py-1 text-xs font-semibold text-textSecondary-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark"
          >
            Cerrar
          </button>
        </div>
        <div className="space-y-6 px-6 py-6 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold uppercase', ISSUE_TYPE_COLOR[issue.type])}>
              {issue.type}
            </span>
            <IssueStatusBadge status={issue.status} />
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              {formatPoints(issue.storyPoints)}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              Prioridad: {issue.priority}
            </span>
            {issue.blocked ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-200">
                Bloqueado
              </span>
            ) : null}
          </div>

          {epic ? (
            <div className="rounded-lg border border-border-light bg-neutral-50 px-4 py-3 text-xs text-textSecondary-light dark:border-border-dark dark:bg-neutral-900/60 dark:text-textSecondary-dark">
              <p className="font-semibold text-textPrimary-light dark:text-textPrimary-dark">Épica</p>
              <p>{epic.name}</p>
              <p className="mt-1 text-[11px]">{epic.objective}</p>
            </div>
          ) : null}

          <section>
            <header className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                  Responsable
                </p>
                <select
                  value={issue.assigneeId ?? ''}
                  onChange={(event) => onAssigneeChange(event.target.value || undefined)}
                  className="mt-1 w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                >
                  <option value="">Sin asignar</option>
                  {assigneeOptions.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} · {member.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                  Estado
                </p>
                <select
                  value={issue.status}
                  onChange={(event) => onStatusChange(event.target.value as IssueStatus)}
                  className="mt-1 w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {ISSUE_STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                  Sprint
                </p>
                <p className="mt-1 text-sm text-textPrimary-light dark:text-textPrimary-dark">
                  {sprint ? `${sprint.name} · ${formatDateTime(sprint.startDate)} - ${formatDateTime(sprint.endDate)}` : 'Backlog'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleBlocked(!issue.blocked)}
                className={clsx(
                  'ml-auto h-fit rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
                  issue.blocked
                    ? 'border-red-400 bg-red-500 text-white hover:bg-red-600'
                    : 'border-border-light text-textSecondary-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-textSecondary-dark',
                )}
              >
                {issue.blocked ? 'Marcar como desbloqueado' : 'Marcar bloqueo'}
              </button>
            </header>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Descripción
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-textSecondary-light dark:text-textSecondary-dark">
              {issue.description}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Criterios de aceptación
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              {issue.acceptanceCriteria.map((criteria, index) => (
                <li key={`${issue.id}-ac-${index}`}>{criteria}</li>
              ))}
              {issue.acceptanceCriteria.length === 0 ? (
                <li className="list-none text-xs text-textSecondary-light/80 dark:text-textSecondary-dark/70">
                  Sin criterios registrados
                </li>
              ) : null}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Definition of Done
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              {issue.definitionOfDone.map((item, index) => (
                <li key={`${issue.id}-dod-${index}`}>{item}</li>
              ))}
              {issue.definitionOfDone.length === 0 ? (
                <li className="list-none text-xs text-textSecondary-light/80 dark:text-textSecondary-dark/70">
                  Sin DoD disponible
                </li>
              ) : null}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Dependencias
            </h3>
            {issue.dependencies.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {issue.dependencies.map((dependency) => (
                  <span
                    key={dependency}
                    className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark"
                  >
                    {dependency}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-textSecondary-light dark:text-textSecondary-dark">
                Sin dependencias ligadas
              </p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Actividad reciente
            </h3>
            <ul className="mt-2 space-y-3">
              {issue.comments.map((commentItem) => {
                const author = team[commentItem.authorId];
                return (
                  <li key={commentItem.id} className="rounded-md border border-border-light bg-white px-3 py-2 dark:border-border-dark dark:bg-neutral-900/60">
                    <p className="text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                      {author ? author.name : commentItem.authorId}
                      <span className="ml-2 text-[10px] font-normal uppercase text-textSecondary-light dark:text-textSecondary-dark">
                        {formatDateTime(commentItem.createdAt)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                      {commentItem.message}
                    </p>
                  </li>
                );
              })}
              {issue.comments.length === 0 ? (
                <li className="rounded-md border border-dashed border-border-light px-3 py-4 text-xs text-textSecondary-light dark:border-border-dark dark:text-textSecondary-dark">
                  Aún no hay comentarios
                </li>
              ) : null}
            </ul>
            <form onSubmit={handleSubmit} className="mt-3">
              <label className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark">
                Añadir comentario
              </label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                className="mt-1 w-full resize-y rounded-md border border-border-light bg-white px-3 py-2 text-sm text-textPrimary-light focus:border-primary focus:outline-none dark:border-border-dark dark:bg-neutral-900 dark:text-textPrimary-dark"
                placeholder="Comparte avances, bloqueos o contexto"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                >
                  Publicar
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </aside>
  );
}
