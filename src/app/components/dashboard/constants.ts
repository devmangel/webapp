import { IssueStatus, IssueType } from 'types/domain/dashboard';

export const BOARD_COLUMNS: { key: IssueStatus; title: string; wipLimit?: number; accent: string }[] = [
  { key: 'TODO', title: 'To Do', wipLimit: 12, accent: 'border-gray-300' },
  { key: 'IN_PROGRESS', title: 'In Progress', wipLimit: 6, accent: 'border-blue-400' },
  { key: 'IN_REVIEW', title: 'In Review', wipLimit: 4, accent: 'border-purple-400' },
  { key: 'DONE', title: 'Done', accent: 'border-emerald-400' },
];

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const ISSUE_STATUS_COLOR: Record<IssueStatus, string> = {
  TODO: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  IN_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
};

export const ISSUE_TYPE_COLOR: Record<IssueType, string> = {
  EPIC: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  STORY: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
  TASK: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
};

export const PRIORITY_LABELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const PRIORITY_COLOR: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', string> = {
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
};

export const UTILIZATION_THRESHOLDS = {
  normal: 0.8,
  warning: 1,
  critical: 1.3,
};
