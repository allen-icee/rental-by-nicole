import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSettings } from "@/services/admin.service";
import type { SettingsRow } from "@/services/admin.service";
import { siteConfig } from "@/config/site";

type SettingsContextType = {
  settings: SettingsRow | null;
  isLoading: boolean;
  error: Error | null;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSettings() {
      try {
        const data = await getSettings();
        if (mounted) {
          setSettings(data as SettingsRow);
        }
      } catch (err) {
        console.error("Failed to load settings from Supabase, using fallback", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error }}>
      {isLoading ? <SplashScreen /> : children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-background transition-opacity duration-500">
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute size-32 animate-ping rounded-full bg-brand-primary/10" />
        <div className="absolute size-24 animate-pulse rounded-full bg-brand-accent/20" />
        <img
          src="/assets/RN-Logo-Pink.png"
          alt="Rental by Nicole Logo"
          className="relative z-10 h-16 w-auto object-contain drop-shadow-lg"
        />
      </div>
      <p className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent animate-pulse">
        {siteConfig.tagline}
      </p>
    </div>
  );
}
