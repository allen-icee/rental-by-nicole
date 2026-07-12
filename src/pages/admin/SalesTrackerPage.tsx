import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import * as XLSX from "xlsx";
import { useRentalMetrics } from "../../features/sales/useRentalMetrics";
import { useFittings } from "../../features/sales/useFittings";
import { useRentalBookings } from "../../features/sales/useRentalBookings";
import { useToast } from "@/components/ui/toast-context";
import { CustomDropdown } from "../../components/ui/CustomDropdown";
import { FittingTable } from "../../components/sales/FittingTable";
import { RentalTable } from "../../components/sales/RentalTable";
import { getManilaDate, parseManilaDate, formatDateManila } from "../../utils/date-utils";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => ({ value: (i + 1).toString(), label: m }));

export function SalesTrackerPage() {
  const { showToast } = useToast();
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterDay] = useState<string>("all");
  const [module, setModule] = useState<"Fitting" | "Rental">("Fitting");

  const { metrics } = useRentalMetrics({
    year: filterYear,
    month: filterMonth,
    day: filterDay === "all" || !filterDay ? "all" : (filterDay.split("-")[2]?.replace(/^0+/, "") || "all"),
    searchQuery,
    module
  });

  const { data: fittings } = useFittings();
  const { data: rentals } = useRentalBookings();

  // Determine available years from both sources
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    (fittings || []).forEach(f => { if(f.date) years.add(parseManilaDate(f.date).getFullYear().toString()) });
    (rentals || []).forEach(r => { if(r.startDate) years.add(parseManilaDate(r.startDate).getFullYear().toString()) });
    const yearsArray = Array.from(years).sort((a, b) => Number(b) - Number(a));
    return [{ value: "all", label: "All Years" }, ...yearsArray.map(y => ({ value: y, label: y }))];
  }, [fittings, rentals]);

  const handleExportExcel = () => {
    // Export active module
    let dataToExport: Record<string, unknown>[] = [];
    if (module === "Fitting") {
      const filtered = (fittings || []).filter(f => {
        const d = parseManilaDate(f.date);
        if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
        if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
        if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          return f.representativeName?.toLowerCase().includes(q) || f.bookingNumber?.toLowerCase().includes(q);
        }
        return true;
      });
      dataToExport = filtered.map(f => ({
        "No.": f.bookingNumber,
        "Date": formatDateManila(f.date, "yyyy-MM-dd"),
        "Time": f.time || "",
        "Representative": f.representativeName,
        "Count": f.customerCount,
        "Package": f.packageType,
        "Total": f.total,
        "Status": f.status
      }));
    } else {
      const filtered = (rentals || []).filter(r => {
        const d = parseManilaDate(r.startDate);
        if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
        if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
        if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          return r.customerName?.toLowerCase().includes(q) || r.bookingNumber?.toLowerCase().includes(q);
        }
        return true;
      });
      dataToExport = filtered.map(r => ({
        "No.": r.bookingNumber,
        "Start Date": formatDateManila(r.startDate, "yyyy-MM-dd"),
        "End Date": r.endDate ? formatDateManila(r.endDate, "yyyy-MM-dd") : "",
        "Customer": r.customerName,
        "Days": r.rentalDays,
        "Total": r.total,
        "Status": r.status
      }));
    }

    if (dataToExport.length === 0) {
      showToast({ tone: "error", title: "Export Failed", message: "No records to export." });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${module} Data`);
    XLSX.writeFile(wb, `${module}Tracker_${formatDateManila(getManilaDate(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-accent sm:text-3xl">Sales Tracker</h1>
          <p className="mt-1 text-pink-950/70">Track and manage your rental orders, inline Excel style.</p>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 text-brand-primary"><Icon icon="mdi:calendar-check" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Total Bookings</p><p className="text-xl font-bold text-brand-accent">{metrics?.totalRentals || 0}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600"><Icon icon="mdi:cash-multiple" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Total Profit</p><p className="text-xl font-bold text-brand-accent">₱{metrics?.totalProfit?.toLocaleString() || 0}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon icon="mdi:cash-register" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Income This Month</p><p className="text-xl font-bold text-brand-accent">₱{metrics?.totalIncomeThisMonth?.toLocaleString() || 0}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Icon icon="mdi:cash-fast" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Income Today</p><p className="text-xl font-bold text-brand-accent">₱{metrics?.totalIncomeToday?.toLocaleString() || 0}</p></div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-pink-100 shadow-soft">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <div className="flex bg-pink-50 p-1 rounded-xl shrink-0 h-10 w-full sm:w-auto overflow-hidden">
            <button 
              onClick={() => setModule("Fitting")} 
              className={`flex-1 sm:flex-none px-4 py-1 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${module === "Fitting" ? "bg-white text-brand-accent shadow-sm" : "text-pink-950/60 hover:text-pink-950"}`}
            >
              Fitting
            </button>
            <button 
              onClick={() => setModule("Rental")} 
              className={`flex-1 sm:flex-none px-4 py-1 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${module === "Rental" ? "bg-white text-brand-accent shadow-sm" : "text-pink-950/60 hover:text-pink-950"}`}
            >
              Rental
            </button>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5" />
            <input type="text" placeholder="Search tracker..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 w-full rounded-xl border border-pink-100 bg-white pl-11 pr-4 text-sm text-pink-950 shadow-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CustomDropdown value={filterYear} onChange={setFilterYear} options={yearOptions} className="flex-1 min-w-[120px]" />
            <CustomDropdown value={filterMonth} onChange={setFilterMonth} options={[{ value: "all", label: "All Months" }, ...months]} className="flex-1 min-w-[120px]" />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
          <button onClick={() => showToast({tone: "info", title: "Import", message: "Import has been disabled during the refactor."})} title="Import" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 sm:px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:bg-blue-700 shrink-0">
            <Icon icon="mdi:upload" className="size-5 shrink-0" /> <span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={handleExportExcel} title="Export" className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all hover:bg-green-700 shrink-0">
            <Icon icon="mdi:microsoft-excel" className="size-5 shrink-0" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      {module === "Fitting" ? (
        <FittingTable filterYear={filterYear} filterMonth={filterMonth} filterDay={filterDay} searchQuery={searchQuery} />
      ) : (
        <RentalTable filterYear={filterYear} filterMonth={filterMonth} filterDay={filterDay} searchQuery={searchQuery} />
      )}
    </div>
  );
}
