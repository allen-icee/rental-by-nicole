# Architecture

## Public Website

The public site is organized under `src/pages/public` and should only expose customer-facing pages:

- Home
- Catalogue
- Rental Guide
- Testimonials
- FAQ
- Contact

Public catalogue filters should be loaded from admin-managed tables, not hardcoded in components.

## Admin Panel

Admin screens live under `src/pages/admin` and should be protected by Supabase Auth. The admin route should not be linked from public navigation.

Planned admin modules:

- Dashboard
- Catalogue management
- Category management
- Tag management
- Availability management
- Rental guide management
- Testimonials management
- FAQ management
- Inquiry management
- Contact information management
- Website settings

## Supabase

Database schema, RLS policies, seed data, and storage notes should live under `supabase`.

Recommended tables:

- users
- settings
- catalog_items
- catalog_item_images
- catalog_item_sizes
- catalog_item_measurements
- categories
- tags
- catalog_item_tags
- availability_ranges
- inquiries
- customer_reviews
- faqs
- rental_guides
- activity_logs
