import { useMemo } from "react";
import { useFittings } from "./useFittings";
import { useRentalBookings } from "./useRentalBookings";
import { getManilaDate, parseManilaDate, formatDateManila } from "../../utils/date-utils";

export type MetricFilters = {
  year?: string;
  month?: string; // 1-12 or "all"
  day?: string;   // 1-31 or "all"
  searchQuery?: string;
  module?: "Fitting" | "Rental" | "All";
};

export function useRentalMetrics(filters?: MetricFilters) {
  const { data: fittings, isLoading: isFittingsLoading, error: fittingsError } = useFittings();
  const { data: rentals, isLoading: isRentalsLoading, error: rentalsError } = useRentalBookings();

  const metrics = useMemo(() => {
    if (!fittings || !rentals) return null;

    const now = getManilaDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = formatDateManila(now, "yyyy-MM-dd");

    const { year, month, day, searchQuery, module = "All" } = filters || {};
    const q = searchQuery?.toLowerCase().trim() || "";

    // Helper to calculate Rental Income according to rules:
    // "Use subtotal only. Do NOT include Security Deposit, Damage Charges, Late Fees unless actually collected."
    const getRentalIncome = (r: { subtotal?: number, damageCharge?: number, lateFee?: number }) => {
      return (r.subtotal || 0) + (r.damageCharge || 0) + (r.lateFee || 0);
    };

    // 1. Filter Fittings
    let activeFittings = fittings;
    if (module === "Rental") {
      activeFittings = [];
    } else {
      activeFittings = fittings.filter(f => {
        // Fitting Rule: Only Completed fittings count.
        if (f.status !== "Completed") return false;
        
        const d = parseManilaDate(f.date);
        if (year && year !== "all" && d.getFullYear().toString() !== year) return false;
        if (month && month !== "all" && (d.getMonth() + 1).toString() !== month) return false;
        if (day && day !== "all" && d.getDate().toString() !== day) return false;
        
        if (q && !(f.representativeName?.toLowerCase().includes(q) || f.bookingNumber?.toLowerCase().includes(q))) {
          return false;
        }
        return true;
      });
    }

    // 2. Filter Rentals
    let activeRentals = rentals;
    if (module === "Fitting") {
      activeRentals = [];
    } else {
      activeRentals = rentals.filter(r => {
        if (r.status === "Cancelled") return false;
        
        const d = parseManilaDate(r.startDate);
        if (year && year !== "all" && d.getFullYear().toString() !== year) return false;
        if (month && month !== "all" && (d.getMonth() + 1).toString() !== month) return false;
        if (day && day !== "all" && d.getDate().toString() !== day) return false;

        if (q && !(r.customerName?.toLowerCase().includes(q) || r.bookingNumber?.toLowerCase().includes(q))) {
          return false;
        }
        return true;
      });
    }

    let totalProfit = 0;
    let totalIncomeThisMonth = 0;
    let totalIncomeToday = 0;

    const monthlyIncomeMap: Record<string, number> = {};

    activeFittings.forEach(f => {
      const income = f.total || 0;
      totalProfit += income;

      const fd = parseManilaDate(f.date);
      if (formatDateManila(f.date, "yyyy-MM-dd") === todayStr) totalIncomeToday += income;
      if (fd.getMonth() === currentMonth && fd.getFullYear() === currentYear) totalIncomeThisMonth += income;
      
      const monthName = formatDateManila(f.date, "MMM");
      monthlyIncomeMap[monthName] = (monthlyIncomeMap[monthName] || 0) + income;
    });

    activeRentals.forEach(r => {
      const income = getRentalIncome(r);
      totalProfit += income;

      const rd = parseManilaDate(r.startDate);
      if (formatDateManila(r.startDate, "yyyy-MM-dd") === todayStr) totalIncomeToday += income;
      if (rd.getMonth() === currentMonth && rd.getFullYear() === currentYear) totalIncomeThisMonth += income;

      const monthName = formatDateManila(r.startDate, "MMM");
      monthlyIncomeMap[monthName] = (monthlyIncomeMap[monthName] || 0) + income;
    });

    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const orderedMonthlyIncome = allMonths.map(m => ({
      name: m,
      income: monthlyIncomeMap[m] || 0
    })).filter(m => m.income > 0);

    return {
      totalRentals: activeFittings.length + activeRentals.length,
      totalProfit,
      totalIncomeThisMonth,
      totalIncomeToday,
      monthlyIncomeChart: orderedMonthlyIncome,
      topItemsChart: [],
      
      // Keep for AdminDashboardPage global unfiltered metrics if it asks for them
      filteredRentals: [
        ...activeFittings.map(f => ({
          ...f,
          startDate: f.date,
          customerName: f.representativeName,
          total: f.total
        })),
        ...activeRentals
      ], 
      allRentals: [...fittings.map(f => ({ ...f, startDate: f.date })), ...rentals],
      
      // Fill in legacy property names to avoid breaking AdminDashboardPage
      globalTotalProfit: totalProfit,
      globalTotalRentals: activeFittings.length + activeRentals.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fittings, rentals, filters?.year, filters?.month, filters?.day, filters?.searchQuery, filters?.module]);

  return {
    metrics,
    isLoading: isFittingsLoading || isRentalsLoading,
    error: fittingsError || rentalsError,
  };
}
