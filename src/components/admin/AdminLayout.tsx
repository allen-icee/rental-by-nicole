import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/toast-context";
import { signOutOwner } from "@/services/auth.service";
import { useState } from "react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: "mdi:view-dashboard-outline", exact: true },
  { path: "/admin/catalogue", label: "Catalogue Items", icon: "mdi:hanger" },
  { path: "/admin/categories", label: "Categories", icon: "mdi:shape-outline" },
  { path: "/admin/tags", label: "Tags", icon: "mdi:tag-outline" },
  { path: "/admin/availability", label: "Availability", icon: "mdi:calendar-clock-outline" },
  { path: "/admin/guides", label: "Rental Guides", icon: "mdi:book-open-page-variant-outline" },
  { path: "/admin/faqs", label: "FAQs", icon: "mdi:frequently-asked-questions" },
  { path: "/admin/reviews", label: "Reviews", icon: "mdi:star-outline" },
  { path: "/admin/inquiries", label: "Inquiries", icon: "mdi:email-outline" },
  { path: "/admin/settings", label: "Website Settings", icon: "mdi:cog-outline" },
];

export function AdminLayout() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOutOwner();
    showToast({ tone: "info", title: "Signed out", message: "Owner session ended." });
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-brand-background text-pink-950">
      {/* Mobile Header */}
      <header className="flex items-center justify-between bg-white p-4 shadow-soft lg:hidden">
        <div className="font-display text-xl font-bold text-brand-accent">RbN Admin</div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-brand-primary hover:bg-pink-50"
        >
          <Icon icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"} className="size-6" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-soft transition-transform lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center justify-center p-6 lg:flex">
            <span className="font-display text-2xl font-bold text-brand-accent text-center">Rental by Nicole</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-accent text-white shadow-md"
                      : "text-pink-950/70 hover:bg-pink-50 hover:text-brand-accent"
                  }`
                }
              >
                <Icon icon={item.icon} className="size-5 shrink-0" />
                {item.label}
              </NavLink>
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

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-pink-950/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden w-full lg:w-auto">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
