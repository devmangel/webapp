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