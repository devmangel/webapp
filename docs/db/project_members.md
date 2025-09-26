                          Table "public.project_members"
   Column   |           Type           | Collation | Nullable |      Default      
------------+--------------------------+-----------+----------+-------------------
 id         | uuid                     |           | not null | gen_random_uuid()
 project_id | uuid                     |           | not null | 
 user_id    | uuid                     |           | not null | 
 role       | text                     |           | not null | 
 invited_by | uuid                     |           |          | 
 invited_at | timestamp with time zone |           |          | now()
 joined_at  | timestamp with time zone |           |          | 
 status     | text                     |           | not null | 'active'::text
 created_at | timestamp with time zone |           | not null | now()
 updated_at | timestamp with time zone |           | not null | now()
