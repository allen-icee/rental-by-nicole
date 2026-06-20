import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { adminRoutes } from "@/routes/admin-routes";
import { publicRoutes } from "@/routes/public-routes";

const router = createBrowserRouter([...publicRoutes, ...adminRoutes]);

export function App() {
  return <RouterProvider router={router} />;
}
