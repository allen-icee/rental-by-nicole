/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { useRentalBookings, useCreateRentalBooking, useUpdateRentalBooking, useDeleteRentalBooking } from "../../features/sales/useRentalBookings";
import { useRentals } from "../../features/sales/useRentals";
import { parseManilaDate, formatDateManila, getManilaDate } from "../../utils/date-utils";
import { useCustomers, useCreateCustomer } from "../../features/customers/useCustomers";
import { calculateRentalFinancials, calculateEndDate } from "../../utils/sales-calculations";
import { useToast } from "@/components/ui/toast-context";
import { ConfirmModal } from "@/components/admin/AdminModal";
import type { RentalBooking } from "../../types/sales";
import { createPortal } from "react-dom";
import { Pagination } from "@/components/ui/Pagination";

export const getModeColor = (mode: string) => {
  switch (mode) {
    case 'Pick Up': return 'bg-purple-100 text-purple-700';
    case 'Delivery': return 'bg-blue-100 text-blue-700';
    case 'Courier': return 'bg-orange-100 text-orange-700';
    case 'Meet Up': return 'bg-yellow-100 text-yellow-700';
    default: return '';
  }
};

export const getPaymentColor = (payment: string) => {
  switch (payment) {
    case 'Cash': return 'bg-green-100 text-green-700';
    case 'GCash': return 'bg-blue-100 text-blue-700';
    case 'BDO': return 'bg-yellow-100 text-yellow-700';
    case 'Bank': return 'bg-indigo-100 text-indigo-700';
    default: return '';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-pink-100 text-pink-700';
    case 'Reserved': return 'bg-blue-100 text-blue-700';
    case 'Ready for Pickup': return 'bg-indigo-100 text-indigo-700';
    case 'Picked Up': return 'bg-purple-100 text-purple-700';
    case 'Due Today': return 'bg-orange-100 text-orange-700';
    case 'Returned': return 'bg-emerald-100 text-emerald-700';
    case 'Cancelled': return 'bg-gray-100 text-gray-700';
    case 'Overdue': return 'bg-red-100 text-red-700';
    default: return '';
  }
};

import {
  EditableCell,
  InlineCustomerAutocomplete,
  InlineSearchableSelect,
  InlineSizeSelect,
  InlineAccessoriesSelect,
  InlineColorSelect
} from "@/components/ui/table/InlineComponents";

function computeAutoStatus(status: string, startDate: string, endDate: string | null | undefined): string {
  if (status === "Cancelled" || status === "Returned") return status;

  const today = formatDateManila(getManilaDate(), "yyyy-MM-dd");

  if (status === "Reserved" && today >= startDate) {
    return "Ready for Pickup";
  }

  if (endDate && status === "Picked Up" && today === endDate) {
    return "Due Today";
  }

  if (endDate && (status === "Picked Up" || status === "Due Today") && today > endDate) {
    return "Overdue";
  }

  return status;
}

export function RentalTable({ filterYear, filterMonth, filterDay, searchQuery }: { filterYear: string, filterMonth: string, filterDay: string, searchQuery: string }) {
  const { showToast } = useToast();
  const { data: rentals, isLoading } = useRentalBookings();
  const createRental = useCreateRentalBooking();
  const updateRental = useUpdateRentalBooking();
  const deleteRental = useDeleteRentalBooking();
  const queryClient = useQueryClient();

  const pendingUpdatesRef = useRef<Record<string, Partial<RentalBooking>>>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [pendingUpdate, setPendingUpdate] = useState<{id: string, field: string, val: any, rental: RentalBooking} | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<{ rentalId: string, sizeId: string, message: string } | null>(null);

  const prevRentalsLength = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // useEffect moved below filteredRentals

  const { data: catalogItems } = useQuery({
    queryKey: ["catalog_items_minimal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items").select("id, name, price, categories(classification)");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: sizes } = useQuery({
    queryKey: ["catalog_item_sizes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_item_sizes").select("id, catalog_item_id, size_label, inventory_quantity");
      if (error) throw error;
      return data as any[];
    },
  });

  const dresses = (catalogItems || []).filter(i => !i.categories || i.categories.classification === 'Dress');
  const accessories = (catalogItems || []).filter(i => i.categories?.classification === 'Accessory');

  // Automatic status updates have been removed per client request.
  // The system now merely provides suggestions in the UI instead of mutating automatically.

  const filteredRentals = (rentals || []).filter(r => {
    const d = new Date(r.startDate);
    if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
    if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
    if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesName = r.customerName?.toLowerCase().includes(q);
      const matchesTracking = r.bookingNumber?.toLowerCase().includes(q);
      if (!matchesName && !matchesTracking) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const paginatedRentals = filteredRentals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (rentals && prevRentalsLength.current !== null && rentals.length > prevRentalsLength.current) {
      // Record was added! Jump to the last page.
      const newTotalPages = Math.ceil(filteredRentals.length / itemsPerPage);
      setCurrentPage(Math.max(1, newTotalPages));
      
      // Optionally scroll to the bottom of the table
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
    if (rentals) {
      prevRentalsLength.current = rentals.length;
    }
  }, [rentals, filteredRentals.length, itemsPerPage]);

  const executeInlineUpdate = (id: string, field: string, val: any, rental: RentalBooking) => {
    const updates: any = { [field]: val };
    
    // Auto-select size if dress changed
    if (field === 'dressId') {
      const dressSizes = sizes?.filter(s => s.catalog_item_id === val) || [];
      if (dressSizes.length === 1) {
        updates.sizeId = dressSizes[0].id;
      } else {
        updates.sizeId = null;
      }
    }

    // Auto-calculate end date while preserving duration
    if (field === 'startDate') {
      const sDate = val;
      const currentDurationDays = rental.endDate && rental.startDate ? 
        Math.round((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 
        (rental.rentalDays || 2);
      updates.endDate = calculateEndDate(sDate as string, Math.max(1, currentDurationDays));
    }

    // Perform local calculation for optimistic update
    let updatedTotals: any = {};
    if (['dressId', 'accessories', 'status', 'startDate', 'endDate', 'downPayment', 'securityDeposit'].includes(field)) {
      const simulatedRental = { ...rental, ...updates };
      const financials = calculateRentalFinancials({
        dressId: simulatedRental.dressId,
        accessories: simulatedRental.accessories,
        catalogItems: catalogItems || [],
        status: simulatedRental.status,
        manualSubtotal: simulatedRental.subtotal,
        manualDownPayment: simulatedRental.downPayment,
        manualTotal: simulatedRental.total
      });
      updatedTotals = {
        subtotal: financials.subtotal,
        downPayment: financials.downPayment,
        total: financials.total,
        securityDeposit: financials.securityDeposit
      };
      Object.assign(updates, updatedTotals);
    }

    // Optimistically update UI immediately
    queryClient.setQueryData(["rentalBookings"], (old: any) => {
      if (!old) return old;
      return old.map((r: any) => r.id === id ? { ...r, ...updates } : r);
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
        updateRental.mutate({ id: rowId, ...rowUpdates });
      });
    }, 800);
  };

  const handleInlineUpdate = async (id: string, field: string, val: any, rental: RentalBooking) => {
    // Collision detection
    if (field === 'dressId' || field === 'startDate' || field === 'endDate' || field === 'sizeId') {
      const sDate = field === 'startDate' ? val : rental.startDate;
      const newDressId = field === 'dressId' ? val : rental.dressId;
      const newSizeId = field === 'sizeId' ? val : rental.sizeId;
      
      const currentDurationDays = rental.endDate && rental.startDate ? 
        Math.round((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 
        (rental.rentalDays || 2);
        
      const eDate = field === 'endDate' ? val : (field === 'startDate' ? calculateEndDate(sDate as string, Math.max(1, currentDurationDays)) : rental.endDate);

      // Validate date logic
      if (new Date(eDate).getTime() < new Date(sDate).getTime()) {
        showToast({ tone: "error", title: "Invalid Date", message: "Return date cannot be earlier than Picked Up date." });
        return;
      }

      if (newDressId) {
        let query = supabase
          .from('rental_bookings')
          .select('id, start_date, end_date')
          .eq('dress_id', newDressId)
          .neq('id', id)
          .neq('status', 'Cancelled')
          .neq('status', 'Returned')
          .lte('start_date', eDate)
          .gte('end_date', sDate);
          
        if (newSizeId) {
          query = query.eq('size_id', newSizeId);
        }
        
        const { data: overlapping } = await query;
        
        if (overlapping && overlapping.length > 0) {
          setPendingUpdate({ id, field, val, rental });
          setIsWarningModalOpen(true);
          return;
        }
      }
    }
    
    executeInlineUpdate(id, field, val, rental);
  };

  const handleAddInlineRow = async () => {
    // Fetch the latest booking numbers directly from the database to ensure we check all records
    const { data: bookingNumbers } = await supabase.from("rental_bookings").select("booking_number");
    const lastNum = bookingNumbers?.reduce((max, r) => {
      const match = (r.booking_number || "").match(/(\d+)$/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0) || 0;
    const newTrk = `RNT-${lastNum + 1}`;

    const today = new Date().toISOString().slice(0, 10);
    const endDate = calculateEndDate(today, 2);

    await createRental.mutateAsync({
      bookingNumber: newTrk,
      startDate: today,
      time: "10:00",
      rentalDays: 2,
      endDate: endDate,
      customerName: "",
      damageCharge: 0,
      lateFee: 0,
      refundAmount: 0,
      status: "Reserved",
      paymentMethod: "Cash",
      pickupMode: "Pick Up",
      accessories: []
    } as any);
    showToast({ tone: "success", title: "Row Added", message: "A new blank rental record was appended." });
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteRental.mutate(itemToDelete, {
        onSuccess: () => {
          showToast({ tone: "success", title: "Deleted", message: "Rental record deleted successfully." });
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1500px] text-left text-xs text-pink-950/90 whitespace-nowrap">
          <thead className="bg-pink-100/80 font-extrabold uppercase tracking-wider text-brand-accent text-[10px]">
            <tr>
              <th className="px-3 py-3 w-20 border border-pink-100 text-center">No.</th>
              <th className="px-2 py-3 w-28 border border-pink-100 text-center">Start Date</th>
              <th className="px-2 py-3 w-24 border border-pink-100 text-center">Time</th>
              <th className="px-2 py-3 w-28 border border-pink-100 text-center">End Date</th>
              <th className="px-2 py-3 w-40 border border-pink-100 text-center">Customer</th>
              <th className="px-2 py-3 w-48 border border-pink-100 text-center">Dress</th>
              <th className="px-2 py-3 w-32 border border-pink-100 text-center">Size</th>
              <th className="px-2 py-3 w-48 border border-pink-100 text-center">Accessories</th>
              <th className="px-2 py-3 w-24 border border-pink-100 text-center">Down P.</th>
              <th className="px-2 py-3 w-24 border border-pink-100 text-center">Sec. Dep.</th>
              <th className="px-2 py-3 w-28 border border-pink-100 text-center">Mode</th>
              <th className="px-2 py-3 w-28 border border-pink-100 text-center">Payment</th>
              <th className="px-2 py-3 w-32 border border-pink-100 text-center">Status</th>
              <th className="px-2 py-3 w-24 border border-pink-100 text-center text-green-600">Total</th>
              <th className="px-2 py-3 w-10 border border-pink-100 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {isLoading ? (
              <tr><td colSpan={15} className="px-4 py-8 text-center text-pink-950/50">Loading rentals...</td></tr>
            ) : filteredRentals.length === 0 ? (
              <tr><td colSpan={15} className="px-4 py-8 text-center text-pink-950/50">No rentals found.</td></tr>
            ) : (
              paginatedRentals.map((rental) => {
                const dressSizes = sizes?.filter(s => s.catalog_item_id === rental.dressId) || [];
                
                // Calculate size availability
                const overlappingRentals = (rentals || []).filter(r => 
                  r.id !== rental.id &&
                  r.dressId === rental.dressId &&
                  r.status !== 'Cancelled' &&
                  r.status !== 'Returned' &&
                  r.startDate <= (rental.endDate || "") &&
                  (r.endDate || "") >= rental.startDate
                );
                
                const sizesWithAvailability = dressSizes.map(size => {
                  const bookedCount = overlappingRentals.filter(r => r.sizeId === size.id).length;
                  const inventory = size.inventory_quantity || 1;
                  const isReserved = bookedCount >= inventory;
                  
                  // Find overlapping dates for message
                  const overlapsForSize = overlappingRentals.filter(r => r.sizeId === size.id);
                  let overlapMsg = "This size is already reserved for these dates.";
                  if (overlapsForSize.length > 0) {
                    const firstOverlap = overlapsForSize[0];
                    overlapMsg = `This size is already reserved from ${formatDateManila(firstOverlap.startDate)} to ${firstOverlap.endDate ? formatDateManila(firstOverlap.endDate) : ""}. Would you like to continue anyway?`;
                  }
                  
                  return { ...size, isReserved, overlapMsg };
                });

                const isDressMissing = !rental.dressId;
                const isSizeMissing = !!rental.dressId && !rental.sizeId;
                
                return (
                  <tr key={rental.id} className="transition-colors hover:bg-pink-100/60 even:bg-pink-50 group">
                    <td className="px-3 py-2 border border-pink-100 font-mono font-medium text-brand-accent/70 text-[10px] text-center">
                      {rental.bookingNumber}
                    </td>
                    <td className="px-2 py-2 border border-pink-100">
                      <EditableCell 
                        type="date" 
                        value={rental.startDate ? new Date(rental.startDate).toISOString().slice(0,10) : ""} 
                        onBlur={(v: string) => handleInlineUpdate(rental.id as string, "startDate", v ? new Date(v).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100">
                      <EditableCell 
                        type="time" 
                        value={rental.time || ""} 
                        onBlur={(v: string) => handleInlineUpdate(rental.id as string, "time", v, rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100">
                      <EditableCell 
                        type="date" 
                        value={rental.endDate || ""} 
                        onBlur={(v: string) => handleInlineUpdate(rental.id as string, "endDate", v || new Date().toISOString().slice(0,10), rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 relative">
                      <InlineCustomerAutocomplete 
                        value={rental.customerName || ""}
                        placeholder="Select customer"
                        onSelect={(name, id) => {
                          handleInlineUpdate(rental.id as string, "customerName", name, rental);
                          handleInlineUpdate(rental.id as string, "customerId", id, rental);
                        }}
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100">
                      <InlineSearchableSelect 
                        value={rental.dressId || null} 
                        options={dresses} 
                        placeholder="Select dress"
                        isMissing={isDressMissing}
                        onChange={(v) => handleInlineUpdate(rental.id as string, "dressId", v, rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 relative">
                      <InlineSizeSelect 
                        value={rental.sizeId || null} 
                        onChange={(v) => handleInlineUpdate(rental.id as string, "sizeId", v, rental)} 
                        options={sizesWithAvailability} 
                        placeholder="Select size"
                        isMissing={isSizeMissing}
                        onWarningOverride={(sizeId, msg) => {
                          setSizeWarning({ rentalId: rental.id as string, sizeId, message: msg });
                        }}
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 relative">
                      <InlineAccessoriesSelect 
                        value={rental.accessories as any[] || []} 
                        options={accessories} 
                        placeholder="Select accessories"
                        onChange={(v) => handleInlineUpdate(rental.id as string, "accessories", v, rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 text-center">
                      <EditableCell 
                        type="number" min={0} 
                        value={rental.downPayment ?? 0} 
                        onBlur={(v: string) => handleInlineUpdate(rental.id as string, "downPayment", Number(v), rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 text-center">
                      <EditableCell 
                        type="number" min={0} 
                        value={rental.securityDeposit ?? 200} 
                        onBlur={(v: string) => handleInlineUpdate(rental.id as string, "securityDeposit", Number(v), rental)} 
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 text-center">
                      <InlineColorSelect 
                        value={rental.pickupMode || "Pick Up"} 
                        onChange={(v) => handleInlineUpdate(rental.id as string, "pickupMode", v, rental)}
                        options={["Pick Up", "Delivery", "Courier", "Meet Up"]}
                        getColor={getModeColor}
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 text-center">
                      <InlineColorSelect 
                        value={rental.paymentMethod || "Cash"} 
                        onChange={(v) => handleInlineUpdate(rental.id as string, "paymentMethod", v, rental)}
                        options={["Cash", "GCash", "Bank"]}
                        getColor={getPaymentColor}
                      />
                    </td>
                    <td className="px-2 py-2 border border-pink-100 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <InlineColorSelect 
                          value={rental.status || "Reserved"} 
                          onChange={(v) => handleInlineUpdate(rental.id as string, "status", v, rental)}
                          options={["Pending", "Reserved", "Ready for Pickup", "Picked Up", "Due Today", "Overdue", "Returned", "Cancelled"]}
                          getColor={getStatusColor}
                        />
                        {computeAutoStatus(rental.status, rental.startDate, rental.endDate) !== rental.status && (
                          <span className="text-[9px] font-medium text-brand-accent uppercase tracking-wider bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-200">
                            Suggest: {computeAutoStatus(rental.status, rental.startDate, rental.endDate)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 font-bold text-green-600 border border-pink-100 text-center bg-green-50/30">
                      ₱{(rental.total ?? 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 border border-pink-100 text-center">
                      <button onClick={() => confirmDelete(rental.id as string)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Icon icon="mdi:trash-can-outline" className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRentals.length)} of {filteredRentals.length} entries
          </span>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Delete" 
        message="Are you sure you want to delete this rental record?" 
        onConfirm={handleDelete} 
      />

      <ConfirmModal 
        isOpen={isWarningModalOpen} 
        onClose={() => {
          setIsWarningModalOpen(false);
          setPendingUpdate(null);
        }} 
        title="Overlapping Dates Detected" 
        message="This dress is already reserved by another customer during the selected dates. Would you like to proceed anyway?" 
        onConfirm={() => {
          if (pendingUpdate) {
            executeInlineUpdate(pendingUpdate.id, pendingUpdate.field, pendingUpdate.val, pendingUpdate.rental);
          }
          setIsWarningModalOpen(false);
          setPendingUpdate(null);
        }} 
        confirmText="Override & Proceed"
      />

      <ConfirmModal
        isOpen={sizeWarning !== null}
        onClose={() => setSizeWarning(null)}
        title="Size Already Reserved"
        message={sizeWarning?.message || ""}
        onConfirm={() => {
          if (sizeWarning) {
            const rental = rentals?.find(r => r.id === sizeWarning.rentalId);
            if (rental) {
              executeInlineUpdate(rental.id as string, "sizeId", sizeWarning.sizeId, rental);
            }
          }
          setSizeWarning(null);
        }}
        confirmText="Override"
      />
    </div>
  );
}
