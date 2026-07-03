// src/components/ui/forms/FormMultiSelect.tsx
import { useState, useRef, useEffect } from "react";
import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";

type Option = {
  value: string;
  label: string;
};

type FormMultiSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  rules?: Omit<RegisterOptions<T, Path<T>>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
};

export function FormMultiSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  helperText,
  placeholder = "Select options",
  required,
  rules,
  searchable = true
}: FormMultiSelectProps<T>) {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure value is always an array of strings
  const currentValues: string[] = Array.isArray(value) ? value : [];
  
  const selectedOptions = options.filter(opt => currentValues.includes(opt.value));
  
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (currentValues.includes(optionValue)) {
      onChange(currentValues.filter(v => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
    if (!searchable) {
      setIsOpen(false);
    } else {
      inputRef.current?.focus();
    }
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(currentValues.filter(v => v !== optionValue));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      <label className="text-sm font-bold text-pink-950 flex items-center gap-1">
        {label}
        {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
      </label>

      <div className="relative">
        <div
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && searchable) {
              setTimeout(() => inputRef.current?.focus(), 10);
            } else {
              setSearch("");
            }
          }}
          onBlur={onBlur}
          className={`w-full min-h-[48px] flex flex-wrap items-center gap-2 rounded-xl border-2 bg-white/50 px-3 py-2 text-sm shadow-sm outline-none transition-all duration-300 focus-within:bg-white focus-within:shadow-soft cursor-pointer ${
            error 
              ? "border-red-400 focus-within:border-red-500 text-pink-950" 
              : "border-pink-100 hover:border-pink-200 focus-within:border-brand-primary text-pink-950"
          }`}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map(opt => (
              <span 
                key={opt.value} 
                className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary font-semibold px-2 py-1 rounded-md text-xs"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => removeOption(e, opt.value)}
                  className="hover:text-red-500 transition-colors ml-1"
                >
                  <Icon icon="mdi:close" className="size-3" />
                </button>
              </span>
            ))
          ) : !searchable ? (
            <span className="text-pink-950/40 px-1 py-1">{placeholder}</span>
          ) : null}

          {searchable && (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              className="flex-1 min-w-[60px] bg-transparent outline-none text-pink-950 placeholder-pink-950/40 px-1 py-1"
              placeholder={selectedOptions.length === 0 ? placeholder : ""}
            />
          )}

          <div className="ml-auto pl-2">
            <Icon 
              icon="mdi:chevron-down" 
              className={`size-5 text-pink-950/40 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-primary" : ""}`} 
            />
          </div>
        </div>

        <div
          className={`absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-pink-100 bg-white shadow-barbie transition-all duration-200 origin-top ${
            isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="max-h-60 overflow-y-auto overscroll-contain py-2" data-lenis-prevent="true">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = currentValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleOption(opt.value);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-pink-50 ${
                      isSelected ? "bg-brand-primary/5 text-brand-primary" : "text-pink-950"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Icon icon="mdi:check" className="size-4" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-pink-950/40 text-center italic">
                No options found
              </div>
            )}
          </div>
        </div>
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
