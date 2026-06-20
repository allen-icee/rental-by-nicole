import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { NavLink, Link } from "react-router-dom";
import { siteConfig } from "@/config/site";

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
  return (
    <div className="min-h-screen bg-brand-background text-pink-950">
      <header className="sticky top-0 z-40 border-b border-pink-200/70 bg-brand-background/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-brand-primary text-white shadow-soft">
              <Icon icon="mdi:hanger" className="size-6" />
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold text-brand-accent">
                {siteConfig.name}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-900/60">
                {siteConfig.tagline}
              </span>
            </span>
          </NavLink>

          <nav className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-brand-accent text-white shadow-soft"
                      : "text-pink-950/70 hover:bg-brand-secondary/70 hover:text-brand-accent"
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-pink-200 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold text-brand-accent">
              {siteConfig.name}
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-pink-950/70">
              Fashion rental catalogue and inquiry management for dresses,
              gowns, Filipiniana pieces, boleros, and accessories.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-accent">
              Service Areas
            </p>
            <p className="mt-3 text-sm text-pink-950/70">
              {siteConfig.serviceAreas.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-accent">
              Manual Reservations
            </p>
            <p className="mt-3 text-sm text-pink-950/70">
              No online payments, accounts, or automatic bookings.
            </p>
            <Link
              to="/admin/login"
              className="mt-4 inline-grid size-9 place-items-center rounded-full border border-pink-200 text-pink-950/35 transition hover:border-brand-accent hover:text-brand-accent"
              aria-label="Owner admin login"
              title="Owner admin"
            >
              <Icon icon="mdi:shield-key-outline" className="size-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


