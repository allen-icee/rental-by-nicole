// src/features/auth/ProtectedAdminRoute.tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isCurrentUserOwner } from "@/services/auth.service";

type ProtectedAdminRouteProps = {
  children: ReactNode;
};

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const location = useLocation();
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let mounted = true;

    isCurrentUserOwner().then((isOwner) => {
      if (mounted) {
        setState(isOwner ? "allowed" : "denied");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-brand-background text-brand-accent">
        <p className="font-semibold">Checking admin session...</p>
      </main>
    );
  }

  if (state === "denied") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
