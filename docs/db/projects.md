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
