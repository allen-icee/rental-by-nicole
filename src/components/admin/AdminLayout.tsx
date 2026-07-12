// src/components/admin/AdminLayout.tsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/toast-context";
import { signOutOwner } from "@/services/auth.service";
import { useState, useEffect } from "react";
import { AdminNotificationBell } from "./AdminNotificationBell";

type NavItem = { path: string; label: string; icon: string; exact?: boolean; subItems?: NavItem[] };

const navItems: NavItem[] = [
  { path: "/admin", label: "Dashboard", icon: "mdi:view-dashboard-outline", exact: true },
  {
    path: "#",
    label: "Catalogue Management",
    icon: "mdi:folder-outline",
    subItems: [
      { path: "/admin/catalogue", label: "Items", icon: "mdi:hanger" },
      { path: "/admin/categories", label: "Categories", icon: "mdi:shape-outline" },
      { path: "/admin/tags", label: "Tags", icon: "mdi:tag-outline" },
    ]
  },
  { path: "/admin/guides", label: "Rental Guides", icon: "mdi:book-open-page-variant-outline" },
  { path: "/admin/faqs", label: "FAQs", icon: "mdi:frequently-asked-questions" },
  { path: "/admin/reviews", label: "Reviews", icon: "mdi:star-outline" },
  { path: "/admin/inquiries", label: "Inquiries", icon: "mdi:email-outline" },
  { path: "/admin/sales", label: "Sales Tracker", icon: "mdi:chart-line" },
  { path: "/admin/schedule", label: "Schedule", icon: "mdi:calendar-month-outline" },
  { path: "/admin/settings", label: "Website Settings", icon: "mdi:cog-outline" },
];

function NavGroup({ item, closeMobileMenu }: { item: NavItem, closeMobileMenu: () => void }) {
  const location = useLocation();
  const isActiveGroup = item.subItems?.some(sub => location.pathname.startsWith(sub.path));
  const [isOpen, setIsOpen] = useState(isActiveGroup || false);

  if (!item.subItems) {
    return (
      <NavLink
        to={item.path}
        end={item.exact}
        onClick={closeMobileMenu}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            isActive
              ? "bg-brand-accent text-white shadow-md"
              : "text-pink-950/70 hover:bg-pink-50 hover:text-brand-accent"
          }`
        }
      >
        {() => (
          <>
            <Icon icon={item.icon} className="size-5 shrink-0" />
            {item.label}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
          isActiveGroup
            ? "bg-brand-accent/10 text-brand-accent"
            : "text-pink-950/70 hover:bg-pink-50 hover:text-brand-accent"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon icon={item.icon} className="size-5 shrink-0" />
          {item.label}
        </div>
        <Icon icon={isOpen ? "mdi:chevron-down" : "mdi:chevron-right"} className="size-5" />
      </button>
      
      {isOpen && (
        <div className="pl-6 pr-2 py-1 space-y-1">
          {item.subItems.map(sub => (
            <NavLink
              key={sub.path}
              to={sub.path}
              end={sub.exact}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-accent text-white shadow-md"
                    : "text-pink-950/70 hover:bg-pink-50 hover:text-brand-accent"
                }`
              }
            >
              <Icon icon={sub.icon} className="size-4 shrink-0" />
              {sub.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminLayout() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOutOwner();
    showToast({ tone: "info", title: "Signed out", message: "Owner session ended." });
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-brand-background text-pink-950">
      
      <header className="flex items-center justify-between bg-white p-4 shadow-soft lg:hidden">
        <div className="font-display text-xl font-bold text-brand-accent">RbN Admin</div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-brand-primary hover:bg-pink-50"
        >
          <Icon icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"} className="size-6" />
        </button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-soft transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center justify-center p-6 lg:flex">
            <span className="font-display text-2xl font-bold text-brand-accent text-center">Rental by Nicole</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" data-lenis-prevent="true">
            {navItems.map((item) => (
              <NavGroup key={item.label} item={item} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            ))}
          </nav>

          <div className="p-4 border-t border-pink-100 space-y-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-50 px-4 py-3 text-sm font-semibold text-brand-accent transition-colors hover:bg-pink-100"
            >
              <Icon icon="mdi:open-in-new" className="size-5" />
              View Website
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Icon icon="mdi:logout" className="size-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-pink-950/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative">
        <div className="sticky top-0 z-20 flex justify-end px-4 py-3 sm:px-6 lg:px-8 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-soft border border-pink-100">
            <AdminNotificationBell />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" data-lenis-prevent="true">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-2 md:px-8 lg:px-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
