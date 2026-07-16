import { parseManilaDate, formatDateManila } from "./date-utils";
import { addDays } from "date-fns";

/**
 * Utilities for calculating totals, fees, and subtotals for Fittings.
 */

export interface FittingCalculationInput {
  customerCount: number;
  baseFeePerCustomer?: number;
  manualFee?: number;
}

export interface FittingCalculationOutput {
  fee: number;
  total: number;
}

export function calculateFittingFinancials({
  customerCount,
  baseFeePerCustomer = 150,
  manualFee
}: FittingCalculationInput): FittingCalculationOutput {
  // If user provides a manual fee override, we respect it, otherwise we calculate
  const fee = manualFee !== undefined ? manualFee : customerCount * baseFeePerCustomer;
  return {
    fee,
    total: fee
  };
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

export interface RentalCalculationInput {
  dressId?: string | null;
  accessories?: any[]; 
  catalogItems?: any[];
  manualSubtotal?: number;
  manualDownPayment?: number;
  manualTotal?: number;
  securityDeposit?: number;
}

export interface RentalCalculationOutput {
  dressPrice: number;
  accessoriesCost: number;
  subtotal: number;
  downPayment: number;
  total: number;
  securityDeposit: number;
}

export function calculateRentalFinancials({
  dressId,
  accessories = [],
  catalogItems = [],
  manualSubtotal,
  manualDownPayment,
  manualTotal,
  securityDeposit = 200
}: RentalCalculationInput): RentalCalculationOutput {
  
  let dressPrice = 0;
  if (dressId) {
    const dress = catalogItems.find(item => item.id === dressId);
    if (dress && typeof dress.price === 'number') {
      dressPrice = dress.price;
    }
  }

  let accessoriesCost = 0;
  if (Array.isArray(accessories)) {
    accessoriesCost = accessories.reduce((sum, acc) => {
      const accId = acc.itemId || acc.id;
      if (accId) {
        const catalogAcc = catalogItems.find(item => item.id === accId);
        if (catalogAcc && typeof catalogAcc.price === 'number') {
          return sum + catalogAcc.price;
        }
      }
      const fallbackPrice = Number(acc.price);
      return sum + (isNaN(fallbackPrice) ? 0 : fallbackPrice);
    }, 0);
  }

  let subtotal = dressPrice + accessoriesCost;
  
  if (subtotal === 0 && manualSubtotal != null) {
    subtotal = manualSubtotal;
  }

  let downPayment = Math.round(subtotal * 0.5);
  let total = subtotal;

  if (manualTotal != null && manualTotal > 0) {
    total = manualTotal;
    if (subtotal < total) subtotal = total; 
  }
  
  if (manualDownPayment != null && manualDownPayment > 0) {
    downPayment = manualDownPayment;
  }
  
  if (total < downPayment) {
    total = downPayment * 2;
    if (subtotal < total) subtotal = total;
  }

  return {
    dressPrice,
    accessoriesCost,
    subtotal,
    downPayment,
    total,
    securityDeposit
  };
}
