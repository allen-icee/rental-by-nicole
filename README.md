# Rental by Nicole

Rental by Nicole is a modern, responsive web application designed for a boutique fashion rental service. The platform serves as an interactive digital catalogue, allowing clients to effortlessly browse the boutique's collection, check item availability, view detailed sizing and measurements, and seamlessly submit reservation inquiries. 

Behind the scenes, the application includes a secure administrative dashboard that empowers the boutique owner to effortlessly manage their entire inventory, track customer inquiries, approve customer reviews, and update their catalogue in real-time.

## Key Features

### 🛍️ Public Boutique Storefront
- **Dynamic Catalogue:** Clients can browse gowns, dresses, Filipiniana attire, and accessories with high-quality image galleries.
- **Advanced Filtering:** Users can filter the collection by categories, tags, and text search to find the perfect outfit for any occasion.
- **Detailed Item Views:** Each item displays comprehensive sizing guides, exact garment measurements, and an interactive availability calendar showing reserved dates.
- **Reservation Inquiries:** A streamlined form allows customers to select their rental dates and request reservations directly through the site.
- **Customer Reviews:** Approved customer testimonials and outfit photos provide social proof and style inspiration.

### 🔐 Secure Admin Dashboard
- **Inventory Management:** Full CRUD (Create, Read, Update, Delete) capabilities for the catalogue.
- **Nested Data Control:** Seamless management of individual sizes, measurements, and calendar reservation blockers for each piece.
- **Inquiry Tracking:** A centralized system to review incoming customer inquiries, update their status, and manage the booking workflow.
- **Content Curation:** Tools to add and edit categories, style tags, FAQ sections, and the boutique's rental guide rules.
- **Review Moderation:** Tools to approve or reject customer-submitted testimonials before they appear publicly.

## Tech Stack Highlights

- **Frontend Core:** React, TypeScript, and Vite for a lightning-fast, highly responsive single-page application.
- **Styling & Aesthetics:** Tailwind CSS v4 paired with custom premium design tokens (glassmorphism, micro-animations, and curated color palettes).
- **State & Data Fetching:** TanStack Query for optimized data caching and seamless asynchronous operations.
- **Forms & Validation:** React Hook Form coupled with Zod ensures strict data integrity for both customer submissions and complex admin inventory forms.
- **Backend & Database:** Supabase handles PostgreSQL database operations, secure User Authentication, and media Storage buckets.
- **Hosting:** Deployed edge-ready on Vercel.
