// src/pages/admin/AdminDashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend 
} from "recharts";
import * as XLSX from "xlsx";
import { useRentalMetrics } from "../../features/sales/useRentalMetrics";
import { usePageViews } from "../../features/analytics/usePageViews";
import { CustomDropdown } from "../../components/ui/CustomDropdown";

const adminCards = [
  {
    title: "Catalogue",
    href: "/admin/catalogue",
    icon: "mdi:hanger",
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: "mdi:shape-outline",
  },
  {
    title: "Tags",
    href: "/admin/tags",
    icon: "mdi:tag-outline",
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: "mdi:star-outline",
  },
  {
    title: "FAQs",
    href: "/admin/faqs",
    icon: "mdi:frequently-asked-questions",
  },
  {
    title: "Sales Tracker",
    href: "/admin/sales",
    icon: "mdi:chart-line",
  },
  {
    title: "Inquiries",
    href: "/admin/inquiries",
    icon: "mdi:email-outline",
  },
];

const COLORS = ['#F472B6', '#38BDF8', '#A78BFA', '#34D399', '#FBBF24'];

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

const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }));

export function AdminDashboardPage() {
  const [now, setNow] = useState(() => new Date());
  
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("");

  const { metrics, isLoading } = useRentalMetrics({
    year: filterYear,
    month: filterMonth,
    day: filterDay ? filterDay.split("-")[2].replace(/^0+/, "") : "all" // extract day from YYYY-MM-DD
  });

  const { data: totalVisitors } = usePageViews();

  const manilaDate = useMemo(() => getManilaDateParts(now), [now]);
  const GreetingIcon = greetingStyles[manilaDate.greetingTone].icon;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleExportExcel = () => {
    if (!metrics || !metrics.filteredRentals) return;

    const dataToExport = metrics.filteredRentals.map((r) => ({
      "Tracking Number": r.tracking_number,
      "Date": new Date(r.date).toLocaleDateString(),
      "Customer Name": r.customer_name,
      "Total Income": r.total_income,
      "Status": r.status,
      "Payment Method": r.payment_method
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Data");
    XLSX.writeFile(wb, `Sales_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const dynamicYears = useMemo(() => {
    if (!metrics || !metrics.allRentals) return [{ value: "all", label: "All Years" }];
    const yearsSet = new Set(metrics.allRentals.map(r => new Date(r.date).getFullYear().toString()));
    const yearsArray = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
    return [{ value: "all", label: "All Years" }, ...yearsArray.map(y => ({ value: y, label: y }))];
  }, [metrics]);

  return (
    <div className="space-y-4">
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
                Rental By Nicole
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

      {/* METRICS SECTION */}
      {metrics && !isLoading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-950/60">Total Bookings</p>
              <p className="mt-2 text-2xl font-bold text-brand-accent truncate" title={metrics.totalRentals.toString()}>
                {new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(metrics.totalRentals)}
              </p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-950/60">Total Sales / Profit</p>
              <p className="mt-2 text-2xl font-bold text-green-600 truncate" title={`₱${metrics.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}>
                ₱{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(metrics.totalProfit)}
              </p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-950/60">Income This Month</p>
              <p className="mt-2 text-2xl font-bold text-brand-primary truncate" title={`₱${metrics.totalIncomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}>
                ₱{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(metrics.totalIncomeThisMonth)}
              </p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-950/60">Income Today</p>
              <p className="mt-2 text-2xl font-bold text-brand-primary truncate" title={`₱${metrics.totalIncomeToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}>
                ₱{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(metrics.totalIncomeToday)}
              </p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-950/60">Total Visitors</p>
              <p className="mt-2 text-2xl font-bold text-blue-600 truncate" title={(totalVisitors || 0).toString()}>
                {new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(totalVisitors || 0)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-pink-100 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <Icon icon="mdi:filter-variant" className="text-brand-accent size-5" />
              
              <CustomDropdown
                value={filterYear}
                onChange={setFilterYear}
                options={dynamicYears}
              />
              
              <CustomDropdown
                value={filterMonth}
                onChange={setFilterMonth}
                options={[{ value: "all", label: "All Months" }, ...months]}
              />

              <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-lg pl-3 pr-1 py-1">
                <span className="text-xs font-semibold text-pink-950/60 uppercase tracking-wide">Day:</span>
                <input 
                  type="date"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-pink-950 outline-none w-full"
                />
                {filterDay && (
                  <button onClick={() => setFilterDay("")} className="text-pink-950/40 hover:text-red-500 flex-shrink-0 p-1">
                    <Icon icon="mdi:close-circle" className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all hover:-translate-y-0.5 hover:bg-green-700"
            >
              <Icon icon="mdi:microsoft-excel" className="size-5" />
              Export to XLSX
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* BAR CHART */}
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-accent/70">
                Filtered Income Trend
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.monthlyIncomeChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fdf2f8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#831843', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#831843', fontSize: 12 }} tickFormatter={(val) => `₱${val}`} />
                    <Tooltip cursor={{ fill: '#fdf2f8' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="income" fill="#F472B6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART */}
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-accent/70">
                Most Rented Items
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.topItemsChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {metrics.topItemsChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#831843' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      <h2 className="mb-4 mt-8 text-sm font-bold uppercase tracking-widest text-brand-accent/70 px-2">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 lg:grid-cols-7">
        {adminCards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="group flex flex-col items-center justify-center rounded-2xl border border-pink-100 bg-white/80 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/40 hover:bg-white hover:shadow-barbie text-center"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-pink-50 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110 group-hover:shadow-soft mb-3">
              <Icon icon={card.icon} className="size-5" />
            </div>

            <h2 className="font-display text-sm font-bold text-brand-accent transition-colors group-hover:text-brand-primary">
              {card.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
