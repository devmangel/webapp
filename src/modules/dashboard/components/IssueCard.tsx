'use client';

import { clsx } from 'clsx';
import { Issue } from '../types';
import { ISSUE_TYPE_COLOR, PRIORITY_COLOR, PRIORITY_LABELS } from '../constants';
import { formatPoints } from '../utils/format';

interface IssueCardProps {
  issue: Issue;
  assigneeName?: string;
  onClick?: (issue: Issue) => void;
  draggable?: boolean;
}

export function IssueCard({ issue, assigneeName, onClick, draggable = false }: IssueCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      data-issue-id={issue.id}
      draggable={draggable}
      onClick={() => onClick?.(issue)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onClick?.(issue);
        }
      }}
      className={clsx(
        'group rounded-lg border border-border-light bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-neutral-900',
        issue.blocked ? 'border-red-300 ring-1 ring-red-400 dark:border-red-400/60' : '',
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary-light dark:text-textSecondary-dark">
            {issue.key}
          </span>
          <h3 className="mt-1 text-sm font-semibold leading-5 text-textPrimary-light dark:text-textPrimary-dark">
            {issue.title}
          </h3>
        </div>
        <span className={clsx('rounded-full px-2 py-1 text-[10px] font-semibold uppercase', ISSUE_TYPE_COLOR[issue.type])}>
          {issue.type}
        </span>
      </header>
      <p className="mt-2 line-clamp-2 text-xs text-textSecondary-light dark:text-textSecondary-dark">
        {issue.summary}
      </p>
      <footer className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {issue.storyPoints ? (
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark">
            {formatPoints(issue.storyPoints)}
          </span>
        ) : null}
        <span className={clsx('rounded-full px-2 py-0.5', PRIORITY_COLOR[issue.priority])}>
          {PRIORITY_LABELS[issue.priority]}
        </span>
        {issue.labels.map((label) => (
          <span
            key={label}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-textSecondary-light dark:bg-neutral-800 dark:text-textSecondary-dark"
          >
            #{label}
          </span>
        ))}
        {assigneeName ? (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            {assigneeName}
          </span>
        ) : null}
      </footer>
      {issue.blocked ? (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-200">
          Bloqueado
        </div>
      ) : null}
    </article>
  );
}
