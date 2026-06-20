-- Rental by Nicole initial Supabase schema
-- Run this in Supabase SQL Editor or with `supabase db push`.

create extension if not exists pgcrypto;

create type public.app_role as enum ('owner');
create type public.catalog_item_status as enum ('draft', 'published', 'archived');
create type public.availability_status as enum ('available', 'reserved', 'unavailable');
create type public.inquiry_status as enum ('new', 'contacted', 'completed', 'archived');
create type public.review_status as enum ('pending', 'approved', 'rejected', 'archived');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  role public.app_role not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Rental by Nicole',
  tagline text not null default 'Wear Your Dream Dress',
  logo_url text,
  hero_banner_url text,
  footer_text text,
  phone text,
  email text,
  facebook_url text,
  instagram_url text,
  business_hours text,
  service_areas text[] not null default array['Gerona', 'Paniqui', 'Tarlac City'],
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  status public.catalog_item_status not null default 'draft',
  availability_status public.availability_status not null default 'available',
  featured boolean not null default false,
  price_display text not null,
  instagram_reel_url text,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_item_images (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  image_url text not null,
  alt_text text,
  variant text not null default 'medium',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.catalog_item_sizes (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  size_label text not null,
  inventory_quantity integer not null default 1 check (inventory_quantity >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_item_measurements (
  id uuid primary key default gen_random_uuid(),
  catalog_item_size_id uuid not null references public.catalog_item_sizes(id) on delete cascade,
  bust text,
  waist text,
  length text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_item_tags (
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (catalog_item_id, tag_id)
);

create table public.availability_ranges (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  start_date date,
  end_date date,
  label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date is null or end_date is null or end_date >= start_date)
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  selected_item_id uuid references public.catalog_items(id) on delete set null,
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  photo_url text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text,
  question text not null,
  answer text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rental_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index catalog_items_status_idx on public.catalog_items(status);
create index catalog_items_category_idx on public.catalog_items(category_id);
create index catalog_items_featured_idx on public.catalog_items(featured);
create index catalog_item_images_item_idx on public.catalog_item_images(catalog_item_id);
create index catalog_item_sizes_item_idx on public.catalog_item_sizes(catalog_item_id);
create index catalog_item_measurements_size_idx on public.catalog_item_measurements(catalog_item_size_id);
create index availability_ranges_item_idx on public.availability_ranges(catalog_item_id);
create index inquiries_status_idx on public.inquiries(status);
create index customer_reviews_status_idx on public.customer_reviews(status);

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.settings for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger tags_set_updated_at before update on public.tags for each row execute function public.set_updated_at();
create trigger catalog_items_set_updated_at before update on public.catalog_items for each row execute function public.set_updated_at();
create trigger catalog_item_sizes_set_updated_at before update on public.catalog_item_sizes for each row execute function public.set_updated_at();
create trigger catalog_item_measurements_set_updated_at before update on public.catalog_item_measurements for each row execute function public.set_updated_at();
create trigger availability_ranges_set_updated_at before update on public.availability_ranges for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
create trigger customer_reviews_set_updated_at before update on public.customer_reviews for each row execute function public.set_updated_at();
create trigger faqs_set_updated_at before update on public.faqs for each row execute function public.set_updated_at();
create trigger rental_guides_set_updated_at before update on public.rental_guides for each row execute function public.set_updated_at();

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'owner'
  );
$$;

alter table public.users enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.catalog_items enable row level security;
alter table public.catalog_item_images enable row level security;
alter table public.catalog_item_sizes enable row level security;
alter table public.catalog_item_measurements enable row level security;
alter table public.catalog_item_tags enable row level security;
alter table public.availability_ranges enable row level security;
alter table public.inquiries enable row level security;
alter table public.customer_reviews enable row level security;
alter table public.faqs enable row level security;
alter table public.rental_guides enable row level security;
alter table public.activity_logs enable row level security;


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

create policy "owner can read users" on public.users for select to authenticated using (public.is_owner() or id = auth.uid());
create policy "owner can manage users" on public.users for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read settings" on public.settings for select to anon, authenticated using (true);
create policy "owner can manage settings" on public.settings for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read active categories" on public.categories for select to anon, authenticated using (is_active = true or public.is_owner());
create policy "owner can manage categories" on public.categories for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read active tags" on public.tags for select to anon, authenticated using (is_active = true or public.is_owner());
create policy "owner can manage tags" on public.tags for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published catalog items" on public.catalog_items for select to anon, authenticated using (status = 'published' or public.is_owner());
create policy "owner can manage catalog items" on public.catalog_items for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published item images" on public.catalog_item_images for select to anon, authenticated using (
  exists (select 1 from public.catalog_items i where i.id = catalog_item_id and (i.status = 'published' or public.is_owner()))
);
create policy "owner can manage item images" on public.catalog_item_images for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published item sizes" on public.catalog_item_sizes for select to anon, authenticated using (
  exists (select 1 from public.catalog_items i where i.id = catalog_item_id and (i.status = 'published' or public.is_owner()))
);
create policy "owner can manage item sizes" on public.catalog_item_sizes for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published item measurements" on public.catalog_item_measurements for select to anon, authenticated using (
  exists (
    select 1
    from public.catalog_item_sizes s
    join public.catalog_items i on i.id = s.catalog_item_id
    where s.id = catalog_item_size_id and (i.status = 'published' or public.is_owner())
  )
);
create policy "owner can manage item measurements" on public.catalog_item_measurements for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published item tags" on public.catalog_item_tags for select to anon, authenticated using (
  exists (select 1 from public.catalog_items i where i.id = catalog_item_id and (i.status = 'published' or public.is_owner()))
);
create policy "owner can manage item tags" on public.catalog_item_tags for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published availability" on public.availability_ranges for select to anon, authenticated using (
  exists (select 1 from public.catalog_items i where i.id = catalog_item_id and (i.status = 'published' or public.is_owner()))
);
create policy "owner can manage availability" on public.availability_ranges for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can create inquiries" on public.inquiries for insert to anon, authenticated with check (status = 'new');
create policy "owner can manage inquiries" on public.inquiries for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read approved reviews" on public.customer_reviews for select to anon, authenticated using (status = 'approved' or public.is_owner());
create policy "public can create pending reviews" on public.customer_reviews for insert to anon, authenticated with check (status = 'pending');
create policy "owner can manage reviews" on public.customer_reviews for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published faqs" on public.faqs for select to anon, authenticated using (is_published = true or public.is_owner());
create policy "owner can manage faqs" on public.faqs for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "public can read published rental guides" on public.rental_guides for select to anon, authenticated using (is_published = true or public.is_owner());
create policy "owner can manage rental guides" on public.rental_guides for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "owner can read logs" on public.activity_logs for select to authenticated using (public.is_owner());
create policy "owner can create logs" on public.activity_logs for insert to authenticated with check (public.is_owner());

insert into public.settings (business_name, tagline, phone, email, facebook_url, instagram_url, business_hours)
values ('Rental by Nicole', 'Wear Your Dream Dress', '+63 912 345 6789', 'hello@rentalbynicole.example', 'https://www.facebook.com/', 'https://www.instagram.com/', 'Monday to Saturday, 9:00 AM - 6:00 PM')
on conflict do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Dress', 'dress', 1),
  ('Gown', 'gown', 2),
  ('Filipiniana', 'filipiniana', 3),
  ('Bolero', 'bolero', 4),
  ('Accessory', 'accessory', 5)
on conflict (slug) do nothing;

insert into public.tags (name, slug, sort_order) values
  ('Graduation', 'graduation', 1),
  ('Birthday', 'birthday', 2),
  ('Date Night', 'date-night', 3),
  ('Photoshoot', 'photoshoot', 4),
  ('Wedding Guest', 'wedding-guest', 5),
  ('Pageant', 'pageant', 6)
on conflict (slug) do nothing;

insert into public.faqs (category, question, answer, sort_order) values
  ('Reservations', 'Can I book and pay directly on the website?', 'No. The website is for browsing, availability visibility, and inquiries. Nicole confirms reservations and payment manually.', 1),
  ('Fitting', 'Do you allow fitting before renting?', 'Yes, private fitting can be arranged depending on Nicole''s schedule and the item''s current availability.', 2),
  ('Catalogue', 'Are all filters admin managed?', 'Yes. Categories and tags come from Supabase so Nicole can add more without code changes.', 3)
on conflict do nothing;

insert into public.rental_guides (title, body, sort_order) values
  ('Reservation Process', 'Choose an item, check visible unavailable dates, then send Nicole an inquiry. Nicole confirms reservations manually.', 1),
  ('Private Fitting', 'Private fitting can be arranged depending on schedule and item availability.', 2),
  ('Payment Information', 'No online payment is collected on the website. Deposit and payment instructions are sent manually.', 3)
on conflict do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('catalogue-assets', 'catalogue-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('review-photos', 'review-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public can read public storage assets" on storage.objects for select to anon, authenticated using (
  bucket_id in ('catalogue-assets', 'review-photos', 'site-assets')
);

create policy "owner can manage storage assets" on storage.objects for all to authenticated using (
  bucket_id in ('catalogue-assets', 'review-photos', 'site-assets') and public.is_owner()
) with check (
  bucket_id in ('catalogue-assets', 'review-photos', 'site-assets') and public.is_owner()
);



