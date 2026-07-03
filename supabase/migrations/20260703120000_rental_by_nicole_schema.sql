-- supabase/migrations/20260703120000_rental_by_nicole_schema.sql
-- ==============================================================================
-- RENTAL BY NICOLE - MASTER SCHEMA
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS, DROPS & ENUMS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types to ensure a clean slate (Safe for resetting)
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.rentals CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.rental_guides CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.customer_reviews CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.availability_ranges CASCADE;
DROP TABLE IF EXISTS public.catalog_item_tags CASCADE;
DROP TABLE IF EXISTS public.catalog_item_measurements CASCADE;
DROP TABLE IF EXISTS public.catalog_item_sizes CASCADE;
DROP TABLE IF EXISTS public.catalog_item_images CASCADE;
DROP TABLE IF EXISTS public.catalog_items CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS public.rental_status CASCADE;
DROP TYPE IF EXISTS public.review_status CASCADE;
DROP TYPE IF EXISTS public.inquiry_status CASCADE;
DROP TYPE IF EXISTS public.availability_status CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Role Enums
CREATE TYPE public.app_role AS ENUM ('owner');

-- Status Enums
CREATE TYPE public.availability_status AS ENUM ('available', 'reserved', 'unavailable');
CREATE TYPE public.inquiry_status AS ENUM ('new', 'contacted', 'completed', 'archived');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
CREATE TYPE public.rental_status AS ENUM ('paid and verified', 'pending', 'unpaid');


-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- USERS (Admin/Owner)
CREATE TABLE public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  role public.app_role DEFAULT 'owner'::public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SETTINGS
CREATE TABLE public.settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  secondary_email text,
  facebook_url text,
  instagram_url text,
  business_hours text,
  service_areas text[] DEFAULT '{}'::text[] NOT NULL,
  seo_title text,
  seo_description text,
  announcement_text text,
  announcement_is_active boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TAGS
CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATALOG ITEMS
CREATE TABLE public.catalog_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  availability_status public.availability_status DEFAULT 'available'::public.availability_status NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  is_new_arrival boolean DEFAULT false NOT NULL,
  price numeric NOT NULL,
  rental_days integer DEFAULT 2 NOT NULL CHECK (rental_days > 0),
  price_display text GENERATED ALWAYS AS ('PHP ' || price || ' for ' || rental_days || ' Days') STORED,
  reel_url text,
  archived_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATALOG ITEM IMAGES
CREATE TABLE public.catalog_item_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_item_id uuid REFERENCES public.catalog_items(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  variant text DEFAULT 'default' NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATALOG ITEM SIZES
CREATE TABLE public.catalog_item_sizes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_item_id uuid REFERENCES public.catalog_items(id) ON DELETE CASCADE NOT NULL,
  size_label text NOT NULL,
  inventory_quantity integer DEFAULT 1 NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATALOG ITEM MEASUREMENTS
CREATE TABLE public.catalog_item_measurements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_item_size_id uuid REFERENCES public.catalog_item_sizes(id) ON DELETE CASCADE NOT NULL,
  bust text,
  chest text,
  waist text,
  hips text,
  length text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATALOG ITEM TAGS (Many-to-Many)
CREATE TABLE public.catalog_item_tags (
  catalog_item_id uuid REFERENCES public.catalog_items(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (catalog_item_id, tag_id)
);

-- AVAILABILITY RANGES (Reservations / Blocked Dates)
CREATE TABLE public.availability_ranges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_item_id uuid REFERENCES public.catalog_items(id) ON DELETE CASCADE NOT NULL,
  start_date date,
  end_date date,
  customer_name text,
  label text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INQUIRIES
CREATE TABLE public.inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  selected_item_id uuid REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  status public.inquiry_status DEFAULT 'new'::public.inquiry_status NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CUSTOMER REVIEWS
CREATE TABLE public.customer_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text NOT NULL,
  photo_url text,
  status public.review_status DEFAULT 'pending'::public.review_status NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FAQS
CREATE TABLE public.faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text,
  question text NOT NULL,
  answer text NOT NULL,
  is_published boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RENTAL GUIDES
CREATE TABLE public.rental_guides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  is_published boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RENTALS (Sales Tracker)
CREATE TABLE public.rentals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number text UNIQUE NOT NULL,
  date timestamp with time zone NOT NULL,
  customer_name text NOT NULL,
  rented_items jsonb NOT NULL, -- Array of { item_id, item_name, quantity, unit_price, amount }
  amount numeric NOT NULL,
  total_income numeric NOT NULL,
  status public.rental_status DEFAULT 'pending'::public.rental_status NOT NULL,
  payment_method text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PAGE VIEWS (Analytics)
CREATE TABLE public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_item_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_item_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;


-- 3a. Public Read Access (Anyone can read these tables)
CREATE POLICY "Public read access for settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public read access for active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for active tags" ON public.tags FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for published catalog items" ON public.catalog_items FOR SELECT USING (archived_at IS NULL);
CREATE POLICY "Public read access for catalog item images" ON public.catalog_item_images FOR SELECT USING (true);
CREATE POLICY "Public read access for catalog item sizes" ON public.catalog_item_sizes FOR SELECT USING (true);
CREATE POLICY "Public read access for catalog item measurements" ON public.catalog_item_measurements FOR SELECT USING (true);
CREATE POLICY "Public read access for catalog item tags" ON public.catalog_item_tags FOR SELECT USING (true);
CREATE POLICY "Public read access for availability ranges" ON public.availability_ranges FOR SELECT USING (true);
CREATE POLICY "Public read access for approved reviews" ON public.customer_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read access for published faqs" ON public.faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access for published guides" ON public.rental_guides FOR SELECT USING (is_published = true);


-- 3b. Public Insert Access (Forms / Analytics)
CREATE POLICY "Public can submit inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit reviews" ON public.customer_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);


-- 3c. Authenticated / Admin Access
-- We assume any authenticated user is an admin for this app.
CREATE POLICY "Auth users full access to users" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to tags" ON public.tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to catalog items" ON public.catalog_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to catalog item images" ON public.catalog_item_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to catalog item sizes" ON public.catalog_item_sizes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to catalog item measurements" ON public.catalog_item_measurements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to catalog item tags" ON public.catalog_item_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to availability ranges" ON public.availability_ranges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to inquiries" ON public.inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to customer reviews" ON public.customer_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to faqs" ON public.faqs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to rental guides" ON public.rental_guides FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to activity logs" ON public.activity_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to rentals" ON public.rentals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to page views" ON public.page_views FOR SELECT USING (auth.role() = 'authenticated');


-- ==============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function to safely check if current user is owner (can be expanded later)
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'owner'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for tracking activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to allow login via custom email map or username
CREATE OR REPLACE FUNCTION public.get_owner_email_for_login(login_input text)
RETURNS text AS $$
DECLARE
  found_email text;
BEGIN
  SELECT email INTO found_email
  FROM public.users
  WHERE username = login_input
     OR email = login_input
     AND role = 'owner'
  LIMIT 1;
  
  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 5. INITIAL DATA / SEEDING
-- ==============================================================================

INSERT INTO public.users (id, email, username, role)
SELECT id, email, split_part(email, '@', 1), 'owner'::public.app_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;
