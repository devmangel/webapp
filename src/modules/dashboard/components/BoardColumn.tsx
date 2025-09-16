'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Issue, TeamMember } from '../types';
import { BOARD_COLUMNS, ISSUE_STATUS_LABEL } from '../constants';
import { IssueCard } from './IssueCard';

interface BoardColumnProps {
  status: Issue['status'];
  issues: Issue[];
  onIssueDrop: (issueId: string, status: Issue['status']) => void;
  onIssueClick: (issue: Issue) => void;
  team: Record<string, TeamMember>;
}

export function BoardColumn({ status, issues, onIssueDrop, onIssueClick, team }: BoardColumnProps) {
  const [isTargeted, setIsTargeted] = useState(false);
  const columnMeta = BOARD_COLUMNS.find((column) => column.key === status);
  const wipLimit = columnMeta?.wipLimit;
  const isOverWip = typeof wipLimit === 'number' ? issues.length > wipLimit : false;

  return (
    <section
      className={clsx(
        'flex min-h-[500px] w-full flex-1 flex-col rounded-lg border border-dashed border-transparent bg-neutral-100/60 p-3 transition-colors dark:bg-neutral-900/40',
        columnMeta?.accent,
        isTargeted ? 'border-primary bg-primary/5' : '',
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsTargeted(true);
      }}
      onDragLeave={() => setIsTargeted(false)}
      onDrop={(event) => {
        event.preventDefault();
        const issueId = event.dataTransfer.getData('text/issue-id');
        if (issueId) {
          onIssueDrop(issueId, status);
        }
        setIsTargeted(false);
      }}
    >
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark">
            {ISSUE_STATUS_LABEL[status]}
          </h3>
          <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
            {issues.length} tareas
            {wipLimit ? ` · Límite ${wipLimit}` : ''}
          </p>
        </div>
        {isOverWip ? (
          <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-200">
            Exceso WIP
          </span>
        ) : null}
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/issue-id', issue.id);
            }}
          >
            <IssueCard
              issue={issue}
              assigneeName={issue.assigneeId ? team[issue.assigneeId]?.name : undefined}
              onClick={onIssueClick}
              draggable
            />
          </div>
        ))}
        {issues.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-md border border-border-light border-dashed bg-white/50 px-4 py-6 text-xs text-textSecondary-light dark:border-border-dark dark:bg-neutral-900/60 dark:text-textSecondary-dark">
            Arrastra tareas aquí
          </div>
        ) : null}
      </div>
    </section>
  );
}
