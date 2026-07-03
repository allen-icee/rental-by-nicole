// src/components/layout/PublicLayout.tsx
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { NavLink, useLocation } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";
import { useSettings } from "@/contexts/SettingsContext";
import { AtmosphereBackground } from "./AtmosphereBackground";

const links = [
  { to: "/", label: "Home" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/rental-guide", label: "Rental Guide" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" }
];

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setClickCount] = useState(0);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const { settings } = useSettings();

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsAdminModalOpen(true);
        return 0;
      }
      return newCount;
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-transparent text-pink-950 flex flex-col relative z-0">
      <AtmosphereBackground />
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,47,168,0.06)] transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:py-4 md:px-8 relative z-50">

          <NavLink
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group"
          >
            <div className="size-10 md:size-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-sm">
              <img src="/assets/RN-Logo-Pink.png" alt="Rental by Nicole Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="block font-display text-xl md:text-2xl font-bold bg-gradient-to-r from-brand-accent to-brand-primary bg-clip-text text-transparent leading-none tracking-tight">
                {siteConfig.name}
              </span>
              <span className="block text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-pink-500/80 mt-1">
                {siteConfig.tagline}
              </span>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1 lg:gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => {
                  if (location.pathname === link.to) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                    isActive
                      ? "bg-brand-accent text-white shadow-soft"
                      : "text-pink-950/70 hover:bg-pink-100 hover:text-brand-accent active:scale-95"
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative grid size-10 place-items-center rounded-full bg-white/80 border border-pink-100 text-brand-primary shadow-soft hover:bg-pink-50 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            <Icon
              icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"}
              className="size-6 transition-transform duration-300"
            />
          </button>
        </div>

        <div
          className={[
            "absolute inset-x-0 top-full flex flex-col bg-white/95 backdrop-blur-xl border-b border-pink-100 px-5 py-6 gap-2 shadow-barbie transition-all duration-500 ease-in-out md:hidden z-40",
            isMobileMenuOpen
              ? "translate-y-0 opacity-100 pointer-events-auto visible"
              : "-translate-y-8 opacity-0 pointer-events-none invisible"
          ].join(" ")}
        >
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (location.pathname === link.to) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              style={{ transitionDelay: `${isMobileMenuOpen ? index * 40 : 0}ms` }}
              className={({ isActive }) =>
                [
                  "flex items-center px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-300",
                  isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                  isActive
                    ? "bg-gradient-to-r from-pink-50 to-transparent text-brand-accent border-l-4 border-brand-primary shadow-sm"
                    : "text-pink-900/70 hover:bg-pink-50/50 hover:text-brand-accent border-l-4 border-transparent"
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="border-t border-pink-100 bg-white/90 backdrop-blur-md mt-auto relative z-10 py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="size-10 drop-shadow-sm">
                  <img src="/assets/RN-Logo-Pink.png" alt="Rental by Nicole Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold bg-gradient-to-r from-brand-accent to-brand-primary bg-clip-text text-transparent leading-none">
                    {siteConfig.name}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">
                    {siteConfig.tagline}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="grid size-10 place-items-center rounded-full border border-pink-100 bg-white text-brand-primary shadow-sm transition hover:scale-110 hover:border-brand-primary hover:bg-brand-primary hover:text-white" aria-label="Email Us">
                  <Icon icon="mdi:email-outline" className="size-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full border border-pink-100 bg-white text-brand-primary shadow-sm transition hover:scale-110 hover:border-brand-primary hover:bg-brand-primary hover:text-white" aria-label="Instagram">
                  <Icon icon="mdi:instagram" className="size-5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full border border-pink-100 bg-white text-brand-primary shadow-sm transition hover:scale-110 hover:border-brand-primary hover:bg-brand-primary hover:text-white" aria-label="Facebook">
                  <Icon icon="mdi:facebook" className="size-5" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-pink-100 pt-6 text-center">
            <p className="text-xs font-semibold text-pink-950/40">
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. ⊂⁠(⁠≽^•⩊•^≼⁠)⁠つ
            </p>
          </div>
        </div>
      </footer>

      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
    </div>
  );
}
