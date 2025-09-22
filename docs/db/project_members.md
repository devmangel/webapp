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
Indexes:
    "project_members_pkey" PRIMARY KEY, btree (id)
    "idx_project_members_invited_by" btree (invited_by)
    "idx_project_members_project_id" btree (project_id)
    "idx_project_members_role" btree (role)
    "idx_project_members_status" btree (status)
    "idx_project_members_user_id" btree (user_id)
    "project_members_project_id_user_id_key" UNIQUE CONSTRAINT, btree (project_id, user_id)
Check constraints:
    "project_members_role_check" CHECK (role = ANY (ARRAY['ADMIN'::text, 'PM'::text, 'CONTRIBUTOR'::text, 'VIEWER'::text]))
    "project_members_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text]))
Foreign-key constraints:
    "project_members_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES users(id)
    "project_members_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    "project_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
Policies:
    POLICY "PM and ADMIN can delete project members" FOR DELETE
      USING ((project_id IN ( SELECT project_members_1.project_id
   FROM project_members project_members_1
  WHERE ((project_members_1.user_id = auth.uid()) AND (project_members_1.role = ANY (ARRAY['ADMIN'::text, 'PM'::text]
)) AND (project_members_1.status = 'active'::text)))))
    POLICY "PM and ADMIN can manage project members" FOR INSERT
      WITH CHECK ((project_id IN ( SELECT project_members_1.project_id
   FROM project_members project_members_1
  WHERE ((project_members_1.user_id = auth.uid()) AND (project_members_1.role = ANY (ARRAY['ADMIN'::text, 'PM'::text]
)) AND (project_members_1.status = 'active'::text)))))
    POLICY "PM and ADMIN can update project members" FOR UPDATE
      USING ((project_id IN ( SELECT project_members_1.project_id
   FROM project_members project_members_1
  WHERE ((project_members_1.user_id = auth.uid()) AND (project_members_1.role = ANY (ARRAY['ADMIN'::text, 'PM'::text]
)) AND (project_members_1.status = 'active'::text)))))
    POLICY "Users can accept their own invitations" FOR UPDATE
      USING (((user_id = auth.uid()) AND (status = 'pending'::text)))
    POLICY "Users can view project members of their projects" FOR SELECT
      USING ((project_id IN ( SELECT project_members_1.project_id
   FROM project_members project_members_1
  WHERE ((project_members_1.user_id = auth.uid()) AND (project_members_1.status = 'active'::text)))))
Triggers:
    update_project_members_updated_at BEFORE UPDATE ON project_members FOR EACH ROW EXECUTE FUNCTION update_updated_a
t_column()
