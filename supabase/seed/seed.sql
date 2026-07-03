-- supabase/seed/seed.sql
﻿-- Optional live demo seed data for Rental by Nicole.
-- Run after the initial schema migration.

with gown as (select id from public.categories where slug = 'gown'),
     dress as (select id from public.categories where slug = 'dress'),
     filipiniana as (select id from public.categories where slug = 'filipiniana'),
     bolero as (select id from public.categories where slug = 'bolero'),
     accessory as (select id from public.categories where slug = 'accessory')
insert into public.catalog_items (category_id, name, slug, description, status, availability_status, featured, price_display, instagram_reel_url, sort_order)
values
  ((select id from gown), 'Rose Atelier Ball Gown', 'rose-atelier-ball-gown', 'A soft rose formal gown with a structured bodice and graceful skirt for graduations, birthdays, and portraits.', 'published', 'available', true, 'PHP 1,499 / 3 Days', 'https://www.instagram.com/', 1),
  ((select id from dress), 'Blush Satin Midi Dress', 'blush-satin-midi-dress', 'A polished satin midi dress for dinner dates, wedding guest looks, and intimate celebrations.', 'published', 'reserved', true, 'PHP 599 / 2 Days', 'https://www.instagram.com/', 2),
  ((select id from filipiniana), 'Modern Filipiniana Sleeve Set', 'modern-filipiniana-sleeve-set', 'A refined Filipiniana-inspired sleeve layer that adds heritage detail to simple gowns and dresses.', 'published', 'available', false, 'Price Upon Inquiry', 'https://www.instagram.com/', 3),
  ((select id from bolero), 'Pearl Sheer Bolero', 'pearl-sheer-bolero', 'A delicate cover-up for church ceremonies, evening events, and modest styling over formal gowns.', 'published', 'available', false, 'PHP 299 / 2 Days', 'https://www.instagram.com/', 4),
  ((select id from accessory), 'Champagne Evening Clutch', 'champagne-evening-clutch', 'A compact champagne clutch for finishing formal looks without buying a one-night accessory.', 'published', 'available', false, 'PHP 199 / 2 Days', 'https://www.instagram.com/', 5),
  ((select id from gown), 'Ivory Garden Gown', 'ivory-garden-gown', 'A romantic ivory gown for prenup shoots, garden birthdays, and soft editorial portraits.', 'published', 'unavailable', true, 'PHP 1,299 / 3 Days', 'https://www.instagram.com/', 6)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  availability_status = excluded.availability_status,
  featured = excluded.featured,
  price_display = excluded.price_display,
  instagram_reel_url = excluded.instagram_reel_url,
  sort_order = excluded.sort_order;

insert into public.catalog_item_images (catalog_item_id, image_url, alt_text, sort_order)
select id, '/assets/boutique-hero.png', name, 1 from public.catalog_items
where slug in ('rose-atelier-ball-gown', 'blush-satin-midi-dress', 'modern-filipiniana-sleeve-set', 'pearl-sheer-bolero', 'champagne-evening-clutch', 'ivory-garden-gown')
on conflict do nothing;

with item_sizes as (
  insert into public.catalog_item_sizes (catalog_item_id, size_label, inventory_quantity, sort_order)
  select id, 'M', 1, 1 from public.catalog_items where slug in ('rose-atelier-ball-gown', 'blush-satin-midi-dress', 'ivory-garden-gown')
  union all
  select id, 'One Size', 2, 1 from public.catalog_items where slug in ('modern-filipiniana-sleeve-set', 'champagne-evening-clutch')
  union all
  select id, 'M', 3, 1 from public.catalog_items where slug = 'pearl-sheer-bolero'
  returning id, size_label
)
insert into public.catalog_item_measurements (catalog_item_size_id, bust, waist, length, notes)
select id,
  case when size_label = 'One Size' then 'Adjustable' else '85-92 cm' end,
  case when size_label = 'One Size' then 'Open fit' else '67-76 cm' end,
  case when size_label = 'One Size' then 'Varies by item' else '124 cm' end,
  'Seed measurement; update in admin later.'
from item_sizes;

insert into public.catalog_item_tags (catalog_item_id, tag_id)
select i.id, t.id
from public.catalog_items i
join public.tags t on t.slug in ('graduation', 'photoshoot', 'wedding-guest')
where i.slug in ('rose-atelier-ball-gown', 'modern-filipiniana-sleeve-set', 'ivory-garden-gown')
on conflict do nothing;

insert into public.catalog_item_tags (catalog_item_id, tag_id)
select i.id, t.id
from public.catalog_items i
join public.tags t on t.slug in ('date-night', 'wedding-guest', 'birthday')
where i.slug in ('blush-satin-midi-dress', 'champagne-evening-clutch')
on conflict do nothing;

insert into public.catalog_item_tags (catalog_item_id, tag_id)
select i.id, t.id
from public.catalog_items i
join public.tags t on t.slug in ('wedding-guest', 'photoshoot')
where i.slug = 'pearl-sheer-bolero'
on conflict do nothing;

insert into public.availability_ranges (catalog_item_id, start_date, end_date, label)
select id, date '2026-06-20', date '2026-06-22', 'June 20 - June 22' from public.catalog_items where slug = 'rose-atelier-ball-gown'
union all
select id, date '2026-06-27', date '2026-06-29', 'June 27 - June 29' from public.catalog_items where slug = 'blush-satin-midi-dress'
union all
select id, date '2026-07-05', date '2026-07-06', 'July 5 - July 6' from public.catalog_items where slug = 'pearl-sheer-bolero';

insert into public.customer_reviews (name, rating, comment, status)
values
  ('Mika Reyes', 5, 'The gown looked premium in photos and Nicole helped me pick a size that fit comfortably.', 'approved'),
  ('Elaine Santos', 5, 'Easy inquiry process and the bolero completed my graduation outfit beautifully.', 'approved'),
  ('Alyssa Cruz', 4, 'Loved that I could see reserved dates before messaging. The dress was clean and ready on time.', 'approved');
