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