import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { adminRoutes } from "@/routes/admin-routes";
import { publicRoutes } from "@/routes/public-routes";

const router = createBrowserRouter([...publicRoutes, ...adminRoutes]);

export function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
