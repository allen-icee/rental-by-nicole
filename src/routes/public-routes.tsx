// src/routes/public-routes.tsx
import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

const HomePage = lazy(() => import("@/pages/public/HomePage").then(m => ({ default: m.HomePage })));
const CataloguePage = lazy(() => import("@/pages/public/CataloguePage").then(m => ({ default: m.CataloguePage })));
const RentalGuidePage = lazy(() => import("@/pages/public/RentalGuidePage").then(m => ({ default: m.RentalGuidePage })));
const TestimonialsPage = lazy(() => import("@/pages/public/TestimonialsPage").then(m => ({ default: m.TestimonialsPage })));
const FAQPage = lazy(() => import("@/pages/public/FAQPage").then(m => ({ default: m.FAQPage })));
const ContactPage = lazy(() => import("@/pages/public/ContactPage").then(m => ({ default: m.ContactPage })));

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}><HomePage /></Suspense>
  },
  {
    path: "/catalogue",
    element: <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}><CataloguePage /></Suspense>
  },
  {
    path: "/rental-guide",
    element: <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}><RentalGuidePage /></Suspense>
  },
  {
    path: "/testimonials",
    element: <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}><TestimonialsPage /></Suspense>
  },
  {
    path: "/faq",
    element: <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}><FAQPage /></Suspense>
  },
  {
    path: "/contact",
    element: <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}><ContactPage /></Suspense>
  }
];
