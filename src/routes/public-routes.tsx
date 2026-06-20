import type { RouteObject } from "react-router-dom";
import { CataloguePage } from "@/pages/public/CataloguePage";
import { ContactPage } from "@/pages/public/ContactPage";
import { FAQPage } from "@/pages/public/FAQPage";
import { HomePage } from "@/pages/public/HomePage";
import { RentalGuidePage } from "@/pages/public/RentalGuidePage";
import { TestimonialsPage } from "@/pages/public/TestimonialsPage";

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/catalogue",
    element: <CataloguePage />
  },
  {
    path: "/rental-guide",
    element: <RentalGuidePage />
  },
  {
    path: "/testimonials",
    element: <TestimonialsPage />
  },
  {
    path: "/faq",
    element: <FAQPage />
  },
  {
    path: "/contact",
    element: <ContactPage />
  }
];
