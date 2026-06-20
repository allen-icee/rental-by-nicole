-- Adds username-based owner login support for projects that already ran the initial schema.

alter table public.users
add column if not exists username text;

update public.users
set username = split_part(email, '@', 1)
where username is null;

alter table public.users
alter column username set not null;

create unique index if not exists users_username_unique_idx on public.users (lower(username));

create or replace function public.get_owner_email_for_login(login_input text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.users
  where role = 'owner'
    and (
      lower(username) = lower(trim(login_input))
      or lower(email) = lower(trim(login_input))
    )
  limit 1;
$$;

revoke all on function public.get_owner_email_for_login(text) from public;
grant execute on function public.get_owner_email_for_login(text) to anon, authenticated;
