-- Add new columns for the updated Sales Tracker features
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS type text DEFAULT 'Rental';
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS accessories text;
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS days integer DEFAULT 2;
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS downpayment numeric DEFAULT 0;
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS security_deposit numeric DEFAULT 200;
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS delivery_method text;

-- Update the default status to 'unpaid' as 'pending' is no longer used in the UI
ALTER TABLE public.rentals ALTER COLUMN status SET DEFAULT 'unpaid';

-- Convert existing 'pending' records to 'unpaid'
UPDATE public.rentals SET status = 'unpaid' WHERE status = 'pending';
