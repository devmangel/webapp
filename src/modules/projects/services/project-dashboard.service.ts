/**
 * Servicio para gestionar el dashboard de proyectos filtrado por usuario autenticado
 */

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
} from 'types/domain';
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

export class ProjectDashboardService {
  private supabase = createSupabaseServerClient();

  /**
   * Obtiene el snapshot completo del dashboard filtrado por el usuario autenticado
   */
  async getUserDashboardSnapshot(userId: string): Promise<DashboardSnapshotResponse> {
    try {
      // 1. Obtener proyectos accesibles al usuario
      const accessibleProjects = await this.getUserAccessibleProjects(userId);
      const projectIds = accessibleProjects.map(p => p.id);

      if (projectIds.length === 0) {
        // Usuario sin proyectos - retornar estado vacío
        return this.getEmptyDashboardSnapshot();
      }

      // 2. Cargar todas las entidades filtradas por proyectos accesibles
      const [epicsRes, issuesRes, sprintsRes, teamRes, rulesRes, depsRes, auditRes] = await Promise.all([
        this.getFilteredEpics(projectIds),
        this.getFilteredIssues(projectIds),
        this.getFilteredSprints(projectIds),
        this.getFilteredTeamMembers(projectIds),
        this.getFilteredAssignmentRules(projectIds),
        this.getFilteredIssueDependencies(projectIds),
        this.getFilteredAuditLog(projectIds),
      ]);

      // 3. Construir el snapshot
      const snapshot = this.buildDashboardSnapshot(
        accessibleProjects,
        epicsRes,
        issuesRes,
        sprintsRes,
        teamRes,
        rulesRes,
        depsRes,
        auditRes
      );

      // 4. Configurar filtros por defecto
      const activeProjectId = accessibleProjects[0]?.id ?? '';
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

      return {
        snapshot,
        filters,
        activeProjectId,
      };

    } catch (error) {
      console.error('[ProjectDashboardService] Error getting user dashboard snapshot:', error);
      throw new Error('No se pudo obtener el estado del dashboard');
    }
  }

  /**
   * Obtiene solo los proyectos donde el usuario es miembro activo
   */
  private async getUserAccessibleProjects(userId: string): Promise<ProjectsRow[]> {
    const { data: projects, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        project_members!project_members_project_id_fkey!inner(
          user_id,
          status
        )
      `)
      .eq('project_members.user_id', userId)
      .eq('project_members.status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[ProjectDashboardService] Error fetching accessible projects:', error);
      throw error;
    }

    return projects || [];
  }

  /**
   * Obtiene epics filtrados por proyectos accesibles
   */
  private async getFilteredEpics(projectIds: string[]) {
    const { data, error } = await this.supabase
      .from('epics')
      .select('*')
      .in('project_id', projectIds);

    if (error) {
      console.error('[ProjectDashboardService] Error fetching epics:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene issues filtradas por proyectos accesibles
   */
  private async getFilteredIssues(projectIds: string[]) {
    const { data, error } = await this.supabase
      .from('issues')
      .select('*')
      .in('project_id', projectIds);

    if (error) {
      console.error('[ProjectDashboardService] Error fetching issues:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene sprints filtrados por proyectos accesibles
   */
  private async getFilteredSprints(projectIds: string[]) {
    const { data, error } = await this.supabase
      .from('sprints')
      .select('*')
      .in('project_id', projectIds);

    if (error) {
      console.error('[ProjectDashboardService] Error fetching sprints:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene miembros del equipo que están en al menos uno de los proyectos accesibles
   */
  private async getFilteredTeamMembers(projectIds: string[]) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        project_members!project_members_user_id_fkey!inner(
          project_id,
          status
        )
      `)
      .in('project_members.project_id', projectIds)
      .eq('project_members.status', 'active')
      .is('active', true);

    if (error) {
      console.error('[ProjectDashboardService] Error fetching team members:', error);
      throw error;
    }

    // Eliminar duplicados si un usuario está en múltiples proyectos
    const uniqueUsers = new Map();
    (data || []).forEach(user => {
      if (!uniqueUsers.has(user.id)) {
        uniqueUsers.set(user.id, user);
      }
    });

    return Array.from(uniqueUsers.values());
  }

  /**
   * Obtiene reglas de asignación filtradas por proyectos accesibles
   */
  private async getFilteredAssignmentRules(projectIds: string[]) {
    const { data, error } = await this.supabase
      .from('assignment_rules')
      .select('*')
      .in('project_id', projectIds)
      .is('active', true);

    if (error) {
      console.error('[ProjectDashboardService] Error fetching assignment rules:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene dependencias de issues filtradas por proyectos accesibles
   */
  private async getFilteredIssueDependencies(projectIds: string[]) {
    // Obtener IDs de issues de los proyectos accesibles primero
    const { data: issueIds, error: issueError } = await this.supabase
      .from('issues')
      .select('id')
      .in('project_id', projectIds);

    if (issueError) {
      console.error('[ProjectDashboardService] Error fetching issue IDs:', issueError);
      throw issueError;
    }

    if (!issueIds || issueIds.length === 0) {
      return [];
    }

    const issueIdList = issueIds.map(issue => issue.id);

    const { data, error } = await this.supabase
      .from('issue_dependencies')
      .select('*')
      .in('issue_id', issueIdList);

    if (error) {
      console.error('[ProjectDashboardService] Error fetching issue dependencies:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene audit log filtrado por actores de los proyectos accesibles
   */
  private async getFilteredAuditLog(projectIds: string[]) {
    try {
      // 1. Obtener todos los user_ids que son miembros activos de los proyectos accesibles
      const projectUserIds = await this.getProjectUserIds(projectIds);

      if (projectUserIds.length === 0) {
        return [];
      }

      // 2. Filtrar audit_log por estos actores
      const { data, error } = await this.supabase
        .from('audit_log')
        .select('*')
        .in('actor_id', projectUserIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[ProjectDashboardService] Error fetching audit log:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[ProjectDashboardService] Error in getFilteredAuditLog:', error);
      return [];
    }
  }

  /**
   * Obtiene los user_ids de todos los miembros activos de los proyectos dados
   */
  private async getProjectUserIds(projectIds: string[]): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('project_members')
      .select('user_id')
      .in('project_id', projectIds)
      .eq('status', 'active');

    if (error) {
      console.error('[ProjectDashboardService] Error fetching project user IDs:', error);
      throw error;
    }

    // Eliminar duplicados y extraer solo los IDs
    const uniqueUserIds = Array.from(new Set(
      (data || []).map(member => member.user_id).filter(Boolean)
    ));

    return uniqueUserIds;
  }

  /**
   * Construye el snapshot del dashboard a partir de los datos obtenidos
   */
  private buildDashboardSnapshot(
    projects: ProjectsRow[],
    epics: EpicsRow[],
    issues: IssuesRow[],
    sprints: SprintsRow[],
    team: UsersRow[],
    rules: AssignmentRulesRow[],
    dependencies: IssueDependenciesRow[],
    auditLog: AuditLogRow[]
  ): DashboardStateSnapshot {
    const snapshot: DashboardStateSnapshot = {
      projects: {},
      epics: {},
      issues: {},
      sprints: {},
      team: {},
      assignmentRules: {},
      activity: [],
    };

    // Normalizar proyectos
    projects.forEach((row) => {
      const project = this.normalizeProject(row);
      snapshot.projects[project.id] = project;
    });

    // Normalizar epics
    epics.forEach((row) => {
      const epic = this.normalizeEpic(row);
      snapshot.epics[epic.id] = epic;
      const project = snapshot.projects[epic.projectId];
      if (project) {
        project.epicIds.push(epic.id);
      }
    });

    // Normalizar sprints
    sprints.forEach((row) => {
      const sprint = this.normalizeSprint(row);
      snapshot.sprints[sprint.id] = sprint;
      const project = snapshot.projects[sprint.projectId];
      if (project) {
        project.sprintIds.push(sprint.id);
      }
    });

    // Normalizar issues
    issues.forEach((row) => {
      const issue = this.normalizeIssue(row);
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

    // Procesar dependencias
    dependencies.forEach((row) => {
      const issue = snapshot.issues[row.issue_id];
      if (issue) {
        issue.dependencies.push(row.depends_on_issue_id);
      }
    });

    // Normalizar team members
    team.forEach((row) => {
      const member = this.normalizeTeamMember(row);
      snapshot.team[member.id] = member;
    });

    // Normalizar assignment rules
    rules.forEach((row) => {
      const rule = this.normalizeAssignmentRule(row);
      snapshot.assignmentRules[rule.id] = rule;
    });

    // Normalizar audit log
    snapshot.activity = auditLog.map(row => this.normalizeAuditEntry(row));

    return snapshot;
  }

  /**
   * Retorna un snapshot vacío cuando el usuario no tiene acceso a ningún proyecto
   */
  private getEmptyDashboardSnapshot(): DashboardSnapshotResponse {
    const emptySnapshot: DashboardStateSnapshot = {
      projects: {},
      epics: {},
      issues: {},
      sprints: {},
      team: {},
      assignmentRules: {},
      activity: [],
    };

    const emptyFilters: DashboardFilters = {
      projectId: '',
      sprintId: undefined,
      assigneeId: undefined,
      issueType: 'ALL',
      labels: [],
      searchTerm: '',
    };

    return {
      snapshot: emptySnapshot,
      filters: emptyFilters,
      activeProjectId: '',
    };
  }

  // === MÉTODOS DE NORMALIZACIÓN ===

  private normalizeTeamMember(row: UsersRow): TeamMember {
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

  private normalizeProject(row: ProjectsRow): Project {
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

  private normalizeEpic(row: EpicsRow): Epic {
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

  private normalizeSprint(row: SprintsRow): Sprint {
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

  private normalizeIssue(row: IssuesRow): Issue {
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

  private normalizeAssignmentRule(row: AssignmentRulesRow): AssignmentRule {
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

  private normalizeAuditEntry(row: AuditLogRow): AuditLogEntry {
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
}
