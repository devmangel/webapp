import { Issue, AuditLogEntry, Epic, TeamMember } from 'types/domain';

export interface KpiCardProps {
  title: string;
  value: string;
  sublabel?: string;
  accentClass?: string;
  icon?: React.ReactNode;
  index?: number;
}

export interface EpicStatsData {
  total: number;
  done: number;
  todo: number;
  inProgress: number;
  inReview: number;
}

export interface EpicProgressCardProps {
  epic: Epic;
  stats: EpicStatsData;
  index: number;
}

export interface BlockedIssueCardProps {
  issue: Issue;
  assignee?: TeamMember;
  index: number;
}

export interface TeamMemberCardProps {
  member: TeamMember;
  memberIssues: Issue[];
  index: number;
}

export interface ActivityTimelineProps {
  activities: AuditLogEntry[];
  team: Record<string, TeamMember>;
  issues: Record<string, Issue>;
}
