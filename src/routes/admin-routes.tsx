// src/routes/admin-routes.tsx
import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { ProtectedAdminRoute } from "@/features/auth/ProtectedAdminRoute";

const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage").then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const CataloguePage = lazy(() => import("@/pages/admin/CataloguePage").then(m => ({ default: m.CataloguePage })));
const CategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage").then(m => ({ default: m.CategoriesPage })));
const TagsPage = lazy(() => import("@/pages/admin/TagsPage").then(m => ({ default: m.TagsPage })));
const RentalGuidePage = lazy(() => import("@/pages/admin/RentalGuidePage").then(m => ({ default: m.RentalGuidePage })));
const FaqPage = lazy(() => import("@/pages/admin/FaqPage").then(m => ({ default: m.FaqPage })));
const ReviewsPage = lazy(() => import("@/pages/admin/ReviewsPage").then(m => ({ default: m.ReviewsPage })));
const InquiriesPage = lazy(() => import("@/pages/admin/InquiriesPage").then(m => ({ default: m.InquiriesPage })));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage").then(m => ({ default: m.SettingsPage })));
const SalesTrackerPage = lazy(() => import("@/pages/admin/SalesTrackerPage").then(m => ({ default: m.SalesTrackerPage })));
const SchedulePage = lazy(() => import("@/pages/admin/SchedulePage").then(m => ({ default: m.SchedulePage })));

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}>
        <AdminLoginPage />
      </Suspense>
    )
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <Suspense fallback={<div className="grid min-h-screen place-items-center bg-brand-background text-brand-accent font-semibold">Loading...</div>}>
          <AdminLayout />
        </Suspense>
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "catalogue", element: <CataloguePage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "tags", element: <TagsPage /> },
      { path: "guides", element: <RentalGuidePage /> },
      { path: "faqs", element: <FaqPage /> },
      { path: "reviews", element: <ReviewsPage /> },
      { path: "inquiries", element: <InquiriesPage /> },
      { path: "sales", element: <SalesTrackerPage /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
];
