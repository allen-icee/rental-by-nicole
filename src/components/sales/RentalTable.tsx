/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { useRentalBookings, useCreateRentalBooking, useUpdateRentalBooking, useDeleteRentalBooking } from "../../features/sales/useRentalBookings";
import { useRentals } from "../../features/sales/useRentals";
import { parseManilaDate, formatDateManila } from "../../utils/date-utils";
import { useCustomers, useCreateCustomer } from "../../features/customers/useCustomers";
import { calculateDownPayment, calculateEndDate } from "../../utils/sales-calculations";
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

// Helpers for inline edit
function EditableCell({ value, onBlur, type = "text", placeholder = "", min, max, className = "" }: any) {
  const [local, setLocal] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => setLocal(value || ""), [value]);

  const displayValue = () => {
    if (type === "date" && !isEditing && local) {
      const d = new Date(local);
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
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
        let finalVal = local;
        if (type === "number") {
          let num = Number(local);
          if (isNaN(num)) num = value;
          if (min !== undefined && num < min) num = min;
          if (max !== undefined && num > max) num = max;
          finalVal = String(num);
          setLocal(finalVal);
        }
        if (finalVal !== (value || "")) onBlur(finalVal);
      }}
      min={min}
      max={max}
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

function InlineCustomerAutocomplete({ 
  value, 
  onSelect, 
  placeholder 
}: { 
  value: string; 
  onSelect: (name: string, id: string | null) => void;
  placeholder: string;
}) {
  const [local, setLocal] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const { data: customers } = useCustomers();
  const createCustomer = useCreateCustomer();

  useEffect(() => setLocal(value || ""), [value]);

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
        if (local !== value) {
          if (local.trim()) handleSaveNewOrExisting(local.trim());
          else setLocal(value || "");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, local, value]);

  const handleSaveNewOrExisting = async (name: string) => {
    const existing = customers?.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      onSelect(existing.name, existing.id);
    } else {
      try {
        const newC = await createCustomer.mutateAsync(name);
        onSelect(newC.name, newC.id);
      } catch {
        onSelect(name, null);
      }
    }
    setIsOpen(false);
  };

  const filtered = Array.from(new Map((customers?.filter(c => c.name.toLowerCase().includes(local.toLowerCase())) || []).map(c => [c.name.toLowerCase(), c])).values());

  const menu = isOpen && rect ? (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 200), zIndex: 99999 }}
      className="max-h-64 overflow-y-auto flex flex-col bg-white border border-pink-100 shadow-barbie rounded-xl p-1"
      data-lenis-prevent="true"
    >
      {filtered.map(c => (
        <div
          key={c.id}
          onClick={() => {
            setLocal(c.name);
            onSelect(c.name, c.id);
            setIsOpen(false);
          }}
          className="flex items-center gap-2 p-2 text-xs hover:bg-pink-50 cursor-pointer rounded-lg"
        >
          <span>{c.name}</span>
        </div>
      ))}
      {local.trim() && !filtered.find(c => c.name.toLowerCase() === local.toLowerCase()) && (
        <div
          onClick={() => handleSaveNewOrExisting(local.trim())}
          className="flex items-center gap-2 p-2 text-xs text-brand-primary font-semibold hover:bg-pink-50 cursor-pointer rounded-lg"
        >
          <Icon icon="mdi:plus" /> Create "{local}"
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveNewOrExisting(local.trim());
          }
        }}
        className="w-full bg-transparent border border-transparent hover:border-pink-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent px-2 py-1 text-xs rounded outline-none transition-all"
      />
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

function InlineSearchableSelect({ value, onChange, options, placeholder, isMissing }: { value: string | null; onChange: (v: string | null) => void; options: {id: string, name: string}[]; placeholder: string; isMissing?: boolean; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = () => { if (containerRef.current) setRect(containerRef.current.getBoundingClientRect()); };

  useEffect(() => {
    if (isOpen) {
      updateRect();
      setSearch(""); // Reset search when opened
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

  const selectedOpt = options.find(o => o.id === value);
  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  const menu = isOpen && rect ? (
    <div
      ref={menuRef}
      className="absolute z-[100] w-64 bg-white rounded-xl shadow-barbie border border-pink-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: rect.bottom + 4,
        left: rect.left,
        maxHeight: '300px'
      }}
      data-lenis-prevent="true"
    >
      <div className="p-2 border-b border-pink-50 sticky top-0 bg-white z-10">
        <div className="relative">
          <Icon icon="mdi:magnify" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-pink-950/40 size-4" />
          <input
            type="text"
            autoFocus
            placeholder="Search dress..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-pink-50/50 rounded-lg outline-none focus:ring-2 focus:ring-brand-accent/20 border border-transparent focus:border-brand-accent transition-all"
          />
        </div>
      </div>
      <div className="overflow-y-auto p-1 scrollbar-hide overscroll-contain" data-lenis-prevent="true">
        {filtered.length === 0 ? (
          <div className="p-3 text-center text-xs text-pink-950/50">No dresses found</div>
        ) : (
          filtered.map(o => (
            <div
              key={o.id}
              onClick={() => { onChange(o.id); setIsOpen(false); }}
              className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex justify-between items-center transition-colors ${value === o.id ? 'bg-brand-primary/10 text-brand-accent font-bold' : 'hover:bg-pink-50 text-pink-950'}`}
            >
              <span className="truncate">{o.name}</span>
              {value === o.id && <Icon icon="mdi:check" className="size-3 shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-transparent border ${isMissing ? 'border-red-400 bg-red-50' : 'border-transparent hover:border-pink-200'} focus:border-brand-accent focus:ring-1 focus:ring-brand-accent px-2 py-1 text-xs rounded outline-none transition-all flex items-center justify-between`}
      >
        <span className={`block truncate ${!selectedOpt ? "text-pink-950/40" : ""}`}>
          {selectedOpt ? selectedOpt.name : placeholder}
        </span>
        <Icon icon="mdi:chevron-down" className="size-3 opacity-50 shrink-0 ml-1" />
      </button>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

function InlineSizeSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  isMissing,
  onWarningOverride
}: { 
  value: string | null; 
  onChange: (v: string | null) => void; 
  options: {id: string, size_label: string, isReserved: boolean, overlapMsg?: string}[]; 
  placeholder: string; 
  isMissing?: boolean;
  onWarningOverride: (sizeId: string, msg: string) => void;
}) {
  return (
    <select 
      value={value || ""} 
      onChange={(e) => {
        const val = e.target.value;
        const opt = options.find(o => o.id === val);
        if (opt?.isReserved) {
          onWarningOverride(val, opt.overlapMsg || "This size is already reserved for these dates.");
        } else {
          onChange(val || null);
        }
      }}
      className={`w-full bg-transparent outline-none border ${isMissing ? 'border-red-400 bg-red-50' : 'border-transparent hover:border-pink-200'} rounded px-1 py-1 text-xs`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => (
        <option key={o.id} value={o.id}>
          {o.size_label} {o.isReserved ? `(Reserved)` : ''}
        </option>
      ))}
    </select>
  );
}

function InlineAccessoriesSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: any[]; 
  onChange: (v: any[]) => void; 
  options: {id: string, name: string, price: number}[]; 
  placeholder: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const [search, setSearch] = useState("");

  const updateRect = () => { if (containerRef.current) setRect(containerRef.current.getBoundingClientRect()); };

  useEffect(() => {
    if (isOpen) {
      updateRect();
      setSearch("");
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

  const handleToggle = (opt: {id: string, name: string, price: number}) => {
    const exists = value.find(v => v.id === opt.id);
    if (exists) {
      onChange(value.filter(v => v.id !== opt.id));
    } else {
      onChange([...value, { id: opt.id, name: opt.name, price: opt.price || 0 }]);
    }
  };

  const handleAddCustom = () => {
    if (!customName.trim() || isNaN(Number(customPrice)) || Number(customPrice) < 0) return;
    onChange([...value, { name: customName.trim(), price: Number(customPrice) }]);
    setCustomName("");
    setCustomPrice("");
  };

  const handleRemoveCustom = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const selectedLabels = value.map(v => v.name);
  const filteredOptions = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  const menu = isOpen && rect ? (
    <div 
      ref={menuRef}
      style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 250), zIndex: 99999 }}
      className="max-h-[28rem] flex flex-col bg-white border border-pink-100 shadow-barbie rounded-xl p-2 gap-2" 
      data-lenis-prevent="true"
    >
      <div className="font-semibold text-xs text-brand-accent px-1 flex items-center justify-between">
        Catalog Accessories
      </div>
      <div className="px-1">
        <div className="relative">
          <Icon icon="mdi:magnify" className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-950/40 size-3.5" />
          <input
            type="text"
            autoFocus
            placeholder="Search accessories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-[10px] bg-pink-50/50 rounded-lg outline-none focus:ring-1 focus:ring-brand-accent/20 border border-pink-100 focus:border-brand-accent transition-all"
          />
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto border-b border-pink-50 pb-2 overscroll-contain" data-lenis-prevent="true">
        {filteredOptions.length === 0 ? (
          <div className="p-2 text-center text-[10px] text-pink-950/50">No accessories found</div>
        ) : (
          filteredOptions.map(opt => {
            const isSelected = !!value.find(v => v.id === opt.id);
            return (
              <div 
                key={opt.id} 
                onClick={() => handleToggle(opt)}
                className="flex items-center gap-2 p-1.5 text-xs hover:bg-pink-50 cursor-pointer rounded-lg"
              >
                <div className={`size-3 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-accent border-brand-accent' : 'border-pink-200'}`}>
                  {isSelected && <Icon icon="mdi:check" className="size-2 text-white" />}
                </div>
                <span className="truncate flex-1">{opt.name}</span>
                <span className="text-pink-950/50">₱{opt.price || 0}</span>
              </div>
            )
          })
        )}
      </div>

      <div className="font-semibold text-xs text-brand-accent px-1 mt-1">Custom Accessories</div>
      <div className="flex gap-2 items-center">
        <input type="text" placeholder="Name" value={customName} onChange={e => setCustomName(e.target.value)} className="flex-1 w-full text-xs p-1.5 outline-none border border-pink-100 rounded focus:border-brand-accent" />
        <input type="number" min={0} placeholder="Price" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="w-16 text-xs p-1.5 outline-none border border-pink-100 rounded focus:border-brand-accent" />
        <button onClick={handleAddCustom} className="bg-brand-primary text-white p-1.5 rounded hover:bg-brand-primary/90"><Icon icon="mdi:plus" /></button>
      </div>

      {value.filter(v => !v.id).map((v, i) => (
        <div key={`custom-${i}`} className="flex items-center gap-2 p-1.5 text-xs bg-pink-50 rounded-lg">
          <span className="truncate flex-1">{v.name}</span>
          <span className="text-pink-950/70">₱{v.price}</span>
          <button onClick={() => handleRemoveCustom(value.findIndex(val => val === v))} className="text-red-400 hover:text-red-600"><Icon icon="mdi:close" /></button>
        </div>
      ))}
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

function InlineColorSelect({ 
  value, 
  onChange, 
  options, 
  getColor 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  options: string[]; 
  getColor: (v: string) => string; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = () => { if (containerRef.current) setRect(containerRef.current.getBoundingClientRect()); };

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

  const menu = isOpen && rect ? (
    <div
      ref={menuRef}
      className="absolute z-[100] w-48 bg-white rounded-xl shadow-barbie border border-pink-100 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: rect.bottom + 4,
        left: rect.left,
        maxHeight: '300px'
      }}
      data-lenis-prevent="true"
    >
      <div className="overflow-y-auto scrollbar-hide overscroll-contain flex flex-col gap-1" data-lenis-prevent="true">
        {options.map(o => {
          const isSelected = value === o;
          return (
            <div
              key={o}
              onClick={() => { onChange(o); setIsOpen(false); }}
              className="px-2 py-1.5 cursor-pointer hover:bg-gray-50 flex items-center transition-colors"
            >
              <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold inline-flex items-center gap-2 ${getColor(o)}`}>
                 <span>{o}</span>
                 {isSelected && <Icon icon="mdi:check" className="size-3 shrink-0" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border border-transparent hover:border-pink-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent px-1 py-1 text-xs rounded outline-none transition-all flex items-center justify-between font-semibold ${getColor(value)}`}
      >
        <span className="block truncate">
          {value}
        </span>
        <Icon icon="mdi:chevron-down" className="size-3 opacity-50 shrink-0 ml-1" />
      </button>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

function computeAutoStatus(status: string, startDate: string, endDate: string | null | undefined): string {
  if (status === "Cancelled" || status === "Returned") return status;

  const today = new Date().toISOString().slice(0, 10);

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

  // Automatic State Machine Evaluation
  useEffect(() => {
    if (!rentals) return;
    rentals.forEach((r) => {
      const newStatus = computeAutoStatus(r.status, r.startDate, r.endDate);
      if (newStatus !== r.status && r.id) {
        updateRental.mutate({ id: r.id, status: newStatus as any });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentals]);

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

    // Auto-calculate end date
    if (field === 'startDate') {
      const sDate = val;
      updates.endDate = calculateEndDate(sDate as string, 2);
    }

    // Auto-calculate financial fields
    const newDressId = field === 'dressId' ? val : rental.dressId;
    const newAccs = field === 'accessories' ? val : (rental.accessories || []);
    
    const dressPrice = newDressId ? (dresses.find(d => d.id === newDressId)?.price || 0) : 0;
    const accsCost = (newAccs as any[]).reduce((sum, a) => sum + (a.price || 0), 0);
    
    // Total is strictly Dress Price + Accessory Total
    const subtotal = dressPrice + accsCost;
    updates.subtotal = subtotal;
    updates.total = subtotal;

    if (field === 'dressId' || field === 'accessories') {
      updates.downPayment = calculateDownPayment(subtotal);
    }

    updateRental.mutate({ id, ...updates });
  };

  const handleInlineUpdate = async (id: string, field: string, val: any, rental: RentalBooking) => {
    // Collision detection
    if (field === 'dressId' || field === 'startDate' || field === 'endDate') {
      const sDate = field === 'startDate' ? val : rental.startDate;
      const newDressId = field === 'dressId' ? val : rental.dressId;
      const eDate = field === 'endDate' ? val : (field === 'startDate' ? calculateEndDate(sDate as string, 2) : rental.endDate);

      if (newDressId) {
        const { data: overlapping } = await supabase
          .from('rental_bookings')
          .select('id, start_date, end_date')
          .eq('dress_id', newDressId)
          .neq('id', id)
          .neq('status', 'Cancelled')
          .neq('status', 'Returned')
          .lte('start_date', eDate)
          .gte('end_date', sDate);
        
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
      subtotal: 0,
      downPayment: 0,
      securityDeposit: 200,
      damageCharge: 0,
      lateFee: 0,
      refundAmount: 200,
      total: 0,
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
                      <InlineColorSelect 
                        value={rental.status || "Reserved"} 
                        onChange={(v) => handleInlineUpdate(rental.id as string, "status", v, rental)}
                        options={["Pending", "Reserved", "Ready for Pickup", "Picked Up", "Due Today", "Overdue", "Returned", "Cancelled"]}
                        getColor={getStatusColor}
                      />
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
