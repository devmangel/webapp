Schema |         Name          | Type  |  Owner   
--------+-----------------------+-------+----------
 public | activity_stream       | table | postgres
 public | ai_runs               | table | postgres
 public | ai_suggestions        | table | postgres
 public | assignment_rules      | table | postgres
 public | audit_log             | table | postgres
 public | backlog_imports       | table | postgres
 public | capacity_snapshots    | table | postgres
 public | checklists            | table | postgres
 public | epics                 | table | postgres
 public | integration_events    | table | postgres
 public | issue_attachments     | table | postgres
 public | issue_comments        | table | postgres
 public | issue_dependencies    | table | postgres
 public | issue_history         | table | postgres
 public | issue_watchers        | table | postgres
 public | issues                | table | postgres
 public | label_directory       | table | postgres
 public | notifications         | table | postgres
 public | prioritization_scores | table | postgres
 public | projects              | table | postgres
 public | sprint_assignments    | table | postgres
 public | sprints               | table | postgres
 public | system_settings       | table | postgres
 public | users                 | table | postgres

                                    Table "public.users"
       Column        |           Type           | Collation | Nullable |      Default      
---------------------+--------------------------+-----------+----------+-------------------
 id                  | uuid                     |           | not null | gen_random_uuid()
 name                | text                     |           | not null | 
 email               | citext                   |           | not null | 
 role                | text                     |           | not null | 
 timezone            | text                     |           |          | 
 capacity_per_sprint | integer                  |           |          | 
 skills              | jsonb                    |           |          | 
 active              | boolean                  |           | not null | 
 created_at          | timestamp with time zone |           | not null | 
 updated_at          | timestamp with time zone |           | not null | 
Indexes:
    "pk_users" PRIMARY KEY, btree (id)
    "idx_users_active" btree (active)
    "idx_users_email" UNIQUE, btree (email)
Referenced by:
    TABLE "ai_runs" CONSTRAINT "fk_ai_runs_requested_by" FOREIGN KEY (requested_by) REFERENCES users(id)
    TABLE "ai_suggestions" CONSTRAINT "fk_ai_suggestions_reviewed_by" FOREIGN KEY (reviewed_by) REFERENCES users(id)
    TABLE "audit_log" CONSTRAINT "fk_audit_log_actor_id" FOREIGN KEY (actor_id) REFERENCES users(id)
    TABLE "backlog_imports" CONSTRAINT "fk_backlog_imports_uploader_id" FOREIGN KEY (uploader_id) REFERENCES users(id)
    TABLE "capacity_snapshots" CONSTRAINT "fk_capacity_snapshots_user_id" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "epics" CONSTRAINT "fk_epics_owner_id" FOREIGN KEY (owner_id) REFERENCES users(id)
    TABLE "issue_attachments" CONSTRAINT "fk_issue_attachments_uploader_id" FOREIGN KEY (uploader_id) REFERENCES users(id)
    TABLE "issue_comments" CONSTRAINT "fk_issue_comments_author_id" FOREIGN KEY (author_id) REFERENCES users(id)
    TABLE "issue_history" CONSTRAINT "fk_issue_history_changed_by" FOREIGN KEY (changed_by) REFERENCES users(id)
    TABLE "issue_watchers" CONSTRAINT "fk_issue_watchers_user_id" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "issues" CONSTRAINT "fk_issues_assignee_id" FOREIGN KEY (assignee_id) REFERENCES users(id)
    TABLE "issues" CONSTRAINT "fk_issues_reporter_id" FOREIGN KEY (reporter_id) REFERENCES users(id)
    TABLE "notifications" CONSTRAINT "fk_notifications_user_id" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "projects" CONSTRAINT "fk_projects_owner_id" FOREIGN KEY (owner_id) REFERENCES users(id)
Triggers:
    update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()

                              Table "public.projects"
   Column    |           Type           | Collation | Nullable |      Default      
-------------+--------------------------+-----------+----------+-------------------
 id          | uuid                     |           | not null | gen_random_uuid()
 name        | text                     |           | not null | 
 code        | text                     |           | not null | 
 description | text                     |           |          | 
 color       | text                     |           |          | 
 owner_id    | uuid                     |           | not null | 
 status      | text                     |           | not null | 
 created_at  | timestamp with time zone |           | not null | 
 updated_at  | timestamp with time zone |           | not null | 
Indexes:
    "pk_projects" PRIMARY KEY, btree (id)
    "idx_projects_code" UNIQUE, btree (code)
    "idx_projects_owner_id" btree (owner_id)
    "idx_projects_status" btree (status)
Foreign-key constraints:
    "fk_projects_owner_id" FOREIGN KEY (owner_id) REFERENCES users(id)
Referenced by:
    TABLE "activity_stream" CONSTRAINT "fk_activity_stream_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "ai_runs" CONSTRAINT "fk_ai_runs_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "assignment_rules" CONSTRAINT "fk_assignment_rules_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "backlog_imports" CONSTRAINT "fk_backlog_imports_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "epics" CONSTRAINT "fk_epics_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "issues" CONSTRAINT "fk_issues_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "label_directory" CONSTRAINT "fk_label_directory_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "sprints" CONSTRAINT "fk_sprints_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    TABLE "system_settings" CONSTRAINT "fk_system_settings_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
Triggers:
    update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()

                               Table "public.epics"
   Column   |           Type           | Collation | Nullable |      Default      
------------+--------------------------+-----------+----------+-------------------
 id         | uuid                     |           | not null | gen_random_uuid()
 project_id | uuid                     |           | not null | 
 key        | text                     |           | not null | 
 name       | text                     |           | not null | 
 objective  | text                     |           |          | 
 owner_id   | uuid                     |           |          | 
 status     | text                     |           | not null | 
 health     | text                     |           |          | 
 created_at | timestamp with time zone |           | not null | 
 updated_at | timestamp with time zone |           | not null | 
Indexes:
    "pk_epics" PRIMARY KEY, btree (id)
    "idx_epics_owner_id" btree (owner_id)
    "idx_epics_project_id" btree (project_id)
    "idx_epics_status" btree (status)
Foreign-key constraints:
    "fk_epics_owner_id" FOREIGN KEY (owner_id) REFERENCES users(id)
    "fk_epics_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
Referenced by:
    TABLE "issues" CONSTRAINT "fk_issues_epic_id" FOREIGN KEY (epic_id) REFERENCES epics(id)
Triggers:
    update_epics_updated_at BEFORE UPDATE ON epics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()


                                 Table "public.sprints"
      Column       |           Type           | Collation | Nullable |      Default      
-------------------+--------------------------+-----------+----------+-------------------
 id                | uuid                     |           | not null | gen_random_uuid()
 project_id        | uuid                     |           | not null | 
 name              | text                     |           | not null | 
 goal              | text                     |           |          | 
 status            | text                     |           | not null | 
 start_date        | date                     |           |          | 
 end_date          | date                     |           |          | 
 capacity          | integer                  |           |          | 
 velocity_snapshot | integer                  |           |          | 
 created_at        | timestamp with time zone |           | not null | 
 updated_at        | timestamp with time zone |           | not null | 
Indexes:
    "pk_sprints" PRIMARY KEY, btree (id)
    "idx_sprints_project_id" btree (project_id)
    "idx_sprints_status" btree (status)
Foreign-key constraints:
    "fk_sprints_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
Referenced by:
    TABLE "capacity_snapshots" CONSTRAINT "fk_capacity_snapshots_sprint_id" FOREIGN KEY (sprint_id) REFERENCES sprints(id)
    TABLE "issues" CONSTRAINT "fk_issues_sprint_id" FOREIGN KEY (sprint_id) REFERENCES sprints(id)
    TABLE "sprint_assignments" CONSTRAINT "fk_sprint_assignments_sprint_id" FOREIGN KEY (sprint_id) REFERENCES sprints(id)
Triggers:
    update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()


                                   Table "public.issues"
       Column        |           Type           | Collation | Nullable |      Default      
---------------------+--------------------------+-----------+----------+-------------------
 id                  | uuid                     |           | not null | gen_random_uuid()
 project_id          | uuid                     |           | not null | 
 epic_id             | uuid                     |           |          | 
 parent_issue_id     | uuid                     |           |          | 
 key                 | text                     |           | not null | 
 type                | text                     |           | not null | 
 status              | text                     |           | not null | 
 priority            | text                     |           | not null | 
 summary             | text                     |           | not null | 
 description         | text                     |           |          | 
 assignee_id         | uuid                     |           |          | 
 reporter_id         | uuid                     |           |          | 
 sprint_id           | uuid                     |           |          | 
 story_points        | smallint                 |           |          | 
 blocked             | boolean                  |           | not null | 
 labels              | text[]                   |           |          | 
 definition_of_done  | text[]                   |           |          | 
 acceptance_criteria | text[]                   |           |          | 
 watchers            | uuid[]                   |           |          | 
 due_date            | date                     |           |          | 
 created_at          | timestamp with time zone |           | not null | 
 updated_at          | timestamp with time zone |           | not null | 
Indexes:
    "pk_issues" PRIMARY KEY, btree (id)
    "idx_issues_assignee_id" btree (assignee_id)
    "idx_issues_epic_id" btree (epic_id)
    "idx_issues_key" UNIQUE, btree (key)
    "idx_issues_priority" btree (priority)
    "idx_issues_project_id" btree (project_id)
    "idx_issues_reporter_id" btree (reporter_id)
    "idx_issues_sprint_id" btree (sprint_id)
    "idx_issues_status" btree (status)
    "idx_issues_type" btree (type)
Foreign-key constraints:
    "fk_issues_assignee_id" FOREIGN KEY (assignee_id) REFERENCES users(id)
    "fk_issues_epic_id" FOREIGN KEY (epic_id) REFERENCES epics(id)
    "fk_issues_project_id" FOREIGN KEY (project_id) REFERENCES projects(id)
    "fk_issues_reporter_id" FOREIGN KEY (reporter_id) REFERENCES users(id)
    "fk_issues_sprint_id" FOREIGN KEY (sprint_id) REFERENCES sprints(id)
Referenced by:
    TABLE "ai_suggestions" CONSTRAINT "fk_ai_suggestions_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(id)
    TABLE "checklists" CONSTRAINT "fk_checklists_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(id)
    TABLE "issue_attachments" CONSTRAINT "fk_issue_attachments_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(id)
    TABLE "issue_comments" CONSTRAINT "fk_issue_comments_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(id)
    TABLE "issue_dependencies" CONSTRAINT "fk_issue_dependencies_depends_on_issue_id" FOREIGN KEY (depends_on_issue_i
d) REFERENCES issues(id)
    TABLE "issue_dependencies" CONSTRAINT "fk_issue_dependencies_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(i
d)
    TABLE "issue_history" CONSTRAINT "fk_issue_history_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(id)
    TABLE "issue_watchers" CONSTRAINT "fk_issue_watchers_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(id)
    TABLE "prioritization_scores" CONSTRAINT "fk_prioritization_scores_issue_id" FOREIGN KEY (issue_id) REFERENCES is
sues(id)
    TABLE "sprint_assignments" CONSTRAINT "fk_sprint_assignments_issue_id" FOREIGN KEY (issue_id) REFERENCES issues(i
d)
Triggers:
    update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()

