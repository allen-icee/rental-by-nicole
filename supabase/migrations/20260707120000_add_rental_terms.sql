CREATE TABLE IF NOT EXISTS "public"."rental_terms" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "icon" text,
    "is_published" boolean NOT NULL DEFAULT true,
    "sort_order" integer NOT NULL DEFAULT 0,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."rental_terms" ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public terms are viewable by everyone." 
ON "public"."rental_terms" FOR SELECT 
USING ( true );

-- Allow owner full access
CREATE POLICY "Owner has full access to rental_terms" 
ON "public"."rental_terms" FOR ALL 
USING ( is_owner() ) WITH CHECK ( is_owner() );
