import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from 'app/lib/supabase/server-client';
import {
  AssignmentRule,
  AuditLogEntry,
  DashboardFilters,
  DashboardStateSnapshot,
  Epic,
  Issue,
  Sprint,
  TeamMember,
  Project,
} from 'modules/dashboard/types';
import {
  UsersRow,
  ProjectsRow,
  EpicsRow,
  SprintsRow,
  IssuesRow,
  AssignmentRulesRow,
  IssueDependenciesRow,
  AuditLogRow,
} from 'types/dashboard-rows';

interface DashboardSnapshotResponse {
  snapshot: DashboardStateSnapshot;
  filters: DashboardFilters;
  activeProjectId: string;
}

function normalizeTeamMember(row: UsersRow): TeamMember {
  const skillsValue = Array.isArray(row.skills) ? row.skills : [];

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    title: row.role,
    timezone: row.timezone ?? 'UTC',
    capacityPerSprint: row.capacity_per_sprint ?? 0,
    skills: skillsValue,
    active: row.active ?? true,
    focusAreas: skillsValue,
  };
}

function normalizeProject(row: ProjectsRow): Project {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description ?? '',
    color: row.color ?? '#3b82f6',
    ownerId: row.owner_id,
    epicIds: [],
    issueIds: [],
    sprintIds: [],
  };
}

function normalizeEpic(row: EpicsRow): Epic {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    objective: row.objective ?? '',
    projectId: row.project_id,
    ownerId: row.owner_id ?? undefined,
    status: row.status,
    storyIds: [],
    health: row.health ?? 'ON_TRACK',
  };
}

function normalizeSprint(row: SprintsRow): Sprint {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal ?? '',
    status: row.status,
    capacity: row.capacity ?? 0,
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    projectId: row.project_id,
    issueIds: [],
  } as Sprint;
}

function normalizeIssue(row: IssuesRow): Issue {
  return {
    id: row.id,
    key: row.key,
    title: row.summary,
    type: row.type,
    subtype: undefined,
    status: row.status,
    summary: row.summary,
    description: row.description ?? '',
    epicId: row.epic_id ?? undefined,
    storyId: row.parent_issue_id ?? undefined,
    assigneeId: row.assignee_id ?? undefined,
    reporterId: row.reporter_id ?? undefined,
    sprintId: row.sprint_id ?? undefined,
    storyPoints: row.story_points ?? undefined,
    priority: row.priority,
    labels: row.labels ?? [],
    dependencies: [],
    watchers: row.watchers ?? [],
    blocked: row.blocked ?? false,
    dueDate: row.due_date ?? undefined,
    acceptanceCriteria: row.acceptance_criteria ?? [],
    definitionOfDone: row.definition_of_done ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    comments: [],
  };
}

function normalizeAssignmentRule(row: AssignmentRulesRow): AssignmentRule {
  const preferredRoles = Array.isArray(row.preferred_roles)
    ? row.preferred_roles.filter((role): role is AssignmentRule['preferredRoles'][number] =>
        role === 'PM' || role === 'CONTRIBUTOR',
      )
    : [];
  const preferredSkills = Array.isArray(row.preferred_skills) ? row.preferred_skills : [];
  return {
    id: row.id,
    labelPattern: row.pattern,
    preferredRoles,
    preferredSkills,
    fallbackAssigneeId: row.fallback_user_id ?? undefined,
  } as AssignmentRule;
}

function normalizeAuditEntry(row: AuditLogRow): AuditLogEntry {
  // Safely convert Json to Record<string, unknown>
  let payload: Record<string, unknown> = {};
  if (row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)) {
    payload = row.metadata as Record<string, unknown>;
  }

  return {
    id: row.id,
    actorId: row.actor_id ?? 'system',
    action: row.action,
    scope: row.scope,
    targetId: row.target_id ?? 'n/a',
    createdAt: row.created_at,
    payload,
  };
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const [projectsRes, epicsRes, issuesRes, sprintsRes, teamRes, rulesRes, depsRes, auditRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: true }),
      supabase.from('epics').select('*'),
      supabase.from('issues').select('*'),
      supabase.from('sprints').select('*'),
      supabase.from('users').select('*').is('active', true),
      supabase.from('assignment_rules').select('*').is('active', true),
      supabase.from('issue_dependencies').select('*'),
      supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const allResponses = [projectsRes, epicsRes, issuesRes, sprintsRes, teamRes, rulesRes, depsRes, auditRes];
    const responseError = allResponses.find((res) => res.error);
    if (responseError?.error) {
      throw responseError.error;
    }

    const snapshot: DashboardStateSnapshot = {
      projects: {},
      epics: {},
      issues: {},
      sprints: {},
      team: {},
      assignmentRules: {},
      activity: [],
    };

    (projectsRes.data as unknown as ProjectsRow[])?.forEach((row) => {
      const project = normalizeProject(row);
      snapshot.projects[project.id] = project;
    });

    (epicsRes.data as unknown as EpicsRow[])?.forEach((row) => {
      const epic = normalizeEpic(row);
      snapshot.epics[epic.id] = epic;
      const project = snapshot.projects[epic.projectId];
      if (project) {
        project.epicIds.push(epic.id);
      }
    });

    (sprintsRes.data as unknown as SprintsRow[])?.forEach((row) => {
      const sprint = normalizeSprint(row);
      snapshot.sprints[sprint.id] = sprint;
      const project = snapshot.projects[sprint.projectId];
      if (project) {
        project.sprintIds.push(sprint.id);
      }
    });

    (issuesRes.data as unknown as IssuesRow[])?.forEach((row) => {
      const issue = normalizeIssue(row);
      snapshot.issues[issue.id] = issue;
      if (issue.epicId && snapshot.epics[issue.epicId]) {
        snapshot.epics[issue.epicId].storyIds.push(issue.id);
      }
      const project = snapshot.projects[row.project_id];
      if (project) {
        project.issueIds.push(issue.id);
      }
      if (issue.sprintId && snapshot.sprints[issue.sprintId]) {
        snapshot.sprints[issue.sprintId].issueIds.push(issue.id);
      }
    });

    (depsRes.data as unknown as IssueDependenciesRow[])?.forEach((row) => {
      const issue = snapshot.issues[row.issue_id];
      if (issue) {
        issue.dependencies.push(row.depends_on_issue_id);
      }
    });

    (teamRes.data as unknown as UsersRow[])?.forEach((row) => {
      const member = normalizeTeamMember(row);
      snapshot.team[member.id] = member;
    });

    (rulesRes.data as unknown as AssignmentRulesRow[])?.forEach((row) => {
      const rule = normalizeAssignmentRule(row);
      snapshot.assignmentRules[rule.id] = rule;
    });

    const auditEntries = (auditRes.data ?? []) as unknown as AuditLogRow[];
    snapshot.activity = auditEntries.map(normalizeAuditEntry);

    const projectIds = Object.keys(snapshot.projects);
    const activeProjectId = projectIds[0] ?? '';
    const defaultProject = snapshot.projects[activeProjectId];
    const defaultSprintId = defaultProject?.sprintIds[0];

    const filters: DashboardFilters = {
      projectId: activeProjectId,
      sprintId: defaultSprintId,
      assigneeId: undefined,
      issueType: 'ALL',
      labels: [],
      searchTerm: '',
    };

    const payload: DashboardSnapshotResponse = {
      snapshot,
      filters,
      activeProjectId,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('Failed to load dashboard snapshot', error);
    return NextResponse.json(
      { message: 'Error retrieving dashboard snapshot' },
      { status: 500 },
    );
  }
}
