import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { Fitting } from "../../types/sales";

// Mapper utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToFitting(row: any): Fitting {
  return {
    id: row.id,
    bookingNumber: row.booking_number,
    date: row.date,
    time: row.time,
    representativeCustomerId: row.representative_customer_id,
    representativeName: row.representative_name,
    customerCount: row.customer_count,
    fee: row.fee,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDb(fitting: Partial<Fitting>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped: any = { ...fitting } as any;
  if (fitting.bookingNumber !== undefined) { mapped.booking_number = fitting.bookingNumber; delete mapped.bookingNumber; }
  if (fitting.representativeCustomerId !== undefined) { mapped.representative_customer_id = fitting.representativeCustomerId; delete mapped.representativeCustomerId; }
  if (fitting.representativeName !== undefined) { mapped.representative_name = fitting.representativeName; delete mapped.representativeName; }
  if (fitting.customerCount !== undefined) { mapped.customer_count = fitting.customerCount; delete mapped.customerCount; }
  if (fitting.createdAt !== undefined) { mapped.created_at = fitting.createdAt; delete mapped.createdAt; }
  if (fitting.updatedAt !== undefined) { mapped.updated_at = fitting.updatedAt; delete mapped.updatedAt; }
  return mapped;
}

export function useFittings() {
  return useQuery({
    queryKey: ["fittings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fittings")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map(mapToFitting);
    },
  });
}

export function useCreateFitting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fitting: Partial<Fitting>) => {
      const { data, error } = await supabase
        .from("fittings")
        .insert([mapToDb(fitting)])
        .select()
        .single();
      if (error) throw error;
      return mapToFitting(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fittings"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}

export function useUpdateFitting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fitting> & { id: string }) => {
      const { data, error } = await supabase
        .from("fittings")
        .update(mapToDb(updates))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapToFitting(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fittings"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}

export function useDeleteFitting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fittings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fittings"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}
