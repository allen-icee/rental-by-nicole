// src/features/sales/useRentalMetrics.ts
import { useMemo } from "react";
import { useRentals } from "./useRentals";

export type MetricFilters = {
  year?: string;
  month?: string; // 1-12 or "all"
  day?: string;   // 1-31 or "all"
};

export function useRentalMetrics(filters?: MetricFilters) {
  const { data: rentals, isLoading, error } = useRentals();

  const metrics = useMemo(() => {
    if (!rentals) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.toDateString();

    let totalIncomeToday = 0;
    let totalIncomeThisMonth = 0;
    let totalIncomeThisYear = 0;
    let globalTotalProfit = 0;
    let globalTotalRentals = rentals.length;

    // Filter rentals for charts & export
    let filteredRentals = rentals;
    
    if (filters) {
      filteredRentals = rentals.filter((r) => {
        const d = new Date(r.date);
        if (filters.year && filters.year !== "all" && d.getFullYear().toString() !== filters.year) return false;
        if (filters.month && filters.month !== "all" && (d.getMonth() + 1).toString() !== filters.month) return false;
        if (filters.day && filters.day !== "all" && d.getDate().toString() !== filters.day) return false;
        return true;
      });
    }

    const monthlyIncomeMap: Record<string, number> = {};
    const itemPopularityMap: Record<string, number> = {};

    let filteredTotalProfit = 0;
    let filteredTotalRentals = filteredRentals.length;

    // First pass: Global Metrics (unfiltered)
    rentals.forEach((rental) => {
      if (rental.status === "paid and verified") {
        const rentalDate = new Date(rental.date);
        if (rentalDate.toDateString() === today) totalIncomeToday += rental.total_income;
        if (rentalDate.getMonth() === currentMonth && rentalDate.getFullYear() === currentYear) totalIncomeThisMonth += rental.total_income;
        if (rentalDate.getFullYear() === currentYear) totalIncomeThisYear += rental.total_income;
        globalTotalProfit += rental.total_income;
      }
    });

    // Second pass: Filtered Metrics for Charts
    filteredRentals.forEach((rental) => {
      if (rental.status === "paid and verified") {
        filteredTotalProfit += rental.total_income;
        
        const rentalDate = new Date(rental.date);
        const monthName = rentalDate.toLocaleString("default", { month: "short" });
        monthlyIncomeMap[monthName] = (monthlyIncomeMap[monthName] || 0) + rental.total_income;
      }

      const items = Array.isArray(rental.rented_items) ? rental.rented_items : [];
      items.forEach((item: any) => {
        const itemName = item.item_name || "Unknown Item";
        itemPopularityMap[itemName] = (itemPopularityMap[itemName] || 0) + (item.quantity || 1);
      });
    });

    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const orderedMonthlyIncome = allMonths.map(month => ({
      name: month,
      income: monthlyIncomeMap[month] || 0
    })).filter(m => m.income > 0);

    const topItemsChart = Object.entries(itemPopularityMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      // Global stats
      totalIncomeToday,
      totalIncomeThisMonth,
      totalIncomeThisYear,
      globalTotalProfit,
      globalTotalRentals,
      
      // Filtered stats (use these for displaying main stats if filter is active)
      totalProfit: filteredTotalProfit,
      totalRentals: filteredTotalRentals,
      
      // Charts
      monthlyIncomeChart: orderedMonthlyIncome,
      topItemsChart,
      
      // Export Data
      filteredRentals,
      allRentals: rentals
    };
  }, [rentals, filters]);

  return {
    metrics,
    isLoading,
    error,
  };
}
