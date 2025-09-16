import { Issue, Sprint, TeamMember } from 'types/domain/dashboard';

export interface TeamLoadEntry {
  member: TeamMember;
  sprint: Sprint;
  totalPoints: number;
  capacityUsed: number;
  utilization: number;
  assignments: Issue[];
}

export function buildTeamLoadMatrix(
  teamMap: Record<string, TeamMember>,
  sprints: Sprint[],
  issues: Issue[],
): TeamLoadEntry[] {
  const entries: TeamLoadEntry[] = [];
  sprints.forEach((sprint) => {
    issues
      .filter((issue) => issue.sprintId === sprint.id && issue.assigneeId)
      .forEach((issue) => {
        const member = issue.assigneeId ? teamMap[issue.assigneeId] : undefined;
        if (!member) return;
        const existing = entries.find(
          (entry) => entry.member.id === member.id && entry.sprint.id === sprint.id,
        );
        if (existing) {
          existing.totalPoints += issue.storyPoints ?? 0;
          existing.assignments.push(issue);
          existing.capacityUsed = Math.round((existing.totalPoints / member.capacityPerSprint) * 100);
          existing.utilization = existing.totalPoints / member.capacityPerSprint;
        } else {
          const totalPoints = issue.storyPoints ?? 0;
          entries.push({
            member,
            sprint,
            totalPoints,
            assignments: [issue],
            capacityUsed: Math.round((totalPoints / member.capacityPerSprint) * 100),
            utilization: totalPoints / member.capacityPerSprint,
          });
        }
      });
  });
  return entries;
}

export function summarizeMemberLoad(
  teamMap: Record<string, TeamMember>,
  issues: Issue[],
  sprint?: Sprint,
) {
  return Object.values(teamMap).map((member) => {
    const memberIssues = issues.filter((issue) => {
      if (issue.assigneeId !== member.id) return false;
      if (sprint && issue.sprintId !== sprint.id) return false;
      return true;
    });

    const totalPoints = memberIssues.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0);
    const percent = member.capacityPerSprint === 0 ? 0 : (totalPoints / member.capacityPerSprint) * 100;
    return {
      member,
      totalPoints,
      utilization: percent,
      assignments: memberIssues,
    };
  });
}
