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