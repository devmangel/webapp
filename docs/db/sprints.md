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
