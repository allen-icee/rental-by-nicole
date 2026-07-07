// src/components/ui/forms/FormSelect.tsx
import { useState, useRef, useEffect } from "react";
import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";

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
  placement?: "top" | "bottom";
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
  placement = "bottom"
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.value !== "" && opt.label.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      <label className="text-sm font-bold text-pink-950 flex items-center gap-1">
        {label}
        {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearch("");
          }}
          onBlur={onBlur}
          className={`w-full flex items-center justify-between rounded-xl border-2 bg-white/50 px-4 py-3 text-sm shadow-sm outline-none transition-all duration-300 focus:bg-white focus:shadow-soft ${
            error 
              ? "border-red-400 focus:border-red-500 text-pink-950" 
              : "border-pink-100 hover:border-pink-200 focus:border-brand-primary text-pink-950"
          }`}
        >
          <span className={`block truncate ${!selectedOption ? "text-pink-950/40" : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icon 
            icon="mdi:chevron-down" 
            className={`size-5 text-pink-950/40 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-primary" : ""}`} 
          />
        </button>

        <div
          className={`absolute z-[100] w-full overflow-hidden rounded-xl border border-pink-100 bg-white shadow-barbie transition-all duration-200 ${
            isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
          } ${placement === "top" ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"}`}
        >
          {searchable && (
            <div className="p-2 border-b border-pink-50 bg-pink-50/30">
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

          <div className="max-h-60 overflow-y-auto p-1 scrollbar-hide">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-pink-950/50 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors ${
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
