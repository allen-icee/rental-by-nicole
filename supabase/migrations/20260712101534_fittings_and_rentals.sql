-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.fitting_status_v2 AS ENUM ('Scheduled', 'Completed', 'No Show', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.rental_booking_status AS ENUM ('Reserved', 'Ready for Pickup', 'Picked Up', 'Due Today', 'Overdue', 'Returned', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS public.fittings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_number text UNIQUE NOT NULL,
    date date NOT NULL,
    time text,
    representative_customer_id uuid,
    representative_name text NOT NULL,
    customer_count integer DEFAULT 1 NOT NULL,
    package_type text DEFAULT 'Standard' NOT NULL,
    fee numeric DEFAULT 0 NOT NULL,
    total numeric DEFAULT 0 NOT NULL,
    status public.fitting_status_v2 DEFAULT 'Scheduled'::public.fitting_status_v2 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rental_bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_number text UNIQUE NOT NULL,
    start_date date NOT NULL,
    rental_days integer DEFAULT 2 NOT NULL,
    end_date date,
    customer_id uuid,
    customer_name text NOT NULL,
    dress_id uuid REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    size_id uuid REFERENCES public.catalog_item_sizes(id) ON DELETE SET NULL,
    accessories jsonb DEFAULT '[]'::jsonb,
    subtotal numeric DEFAULT 0 NOT NULL,
    down_payment numeric DEFAULT 0 NOT NULL,
    security_deposit numeric DEFAULT 200 NOT NULL,
    damage_charge numeric DEFAULT 0 NOT NULL,
    late_fee numeric DEFAULT 0 NOT NULL,
    refund_amount numeric DEFAULT 0 NOT NULL,
    total numeric DEFAULT 0 NOT NULL,
    pickup_mode text,
    payment_method text,
    status public.rental_booking_status DEFAULT 'Reserved'::public.rental_booking_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.fittings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users full access to fittings" ON public.fittings;
CREATE POLICY "Auth users full access to fittings" ON public.fittings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users full access to rental_bookings" ON public.rental_bookings;
CREATE POLICY "Auth users full access to rental_bookings" ON public.rental_bookings FOR ALL USING (auth.role() = 'authenticated');

-- 4. Data Migration (Best effort)
-- For fittings
INSERT INTO public.fittings (
    id, booking_number, date, time, representative_name, customer_count, package_type, fee, total, status, created_at, updated_at
)
SELECT 
    id,
    tracking_number,
    date::date,
    to_char(date, 'HH12:MI AM')::time,
    customer_name,
    1,
    'Standard',
    150,
    total_income,
    CASE 
        WHEN status = 'paid and verified' THEN 'Completed'::public.fitting_status_v2
        ELSE 'Scheduled'::public.fitting_status_v2
    END,
    created_at,
    updated_at
FROM public.rentals 
WHERE type = 'Fitting'
ON CONFLICT (id) DO NOTHING;

-- For rentals
INSERT INTO public.rental_bookings (
    id, booking_number, start_date, rental_days, end_date, customer_name, dress_id, size_id, accessories, subtotal, down_payment, security_deposit, damage_charge, late_fee, refund_amount, total, pickup_mode, payment_method, status, created_at, updated_at
)
SELECT 
    id,
    tracking_number,
    date::date,
    COALESCE(days, 2),
    (date::date + COALESCE(days, 2)),
    customer_name,
    NULLIF(
        CASE 
            WHEN jsonb_typeof(rented_items) = 'array' AND jsonb_array_length(rented_items) > 0 THEN 
                rented_items->0->>'item_id'
            ELSE NULL 
        END,
        ''
    )::uuid,
    NULL,
    COALESCE(
        (SELECT jsonb_agg(trim(val)) FROM unnest(string_to_array(accessories::text, ',')) as val WHERE trim(val) != ''),
        '[]'::jsonb
    ),
    COALESCE(amount, 0),
    COALESCE(downpayment, 0),
    COALESCE(security_deposit, 200),
    0,
    0,
    0,
    COALESCE(total_income, 0),
    delivery_method,
    payment_method,
    CASE 
        WHEN status = 'paid and verified' THEN 'Reserved'::public.rental_booking_status
        ELSE 'Reserved'::public.rental_booking_status
    END,
    created_at,
    updated_at
FROM public.rentals 
WHERE type = 'Rental' OR type IS NULL
ON CONFLICT (id) DO NOTHING;
