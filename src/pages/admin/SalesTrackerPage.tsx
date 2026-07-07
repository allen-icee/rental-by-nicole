// src/pages/admin/SalesTrackerPage.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  accessories: RentedItemInput[];
  payment_method: string;
  type: string;
  days: number;
  downpayment: number;
  security_deposit: number;
  delivery_method: string;
};

const currentYear = new Date().getFullYear();
const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }));

// Helper for inline multi select
function InlineMultiSelect({ value, onChange, options, placeholder, allowCustom = false }: { value: string[]; onChange: (v: string[]) => void; options: {value: string, label: string}[]; placeholder: string; allowCustom?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [customText, setCustomText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const updateRect = () => {
    if (containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateRect();
      const handleScroll = () => updateRect();
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const customValues = value.filter(v => v.startsWith("custom-"));
  const selectedLabels = value.map(v => {
    if (v.startsWith("custom-")) return v.replace("custom-", "");
    return options.find(o => o.value === v)?.label;
  }).filter(Boolean);

  const menu = isOpen && rect ? (
    <div 
      ref={menuRef}
      style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 99999 }}
      className="max-h-64 flex flex-col bg-white border border-pink-100 shadow-barbie rounded-xl p-1" 
      data-lenis-prevent="true"
    >
      <div className="p-1 mb-1 border-b border-pink-50 sticky top-0 bg-white z-10 space-y-1">
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full text-xs p-1.5 outline-none border border-pink-100 rounded focus:border-brand-accent bg-gray-50 text-gray-800 placeholder-gray-400"
        />
        {allowCustom && (
          <input 
            type="text" 
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && customText.trim()) {
                e.preventDefault();
                const newId = `custom-${customText.trim()}`;
                if (!value.includes(newId)) onChange([...value, newId]);
                setCustomText("");
              }
            }}
            placeholder="Type and press Enter to add custom..."
            className="w-full text-xs p-1.5 outline-none border border-pink-100 rounded focus:border-brand-accent bg-pink-50/30 text-pink-950 placeholder-pink-300"
          />
        )}
      </div>
      <div className="overflow-y-auto flex-1">
        {options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase())).map(opt => {
          const isSelected = value.includes(opt.value);
          return (
          <div 
            key={opt.value} 
            onClick={() => {
              if (isSelected) onChange(value.filter(v => v !== opt.value));
              else onChange([...value, opt.value]);
            }}
            className="flex items-center gap-2 p-2 text-xs hover:bg-pink-50 cursor-pointer rounded-lg"
          >
            <div className={`size-3 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-accent border-brand-accent' : 'border-pink-200'}`}>
              {isSelected && <Icon icon="mdi:check" className="size-2 text-white" />}
            </div>
            <span className="truncate">{opt.label}</span>
          </div>
        )
      })}
      {customValues.map(v => {
        const label = v.replace("custom-", "");
        return (
          <div 
            key={v} 
            onClick={() => onChange(value.filter(id => id !== v))}
            className="flex items-center gap-2 p-2 text-xs hover:bg-pink-50 cursor-pointer rounded-lg"
          >
            <div className="size-3 rounded border flex items-center justify-center shrink-0 bg-brand-accent border-brand-accent">
              <Icon icon="mdi:check" className="size-2 text-white" />
            </div>
            <span className="truncate">{label}</span>
          </div>
        )
      })}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }} 
        className="w-full min-h-[30px] px-2 py-1 text-xs border border-transparent hover:border-pink-200 rounded text-left flex items-center justify-between"
      >
        <span className="line-clamp-2 leading-tight">{selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}</span>
        <Icon icon="mdi:chevron-down" className="size-3 text-pink-950/40 shrink-0" />
      </button>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

function EditableCell({ value, onBlur, type = "text", placeholder = "", min, className="" }: any) {
  const [local, setLocal] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => setLocal(value || ""), [value]);

  const displayValue = () => {
    if (type === "date" && !isEditing && local) {
      const d = new Date(local);
      return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${String(d.getFullYear()).slice(2)}`;
    }
    return local;
  };

  const input = (
    <input
      type={isEditing && type === "date" ? "date" : type === "date" ? "text" : type}
      value={isEditing || type !== "date" ? local : displayValue()}
      placeholder={placeholder}
      onFocus={() => setIsEditing(true)}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { 
        setIsEditing(false);
        if (local !== (value||"")) onBlur(local); 
      }}
      min={min}
      className={`w-full bg-transparent border border-transparent hover:border-pink-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent px-2 py-1 text-xs rounded outline-none transition-all ${className} ${type === 'date' && !isEditing ? 'pr-6' : ''}`}
    />
  );

  if (type === "date" && !isEditing) {
    return (
      <div className="relative w-full">
        {input}
        <Icon icon="mdi:calendar-blank" className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-pink-950/40 pointer-events-none" />
      </div>
    );
  }

  return input;
}

export function SalesTrackerPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: rentals, isLoading } = useRentals();
  const createRental = useCreateRental();
  const updateRental = useUpdateRental();
  const deleteRental = useDeleteRental();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("all");

  const { metrics } = useRentalMetrics({
    year: filterYear,
    month: filterMonth,
    day: filterDay === "all" || !filterDay ? "all" : (filterDay.split("-")[2]?.replace(/^0+/, "") || "all")
  });

  const { control, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty, isValid, isSubmitSuccessful } } = useForm<RentalFormInput>({
    mode: "onChange",
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      customer_name: "",
      payment_method: "Cash",
      rented_items: [{ item_id: "", item_name: "", quantity: 1, unit_price: 0, amount: 0 }],
      accessories: [],
      type: "Rental",
      days: 2,
      downpayment: 0,
      security_deposit: 200,
      delivery_method: "Pick Up"
    }
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control, name: "rented_items" });
  const { fields: accessoryFields, append: appendAccessory, remove: removeAccessory } = useFieldArray({ control, name: "accessories" });

  const { data: items } = useQuery({
    queryKey: ["catalog_items_minimal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items").select("id, name, price, categories(classification)");
      if (error) throw error;
      return data;
    },
  });

  const { data: blocks } = useQuery({
    queryKey: ["availability_blocks_minimal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("availability_ranges").select("id, start_date, customer_name, catalog_items(id, name, price)");
      if (error) throw error;
      return data as any[];
    },
  });

  const rentedItemsWatch = watch("rented_items");
  const accessoriesWatch = watch("accessories") || [];
  const modalTypeWatch = watch("type");

  useEffect(() => {
    rentedItemsWatch.forEach((item, index) => {
      if (item.item_id && items) {
        const matchedItem = items.find(i => i.id === item.item_id);
        if (matchedItem && (!item.item_name || item.item_name !== matchedItem.name)) {
          setValue(`rented_items.${index}.item_name`, matchedItem.name);
          setValue(`rented_items.${index}.unit_price`, matchedItem.price || 0);
        }
      }
      const currentAmount = item.quantity * item.unit_price;
      if (currentAmount !== item.amount) {
        setValue(`rented_items.${index}.amount`, currentAmount);
      }
    });

    accessoriesWatch.forEach((item, index) => {
      if (item.item_id && items) {
        const matchedItem = items.find(i => i.id === item.item_id);
        if (matchedItem && (!item.item_name || item.item_name !== matchedItem.name)) {
          setValue(`accessories.${index}.item_name`, matchedItem.name);
          setValue(`accessories.${index}.unit_price`, matchedItem.price || 0);
        }
      }
      const currentAmount = item.quantity * item.unit_price;
      if (currentAmount !== item.amount) {
        setValue(`accessories.${index}.amount`, currentAmount);
      }
    });

    const totalItemsPrice = rentedItemsWatch.reduce((sum, item) => sum + (item.amount || 0), 0) + 
                            accessoriesWatch.reduce((sum, item) => sum + (item.amount || 0), 0);
    setValue("downpayment", totalItemsPrice * 0.5);
  }, [rentedItemsWatch, accessoriesWatch, items, setValue]);

  const modalTotalItemPrice = rentedItemsWatch.reduce((sum, item) => sum + (item.amount || 0), 0) + 
                              accessoriesWatch.reduce((sum, item) => sum + (item.amount || 0), 0);
  const modalSecurityDeposit = watch("security_deposit") || 0;
  const modalTotal = modalTypeWatch === "Fitting" ? 150 : (modalTotalItemPrice + Number(modalSecurityDeposit));

  const handleAddSubmit = async (data: RentalFormInput) => {
    try {
      const finalItems = data.rented_items.map(item => {
        if (!item.item_id) return item;
        const matched = items?.find(i => i.id === item.item_id);
        return { ...item, item_name: matched ? matched.name : item.item_name };
      });
      const tIncome = data.type === "Fitting" ? 150 : (modalTotalItemPrice + Number(data.security_deposit));

      const trackingNumber = `TRK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      await createRental.mutateAsync({
        tracking_number: trackingNumber,
        date: new Date(data.date).toISOString(),
        customer_name: data.customer_name,
        rented_items: finalItems,
        amount: tIncome,
        total_income: tIncome,
        status: "paid and verified", // Default since UI no longer handles it
        payment_method: data.payment_method || null,
        type: data.type,
        accessories: (data.accessories || []).filter(i => i.item_id || i.item_name),
        days: data.days,
        downpayment: data.downpayment,
        security_deposit: data.security_deposit,
        delivery_method: data.delivery_method
      });
      
      showToast({ tone: "success", title: "Success", message: "Rental record added successfully." });
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      showToast({ tone: "error", title: "Error", message: "Failed to add record." });
    }
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

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let importedCount = 0;
        for (const row of data as any[]) {
          const tNum = row["No."] || row["Tracking Number"];
          const existing = rentals?.find(r => r.tracking_number === tNum);
          
          const newRec = {
            date: row["Date"] ? new Date(row["Date"]).toISOString() : new Date().toISOString(),
            customer_name: row["Customer"] || "Unknown",
            type: row["F/R"] === "F" || row["Fitting/Rental"] === "Fitting" ? "Fitting" : "Rental",
            accessories: [],
            days: parseInt(row["No. of Days"]) || 2,
            downpayment: parseFloat(row["Downpayment"]) || 0,
            security_deposit: parseFloat(row["Security Deposit"]) || 200,
            payment_method: row["Mode of Payment"] || "Cash",
            delivery_method: row["Method"] || "Pick Up",
            status: "paid and verified" as const,
            rented_items: [],
            amount: parseFloat(row["Total"]) || 0,
            total_income: parseFloat(row["Total"]) || 0,
          };

          if (existing) {
            await supabase.from("rentals").update(newRec as any).eq("id", existing.id);
          } else {
            await supabase.from("rentals").insert([{ ...newRec, tracking_number: tNum || `TRK-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]);
          }
          importedCount++;
        }
        showToast({ tone: "success", title: "Import Successful", message: `Imported ${importedCount} records.` });
        queryClient.invalidateQueries({ queryKey: ["rentals"] });
      } catch (err) {
        showToast({ tone: "error", title: "Import Failed", message: "Error parsing the Excel file." });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportExcel = () => {
    const dataToExport = filteredRentals.map((r) => {
      const itemsList = r.rented_items as any[] || [];
      const itemNames = itemsList.map(i => i.item_name).join(", ");
      
      return {
        "No.": r.tracking_number,
        "Date": new Date(r.date).toLocaleDateString(),
        "Customer": r.customer_name,
        "F/R": r.type,
        "Dress": itemNames,
        "Accessories": (r.accessories as any[] || []).map(i => i.item_name).join(", "),
        "No. of Days": r.days || 2,
        "Downpayment": r.downpayment || 0,
        "Security Deposit": r.security_deposit || 200,
        "Mode of Payment": r.payment_method || "",
        "Method": r.delivery_method || "",
        "Total": r.total_income
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Data");
    XLSX.writeFile(wb, `SalesTracker_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter(r => {
      const d = new Date(r.date);
      if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth !== "all" && (d.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterDay !== "all" && d.getDate().toString() !== filterDay) return false;

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

  // Handle Inline Update
  const handleInlineUpdate = (id: string, field: string, val: any, rental: any) => {
    const updates: any = { [field]: val };
    
    // Auto compute total if dependent fields change
    if (field === 'type' || field === 'security_deposit' || field === 'rented_items') {
      const itemsList = field === 'rented_items' ? val : rental.rented_items;
      const typeVal = field === 'type' ? val : rental.type;
      const secDep = field === 'security_deposit' ? Number(val) : Number(rental.security_deposit || 0);
      
      const itemPriceSum = itemsList.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      const newTotal = typeVal === "Fitting" ? 150 : (itemPriceSum + secDep);
      
      updates.total_income = newTotal;
      updates.amount = newTotal;
      
      // Auto update downpayment if items changed
      if (field === 'rented_items') {
        updates.downpayment = itemPriceSum * 0.5;
      }
    }
    
    updateRental.mutate({ id, ...updates });
  };

  // Add new empty row inline
  const handleAddInlineRow = async () => {
    const lastNum = rentals?.reduce((max, r) => {
      const match = r.tracking_number.match(/^(?:No\.)?(\d+)$/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0) || 0;
    const newTrk = `${lastNum + 1}`;

    await createRental.mutateAsync({
      tracking_number: newTrk,
      date: new Date().toISOString(),
      customer_name: "",
      rented_items: [],
      amount: 200,
      total_income: 200,
      status: "paid and verified",
      type: "Rental",
      accessories: [],
      days: 2,
      downpayment: 0,
      security_deposit: 200,
      delivery_method: "Pick Up",
      payment_method: "Cash"
    });
    showToast({ tone: "success", title: "Row Added", message: "A new blank record was appended." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-accent sm:text-3xl">Sales Tracker</h1>
          <p className="mt-1 text-pink-950/70">Track and manage your rental orders, inline Excel style.</p>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... Stats omitted for brevity ... */}
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 text-brand-primary"><Icon icon="mdi:calendar-check" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Total Bookings</p><p className="text-xl font-bold text-brand-accent">{metrics?.totalRentals || 0}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600"><Icon icon="mdi:cash-multiple" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Total Profit</p><p className="text-xl font-bold text-brand-accent">₱{metrics?.totalProfit?.toLocaleString() || 0}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon icon="mdi:cash-register" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Income This Month</p><p className="text-xl font-bold text-brand-accent">₱{metrics?.totalIncomeThisMonth?.toLocaleString() || 0}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-soft flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Icon icon="mdi:cash-fast" className="size-6" /></div>
          <div><p className="text-sm font-semibold text-pink-950/60">Income Today</p><p className="text-xl font-bold text-brand-accent">₱{metrics?.totalIncomeToday?.toLocaleString() || 0}</p></div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-pink-100 shadow-soft">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative w-full sm:max-w-sm">
            <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5" />
            <input type="text" placeholder="Search tracker..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 w-full rounded-xl border border-pink-100 bg-white pl-11 pr-4 text-sm text-pink-950 shadow-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CustomDropdown value={filterYear} onChange={setFilterYear} options={(() => {
                if (!metrics || !metrics.allRentals) return [{ value: "all", label: "All Years" }];
                const yearsSet = new Set(metrics.allRentals.map(r => new Date(r.date).getFullYear().toString()));
                const yearsArray = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
                return [{ value: "all", label: "All Years" }, ...yearsArray.map(y => ({ value: y, label: y }))];
              })()} className="flex-1 min-w-[120px]" />
            <CustomDropdown value={filterMonth} onChange={setFilterMonth} options={[{ value: "all", label: "All Months" }, ...months]} className="flex-1 min-w-[120px]" />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-3 sm:px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:bg-brand-primary/90 whitespace-nowrap">
            <Icon icon="mdi:plus" className="size-5 shrink-0" /> Add Record
          </button>
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" ref={fileInputRef} onChange={handleImportExcel} />
          <button onClick={() => fileInputRef.current?.click()} title="Import" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 sm:px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:bg-blue-700 shrink-0">
            <Icon icon="mdi:upload" className="size-5 shrink-0" /> <span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={handleExportExcel} title="Export" className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all hover:bg-green-700 shrink-0">
            <Icon icon="mdi:microsoft-excel" className="size-5 shrink-0" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left text-xs text-pink-950/90 whitespace-nowrap">
            <thead className="bg-pink-100/80 font-extrabold uppercase tracking-wider text-brand-accent text-[10px]">
              <tr>
                <th className="px-3 py-3 w-20 border border-pink-100 text-center font-extrabold">No.</th>
                <th className="px-2 py-3 w-32 border border-pink-100 text-center font-extrabold">Date</th>
                <th className="px-2 py-3 w-40 border border-pink-100 text-center font-extrabold">Customer</th>
                <th className="px-2 py-3 w-24 border border-pink-100 text-center font-extrabold">F/R</th>
                <th className="px-2 py-3 w-48 border border-pink-100 text-center font-extrabold">Dress</th>
                <th className="px-2 py-3 w-32 border border-pink-100 text-center font-extrabold">Accessories</th>
                <th className="px-2 py-3 w-20 border border-pink-100 text-center font-extrabold">Days</th>
                <th className="px-2 py-3 w-24 border border-pink-100 text-center font-extrabold">Down P.</th>
                <th className="px-2 py-3 w-24 border border-pink-100 text-center font-extrabold">Sec. Dep.</th>
                <th className="px-2 py-3 w-28 border border-pink-100 text-center font-extrabold">Mode</th>
                <th className="px-2 py-3 w-28 border border-pink-100 text-center font-extrabold">Method</th>
                <th className="px-2 py-3 w-24 text-brand-primary border border-pink-100 text-center font-extrabold">Total</th>
                <th className="px-2 py-3 w-10 border border-pink-100 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {isLoading ? (
                <tr><td colSpan={14} className="px-4 py-8 text-center text-pink-950/50">Loading records...</td></tr>
              ) : filteredRentals.length === 0 ? (
                <tr><td colSpan={14} className="px-4 py-8 text-center text-pink-950/50">No records found.</td></tr>
              ) : (
                filteredRentals.map((rental) => {
                  const rentedItemsList = rental.rented_items as any[] || [];
                  const selectedDressIds = rentedItemsList.map(i => i.item_id);

                  return (
                    <tr key={rental.id} className="transition-colors hover:bg-pink-100/60 even:bg-pink-50 group">
                      <td className="px-3 py-2 border border-pink-100 font-mono font-medium text-brand-accent/70 text-[10px] text-center">{rental.tracking_number}</td>
                      <td className="px-2 py-2 border border-pink-100">
                        <EditableCell 
                          type="date" 
                          value={rental.date ? new Date(rental.date).toISOString().slice(0,10) : ""} 
                          onBlur={(v: string) => handleInlineUpdate(rental.id, "date", v ? new Date(v).toISOString() : new Date().toISOString(), rental)} 
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100">
                        <EditableCell 
                          value={rental.customer_name} 
                          placeholder="e.g. Maria Theresa"
                          onBlur={(v: string) => handleInlineUpdate(rental.id, "customer_name", v, rental)} 
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 flex justify-center items-center h-full min-h-[40px]">
                        <div 
                          className="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 relative"
                          onClick={() => handleInlineUpdate(rental.id, "type", rental.type === "Rental" ? "Fitting" : "Rental", rental)}
                          style={{ backgroundColor: rental.type === "Fitting" ? "#a855f7" : "#ec4899" }}
                          title={rental.type}
                        >
                          <span className="absolute left-1.5 text-[9px] font-bold text-white select-none">F</span>
                          <span className="absolute right-1.5 text-[9px] font-bold text-white select-none">R</span>
                          <div
                            className={"bg-white size-4 rounded-full shadow-md transform transition-transform duration-300 z-10 " + (rental.type === "Fitting" ? "" : "translate-x-6")}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 border border-pink-100 relative">
                        <InlineMultiSelect 
                          value={selectedDressIds} 
                          options={(items || []).filter((i: any) => !i.categories || i.categories.classification === 'Dress').map(i => ({ value: i.id, label: i.name }))}
                          placeholder="Select..."
                          onChange={(newIds) => {
                            const newItems = newIds.map(id => {
                              const match = items?.find(i => i.id === id);
                              return {
                                item_id: id,
                                item_name: match?.name || "",
                                quantity: 1,
                                unit_price: match?.price || 0,
                                amount: match?.price || 0
                              };
                            });
                            handleInlineUpdate(rental.id, "rented_items", newItems, rental);
                          }}
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 relative">
                        <InlineMultiSelect 
                          value={(rental.accessories as any[] || []).map(i => i.item_id)} 
                          options={(items || []).filter((i: any) => i.categories?.classification === 'Accessory').map(i => ({ value: i.id, label: i.name }))}
                          placeholder="Select..."
                          allowCustom={true}
                          onChange={(newIds) => {
                            const newItems = newIds.map(id => {
                              const match = items?.find(i => i.id === id);
                              return {
                                item_id: id,
                                item_name: match?.name || "",
                                quantity: 1,
                                unit_price: match?.price || 0,
                                amount: match?.price || 0
                              };
                            });
                            handleInlineUpdate(rental.id, "accessories", newItems, rental);
                          }}
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 text-center">
                        <EditableCell 
                          type="number" min={1} 
                          value={rental.days || 2} 
                          onBlur={(v: string) => handleInlineUpdate(rental.id, "days", Number(v), rental)} 
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 text-center">
                        <EditableCell 
                          type="number" min={0} 
                          value={rental.downpayment || 0} 
                          onBlur={(v: string) => handleInlineUpdate(rental.id, "downpayment", Number(v), rental)} 
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 text-center">
                        <EditableCell 
                          type="number" min={0} 
                          value={rental.security_deposit || 0} 
                          onBlur={(v: string) => handleInlineUpdate(rental.id, "security_deposit", Number(v), rental)} 
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 text-center">
                        <select 
                          value={rental.payment_method || ""} 
                          onChange={(e) => handleInlineUpdate(rental.id, "payment_method", e.target.value, rental)}
                          className="w-full bg-transparent outline-none border border-transparent hover:border-pink-200 rounded px-1 py-1"
                        >
                          <option value="Cash">Cash</option>
                          <option value="GCash">GCash</option>
                          <option value="BDO">BDO</option>
                          <option value="Bank">Bank</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 border border-pink-100 text-center">
                        <select 
                          value={rental.delivery_method || ""} 
                          onChange={(e) => handleInlineUpdate(rental.id, "delivery_method", e.target.value, rental)}
                          className="w-full bg-transparent outline-none border border-transparent hover:border-pink-200 rounded px-1 py-1"
                        >
                          <option value="Pick Up">Pick Up</option>
                          <option value="Meet Up">Meet Up</option>
                          <option value="J&T">J&T</option>
                          <option value="Lalamove">Lalamove</option>
                          <option value="Grab">Grab</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 font-bold text-green-600 border border-pink-100 text-center">
                        ₱<EditableCell 
                          type="number" min={0} 
                          value={rental.total_income || 0} 
                          onBlur={(v: string) => handleInlineUpdate(rental.id, "total_income", Number(v), rental)} 
                        />
                      </td>
                      <td className="px-2 py-2 border border-pink-100 text-center">
                        <button onClick={() => confirmDelete(rental.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Icon icon="mdi:trash-can-outline" className="size-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <button onClick={handleAddInlineRow} className="w-full py-2 text-xs font-semibold text-brand-primary hover:bg-pink-50 flex items-center justify-center gap-1 border-t border-pink-50">
            <Icon icon="mdi:plus" /> Add Empty Row
          </button>
        </div>
      </div>

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Rental Record" maxWidth="2xl">
        <form onSubmit={handleSubmit(handleAddSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormInput name="customer_name" control={control} label="Customer Name" placeholder="e.g. Maria Theresa" required />
            </div>
            <FormInput name="date" control={control} type="date" label="Date" required />
            <FormSelect name="type" control={control} label="Type (Fitting/Rental)" searchable={false} options={[{value: "Rental", label: "Rental"}, {value: "Fitting", label: "Fitting"}]} />
          </div>

          <div className="border-t border-pink-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-pink-950">Rented Dresses</h3>
            </div>
            <div className="space-y-3">
              {itemFields.map((field, index) => (
                <div key={field.id} className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 flex items-end gap-3 relative">
                  {itemFields.length > 1 && <button type="button" onClick={() => removeItem(index)} title="Remove Dress" className="absolute -top-3 -right-3 bg-white rounded-full p-2 text-red-500 shadow-sm border border-pink-100 hover:bg-red-50"><Icon icon="mdi:trash-can-outline" className="size-4" /></button>}
                  <div className="flex-1">
                    <FormSelect name={`rented_items.${index}.item_id`} control={control} label="Select Dress" placeholder="Search dress..." options={(items || []).filter((i: any) => !i.categories || i.categories.classification === 'Dress').map(i => ({ value: i.id, label: i.name }))} />
                  </div>
                  <div className="text-xs font-bold text-brand-accent pb-2 w-20 text-right">
                    ₱{Number(rentedItemsWatch[index]?.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => appendItem({ item_id: "", item_name: "", quantity: 1, unit_price: 0, amount: 0 })} className="mt-4 w-full py-2 text-xs font-semibold text-brand-primary bg-pink-50/50 hover:bg-pink-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-dashed border-pink-200"><Icon icon="mdi:plus" className="size-4" /> Add Another Dress</button>
          </div>

          <div className="border-t border-pink-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-pink-950">Rented Accessories</h3>
            </div>
            <div className="space-y-3">
              {accessoryFields.map((field, index) => (
                <div key={field.id} className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 flex items-end gap-3 relative">
                  <button type="button" onClick={() => removeAccessory(index)} title="Remove Accessory" className="absolute -top-3 -right-3 bg-white rounded-full p-2 text-red-500 shadow-sm border border-pink-100 hover:bg-red-50"><Icon icon="mdi:trash-can-outline" className="size-4" /></button>
                  <div className="flex-1">
                    <FormSelect name={`accessories.${index}.item_id`} control={control} label="Select Accessory" placeholder="Search accessory..." options={(items || []).filter((i: any) => i.categories?.classification === 'Accessory').map(i => ({ value: i.id, label: i.name }))} />
                  </div>
                  <div className="text-xs font-bold text-brand-accent pb-2 w-20 text-right">
                    ₱{Number(accessoriesWatch[index]?.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => appendAccessory({ item_id: "", item_name: "", quantity: 1, unit_price: 0, amount: 0 })} className="mt-4 w-full py-2 text-xs font-semibold text-brand-primary bg-pink-50/50 hover:bg-pink-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-dashed border-pink-200"><Icon icon="mdi:plus" className="size-4" /> Add Accessory</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-pink-100 pt-6">
            <FormInput name="days" control={control} type="number" min={1} label="Days" />
            <FormInput name="downpayment" control={control} type="number" min={0} label="Downpayment" />
            <FormInput name="security_deposit" control={control} type="number" min={0} label="Security Deposit" />
            <FormSelect name="delivery_method" control={control} label="Method" searchable={false} placement="top" options={[{value:"Pick Up", label:"Pick Up"}, {value:"Meet Up", label:"Meet Up"}, {value:"J&T", label:"J&T"}]} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-pink-100 pt-6 pb-20">
            <FormSelect name="payment_method" control={control} label="Payment Method" searchable={false} placement="top" options={[{ value: "Cash", label: "Cash" }, { value: "GCash", label: "GCash" }, { value: "BDO", label: "BDO" }, { value: "Bank", label: "Bank" }]} />
          </div>

          <div className="flex items-center justify-between border-t border-pink-100 pt-6">
            <div className="text-xl font-bold text-brand-primary">Total: ₱{modalTotal.toFixed(2)}</div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3 font-semibold text-pink-950 hover:bg-pink-50 transition-colors">Cancel</button>
              <FormSubmitButton isDirty={isDirty} isValid={isValid} isSubmitting={isSubmitting} isSubmitSuccessful={isSubmitSuccessful} defaultText="Save Record" />
            </div>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete" message="Are you sure you want to delete this sales record?" onConfirm={handleDelete} />
    </div>
  );
}
