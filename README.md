# Rental by Nicole

Fashion rental catalogue and reservation inquiry management system for Rental by Nicole.

## Stack

- React, TypeScript, Vite
- Tailwind CSS v4
- Iconify
- React Hook Form and Zod
- TanStack Query
- Supabase Auth, PostgreSQL, and Storage
- Vercel deployment

## Folder Structure

```text
public/
  assets/                  Static public assets served by Vite
src/
  app/                     App bootstrap, providers, and root shell
  assets/styles/           Global CSS and Tailwind theme tokens
  components/layout/       Shared layout pieces such as header, footer, admin shell
  components/ui/           Reusable base UI components
  config/                  Site constants and environment-aware configuration
  constants/               Shared option lists and app-level constants
  features/                Domain modules grouped by business feature
    catalogue/             Catalogue item listing, filters, modals, admin CRUD
    inquiries/             Customer inquiry form and admin management
    testimonials/          Public review submission and admin approval
    faq/                   Searchable FAQ display and admin management
    rental-guide/          Admin-managed rental guide content
    settings/              Website settings and contact information
  lib/                     Third-party client setup
  pages/admin/             Protected admin route screens
  pages/public/            Public website route screens
  routes/                  Route definitions and route guards
  services/                Cross-feature service helpers
  types/                   Shared TypeScript types
  utils/                   Small generic helpers
supabase/
  migrations/              Database schema and RLS migrations
  seed/                    Seed data for local development
  storage/                 Notes or policies for Supabase Storage buckets
docs/                      Project notes and implementation references
scripts/                   Maintenance and setup scripts
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase values.

3. Run the development server:

   ```bash
   npm run dev
   ```

## Architecture Notes

- Public pages and admin pages are intentionally separated.
- Admin routes should stay protected by Supabase Auth and should not appear in public navigation.
- Filters such as categories and tags should come from Supabase instead of hardcoded arrays.
- All customer-facing forms should use Zod validation before writing to Supabase.
- Catalogue media should store images in Supabase Storage and Instagram Reels as external URLs.
