-- Add classification to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS classification text DEFAULT 'Dress';

-- Add check constraint for valid classifications
ALTER TABLE public.categories ADD CONSTRAINT valid_classification CHECK (classification IN ('Dress', 'Accessory'));

-- Recreate accessories column as JSONB for structured data
ALTER TABLE public.rentals DROP COLUMN IF EXISTS accessories;
ALTER TABLE public.rentals ADD COLUMN accessories jsonb DEFAULT '[]'::jsonb;
