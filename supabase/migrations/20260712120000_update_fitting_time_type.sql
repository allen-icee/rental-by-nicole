-- ==============================================================================
-- 1. ALTER TIME COLUMN TYPE
-- ==============================================================================
-- Safely cast the text column to a time column. Since the table is either
-- empty or contains standard "HH:mm" strings, this cast is perfectly safe.
-- We must drop the previously created views to avoid 0A000 dependency errors.
DROP VIEW IF EXISTS public.public_fittings_view CASCADE;
DROP VIEW IF EXISTS public.public_rentals_view CASCADE;

ALTER TABLE public.fittings
  ALTER COLUMN time TYPE time USING time::time;

-- ==============================================================================
-- 2. COLUMN-LEVEL GRANTS (Replaces Security Definer Views)
-- ==============================================================================
-- We must expose availability data to the `anon` role (for the public catalogue) 
-- WITHOUT exposing PII (customer names, fees, tracking numbers). 
-- Instead of using Security Definer Views (which trigger Supabase security warnings),
-- we use strict Column-Level Grants and Row-Level Security (RLS).

-- First, revoke the default table-wide SELECT access from anon.
REVOKE SELECT ON public.fittings FROM anon;
REVOKE SELECT ON public.rental_bookings FROM anon;

-- Grant SELECT only on the safe, non-PII columns required for availability checks.
GRANT SELECT (id, date, time, status) ON public.fittings TO anon;
GRANT SELECT (id, dress_id, start_date, end_date, status) ON public.rental_bookings TO anon;

-- ==============================================================================
-- 3. RLS POLICIES FOR ANON
-- ==============================================================================
-- Allow anon to read ONLY the rows that affect public availability.

DROP POLICY IF EXISTS "Anon can view scheduled fittings" ON public.fittings;
CREATE POLICY "Anon can view scheduled fittings" 
ON public.fittings FOR SELECT TO anon 
USING (status = 'Scheduled');

DROP POLICY IF EXISTS "Anon can view active rentals" ON public.rental_bookings;
CREATE POLICY "Anon can view active rentals" 
ON public.rental_bookings FOR SELECT TO anon 
USING (status != 'Cancelled' AND status != 'Returned');
