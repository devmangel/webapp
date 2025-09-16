export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'ADMIN' | 'PM' | 'CONTRIBUTOR' | 'VIEWER';
          timezone: string | null;
          capacity_per_sprint: number | null;
          skills: string[] | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          avatar_url: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          color: string | null;
          owner_id: string;
          status: 'ACTIVE' | 'ARCHIVED';
          created_at: string;
          updated_at: string;
        };
      };
      epics: {
        Row: {
          id: string;
          project_id: string;
          key: string;
          name: string;
          objective: string | null;
          owner_id: string | null;
          status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
          health: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | null;
          created_at: string;
          updated_at: string;
        };
      };
      sprints: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          goal: string | null;
          status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
          start_date: string | null;
          end_date: string | null;
          capacity: number | null;
          velocity_snapshot: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      issues: {
        Row: {
          id: string;
          project_id: string;
          epic_id: string | null;
          parent_issue_id: string | null;
          key: string;
          type: 'EPIC' | 'STORY' | 'TASK';
          status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          summary: string;
          description: string | null;
          assignee_id: string | null;
          reporter_id: string | null;
          sprint_id: string | null;
          story_points: number | null;
          blocked: boolean | null;
          labels: string[] | null;
          definition_of_done: string[] | null;
          acceptance_criteria: string[] | null;
          watchers: string[] | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      assignment_rules: {
        Row: {
          id: string;
          project_id: string;
          pattern: string;
          preferred_roles: string[] | null;
          preferred_skills: string[] | null;
          fallback_user_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      issue_dependencies: {
        Row: {
          issue_id: string;
          depends_on_issue_id: string;
          created_at: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          scope: 'ISSUE' | 'SPRINT' | 'PROJECT' | 'RULE';
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
          ip_address: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
