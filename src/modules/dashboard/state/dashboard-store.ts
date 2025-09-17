'use client';

import { create } from 'zustand';
import { AssignmentRule, AuditLogEntry, DashboardFilters, DashboardStateSnapshot, Issue, IssueStatus } from 'types/domain/dashboard';

// Simple uuid fallback if the package is not available
function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export interface DashboardStore extends DashboardStateSnapshot {
  filters: DashboardFilters;
  baseFilters: DashboardFilters;
  activeProjectId: string;
  selectedIssueId?: string;
  isLoading: boolean;
  isHydrated: boolean;
  loadError?: string;
  loadInitialState: () => Promise<void>;
  setProject: (projectId: string) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  setSelectedIssue: (issueId?: string) => void;
  moveIssue: (issueId: string, nextStatus: IssueStatus, options?: { sprintId?: string; blocked?: boolean }) => void;
  assignIssue: (issueId: string, assigneeId?: string) => void;
  updateIssue: (issueId: string, data: Partial<Issue>) => void;
  addComment: (issueId: string, authorId: string, message: string) => void;
  toggleBlocked: (issueId: string, blocked: boolean) => void;
  upsertAssignmentRule: (rule: AssignmentRule) => void;
  removeAssignmentRule: (ruleId: string) => void;
  recordActivity: (entry: AuditLogEntry) => void;
}

function appendActivity(activity: AuditLogEntry[], entry: AuditLogEntry): AuditLogEntry[] {
  return [...activity, entry];
}

function createAuditEntry(params: Omit<AuditLogEntry, 'id' | 'createdAt'> & { createdAt?: string }): AuditLogEntry {
  return {
    id: generateId(),
    createdAt: params.createdAt ?? new Date().toISOString(),
    ...params,
  };
}

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

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...emptySnapshot,
  filters: emptyFilters,
  baseFilters: emptyFilters,
  activeProjectId: '',
  selectedIssueId: undefined,
  isLoading: false,
  isHydrated: false,
  loadError: undefined,
  loadInitialState: async () => {
    const { isHydrated, isLoading } = get();
    if (isHydrated || isLoading) return;

    set({ isLoading: true, loadError: undefined });

    try {
      const response = await fetch('/api/dashboard/state', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el estado del dashboard');
      }

      const data = await response.json();

      set(() => ({
        ...data.snapshot,
        filters: data.filters,
        baseFilters: data.filters,
        activeProjectId: data.activeProjectId ?? data.filters.projectId ?? '',
        isHydrated: true,
        isLoading: false,
        loadError: undefined,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cargar el dashboard';
      set({
        isLoading: false,
        loadError: message,
      });
      console.error('[DashboardStore] loadInitialState error', error);
    }
  },
  setProject: (projectId) => {
    const { projects, isHydrated } = get();
    if (!isHydrated || !projects[projectId]) return;
    const firstSprintId = projects[projectId].sprintIds[0];
    set((state) => {
      const newFilters: DashboardFilters = {
        ...state.baseFilters,
        projectId,
        sprintId: firstSprintId,
        assigneeId: undefined,
        issueType: 'ALL',
        labels: [],
        searchTerm: '',
      };
      return {
        filters: newFilters,
        baseFilters: newFilters,
        activeProjectId: projectId,
        selectedIssueId: undefined,
      };
    });
  },
  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },
  resetFilters: () => set((state) => ({ filters: state.baseFilters })),
  setSelectedIssue: (issueId) => set({ selectedIssueId: issueId }),
  moveIssue: (issueId, nextStatus, options) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;

      const targetSprintId = options?.sprintId ?? issue.sprintId;
      const updatedIssue: Issue = {
        ...issue,
        status: nextStatus,
        sprintId: targetSprintId,
        blocked: options?.blocked ?? issue.blocked,
        updatedAt: new Date().toISOString(),
      };

      const issues = {
        ...state.issues,
        [issueId]: updatedIssue,
      };

      const sprints = { ...state.sprints };

      if (issue.sprintId && sprints[issue.sprintId]) {
        const sprint = sprints[issue.sprintId];
        sprints[issue.sprintId] = {
          ...sprint,
          issueIds: sprint.issueIds.filter((id) => id !== issueId),
        };
      }

      if (targetSprintId && sprints[targetSprintId]) {
        const sprint = sprints[targetSprintId];
        if (!sprint.issueIds.includes(issueId)) {
          sprints[targetSprintId] = {
            ...sprint,
            issueIds: [...sprint.issueIds, issueId],
          };
        }
      }

      const activity = appendActivity(state.activity, createAuditEntry({
        actorId: updatedIssue.assigneeId ?? 'system',
        action: 'status_changed',
        scope: 'ISSUE',
        targetId: issueId,
        payload: {
          from: issue.status,
          to: nextStatus,
          sprint: targetSprintId,
        },
      }));

      return {
        ...state,
        issues,
        sprints,
        activity,
      };
    });
  },
  assignIssue: (issueId, assigneeId) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;
      const issues = {
        ...state.issues,
        [issueId]: {
          ...issue,
          assigneeId,
          updatedAt: new Date().toISOString(),
        },
      };

      const activity = appendActivity(state.activity, createAuditEntry({
        actorId: assigneeId ?? 'system',
        action: 'assignee_changed',
        scope: 'ISSUE',
        targetId: issueId,
        payload: {
          from: issue.assigneeId,
          to: assigneeId,
        },
      }));

      return {
        ...state,
        issues,
        activity,
      };
    });
  },
  updateIssue: (issueId, data) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;
      const issues = {
        ...state.issues,
        [issueId]: {
          ...issue,
          ...data,
          updatedAt: new Date().toISOString(),
        },
      };

      const activity = appendActivity(state.activity, createAuditEntry({
        actorId: data.assigneeId ?? issue.assigneeId ?? 'system',
        action: 'description_updated',
        scope: 'ISSUE',
        targetId: issueId,
      }));

      return {
        ...state,
        issues,
        activity,
      };
    });
  },
  addComment: (issueId, authorId, message) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;

      const newCommentId = generateId();
      const comment = {
        id: newCommentId,
        authorId,
        message,
        createdAt: new Date().toISOString(),
      };

      const issues = {
        ...state.issues,
        [issueId]: {
          ...issue,
          comments: [...issue.comments, comment],
        },
      };

      const activity = appendActivity(state.activity, createAuditEntry({
        actorId: authorId,
        action: 'comment_added',
        scope: 'ISSUE',
        targetId: issueId,
        payload: { commentId: newCommentId },
      }));

      return {
        ...state,
        issues,
        activity,
      };
    });
  },
  toggleBlocked: (issueId, blocked) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;
      const issues = {
        ...state.issues,
        [issueId]: {
          ...issue,
          blocked,
          updatedAt: new Date().toISOString(),
        },
      };

      const activity = appendActivity(state.activity, createAuditEntry({
        actorId: issue.assigneeId ?? 'system',
        action: blocked ? 'label_added' : 'label_removed',
        scope: 'ISSUE',
        targetId: issueId,
        payload: { label: 'blocked', blocked },
      }));

      return {
        ...state,
        issues,
        activity,
      };
    });
  },
  upsertAssignmentRule: (rule) => {
    set((state) => ({
      assignmentRules: {
        ...state.assignmentRules,
        [rule.id]: rule,
      },
    }));
  },
  removeAssignmentRule: (ruleId) => {
    set((state) => {
      const nextRules: Record<string, AssignmentRule> = { ...state.assignmentRules };
      delete nextRules[ruleId];
      return {
        ...state,
        assignmentRules: nextRules,
      };
    });
  },
  recordActivity: (entry) => {
    set((state) => ({
      activity: appendActivity(state.activity, entry),
    }));
  },
}));
