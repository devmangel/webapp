export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_stream: {
        Row: {
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          project_id: string
          source: string | null
        }
        Insert: {
          event_type: string
          id?: string
          occurred_at: string
          payload: Json
          project_id: string
          source?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          project_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_stream_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_runs: {
        Row: {
          error_message: string | null
          finished_at: string | null
          id: string
          input_snapshot: Json
          mode: string
          project_id: string
          requested_by: string
          started_at: string
          status: string
          toggles: Json
        }
        Insert: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_snapshot: Json
          mode: string
          project_id: string
          requested_by: string
          started_at: string
          status: string
          toggles: Json
        }
        Update: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_snapshot?: Json
          mode?: string
          project_id?: string
          requested_by?: string
          started_at?: string
          status?: string
          toggles?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_ai_runs_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_runs_requested_by"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          acceptance_criteria: Json | null
          accepted: boolean
          ai_run_id: string
          applied_at: string | null
          confidence: string | null
          definition_of_done: Json | null
          dependencies: Json | null
          id: string
          issue_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          story_points: number | null
          suggested_description: string | null
          suggested_summary: string | null
        }
        Insert: {
          acceptance_criteria?: Json | null
          accepted: boolean
          ai_run_id: string
          applied_at?: string | null
          confidence?: string | null
          definition_of_done?: Json | null
          dependencies?: Json | null
          id?: string
          issue_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          story_points?: number | null
          suggested_description?: string | null
          suggested_summary?: string | null
        }
        Update: {
          acceptance_criteria?: Json | null
          accepted?: boolean
          ai_run_id?: string
          applied_at?: string | null
          confidence?: string | null
          definition_of_done?: Json | null
          dependencies?: Json | null
          id?: string
          issue_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          story_points?: number | null
          suggested_description?: string | null
          suggested_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ai_suggestions_ai_run_id"
            columns: ["ai_run_id"]
            isOneToOne: false
            referencedRelation: "ai_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_suggestions_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_suggestions_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_rules: {
        Row: {
          active: boolean
          created_at: string
          fallback_user_id: string | null
          id: string
          name: string
          pattern: string
          preferred_roles: string[] | null
          preferred_skills: string[] | null
          project_id: string
          updated_at: string
        }
        Insert: {
          active: boolean
          created_at: string
          fallback_user_id?: string | null
          id?: string
          name: string
          pattern: string
          preferred_roles?: string[] | null
          preferred_skills?: string[] | null
          project_id: string
          updated_at: string
        }
        Update: {
          active?: boolean
          created_at?: string
          fallback_user_id?: string | null
          id?: string
          name?: string
          pattern?: string
          preferred_roles?: string[] | null
          preferred_skills?: string[] | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assignment_rules_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          scope: string
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          scope: string
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          scope?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_log_actor_id"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      backlog_imports: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          parsed_payload: Json | null
          processed_at: string | null
          project_id: string
          raw_markdown: string
          status: string
          summary: string | null
          uploader_id: string
        }
        Insert: {
          created_at: string
          error_message?: string | null
          id?: string
          parsed_payload?: Json | null
          processed_at?: string | null
          project_id: string
          raw_markdown: string
          status: string
          summary?: string | null
          uploader_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          parsed_payload?: Json | null
          processed_at?: string | null
          project_id?: string
          raw_markdown?: string
          status?: string
          summary?: string | null
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_backlog_imports_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_backlog_imports_uploader_id"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_snapshots: {
        Row: {
          available_capacity: number
          planned_points: number
          recorded_at: string
          sprint_id: string
          user_id: string
          utilization: string | null
        }
        Insert: {
          available_capacity: number
          planned_points: number
          recorded_at: string
          sprint_id: string
          user_id: string
          utilization?: string | null
        }
        Update: {
          available_capacity?: number
          planned_points?: number
          recorded_at?: string
          sprint_id?: string
          user_id?: string
          utilization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_capacity_snapshots_sprint_id"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_capacity_snapshots_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          items: Json
          type: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id?: string
          issue_id: string
          items: Json
          type: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          items?: Json
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_checklists_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      epics: {
        Row: {
          created_at: string
          health: string | null
          id: string
          key: string
          name: string
          objective: string | null
          owner_id: string | null
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at: string
          health?: string | null
          id?: string
          key: string
          name: string
          objective?: string | null
          owner_id?: string | null
          project_id: string
          status: string
          updated_at: string
        }
        Update: {
          created_at?: string
          health?: string | null
          id?: string
          key?: string
          name?: string
          objective?: string | null
          owner_id?: string | null
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_epics_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_epics_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          processed_at: string | null
          retries: number
          source: string
          status: string
        }
        Insert: {
          created_at: string
          id?: string
          payload: Json
          processed_at?: string | null
          retries: number
          source: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          retries?: number
          source?: string
          status?: string
        }
        Relationships: []
      }
      issue_attachments: {
        Row: {
          content_type: string | null
          id: string
          issue_id: string
          name: string
          size_bytes: number | null
          uploaded_at: string
          uploader_id: string
          url: string
        }
        Insert: {
          content_type?: string | null
          id?: string
          issue_id: string
          name: string
          size_bytes?: number | null
          uploaded_at: string
          uploader_id: string
          url: string
        }
        Update: {
          content_type?: string | null
          id?: string
          issue_id?: string
          name?: string
          size_bytes?: number | null
          uploaded_at?: string
          uploader_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issue_attachments_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issue_attachments_uploader_id"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          edited_at: string | null
          id: string
          issue_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at: string
          edited_at?: string | null
          id?: string
          issue_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issue_comments_author_id"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issue_comments_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_dependencies: {
        Row: {
          created_at: string
          depends_on_issue_id: string
          issue_id: string
        }
        Insert: {
          created_at: string
          depends_on_issue_id: string
          issue_id: string
        }
        Update: {
          created_at?: string
          depends_on_issue_id?: string
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issue_dependencies_depends_on_issue_id"
            columns: ["depends_on_issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issue_dependencies_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          field: string
          id: string
          issue_id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          changed_at: string
          changed_by?: string | null
          field: string
          id?: string
          issue_id: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          field?: string
          id?: string
          issue_id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_issue_history_changed_by"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issue_history_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_watchers: {
        Row: {
          issue_id: string
          subscribed_at: string
          user_id: string
        }
        Insert: {
          issue_id: string
          subscribed_at: string
          user_id: string
        }
        Update: {
          issue_id?: string
          subscribed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issue_watchers_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issue_watchers_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          acceptance_criteria: string[] | null
          assignee_id: string | null
          blocked: boolean
          created_at: string
          definition_of_done: string[] | null
          description: string | null
          due_date: string | null
          epic_id: string | null
          id: string
          key: string
          labels: string[] | null
          parent_issue_id: string | null
          priority: string
          project_id: string
          reporter_id: string | null
          sprint_id: string | null
          status: string
          story_points: number | null
          summary: string
          type: string
          updated_at: string
          watchers: string[] | null
        }
        Insert: {
          acceptance_criteria?: string[] | null
          assignee_id?: string | null
          blocked: boolean
          created_at: string
          definition_of_done?: string[] | null
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          id?: string
          key: string
          labels?: string[] | null
          parent_issue_id?: string | null
          priority: string
          project_id: string
          reporter_id?: string | null
          sprint_id?: string | null
          status: string
          story_points?: number | null
          summary: string
          type: string
          updated_at: string
          watchers?: string[] | null
        }
        Update: {
          acceptance_criteria?: string[] | null
          assignee_id?: string | null
          blocked?: boolean
          created_at?: string
          definition_of_done?: string[] | null
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          id?: string
          key?: string
          labels?: string[] | null
          parent_issue_id?: string | null
          priority?: string
          project_id?: string
          reporter_id?: string | null
          sprint_id?: string | null
          status?: string
          story_points?: number | null
          summary?: string
          type?: string
          updated_at?: string
          watchers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_issues_assignee_id"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_epic_id"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_reporter_id"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_sprint_id"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      label_directory: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_label_directory_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at: string
          id?: string
          payload: Json
          read_at?: string | null
          status: string
          type: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prioritization_scores: {
        Row: {
          calculated_at: string
          capacity_hint: Json | null
          framework: string
          id: string
          input_payload: Json
          issue_id: string
          rank: number | null
          score: string | null
        }
        Insert: {
          calculated_at: string
          capacity_hint?: Json | null
          framework: string
          id?: string
          input_payload: Json
          issue_id: string
          rank?: number | null
          score?: string | null
        }
        Update: {
          calculated_at?: string
          capacity_hint?: Json | null
          framework?: string
          id?: string
          input_payload?: Json
          issue_id?: string
          rank?: number | null
          score?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_prioritization_scores_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          color?: string | null
          created_at: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          status: string
          updated_at: string
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_assignments: {
        Row: {
          added_at: string
          committed: boolean
          issue_id: string
          position: number
          sprint_id: string
        }
        Insert: {
          added_at: string
          committed: boolean
          issue_id: string
          position: number
          sprint_id: string
        }
        Update: {
          added_at?: string
          committed?: boolean
          issue_id?: string
          position?: number
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sprint_assignments_issue_id"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sprint_assignments_sprint_id"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          capacity: number | null
          created_at: string
          end_date: string | null
          goal: string | null
          id: string
          name: string
          project_id: string
          start_date: string | null
          status: string
          updated_at: string
          velocity_snapshot: number | null
        }
        Insert: {
          capacity?: number | null
          created_at: string
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          project_id: string
          start_date?: string | null
          status: string
          updated_at: string
          velocity_snapshot?: number | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          project_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          velocity_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sprints_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          project_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at: string
          id?: string
          project_id: string
          settings: Json
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_system_settings_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          capacity_per_sprint: number | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          skills: Json | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          active: boolean
          capacity_per_sprint?: number | null
          created_at: string
          email: string
          id?: string
          name: string
          role: string
          skills?: Json | null
          timezone?: string | null
          updated_at: string
        }
        Update: {
          active?: boolean
          capacity_per_sprint?: number | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          skills?: Json | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
