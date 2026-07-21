import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { RentalBooking } from "../../types/sales";
import { calculateRentalFinancials } from "../../utils/sales-calculations";

// Mapper utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToRentalBooking(row: any): RentalBooking {
  return {
    id: row.id,
    bookingNumber: row.booking_number,
    startDate: row.start_date,
    time: row.time,
    rentalDays: row.rental_days,
    endDate: row.end_date,
    customerId: row.customer_id,
    customerName: row.customer_name,
    dressId: row.dress_id,
    sizeId: row.size_id,
    accessories: row.accessories,
    subtotal: row.subtotal,
    downPayment: row.down_payment,
    securityDeposit: row.security_deposit,
    damageCharge: row.damage_charge,
    lateFee: row.late_fee,
    refundAmount: row.refund_amount,
    total: row.total,
    pickupMode: row.pickup_mode,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDb(booking: Partial<RentalBooking>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped: any = { ...booking } as any;
  if (booking.bookingNumber !== undefined) { mapped.booking_number = booking.bookingNumber; delete mapped.bookingNumber; }
  if (booking.startDate !== undefined) { mapped.start_date = booking.startDate; delete mapped.startDate; }
  if (booking.time !== undefined) { mapped.time = booking.time; }
  if (booking.rentalDays !== undefined) { mapped.rental_days = booking.rentalDays; delete mapped.rentalDays; }
  if (booking.endDate !== undefined) { mapped.end_date = booking.endDate; delete mapped.endDate; }
  if (booking.customerId !== undefined) { mapped.customer_id = booking.customerId; delete mapped.customerId; }
  if (booking.customerName !== undefined) { mapped.customer_name = booking.customerName; delete mapped.customerName; }
  if (booking.dressId !== undefined) { mapped.dress_id = booking.dressId; delete mapped.dressId; }
  if (booking.sizeId !== undefined) { mapped.size_id = booking.sizeId; delete mapped.sizeId; }
  if (booking.downPayment !== undefined) { mapped.down_payment = booking.downPayment; delete mapped.downPayment; }
  if (booking.securityDeposit !== undefined) { mapped.security_deposit = booking.securityDeposit; delete mapped.securityDeposit; }
  if (booking.damageCharge !== undefined) { mapped.damage_charge = booking.damageCharge; delete mapped.damageCharge; }
  if (booking.lateFee !== undefined) { mapped.late_fee = booking.lateFee; delete mapped.lateFee; }
  if (booking.refundAmount !== undefined) { mapped.refund_amount = booking.refundAmount; delete mapped.refundAmount; }
  if (booking.pickupMode !== undefined) { mapped.pickup_mode = booking.pickupMode; delete mapped.pickupMode; }
  if (booking.paymentMethod !== undefined) { mapped.payment_method = booking.paymentMethod; delete mapped.paymentMethod; }
  if (booking.createdAt !== undefined) { mapped.created_at = booking.createdAt; delete mapped.createdAt; }
  if (booking.updatedAt !== undefined) { mapped.updated_at = booking.updatedAt; delete mapped.updatedAt; }
  return mapped;
}

export function useRentalBookings() {
  return useQuery({
    queryKey: ["rentalBookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map(mapToRentalBooking);
    },
  });
}

export function useCreateRentalBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Partial<RentalBooking>) => {
      let dbPayload = mapToDb(booking);

      let catalogItems = queryClient.getQueryData(["catalog_items_minimal"]) as any[];
      if (!catalogItems) {
        const { data, error } = await supabase.from("catalog_items").select("id, name, price, categories(classification)");
        if (error) throw error;
        catalogItems = data;
      }

      let financials = calculateRentalFinancials({
        dressId: dbPayload.dress_id,
        accessories: dbPayload.accessories || [],
        catalogItems: catalogItems || [],
        status: dbPayload.status,
        manualSubtotal: booking.subtotal,
        manualDownPayment: booking.downPayment,
        manualTotal: booking.total,
      });

      if (dbPayload.status !== 'Cancelled' && financials.total === 0 && dbPayload.dress_id && booking.total === undefined) {
         throw new Error("Unable to determine catalog pricing. Cannot save rental with 0 value.");
      }

      dbPayload.subtotal = financials.subtotal;
      dbPayload.down_payment = financials.downPayment;
      dbPayload.total = financials.total;
      
      if (dbPayload.security_deposit === undefined || dbPayload.security_deposit === null) {
         dbPayload.security_deposit = financials.securityDeposit;
      }

      const { data, error } = await supabase
        .from("rental_bookings")
        .insert([dbPayload])
        .select()
        .single();
      if (error) throw error;
      return mapToRentalBooking(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["rentalBookings"], (old: any) => {
        if (!old) return [data];
        return [...old, data];
      });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rentalBookings"] });
    }
  });
}

export function useUpdateRentalBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RentalBooking> & { id: string }) => {
      const isFinancialUpdate = 
        updates.dressId !== undefined || 
        updates.accessories !== undefined || 
        updates.status !== undefined ||
        updates.subtotal !== undefined ||
        updates.downPayment !== undefined ||
        updates.total !== undefined ||
        updates.securityDeposit !== undefined;

      const { data: current, error: fetchErr } = await supabase.from("rental_bookings").select("*").eq("id", id).single();
      if (fetchErr) throw fetchErr;

      const mergedDb = { ...current, ...mapToDb(updates) };

      if (isFinancialUpdate) {
        let catalogItems = queryClient.getQueryData(["catalog_items_minimal"]) as any[];
        if (!catalogItems) {
          const { data, error } = await supabase.from("catalog_items").select("id, name, price, categories(classification)");
          if (error) throw error;
          catalogItems = data;
        }

        let financials = calculateRentalFinancials({
          dressId: mergedDb.dress_id,
          accessories: mergedDb.accessories || [],
          catalogItems: catalogItems || [],
          status: mergedDb.status,
          manualSubtotal: updates.subtotal,
          manualDownPayment: updates.downPayment,
          manualTotal: updates.total,
        });

        if (mergedDb.status !== 'Cancelled' && financials.total === 0 && mergedDb.dress_id && updates.total === undefined) {
           throw new Error("Unable to determine catalog pricing. Cannot safely complete financial calculation.");
        }

        mergedDb.subtotal = financials.subtotal;
        mergedDb.down_payment = financials.downPayment;
        mergedDb.total = financials.total;
        
        if (updates.securityDeposit === undefined && financials.securityDeposit !== undefined) {
          mergedDb.security_deposit = financials.securityDeposit;
        }
      } else {
        if (updates.securityDeposit !== undefined) {
          mergedDb.security_deposit = updates.securityDeposit;
        }
      }

      const { data, error } = await supabase
        .from("rental_bookings")
        .update(mergedDb)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapToRentalBooking(data);
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["rentalBookings"] });
      const previousRentals = queryClient.getQueryData(["rentalBookings"]);
      queryClient.setQueryData(["rentalBookings"], (old: any) => {
        if (!old) return old;
        return old.map((r: any) => r.id === id ? { ...r, ...updates } : r);
      });
      return { previousRentals };
    },
    onError: (err, newRental, context) => {
      queryClient.setQueryData(["rentalBookings"], context?.previousRentals);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["rentalBookings"], (old: any) => {
        if (!old) return old;
        return old.map((r: any) => r.id === data.id ? data : r);
      });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rentalBookings"] });
    }
  });
}

export function useDeleteRentalBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rental_bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["rentalBookings"] });
      const previousRentals = queryClient.getQueryData(["rentalBookings"]);
      queryClient.setQueryData(["rentalBookings"], (old: any) => {
        if (!old) return old;
        return old.filter((r: any) => r.id !== id);
      });
      return { previousRentals };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["rentalBookings"], context?.previousRentals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rentalBookings"] });
    }
  });
}
