/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useCustomers, useCreateCustomer } from "../../../features/customers/useCustomers";
import { formatDateManila } from "../../../utils/date-utils";

export function EditableCell({ value, onBlur, type = "text", placeholder = "", min, max, className = "" }: any) {
  const [local, setLocal] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => setLocal(value || ""), [value]);

  const displayValue = () => {
    if (type === "date" && !isEditing && local) {
      return formatDateManila(local, "MM/dd/yy");
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
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
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

export function InlineCustomerAutocomplete({ 
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

export function InlineSearchableSelect({ value, onChange, options, placeholder, isMissing }: { value: string | null; onChange: (v: string | null) => void; options: {id: string, name: string}[]; placeholder: string; isMissing?: boolean; }) {
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

export function InlineSizeSelect({ 
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

export function InlineAccessoriesSelect({ 
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

export function InlineColorSelect({ 
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
