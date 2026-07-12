// src/app/App.tsx
import { useEffect } from "react";
import Lenis from "lenis";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { adminRoutes } from "@/routes/admin-routes";
import { publicRoutes } from "@/routes/public-routes";

const router = createBrowserRouter([...publicRoutes, ...adminRoutes]);

export function App() {
  useEffect(() => {
    const lenis = new Lenis();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).lenis;
    };
  }, []);

  return (
    <SettingsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SettingsProvider>
  );
}

