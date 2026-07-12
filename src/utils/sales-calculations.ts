import { parseManilaDate, formatDateManila } from "./date-utils";
import { addDays } from "date-fns";

/**
 * Utilities for calculating totals, fees, and subtotals for Fittings.
 */

export function calculateFittingTotal(
  fee: number,
  customerCount: number = 1
): number {
  // If package type is standard and standard fee is per head, multiply by customer count
  // If unlimited, it could be a fixed total or also per head.
  // We'll base it simply on fee * customerCount for now, but this provides a structured place
  // for business logic rules to be added later.
  return fee * customerCount;
}

/**
 * Utilities for calculating totals, fees, and subtotals for Rentals.
 */

export function calculateRentalSubtotal(
  dressPrice: number,
  rentalDays: number,
  accessoriesCost: number = 0
): number {
  // Normally standard rental days is 2. Additional days might incur extra cost.
  // But for now, we just sum them if needed, or if price is fixed for the days rented.
  // Assumes dressPrice covers the base rentalDays, and accessories are flat rate.
  return dressPrice + accessoriesCost;
}

export function calculateDownPayment(
  subtotal: number,
  downPaymentPercentage: number = 0.5
): number {
  return Math.round(subtotal * downPaymentPercentage);
}

export function calculateRentalTotal(
  subtotal: number
): number {
  return subtotal;
}

export function calculateRentalRefund(
  securityDeposit: number = 200,
  damageCharge: number = 0,
  lateFee: number = 0
): number {
  return Math.max(0, securityDeposit - damageCharge - lateFee);
}

export function calculateEndDate(
  startDate: string,
  rentalDays: number
): string {
  const date = parseManilaDate(startDate);
  const end = addDays(date, rentalDays);
  return formatDateManila(end, "yyyy-MM-dd");
}
