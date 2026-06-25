// src/pages/admin/AdminDashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const adminCards = [
  {
    title: "Catalogue",
    description: "Manage catalog items, upload images, and update inventory.",
    href: "/admin/catalogue",
    icon: "mdi:hanger",
  },
  {
    title: "Categories",
    description: "Manage item categories to organize your rental catalog.",
    href: "/admin/categories",
    icon: "mdi:shape-outline",
  },
  {
    title: "Tags",
    description: "Manage tags like 'Graduation', 'Wedding Guest', etc.",
    href: "/admin/tags",
    icon: "mdi:tag-outline",
  },
  {
    title: "Reviews",
    description: "Approve and manage customer reviews and feedback.",
    href: "/admin/reviews",
    icon: "mdi:star-outline",
  },
  {
    title: "FAQs",
    description: "Create, edit, reorder, and publish frequently asked questions.",
    href: "/admin/faqs",
    icon: "mdi:frequently-asked-questions",
  },
  {
    title: "Inquiries",
    description: "Read website messages and mark requests as handled.",
    href: "/admin/inquiries",
    icon: "mdi:email-outline",
  },
];

type GreetingTone = "morning" | "afternoon" | "evening";

function getManilaDateParts(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(date),
  );

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const greetingTone: GreetingTone =
    hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return {
    greeting,
    greetingTone,
    dateLabel,
    timeLabel,
  };
}

const greetingStyles = {
  morning: {
    icon: "mdi:weather-sunset-up",
    className: "bg-pink-100 text-brand-primary",
  },
  afternoon: {
    icon: "mdi:weather-sunny",
    className: "bg-brand-secondary text-brand-accent",
  },
  evening: {
    icon: "mdi:moon-waning-crescent",
    className: "bg-purple-100 text-purple-600",
  },
};

export function AdminDashboardPage() {
  const [now, setNow] = useState(() => new Date());

  const manilaDate = useMemo(() => getManilaDateParts(now), [now]);

  const GreetingIcon = greetingStyles[manilaDate.greetingTone].icon;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-brand-secondary bg-gradient-to-r from-brand-accent to-brand-primary text-white shadow-barbie">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="hidden size-14 place-items-center rounded-full bg-white/20 text-white sm:grid shadow-inner backdrop-blur-sm">
              <Icon icon="mdi:sparkles" className="size-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm md:text-base font-bold tracking-wide">
                Admin Dashboard Online
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </span>
              </div>

              <p className="mt-1 text-sm md:text-base text-white/90 max-w-sm leading-relaxed font-medium">
                Catalogue, categories, reviews, FAQs, and inquiries are
                ready to manage.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-left shadow-lg backdrop-blur-md sm:text-right transition-transform hover:scale-[1.02]">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              {manilaDate.dateLabel}
            </p>

            <p className="mt-2 flex items-center gap-2 font-mono text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:justify-end">
              <Icon icon="mdi:calendar-clock" className="size-6 md:size-8 opacity-90" />
              {manilaDate.timeLabel}
            </p>

            <p className="mt-1 text-xs md:text-sm font-semibold tracking-wide text-white/80">
              Philippine Time
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border-l-4 border-brand-primary bg-white/90 p-5 shadow-soft backdrop-blur transition-all hover:shadow-barbie">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-accent sm:text-3xl">
              {manilaDate.greeting}, Admin.
            </h1>

            <p className="mt-1 text-sm md:text-base font-medium text-pink-950/70">
              Welcome back to Rental by Nicole content management.
            </p>
          </div>

          <div
            className={`hidden size-14 shrink-0 place-items-center rounded-full sm:grid shadow-inner border border-white/50 ${greetingStyles[manilaDate.greetingTone].className}`}
          >
            <Icon icon={GreetingIcon} className="size-8 drop-shadow-sm" />
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-accent/70 px-2">
        Quick Actions
      </h2>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {adminCards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="group rounded-2xl border border-pink-100 bg-white/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/40 hover:bg-white hover:shadow-barbie"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-pink-50 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110 group-hover:shadow-soft">
                <Icon icon={card.icon} className="size-6" />
              </div>

              <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-accent transition-all duration-300 group-hover:bg-brand-accent group-hover:text-white group-hover:border-transparent group-hover:shadow-sm">
                Open
              </span>
            </div>

            <h2 className="mt-6 font-display text-xl md:text-2xl font-bold text-brand-accent transition-colors group-hover:text-brand-primary">
              {card.title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed font-medium text-pink-950/70 group-hover:text-pink-950/90 transition-colors">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
