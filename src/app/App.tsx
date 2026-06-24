import { useEffect } from "react";
import Lenis from "lenis";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { adminRoutes } from "@/routes/admin-routes";
import { publicRoutes } from "@/routes/public-routes";

const router = createBrowserRouter([...publicRoutes, ...adminRoutes]);

export function App() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

