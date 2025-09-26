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
