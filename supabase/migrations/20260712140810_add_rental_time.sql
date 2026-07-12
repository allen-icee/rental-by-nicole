ALTER TABLE public.rental_bookings ADD COLUMN IF NOT EXISTS time text;
UPDATE public.rental_bookings SET time = '10:00' WHERE time IS NULL;
