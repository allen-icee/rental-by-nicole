# Rental by Nicole

Rental by Nicole is a modern, responsive web application designed for a fashion rental service. The platform serves as an interactive digital catalogue, allowing clients to effortlessly browse the collection, check item availability, view detailed sizing and measurements, and seamlessly submit reservation inquiries.

Behind the scenes, the application includes a secure administrative dashboard that empowers the business owner to effortlessly manage their entire inventory, track customer inquiries, approve customer reviews, and update their catalogue in real-time.

## Key Features

### 🛍️ Public Storefront
- **Dynamic Catalogue:** Clients can browse gowns, dresses, Filipiniana attire, and accessories with high-quality image galleries.
- **Advanced Filtering:** Users can filter the collection by categories, tags, and text search to find the perfect outfit for any occasion.
- **Detailed Item Views:** Each item displays comprehensive sizing guides, exact garment measurements, and an interactive availability calendar showing reserved dates.
- **Reservation Inquiries:** A streamlined form allows customers to select their rental dates and request reservations directly through the site.
- **Customer Reviews:** Approved customer testimonials and outfit photos provide social proof and style inspiration.

### 🔐 Secure Admin Dashboard
- **Inventory Management:** Full CRUD (Create, Read, Update, Delete) capabilities for the catalogue.
- **Nested Data Control:** Seamless management of individual sizes, measurements, and calendar reservation blockers for each piece.
- **Inquiry Tracking:** A centralized system to review incoming customer inquiries, update their status, and manage the booking workflow.
- **Content Curation:** Tools to add and edit categories, style tags, FAQ sections, and the service's rental guide rules.
- **Review Moderation:** Tools to approve or reject customer-submitted testimonials before they appear publicly.

## Tech Stack Highlights

- **Frontend Core:** React, TypeScript, and Vite for a lightning-fast, highly responsive single-page application.
- **Styling & Aesthetics:** Tailwind CSS v4 paired with custom premium design tokens (glassmorphism, micro-animations, and curated color palettes).
- **State & Data Fetching:** TanStack Query for optimized data caching and seamless asynchronous operations.
- **Forms & Validation:** React Hook Form coupled with Zod ensures strict data integrity for both customer submissions and complex admin inventory forms.
- **Backend & Database:** Supabase handles PostgreSQL database operations, secure User Authentication, and media Storage buckets.
- **Hosting:** Deployed edge-ready on Vercel.

## Architecture Overview

The application utilizes a Single Page Application (SPA) architecture optimized for high interactivity. It adopts a Backend-as-a-Service (BaaS) model via Supabase, directly querying a relational PostgreSQL database from the client. Security is enforced at the database level using Row Level Security (RLS) policies, ensuring that only authenticated administrative users can mutate inventory data or view sensitive inquiries. Data fetching is heavily cached and synchronized using TanStack Query to minimize network requests and optimize the user experience.

## Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rental-by-nicole.git
   cd rental-by-nicole
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory based on `.env.example`.

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SITE_URL=http://localhost:5173
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Repository Usage Notice

This repository is shared primarily for learning, inspiration, and portfolio demonstration. Developers are welcome to study the architecture, database schema, and implementation details of the application. 

However, please do not directly copy this project, submit it as your own work, or redistribute it without explicit permission. If you are building a system inspired by this architecture, I encourage you to use the concepts to create your own unique implementation. Thank you for checking out the project!
