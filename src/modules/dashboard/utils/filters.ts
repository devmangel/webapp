import { DashboardFilters, Issue, IssueStatus } from '../types';

const normalizedSearch = (value?: string) => value?.toLowerCase().trim() ?? '';

const statusOrder: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function issueMatchesFilters(issue: Issue, filters: DashboardFilters): boolean {
  if (filters.projectId && issue.epicId) {
    // Project filtering happens outside using epic/project associations
  }

  if (filters.sprintId && issue.sprintId !== filters.sprintId) {
    return false;
  }

  if (filters.assigneeId && issue.assigneeId !== filters.assigneeId) {
    return false;
  }

  if (filters.issueType && filters.issueType !== 'ALL' && issue.type !== filters.issueType) {
    return false;
  }

  if (filters.labels.length > 0) {
    const hasLabel = filters.labels.every((label) => issue.labels.includes(label));
    if (!hasLabel) return false;
  }

  if (filters.searchTerm) {
    const term = normalizedSearch(filters.searchTerm);
    const composite = normalizedSearch(
      `${issue.title} ${issue.summary} ${issue.key} ${issue.labels.join(' ')}`,
    );
    if (!composite.includes(term)) return false;
  }

  return true;
}

export function sortIssuesByStatus(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;
    if (a.priority === b.priority) {
      return a.updatedAt.localeCompare(b.updatedAt) * -1;
    }
    const priorityRank: Record<Issue['priority'], number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };
    return priorityRank[a.priority] - priorityRank[b.priority];
  });
}

export interface KpiSummary {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  completionRate: number;
}

export function computeKpis(issues: Issue[]): KpiSummary {
  const summary = issues.reduce(
    (acc, issue) => {
      acc.total += 1;
      if (issue.blocked) acc.blocked += 1;
      switch (issue.status) {
        case 'TODO':
          acc.todo += 1;
          break;
        case 'IN_PROGRESS':
          acc.inProgress += 1;
          break;
        case 'IN_REVIEW':
          acc.inReview += 1;
          break;
        case 'DONE':
          acc.done += 1;
          break;
        default:
          break;
      }
      return acc;
    },
    {
      total: 0,
      todo: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      blocked: 0,
      completionRate: 0,
    },
  );

  summary.completionRate = summary.total === 0 ? 0 : Math.round((summary.done / summary.total) * 100);
  return summary;
}

export interface EpicStats {
  epicId: string;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  total: number;
  blocked: number;
}

export function computeEpicStats(issues: Issue[], epicId: string): EpicStats {
  const stats: EpicStats = {
    epicId,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    total: 0,
    blocked: 0,
  };

  issues.forEach((issue) => {
    if (issue.epicId !== epicId) return;
    stats.total += 1;
    if (issue.blocked) stats.blocked += 1;
    switch (issue.status) {
      case 'TODO':
        stats.todo += 1;
        break;
      case 'IN_PROGRESS':
        stats.inProgress += 1;
        break;
      case 'IN_REVIEW':
        stats.inReview += 1;
        break;
      case 'DONE':
        stats.done += 1;
        break;
      default:
        break;
    }
  });

  return stats;
}

export function groupIssuesByStatus(issues: Issue[]): Record<IssueStatus, Issue[]> {
  return issues.reduce<Record<IssueStatus, Issue[]>>(
    (acc, issue) => {
      acc[issue.status].push(issue);
      return acc;
    },
    {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    },
  );
}

export function uniqueLabelsFromIssues(issues: Issue[]): string[] {
  const labels = new Set<string>();
  issues.forEach((issue) => issue.labels.forEach((label) => labels.add(label)));
  return Array.from(labels).sort();
}
