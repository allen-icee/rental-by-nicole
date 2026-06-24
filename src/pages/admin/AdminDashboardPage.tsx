import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getAdminStats, type AdminStats } from "@/services/admin.service";

const fallbackStats: AdminStats = {
  publishedItems: 0,
  newInquiries: 0,
  pendingReviews: 0,
  storageBuckets: 3,
  source: "fallback"
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(fallbackStats);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
          Overview
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Dashboard</h1>
        <p className="mt-3 max-w-2xl leading-7 text-pink-950/70">
          Welcome to the Rental by Nicole owner dashboard. From here, you can manage your entire catalog, approve reviews, and handle customer inquiries.
        </p>
      </div>

      {stats.source === "fallback" ? (
        <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-brand-accent shadow-soft">
          Supabase tables are not returning data yet. Run the migration in Supabase, create the owner account, then this dashboard will read live counts.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Published Items" value={stats.publishedItems.toString()} icon="RN-Logo" />
        <Stat label="New Inquiries" value={stats.newInquiries.toString()} icon="mdi:email-alert-outline" />
        <Stat label="Pending Reviews" value={stats.pendingReviews.toString()} icon="mdi:star-clock-outline" />
        <Stat label="Storage Buckets" value={stats.storageBuckets.toString()} icon="mdi:database-outline" />
      </div>

      <section className="mt-7 rounded-2xl bg-white/90 p-5 shadow-soft">
        <h2 className="font-display text-2xl font-semibold text-brand-accent">Supabase Setup Checklist</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Checklist text="Run the initial schema migration from supabase/migrations." />
          <Checklist text="Create one Supabase Auth owner user and add it to public.users." />
          <Checklist text="Upload catalogue images to the catalogue-assets bucket." />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-soft">
      {icon === "RN-Logo" ? (
        <img src="/assets/RN-Logo-Pink.png" alt="" className="size-7 object-contain opacity-80" />
      ) : (
        <Icon icon={icon} className="size-7 text-brand-primary" />
      )}
      <p className="mt-4 text-3xl font-display font-semibold text-brand-accent">{value}</p>
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
