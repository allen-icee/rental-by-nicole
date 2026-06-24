-- Migration: wire up admin settings and catalog item new arrivals

alter table public.catalog_items 
  add column is_new_arrival boolean not null default false;

alter table public.settings 
  add column announcement_text text,
  add column announcement_is_active boolean not null default false,
  add column curated_collection_text text not null default 'Curated Collection';
