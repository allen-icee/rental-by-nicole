// src/features/sales/useRentals.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { Database } from "../../types/database";

type Rental = Database["public"]["Tables"]["rentals"]["Row"];
type InsertRental = Database["public"]["Tables"]["rentals"]["Insert"];
type UpdateRental = Database["public"]["Tables"]["rentals"]["Update"];

export function useRentals() {
  return useQuery({
    queryKey: ["rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as any as Rental[];
    },
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRental: InsertRental) => {
      const { data, error } = await supabase
        .from("rentals")
        .insert([newRental])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
  });
}

export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateRental & { id: string }) => {
      const { data, error } = await supabase
        .from("rentals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
  });
}

export function useDeleteRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rentals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
  });
}
