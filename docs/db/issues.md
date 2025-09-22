
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

