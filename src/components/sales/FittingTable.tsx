/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { useFittings, useCreateFitting, useUpdateFitting, useDeleteFitting } from "../../features/sales/useFittings";
import { useCustomers, useCreateCustomer } from "../../features/customers/useCustomers";
import { useToast } from "@/components/ui/toast-context";
import { ConfirmModal } from "@/components/admin/AdminModal";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase/client";
import { Pagination } from "@/components/ui/Pagination";

import {
  EditableCell,
  InlineCustomerAutocomplete,
  InlineColorSelect
} from "@/components/ui/table/InlineComponents";
export function getFittingStatusColor(status: string) {
  switch (status) {
    case "Scheduled": return "bg-blue-100 text-blue-700";
    case "Completed": return "bg-emerald-100 text-emerald-700";
    case "No Show": return "bg-red-100 text-red-700";
    case "Cancelled": return "bg-gray-100 text-gray-700";
    default: return "bg-gray-50 text-gray-600";
  }
}



export function FittingTable({ filterYear, filterMonth, filterDay, searchQuery }: { filterYear: string, filterMonth: string, filterDay: string, searchQuery: string }) {
  const { showToast } = useToast();
  const { data: fittings, isLoading } = useFittings();
  const createFitting = useCreateFitting();
  const updateFitting = useUpdateFitting();
  const deleteFitting = useDeleteFitting();
  const queryClient = useQueryClient();

  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const prevFittingsLength = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (fittings && prevFittingsLength.current !== null && fittings.length > prevFittingsLength.current) {
      // Record was added! Jump to the last page.
      const newTotalPages = Math.ceil((fittings || []).filter(f => {
        const d = new Date(f.date);
        if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
        if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
        if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchesName = f.representativeName?.toLowerCase().includes(q);
          const matchesTracking = f.bookingNumber?.toLowerCase().includes(q);
          if (!matchesName && !matchesTracking) return false;
        }
        return true;
      }).length / itemsPerPage);
      setCurrentPage(Math.max(1, newTotalPages));
      
      // Optionally scroll to the bottom of the table
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
    if (fittings) {
      prevFittingsLength.current = fittings.length;
    }
  }, [fittings, filterYear, filterMonth, filterDay, searchQuery, itemsPerPage]);

  const filteredFittings = (fittings || []).filter(f => {
    const d = new Date(f.date);
    if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
    if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
    if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesName = f.representativeName?.toLowerCase().includes(q);
      const matchesTracking = f.bookingNumber?.toLowerCase().includes(q);
      if (!matchesName && !matchesTracking) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredFittings.length / itemsPerPage);
  const paginatedFittings = filteredFittings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleInlineUpdate = (id: string, fieldOrUpdates: string | Record<string, any>, val?: any, fitting?: any) => {
    let updates: any = {};
    
    if (typeof fieldOrUpdates === 'string') {
      const field = fieldOrUpdates;
      updates[field] = val;
      
      if (field === 'customerCount') {
        const count = Number(val) || 1;
        const newFee = count * 150;
        updates.fee = newFee;
        updates.total = newFee;
      }
    } else {
      updates = fieldOrUpdates; // object
    }

    // Optimistically update UI immediately
    queryClient.setQueryData(["fittings"], (old: any) => {
      if (!old) return old;
      return old.map((f: any) => f.id === id ? { ...f, ...updates } : f);
    });

    // Queue for debounced save
    pendingUpdatesRef.current[id] = {
      ...(pendingUpdatesRef.current[id] || {}),
      ...updates
    };

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      const pending = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};
      
      Object.entries(pending).forEach(([rowId, rowUpdates]) => {
        updateFitting.mutate({ id: rowId, ...rowUpdates });
      });
    }, 800);
  };

  const handleAddInlineRow = async () => {
    // Fetch the latest booking numbers directly from the database to ensure we check all records
    const { data: bookingNumbers } = await supabase.from("fittings").select("booking_number");
    const lastNum = bookingNumbers?.reduce((max, r) => {
      const match = (r.booking_number || "").match(/(\d+)$/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0) || 0;
    const newTrk = `FIT-${lastNum + 1}`;

    await createFitting.mutateAsync({
      bookingNumber: newTrk,
      date: new Date().toISOString().slice(0, 10),
      time: null,
      representativeName: "",
      customerCount: 1,

      fee: 150,
      total: 150,
      status: "Scheduled"
    } as any);
    showToast({ tone: "success", title: "Row Added", message: "A new blank fitting record was appended." });
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteFitting.mutate(itemToDelete, {
        onSuccess: () => {
          showToast({ tone: "success", title: "Deleted", message: "Fitting record deleted successfully." });
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-xs text-pink-950/90 whitespace-nowrap">
          <thead className="bg-pink-100/80 font-extrabold uppercase tracking-wider text-brand-accent text-[10px]">
            <tr>
              <th className="px-3 py-3 w-20 border border-pink-100 text-center font-extrabold">No.</th>
              <th className="px-2 py-3 w-28 border border-pink-100 text-center font-extrabold">Date</th>
              <th className="px-2 py-3 w-24 border border-pink-100 text-center font-extrabold">Time</th>
              <th className="px-2 py-3 w-48 border border-pink-100 text-center font-extrabold">Representative Name</th>
              <th className="px-2 py-3 w-24 border border-pink-100 text-center font-extrabold">People</th>

              <th className="px-2 py-3 w-24 border border-pink-100 text-center font-extrabold">Fee</th>
              <th className="px-2 py-3 w-32 border border-pink-100 text-center font-extrabold">Status</th>
              <th className="px-2 py-3 w-10 border border-pink-100 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-pink-950/50">Loading fittings...</td></tr>
            ) : filteredFittings.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-pink-950/50">No fittings found.</td></tr>
            ) : (
              paginatedFittings.map((fitting) => (
                <tr key={fitting.id} className="transition-colors hover:bg-pink-100/60 even:bg-pink-50 group">
                  <td className="px-3 py-2 border border-pink-100 font-mono font-medium text-brand-accent/70 text-[10px] text-center">
                    {fitting.bookingNumber}
                  </td>
                  <td className="px-2 py-2 border border-pink-100">
                    <EditableCell 
                      type="date" 
                      value={fitting.date ? new Date(fitting.date).toISOString().slice(0,10) : ""} 
                      onBlur={(v: string) => handleInlineUpdate(fitting.id as string, "date", v ? new Date(v).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), fitting)} 
                    />
                  </td>
                  <td className="px-2 py-2 border border-pink-100">
                    <EditableCell 
                      type="time" 
                      value={fitting.time || ""} 
                      onBlur={(v: string) => handleInlineUpdate(fitting.id as string, "time", v, fitting)} 
                    />
                  </td>
                  <td className="px-2 py-2 border border-pink-100 relative">
                    <InlineCustomerAutocomplete 
                      value={fitting.representativeName || ""}
                      placeholder="Type or select name"
                      onSelect={(name, id) => {
                        handleInlineUpdate(fitting.id as string, "representativeName", name, fitting);
                        handleInlineUpdate(fitting.id as string, "representativeCustomerId", id, fitting);
                      }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-pink-100 text-center">
                    <EditableCell 
                      type="number" min={1} 
                      value={fitting.customerCount ?? 1} 
                      onBlur={(v: string) => handleInlineUpdate(fitting.id as string, "customerCount", Number(v), fitting)} 
                    />
                  </td>

                  <td className="px-2 py-2 font-bold text-green-600 border border-pink-100 text-center bg-green-50/30">
                    ₱{(fitting.fee ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 py-2 border border-pink-100 text-center">
                    <InlineColorSelect 
                      value={fitting.status || "Scheduled"} 
                      onChange={(v) => handleInlineUpdate(fitting.id as string, "status", v, fitting)}
                      options={["Scheduled", "Completed", "No Show", "Cancelled"]}
                      getColor={getFittingStatusColor}
                    />
                  </td>
                  <td className="px-2 py-2 border border-pink-100 text-center">
                    <button onClick={() => confirmDelete(fitting.id as string)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Icon icon="mdi:trash-can-outline" className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <button onClick={handleAddInlineRow} className="w-full py-2 text-xs font-semibold text-brand-primary hover:bg-pink-50 flex items-center justify-center gap-1 border-t border-pink-50">
          <Icon icon="mdi:plus" /> Add Empty Row
        </button>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-pink-100 bg-pink-50/30 text-xs">
          <span className="text-pink-950/60 font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFittings.length)} of {filteredFittings.length} entries
          </span>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete" message="Are you sure you want to delete this fitting record?" onConfirm={handleDelete} />
    </div>
  );
}
