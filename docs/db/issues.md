
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
