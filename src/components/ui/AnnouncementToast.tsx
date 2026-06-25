// src/components/ui/AnnouncementToast.tsx
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useSettings } from "@/contexts/SettingsContext";

export function AnnouncementToast() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (settings?.announcement_is_active && settings.announcement_text) {
      
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  if (!settings?.announcement_is_active || !settings?.announcement_text) return null;

  return (
    <>
      
      <div
        className={`fixed bottom-6 right-4 md:right-6 z-[100] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right ${
          isVisible && isMinimized ? "scale-100 opacity-60 hover:opacity-100 pointer-events-auto" : "scale-50 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-accent via-pink-400 to-brand-primary p-[2px] shadow-barbie hover:scale-105 active:scale-95 transition-all"
          aria-label="View announcement"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white/95 backdrop-blur-md transition-colors group-hover:bg-white">
            <Icon icon="mdi:bullhorn-outline" className="size-6 text-brand-primary animate-pulse" />
          </div>
        </button>
      </div>

      <div
        className={`fixed bottom-6 right-4 md:right-6 z-[100] w-[calc(100vw-2rem)] max-w-sm sm:max-w-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right ${
          isVisible && !isMinimized ? "scale-100 opacity-100 pointer-events-auto" : "scale-50 opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-accent via-pink-400 to-brand-primary p-[2px] shadow-barbie">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between rounded-[2rem] bg-white/95 backdrop-blur-md p-5 sm:p-6">
            <div className="mb-3 sm:mb-0 sm:mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Icon icon="mdi:sparkles" className="size-5 animate-pulse" />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-1">
                Announcement
              </p>
              <p className="text-sm font-semibold text-pink-950 leading-relaxed whitespace-pre-line">
                {settings.announcement_text}
              </p>
            </div>

            <div className="absolute top-4 right-4 sm:static sm:ml-4 flex gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-brand-primary transition hover:bg-brand-primary hover:text-white"
                aria-label="Minimize announcement"
              >
                <Icon icon="mdi:chevron-down" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
