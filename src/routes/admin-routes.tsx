import type { RouteObject } from "react-router-dom";
import { ProtectedAdminRoute } from "@/features/auth/ProtectedAdminRoute";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CataloguePage } from "@/pages/admin/CataloguePage";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { TagsPage } from "@/pages/admin/TagsPage";
import { AvailabilityPage } from "@/pages/admin/AvailabilityPage";
import { RentalGuidePage } from "@/pages/admin/RentalGuidePage";
import { FaqPage } from "@/pages/admin/FaqPage";
import { ReviewsPage } from "@/pages/admin/ReviewsPage";
import { InquiriesPage } from "@/pages/admin/InquiriesPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/login",
    element: <AdminLoginPage />
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "catalogue", element: <CataloguePage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "tags", element: <TagsPage /> },
      { path: "availability", element: <AvailabilityPage /> },
      { path: "guides", element: <RentalGuidePage /> },
      { path: "faqs", element: <FaqPage /> },
      { path: "reviews", element: <ReviewsPage /> },
      { path: "inquiries", element: <InquiriesPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
];
