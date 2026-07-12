/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useFittings, useCreateFitting, useUpdateFitting, useDeleteFitting } from "../../features/sales/useFittings";
import { useCustomers, useCreateCustomer } from "../../features/customers/useCustomers";
import { useToast } from "@/components/ui/toast-context";
import { ConfirmModal } from "@/components/admin/AdminModal";
import { createPortal } from "react-dom";

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
          // Auto create/save on click outside if changed
          if (local.trim()) {
            handleSaveNewOrExisting(local.trim());
          } else {
            setLocal(value || ""); // Revert
          }
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
      // Create new
      try {
        const newC = await createCustomer.mutateAsync(name);
        onSelect(newC.name, newC.id);
      } catch {
        // If error, just use name
        onSelect(name, null);
      }
    }
    setIsOpen(false);
  };

  const filtered = customers?.filter(c => c.name.toLowerCase().includes(local.toLowerCase())) || [];

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

export function getFittingStatusColor(status: string) {
  switch (status) {
    case "Scheduled": return "bg-blue-100 text-blue-800";
    case "Completed": return "bg-green-100 text-green-800";
    case "No Show": return "bg-yellow-100 text-yellow-800";
    case "Cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-50 text-gray-600";
  }
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
              className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer flex justify-between items-center transition-all ${isSelected ? getColor(o) : 'hover:bg-pink-50 text-pink-950'}`}
            >
              <span className="truncate">{o}</span>
              {isSelected && <Icon icon="mdi:check" className="size-3 shrink-0" />}
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
        className={`w-full bg-transparent border border-transparent hover:border-pink-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent px-1 py-1 text-xs rounded outline-none transition-all flex items-center justify-between font-semibold ${getColor(value)}`}
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



export function FittingTable({ filterYear, filterMonth, filterDay, searchQuery }: { filterYear: string, filterMonth: string, filterDay: string, searchQuery: string }) {
  const { showToast } = useToast();
  const { data: fittings, isLoading } = useFittings();
  const createFitting = useCreateFitting();
  const updateFitting = useUpdateFitting();
  const deleteFitting = useDeleteFitting();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

    updateFitting.mutate({ id, ...updates });
  };

  const handleAddInlineRow = async () => {
    const lastNum = fittings?.reduce((max, r) => {
      // In case they are using TRK- or No. prefix
      const match = (r.bookingNumber || "").match(/(\d+)$/);
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
              filteredFittings.map((fitting) => (
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

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete" message="Are you sure you want to delete this fitting record?" onConfirm={handleDelete} />
    </div>
  );
}
