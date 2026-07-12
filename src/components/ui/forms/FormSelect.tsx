import { useState, useRef, useEffect } from "react";
import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";

type Option = {
  value: string | number;
  label: string;
};

type FormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  getColor?: (value: string) => string;
  rules?: Omit<RegisterOptions<T, Path<T>>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
};

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  helperText,
  placeholder = "Select an option",
  required,
  rules,
  searchable = true,
  getColor
}: FormSelectProps<T>) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: {
      required: required ? "This field is required" : false,
      ...rules
    } as Omit<RegisterOptions<T, Path<T>>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.value !== "" && opt.label.toLowerCase().includes(search.toLowerCase())
  );

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
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
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
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let menuStyle: React.CSSProperties = {};
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = 260; // rough max height
    
    const isUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    
    menuStyle = {
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      maxHeight: `${menuHeight}px`,
      zIndex: 9999
    };

    if (isUp) {
      menuStyle.bottom = window.innerHeight - rect.top + 4;
    } else {
      menuStyle.top = rect.bottom + 4;
    }
  }

  const selectedColorClass = getColor && value ? getColor(value as string) : "";

  const menu = isOpen && rect ? (
    <div
      ref={menuRef}
      className="overflow-hidden rounded-xl border border-pink-100 bg-white shadow-barbie animate-in fade-in zoom-in-95 duration-100 flex flex-col"
      style={menuStyle}
      data-lenis-prevent="true"
    >
      {searchable && (
        <div className="p-2 border-b border-pink-50 bg-pink-50/30 shrink-0">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-950/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white rounded-lg border border-pink-100 py-2 pl-9 pr-3 text-sm text-pink-950 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="overflow-y-auto p-1 scrollbar-hide overscroll-contain" data-lenis-prevent="true">
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-3 text-sm text-pink-950/50 text-center">
            No options found
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = value === opt.value;
            const itemColorClass = getColor ? getColor(opt.value as string) : "";
            
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors mb-1 last:mb-0 ${
                  isSelected
                    ? (getColor ? itemColorClass : "bg-brand-primary/10 text-brand-accent font-bold")
                    : (getColor ? `hover:bg-pink-50 text-pink-950 ${itemColorClass}` : "text-pink-950 hover:bg-pink-50")
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Icon icon="mdi:check" className={`size-4 ${getColor ? '' : 'text-brand-primary'}`} />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-pink-950 flex items-center gap-1">
        {label}
        {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
      </label>

      <div className="relative">
        <button
          ref={containerRef}
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearch("");
          }}
          onBlur={onBlur}
          className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm shadow-sm outline-none transition-all duration-300 focus:shadow-soft ${
            selectedColorClass ? `${selectedColorClass} border-transparent` : 'bg-white/50 focus:bg-white'
          } ${
            error 
              ? "border-red-400 focus:border-red-500 text-pink-950" 
              : (!selectedColorClass ? "border-pink-100 hover:border-pink-200 focus:border-brand-primary text-pink-950" : "")
          }`}
        >
          <span className={`block truncate ${!selectedOption && !selectedColorClass ? "text-pink-950/40" : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icon 
            icon="mdi:chevron-down" 
            className={`size-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${selectedColorClass ? "opacity-60" : "text-pink-950/40"}`} 
          />
        </button>

        {menu && createPortal(menu, document.body)}
      </div>

      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
              {error.message}
            </p>
          ) : (
            <p className="text-xs font-medium text-pink-950/60">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
