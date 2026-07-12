-- 1. Create customers table
CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users full access to customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');

-- 3. Data Migration: Extract unique customers from existing rentals
INSERT INTO public.customers (name)
SELECT DISTINCT customer_name 
FROM public.rentals 
WHERE customer_name IS NOT NULL AND customer_name != '';

-- Note: We do not enforce UNIQUE on customers.name intentionally to allow duplicate display names per requirements.
