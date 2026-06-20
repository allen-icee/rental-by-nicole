import type { RouteObject } from "react-router-dom";
import { ProtectedAdminRoute } from "@/features/auth/ProtectedAdminRoute";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/login",
    element: <AdminLoginPage />
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminDashboardPage />
      </ProtectedAdminRoute>
    )
  }
];
