'use client';

import { clsx } from 'clsx';
import { ISSUE_STATUS_COLOR, ISSUE_STATUS_LABEL } from './constants';
import { IssueStatus } from 'types/domain';

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        ISSUE_STATUS_COLOR[status],
      )}
    >
      {ISSUE_STATUS_LABEL[status]}
    </span>
  );
}
