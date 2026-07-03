// src/components/ui/CustomSelect.tsx
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-full border-2 border-pink-100 bg-white py-3 pl-5 pr-4 text-sm font-semibold text-pink-950/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all hover:border-brand-primary"
      >
        <span className="truncate">{value}</span>
        <Icon 
          icon="mdi:chevron-down" 
          className={`size-5 text-pink-950/40 transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border-2 border-pink-100 bg-white p-1 shadow-barbie" data-lenis-prevent="true">
          {options.map((option, index) => (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                value === option 
                  ? "bg-brand-background text-brand-primary" 
                  : "text-pink-950/70 hover:bg-pink-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
