'use client';

import { create } from 'zustand';
import { dashboardMockState, defaultFilters } from '../data/mock-data';
import { AssignmentRule, AuditLogEntry, DashboardFilters, DashboardStateSnapshot, Issue, IssueStatus } from '../types';

// Simple uuid fallback if the package is not available
function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export interface DashboardStore extends DashboardStateSnapshot {
  filters: DashboardFilters;
  activeProjectId: string;
  selectedIssueId?: string;
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

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...dashboardMockState,
  filters: defaultFilters,
  activeProjectId: defaultFilters.projectId,
  selectedIssueId: undefined,
  setProject: (projectId) => {
    const { projects } = get();
    if (!projects[projectId]) return;
    const firstSprintId = projects[projectId].sprintIds[0];
    set((state) => ({
      filters: {
        ...state.filters,
        projectId,
        sprintId: firstSprintId,
      },
      activeProjectId: projectId,
      selectedIssueId: undefined,
    }));
  },
  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },
  resetFilters: () => set({ filters: defaultFilters }),
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
