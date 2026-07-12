// src/features/analytics/usePageViews.ts
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useTrackPageView() {
  useEffect(() => {
    // Only track once per session to avoid spamming on hot reloads
    const hasTracked = sessionStorage.getItem("has_tracked_page_view");
    if (!hasTracked) {
      supabase
        .from("page_views")
        .insert({ path: window.location.pathname, session_id: null })
        .then(({ error }) => {
          if (!error) {
            sessionStorage.setItem("has_tracked_page_view", "true");
          } else {
            console.error("Failed to track page view:", error);
          }
        });
    }
  }, []);
}

export function usePageViews() {
  return useQuery({
    queryKey: ["total_page_views"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });
        
      if (error) {
        console.error("Error fetching page views:", error);
        return 0;
      }
      return count || 0;
    },
    // Refetch less often for admin dashboard
    staleTime: 1000 * 60 * 5,
  });
}
