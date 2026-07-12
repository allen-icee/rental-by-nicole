import { useState, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import * as XLSX from "xlsx";
import { useRentalMetrics } from "../../features/sales/useRentalMetrics";
import { useFittings, useCreateFitting } from "../../features/sales/useFittings";
import { useRentalBookings, useCreateRentalBooking } from "../../features/sales/useRentalBookings";
import { useToast } from "@/components/ui/toast-context";
import { CustomDropdown } from "../../components/ui/CustomDropdown";
import { FittingTable } from "../../components/sales/FittingTable";
import { RentalTable } from "../../components/sales/RentalTable";
import { FittingFormModal } from "../../components/sales/FittingFormModal";
import { RentalFormModal } from "../../components/sales/RentalFormModal";
import { getManilaDate, parseManilaDate, formatDateManila } from "../../utils/date-utils";
import { supabase } from "../../lib/supabase/client";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => ({ value: (i + 1).toString(), label: m }));

export function SalesTrackerPage() {
  const { showToast } = useToast();
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterDay] = useState<string>("all");
  const [module, setModule] = useState<"Fitting" | "Rental">("Fitting");
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isFittingModalOpen, setIsFittingModalOpen] = useState(false);

  const { metrics } = useRentalMetrics({
    year: filterYear,
    month: filterMonth,
    day: filterDay === "all" || !filterDay ? "all" : (filterDay.split("-")[2]?.replace(/^0+/, "") || "all"),
    searchQuery,
    module
  });

  const { data: fittings } = useFittings();
  const { data: rentals } = useRentalBookings();
  const createFitting = useCreateFitting();
  const createRental = useCreateRentalBooking();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine available years from both sources
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    (fittings || []).forEach(f => { if(f.date) years.add(parseManilaDate(f.date).getFullYear().toString()) });
    (rentals || []).forEach(r => { if(r.startDate) years.add(parseManilaDate(r.startDate).getFullYear().toString()) });
    const yearsArray = Array.from(years).sort((a, b) => Number(b) - Number(a));
    return [{ value: "all", label: "All Years" }, ...yearsArray.map(y => ({ value: y, label: y }))];
  }, [fittings, rentals]);

  const handleExportExcel = async () => {
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
        "Date": formatDateManila(f.date, "MM/dd/yy"),
        "Time": f.time || "",
        "Customer": f.representativeName || "",
        "People": f.customerCount,
        "Status": f.status,
        "Fee": f.fee != null ? `₱${f.fee.toFixed(2)}` : "₱0.00",
        "Total": f.total != null ? `₱${f.total.toFixed(2)}` : "₱0.00"
      }));
    } else {
      const dressMap = new Map<string, string>();
      const sizeMap = new Map<string, string>();
      try {
        const { data: dresses } = await supabase.from('catalog_items').select('id, name');
        const { data: sizes } = await supabase.from('catalog_item_sizes').select('id, size_label');
        if (dresses) dresses.forEach(d => dressMap.set(d.id, d.name));
        if (sizes) sizes.forEach(s => sizeMap.set(s.id, s.size_label));
      } catch (err) {
        console.error("Error fetching catalogue data for export", err);
      }

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

      dataToExport = filtered.map(r => {
        let accStr = "N/A";
        if (Array.isArray(r.accessories) && r.accessories.length > 0) {
          accStr = r.accessories.map(a => typeof a === 'object' && a !== null ? (a as any).name : a).join(", ");
        } else if (typeof r.accessories === 'string' && (r.accessories as string).trim() !== "") {
          accStr = r.accessories as string;
        }

        return {
          "No.": r.bookingNumber,
          "Start Date": formatDateManila(r.startDate, "MM/dd/yy"),
          "Time": r.time || "N/A",
          "End Date": r.endDate ? formatDateManila(r.endDate, "MM/dd/yy") : "",
          "Customer": r.customerName,
          "Dress": dressMap.get(r.dressId || "") || r.dressId || "N/A",
          "Size": sizeMap.get(r.sizeId || "") || r.sizeId || "N/A",
          "Accessories": accStr,
          "Down Payment": r.downPayment != null ? `₱${r.downPayment.toFixed(2)}` : "₱0.00",
          "Security Deposit": r.securityDeposit != null ? `₱${r.securityDeposit.toFixed(2)}` : "₱0.00",
          "Mode": r.pickupMode,
          "Payment": r.paymentMethod,
          "Status": r.status,
          "Total": r.total != null ? `₱${r.total.toFixed(2)}` : "₱0.00",
          "Days": r.rentalDays,
          "Subtotal": r.subtotal != null ? `₱${r.subtotal.toFixed(2)}` : "₱0.00",
          "Damage Charge": r.damageCharge != null ? `₱${r.damageCharge.toFixed(2)}` : "₱0.00",
          "Late Fee": r.lateFee != null ? `₱${r.lateFee.toFixed(2)}` : "₱0.00",
          "Refund": r.refundAmount != null ? `₱${r.refundAmount.toFixed(2)}` : "₱0.00"
        };
      });
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

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

      if (jsonData.length === 0) {
        showToast({ tone: "error", title: "Import Failed", message: "File is empty." });
        return;
      }

      let count = 0;
      
      const parseCurrency = (val: any) => {
        if (val == null) return 0;
        const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
        return isNaN(num) ? 0 : num;
      };

      if (module === "Fitting") {
        const { data: dbFits } = await supabase.from("fittings").select("booking_number");
        let lastFitNum = dbFits?.reduce((max, f) => {
          const match = (f.booking_number || "").match(/(\d+)$/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0) || 0;

        for (const row of jsonData) {
          let bNum = row["No."];
          if (!bNum) {
            lastFitNum++;
            bNum = `FIT-${lastFitNum}`;
          }

          await createFitting.mutateAsync({
            bookingNumber: bNum,
            date: row["Date"] || new Date().toISOString().slice(0, 10),
            time: row["Time"] || null,
            representativeName: row["Customer"] || row["Representative Name"] || "",
            customerCount: Number(row["People"]) || 1,
            fee: parseCurrency(row["Fee"]) || 150,
            total: parseCurrency(row["Total"]) || 150,
            status: row["Status"] || "Scheduled"
          } as any);
          count++;
        }
      } else {
        const dressNameMap = new Map<string, string>();
        const sizeNameMap = new Map<string, string>();
        try {
          const { data: dresses } = await supabase.from('catalog_items').select('id, name');
          const { data: sizes } = await supabase.from('catalog_item_sizes').select('id, size_label');
          if (dresses) dresses.forEach(d => dressNameMap.set(d.name.toLowerCase().trim(), d.id));
          if (sizes) sizes.forEach(s => sizeNameMap.set(s.size_label.toLowerCase().trim(), s.id));
        } catch (err) {
          console.error("Error fetching catalogue mapping for import", err);
        }

        const { data: dbRnts } = await supabase.from("rental_bookings").select("booking_number");
        let lastRntNum = dbRnts?.reduce((max, r) => {
          const match = (r.booking_number || "").match(/(\d+)$/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0) || 0;

        for (const row of jsonData) {
          let bNum = row["No."];
          if (!bNum) {
            lastRntNum++;
            bNum = `RNT-${lastRntNum}`;
          }
          
          let accImport: any[] = [];
          const rawAcc = row["Accessories"];
          if (rawAcc && String(rawAcc).trim() !== "N/A" && String(rawAcc).trim() !== "") {
            accImport = String(rawAcc).split(",").map(s => ({ name: s.trim(), price: 0 }));
          }

          // Handle date parsing (Excel might send MM/DD/YY as a string or an Excel date number)
          let startDateStr = row["Start Date"];
          let endDateStr = row["End Date"];
          if (typeof startDateStr === "number") startDateStr = new Date(Math.round((startDateStr - 25569) * 864e5)).toISOString().slice(0, 10);
          else if (startDateStr) startDateStr = new Date(startDateStr).toISOString().slice(0, 10);
          else startDateStr = new Date().toISOString().slice(0, 10);

          if (typeof endDateStr === "number") endDateStr = new Date(Math.round((endDateStr - 25569) * 864e5)).toISOString().slice(0, 10);
          else if (endDateStr) endDateStr = new Date(endDateStr).toISOString().slice(0, 10);
          else endDateStr = null;

          const dressIdStr = row["Dress ID"] || dressNameMap.get((row["Dress"] || "").toString().toLowerCase().trim()) || null;
          const sizeIdStr = row["Size ID"] || sizeNameMap.get((row["Size"] || "").toString().toLowerCase().trim()) || null;

          await createRental.mutateAsync({
            bookingNumber: bNum,
            startDate: startDateStr,
            time: row["Time"] || null,
            endDate: endDateStr,
            customerName: row["Customer"] || "Imported Customer",
            rentalDays: Number(row["Days"]) || 2,
            dressId: dressIdStr,
            sizeId: sizeIdStr,
            accessories: accImport,
            subtotal: parseCurrency(row["Subtotal"]) || parseCurrency(row["Total"]) || 0,
            downPayment: parseCurrency(row["Down Payment"]) || 0,
            securityDeposit: parseCurrency(row["Security Deposit"]) || 200,
            damageCharge: parseCurrency(row["Damage Charge"]) || 0,
            lateFee: parseCurrency(row["Late Fee"]) || 0,
            refundAmount: parseCurrency(row["Refund"]) || 0,
            total: parseCurrency(row["Total"]) || 0,
            pickupMode: row["Mode"] || row["Pickup Mode"] || "Pick Up",
            paymentMethod: row["Payment"] || "Cash",
            status: row["Status"] || "Reserved",
          } as any);
          count++;
        }
      }

      showToast({ tone: "success", title: "Import Successful", message: `Imported ${count} ${module.toLowerCase()} records.` });
    } catch (err) {
      console.error(err);
      showToast({ tone: "error", title: "Import Failed", message: "There was an error parsing the file." });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddRecord = () => {
    if (module === "Fitting") {
      setIsFittingModalOpen(true);
    } else {
      setIsRentalModalOpen(true);
    }
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
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto shrink-0">
          <button onClick={handleAddRecord} title="Add Record" className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-3 sm:px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:bg-brand-primary/90 shrink-0">
            <Icon icon="mdi:plus" className="size-5 shrink-0" /> <span>Add {module === "Fitting" ? "FIT" : "RNT"} Record</span>
          </button>
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportExcel} 
            />
            <button onClick={() => fileInputRef.current?.click()} title="Import" className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 sm:px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:bg-blue-700 shrink-0">
              <Icon icon="mdi:upload" className="size-5 shrink-0" /> <span>Import</span>
            </button>
            <button onClick={handleExportExcel} title="Export" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all hover:bg-green-700 shrink-0">
              <Icon icon="mdi:microsoft-excel" className="size-5 shrink-0" /> <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      {module === "Fitting" ? (
        <FittingTable filterYear={filterYear} filterMonth={filterMonth} filterDay={filterDay} searchQuery={searchQuery} />
      ) : (
        <RentalTable filterYear={filterYear} filterMonth={filterMonth} filterDay={filterDay} searchQuery={searchQuery} />
      )}

      {/* Modals */}
      <RentalFormModal isOpen={isRentalModalOpen} onClose={() => setIsRentalModalOpen(false)} />
      <FittingFormModal isOpen={isFittingModalOpen} onClose={() => setIsFittingModalOpen(false)} />
    </div>
  );
}
