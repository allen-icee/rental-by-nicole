-- ==============================================================================
-- FIX ANON ACCESS FOR SIZE-SPECIFIC AVAILABILITY
-- ==============================================================================
-- The public catalogue queries `rental_bookings` to display which sizes are 
-- reserved on which dates.
--
-- Our previous column-level grant exposed `dress_id`, `start_date`, and `end_date`,
-- but missed `size_id`. This caused the entire query to fail with HTTP 403 / 42501 
-- when executed by the anonymous role.
--
-- We now explicitly grant SELECT on `size_id` to anon. Since RLS is already 
-- enforcing that anon can only see active rentals (and no PII columns like 
-- customer_name or fees are granted), this is perfectly safe and maintains 
-- our strict security posture.

GRANT SELECT (size_id) ON public.rental_bookings TO anon;
