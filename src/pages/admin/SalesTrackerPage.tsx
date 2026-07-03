// src/pages/admin/SalesTrackerPage.tsx
import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase/client";
import { 
  useRentals, 
  useCreateRental, 
  useUpdateRental, 
  useDeleteRental 
} from "../../features/sales/useRentals";
import { useRentalMetrics } from "../../features/sales/useRentalMetrics";
import { Database } from "../../types/database";
import { AdminModal, ConfirmModal } from "@/components/admin/AdminModal";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { useToast } from "@/components/ui/toast-context";
import { CustomDropdown } from "../../components/ui/CustomDropdown";

type RentalStatus = Database["public"]["Enums"]["rental_status"];

type RentedItemInput = {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

type RentalFormInput = {
  date: string;
  customer_name: string;
  rented_items: RentedItemInput[];
  status: RentalStatus;
  payment_method: string;
  selected_block_id?: string;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }));
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export function SalesTrackerPage() {
  const { showToast } = useToast();
  const { data: rentals, isLoading } = useRentals();
  const createRental = useCreateRental();
  const updateRental = useUpdateRental();
  const deleteRental = useDeleteRental();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("");

  const { metrics } = useRentalMetrics({
    year: filterYear,
    month: filterMonth,
    day: filterDay ? filterDay.split("-")[2].replace(/^0+/, "") : "all"
  });

  const { control, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty, isValid, isSubmitSuccessful } } = useForm<RentalFormInput>({
    mode: "onChange",
    defaultValues: {
      date: new Date().toISOString().slice(0, 16),
      customer_name: "",
      status: "pending",
      payment_method: "Cash",
      rented_items: [{ item_id: "", item_name: "", quantity: 1, unit_price: 0, amount: 0 }],
      selected_block_id: ""
    }
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: "rented_items"
  });

  const { data: items } = useQuery({
    queryKey: ["catalog_items_minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("id, name, price");
      if (error) throw error;
      return data;
    },
  });

  const { data: blocks } = useQuery({
    queryKey: ["availability_blocks_minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_ranges")
        .select("id, start_date, customer_name, catalog_items(id, name, price)");
      if (error) throw error;
      return data as any[];
    },
  });

  const rentedItemsWatch = watch("rented_items");
  const selectedBlockIdWatch = watch("selected_block_id");

  useEffect(() => {
    rentedItemsWatch.forEach((item, index) => {
      if (item.item_id && items) {
        const matchedItem = items.find(i => i.id === item.item_id);
        if (matchedItem && (!item.item_name || item.item_name !== matchedItem.name)) {
          setValue(`rented_items.${index}.item_name`, matchedItem.name);
          setValue(`rented_items.${index}.unit_price`, matchedItem.price || 0);
          return;
        }
      }

      const currentAmount = item.quantity * item.unit_price;
      if (currentAmount !== item.amount) {
        setValue(`rented_items.${index}.amount`, currentAmount);
      }
    });
  }, [rentedItemsWatch, items, setValue]);

  useEffect(() => {
    if (selectedBlockIdWatch) {
      const block = blocks?.find((b: any) => b.id === selectedBlockIdWatch);
      if (block && block.catalog_items) {
        setValue(`rented_items.0.item_id`, block.catalog_items.id);
        setValue(`rented_items.0.item_name`, block.catalog_items.name);
        setValue(`rented_items.0.unit_price`, block.catalog_items.price || 0);
        setValue(`rented_items.0.quantity`, 1);
        if (block.start_date) {
          setValue("date", new Date(block.start_date).toISOString().slice(0, 16));
        }
        if (block.customer_name) {
          setValue("customer_name", block.customer_name);
        }
      }
    }
  }, [selectedBlockIdWatch, blocks, setValue]);

  const totalAmount = rentedItemsWatch.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleAddSubmit = async (data: RentalFormInput) => {
    try {
      const finalItems = data.rented_items.map(item => {
        if (!item.item_id) return item;
        const matched = items?.find(i => i.id === item.item_id);
        return {
          ...item,
          item_name: matched ? matched.name : item.item_name
        };
      });

      await createRental.mutateAsync({
        date: new Date(data.date).toISOString(),
        customer_name: data.customer_name,
        rented_items: finalItems,
        amount: totalAmount,
        total_income: totalAmount,
        status: data.status,
        payment_method: data.payment_method || null,
      });
      
      showToast({ tone: "success", title: "Success", message: "Rental record added successfully." });
      setIsModalOpen(false);
      reset({
        date: new Date().toISOString().slice(0, 16),
        customer_name: "",
        status: "pending",
        payment_method: "Cash",
        rented_items: [{ item_id: "", item_name: "", quantity: 1, unit_price: 0, amount: 0 }],
        selected_block_id: ""
      });
    } catch (err) {
      console.error(err);
      showToast({ tone: "error", title: "Error", message: "Failed to add record." });
    }
  };

  const handleStatusChange = (id: string, newStatus: RentalStatus) => {
    updateRental.mutate({ id, status: newStatus }, {
      onSuccess: () => showToast({ tone: "success", title: "Updated", message: "Status updated successfully." })
    });
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteRental.mutate(itemToDelete, {
        onSuccess: () => {
          showToast({ tone: "success", title: "Deleted", message: "Record deleted successfully." });
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }
      });
    }
  };

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter(r => {
      // Date filters
      const d = new Date(r.date);
      if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = r.customer_name.toLowerCase().includes(q);
        const matchesTracking = r.tracking_number.toLowerCase().includes(q);
        const itemsList = (r.rented_items as any[]) || [];
        const matchesItem = itemsList.some(i => i.item_name?.toLowerCase().includes(q));
        if (!matchesName && !matchesTracking && !matchesItem) return false;
      }
      return true;
    });
  }, [rentals, filterYear, filterMonth, filterDay, searchQuery]);

  const handleExportExcel = () => {
    const dataToExport = filteredRentals.map((r) => {
      const itemsList = r.rented_items as any[] || [];
      const itemNames = itemsList.map(i => i.item_name).join(", ");
      const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      
      return {
        "Tracking Number": r.tracking_number,
        "Date": new Date(r.date).toLocaleDateString(),
        "Customer Name": r.customer_name,
        "Items": itemNames,
        "Total Qty": totalQty,
        "Total Income": r.total_income,
        "Status": r.status,
        "Payment Method": r.payment_method || "-"
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Sales Data");
    XLSX.writeFile(wb, `SalesTracker_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-accent sm:text-3xl">
            Sales Tracker
          </h1>
          <p className="mt-1 text-pink-950/70">
            Track and manage your rental orders, income, and expenses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-brand-primary/90 hover:shadow-barbie"
        >
          <Icon icon="mdi:plus" className="size-5" />
          Add Record
        </button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 text-brand-primary">
              <Icon icon="mdi:calendar-check" className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-950/60">Total Bookings</p>
              <p className="text-xl font-bold text-brand-accent">{metrics?.totalRentals || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Icon icon="mdi:cash-multiple" className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-950/60">Total Sales / Profit</p>
              <p className="text-xl font-bold text-brand-accent">₱{metrics?.totalProfit?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon icon="mdi:cash-register" className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-950/60">Income This Month</p>
              <p className="text-xl font-bold text-brand-accent">₱{metrics?.totalIncomeThisMonth?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Icon icon="mdi:cash-fast" className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-950/60">Income Today</p>
              <p className="text-xl font-bold text-brand-accent">₱{metrics?.totalIncomeToday?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-pink-100 shadow-soft">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full max-w-sm">
            <Icon
              icon="mdi:magnify"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
            />
            <input
              type="text"
              placeholder="Search tracker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-pink-100 bg-white pl-11 pr-4 text-sm text-pink-950 shadow-sm outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <CustomDropdown
              value={filterYear}
              onChange={setFilterYear}
              options={(() => {
                if (!metrics || !metrics.allRentals) return [{ value: "all", label: "All Years" }];
                const yearsSet = new Set(metrics.allRentals.map(r => new Date(r.date).getFullYear().toString()));
                const yearsArray = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
                return [{ value: "all", label: "All Years" }, ...yearsArray.map(y => ({ value: y, label: y }))];
              })()}
            />
            
            <CustomDropdown
              value={filterMonth}
              onChange={setFilterMonth}
              options={[{ value: "all", label: "All Months" }, ...months]}
            />

            <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-lg pl-3 pr-1 py-1">
              <span className="text-xs font-semibold text-pink-950/60 uppercase tracking-wide">Day:</span>
              <input 
                type="date"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="bg-transparent text-sm font-semibold text-pink-950 outline-none w-full"
              />
              {filterDay && (
                <button onClick={() => setFilterDay("")} className="text-pink-950/40 hover:text-red-500 flex-shrink-0 p-1">
                  <Icon icon="mdi:close-circle" className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex shrink-0 items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all hover:-translate-y-0.5 hover:bg-green-700"
        >
          <Icon icon="mdi:microsoft-excel" className="size-5" />
          Export to XLSX
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-center text-sm text-pink-950/70">
            <thead className="bg-pink-50/50 text-xs font-bold uppercase tracking-wider text-brand-accent">
              <tr>
                <th className="px-4 py-4 text-center">No.</th>
                <th className="px-4 py-4 text-center">Date</th>
                <th className="px-4 py-4 text-center">Customer</th>
                <th className="px-4 py-4 text-center">Items</th>
                <th className="px-4 py-4 text-center">Qty</th>
                <th className="px-4 py-4 text-center text-brand-primary">Total Income</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Method</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-pink-950/50">Loading records...</td>
                </tr>
              ) : filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-pink-950/50">No records found.</td>
                </tr>
              ) : (
                filteredRentals.map((rental) => {
                  const itemsList = rental.rented_items as any[] || [];
                  const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
                  
                  return (
                    <tr key={rental.id} className="transition-colors hover:bg-pink-50/30">
                      <td className="px-4 py-3 font-mono font-medium text-brand-accent text-center">{rental.tracking_number}</td>
                      <td className="px-4 py-3 text-center">{new Date(rental.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-brand-accent text-center">{rental.customer_name}</td>
                      <td className="px-4 py-3 text-center">
                        <ul className="list-none">
                          {itemsList.map((item: any, i: number) => (
                            <li key={i}>{item.item_name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{totalQty}</td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">₱{Number(rental.total_income).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={rental.status}
                          onChange={(e) => handleStatusChange(rental.id, e.target.value as RentalStatus)}
                          className={`rounded-full border px-2 py-1 text-xs font-bold outline-none transition-colors mx-auto ${
                            rental.status === 'paid and verified' ? 'border-green-200 bg-green-50 text-green-700' :
                            rental.status === 'pending' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="unpaid">Unpaid</option>
                          <option value="paid and verified">Paid and Verified</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">{rental.payment_method || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => confirmDelete(rental.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Icon icon="mdi:trash-can-outline" className="size-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Rental Record"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(handleAddSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormSelect
                name="selected_block_id"
                control={control}
                label="Auto-fill from Reserved Date (Optional)"
                placeholder="Select a reservation..."
                options={(blocks || []).map((block: any) => ({
                  value: block.id,
                  label: `${block.start_date ? new Date(block.start_date).toLocaleDateString() : 'No date'} - ${block.catalog_items?.name} ${block.customer_name ? `(${block.customer_name})` : ''}`
                }))}
              />
            </div>
            <FormInput
              name="date"
              control={control}
              type="datetime-local"
              label="Date"
              required
            />
            <FormInput
              name="customer_name"
              control={control}
              label="Customer Name"
              required
            />
          </div>

          <div className="border-t border-pink-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-pink-950">Rented Items</h3>
              <button
                type="button"
                onClick={() => appendItem({ item_id: "", item_name: "", quantity: 1, unit_price: 0, amount: 0 })}
                className="text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
              >
                <Icon icon="mdi:plus" /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {itemFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-pink-50/50 rounded-xl border border-pink-100 relative">
                  {itemFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="absolute top-4 right-4 text-pink-950/40 hover:text-red-500 transition-colors"
                    >
                      <Icon icon="mdi:trash-can-outline" className="size-5" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
                    <div className="sm:col-span-2">
                      <FormSelect
                        name={`rented_items.${index}.item_id`}
                        control={control}
                        label="Catalog Item"
                        placeholder="Select item..."
                        options={(items || []).map(i => ({ value: i.id, label: i.name }))}
                      />
                    </div>
                    
                    <FormInput
                      name={`rented_items.${index}.quantity`}
                      control={control}
                      type="number"
                      label="Quantity"
                      min={1}
                      required
                    />
                    <FormInput
                      name={`rented_items.${index}.unit_price`}
                      control={control}
                      type="number"
                      label="Unit Price"
                      required
                    />
                  </div>
                  <div className="mt-2 text-right text-sm font-semibold text-pink-950">
                    Amount: ₱{Number(rentedItemsWatch[index]?.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-pink-100 pt-6">
            <FormSelect
              name="status"
              control={control}
              label="Status"
              searchable={false}
              options={[
                { value: "pending", label: "Pending" },
                { value: "unpaid", label: "Unpaid" },
                { value: "paid and verified", label: "Paid and Verified" }
              ]}
            />
            <FormSelect
              name="payment_method"
              control={control}
              label="Payment Method"
              searchable={false}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "GCash", label: "GCash" },
                { value: "Maya", label: "Maya" },
                { value: "Seabank", label: "Seabank" },
                { value: "GoTyme", label: "GoTyme" },
                { value: "Bank", label: "Bank" }
              ]}
            />
          </div>

          <div className="flex items-center justify-between border-t border-pink-100 pt-6">
            <div className="text-xl font-bold text-brand-primary">
              Total: ₱{totalAmount.toFixed(2)}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-6 py-3 font-semibold text-pink-950 hover:bg-pink-50 transition-colors"
              >
                Cancel
              </button>
              <FormSubmitButton
                isDirty={isDirty}
                isValid={isValid}
                isSubmitting={isSubmitting}
                isSubmitSuccessful={isSubmitSuccessful}
                defaultText="Save Record"
              />
            </div>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        message="Are you sure you want to delete this sales record? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
