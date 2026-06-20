import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, type AdminStats } from "@/services/admin.service";
import { useToast } from "@/components/ui/toast-context";
import { signOutOwner } from "@/services/auth.service";

const modules = [
  "Catalogue Management",
  "Category Management",
  "Tag Management",
  "Availability Management",
  "Rental Guide Management",
  "Testimonials Management",
  "FAQ Management",
  "Inquiry Management",
  "Contact Information",
  "Website Settings"
];

const fallbackStats: AdminStats = {
  publishedItems: 0,
  newInquiries: 0,
  pendingReviews: 0,
  storageBuckets: 3,
  source: "fallback"
};

export function AdminDashboardPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>(fallbackStats);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  async function handleSignOut() {
    await signOutOwner();
    showToast({ tone: "info", title: "Signed out", message: "Owner session ended." });
    navigate("/admin/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-brand-background text-pink-950">
      <section className="mx-auto max-w-7xl px-4 py-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
              Owner Admin
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold">Rental by Nicole Dashboard</h1>
            <p className="mt-3 max-w-2xl leading-7 text-pink-950/70">
              Protected by Supabase Auth. The modules below are ready for CRUD
              screens, RLS-aware queries, activity logs, and soft-delete flows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="rounded-full bg-white px-5 py-3 font-semibold text-brand-accent shadow-soft">
              View Website
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-brand-accent px-5 py-3 font-semibold text-white shadow-soft"
            >
              Sign Out
            </button>
          </div>
        </div>

        {stats.source === "fallback" ? (
          <p className="mt-6 rounded-2xl bg-white p-4 text-sm font-semibold text-brand-accent shadow-soft">
            Supabase tables are not returning data yet. Run the migration in
            Supabase, create the owner account, then this dashboard will read
            live counts.
          </p>
        ) : null}

        <div className="mt-7 grid gap-4 md:grid-cols-4">
          <Stat label="Published Items" value={stats.publishedItems.toString()} icon="mdi:hanger" />
          <Stat label="New Inquiries" value={stats.newInquiries.toString()} icon="mdi:email-alert-outline" />
          <Stat label="Pending Reviews" value={stats.pendingReviews.toString()} icon="mdi:star-clock-outline" />
          <Stat label="Storage Buckets" value={stats.storageBuckets.toString()} icon="mdi:database-outline" />
        </div>

        <section className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <article key={module} className="rounded-2xl bg-white/90 p-4 shadow-soft">
              <Icon icon="mdi:tools" className="size-7 text-brand-primary" />
              <h2 className="mt-4 font-display text-2xl font-semibold text-brand-accent">{module}</h2>
              <p className="mt-2 text-sm leading-6 text-pink-950/70">
                Foundation ready. Next pass can add the actual create, edit,
                archive, restore, and approval screens for this module.
              </p>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-2xl bg-white/90 p-5 shadow-soft">
          <h2 className="font-display text-3xl font-semibold text-brand-accent">Supabase setup checklist</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Checklist text="Run the initial schema migration from supabase/migrations." />
            <Checklist text="Create one Supabase Auth owner user and add it to public.users." />
            <Checklist text="Upload catalogue images to the catalogue-assets bucket." />
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-soft">
      <Icon icon={icon} className="size-7 text-brand-primary" />
      <p className="mt-4 text-3xl font-bold text-brand-accent">{value}</p>
      <p className="mt-1 text-sm font-semibold text-pink-950/65">{label}</p>
    </div>
  );
}

function Checklist({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-brand-background p-4">
      <Icon icon="mdi:check-circle-outline" className="size-6 shrink-0 text-brand-accent" />
      <p className="text-sm leading-6 text-pink-950/70">{text}</p>
    </div>
  );
}


