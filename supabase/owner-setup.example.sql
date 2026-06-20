-- Owner account setup for Rental by Nicole
-- 1. Create each account first in Supabase Authentication > Users.
-- 2. Copy each Auth user UUID.
-- 3. Replace the UUID/email/username values below, then run this SQL.
--
-- Important:
-- - username can be developer, nicole, admin, etc.
-- - role must be 'owner' because app_role currently allows owner accounts only.
-- - You can add multiple owners by adding multiple rows.

insert into public.users (id, email, username, role)
values
  ('PASTE_DEVELOPER_AUTH_UUID', 'developer@email.com', 'developer', 'owner'),
  ('PASTE_NICOLE_AUTH_UUID', 'nicole@email.com', 'nicole', 'owner')
on conflict (id) do update
set email = excluded.email,
    username = excluded.username,
    role = excluded.role;
