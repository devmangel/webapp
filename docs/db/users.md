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
