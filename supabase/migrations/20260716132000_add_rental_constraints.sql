-- Add constraints to prevent invalid state in rental bookings
-- Using NOT VALID to ensure the migration passes even if there's corrupted historical data

ALTER TABLE public.rental_bookings
  ADD CONSTRAINT rental_bookings_dates_check CHECK (start_date <= end_date) NOT VALID;

ALTER TABLE public.rental_bookings
  ADD CONSTRAINT rental_bookings_total_check CHECK (total >= 0) NOT VALID;
