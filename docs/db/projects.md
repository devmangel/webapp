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