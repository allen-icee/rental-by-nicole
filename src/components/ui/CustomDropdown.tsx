// src/components/ui/CustomDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

type Option = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export function CustomDropdown({ value, onChange, options, placeholder = "Select...", className = "" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative min-w-[140px] ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-pink-100 bg-pink-50 px-3 py-1.5 text-sm font-semibold outline-none transition-all hover:border-brand-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 text-pink-950"
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon 
          icon="mdi:chevron-down" 
          className={`size-4 text-pink-950/40 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-primary" : ""}`} 
        />
      </button>

      <div
        className={`absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-pink-100 bg-white shadow-barbie transition-all duration-200 origin-top ${
          isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-h-60 overflow-y-auto p-1 scrollbar-hide" data-lenis-prevent="true">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-pink-950/50 text-center">
              No options
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  value === opt.value
                    ? "bg-brand-primary/10 text-brand-accent font-bold"
                    : "text-pink-950 hover:bg-pink-50"
                }`}
              >
                {opt.label}
                {value === opt.value && (
                  <Icon icon="mdi:check" className="size-4 text-brand-primary" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
