-- Add chest and hips to measurements
ALTER TABLE public.catalog_item_measurements
ADD COLUMN chest text,
ADD COLUMN hips text;

-- Rename instagram_reel_url to reel_url
ALTER TABLE public.catalog_items
RENAME COLUMN instagram_reel_url TO reel_url;
