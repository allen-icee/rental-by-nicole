// src/components/ui/forms/FormInput.tsx
import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number" | "email" | "password" | "url" | "date" | "datetime-local";
  maxLength?: number;
  min?: number;
  max?: number;
  rules?: Omit<RegisterOptions<T, Path<T>>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
};

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  placeholder,
  required,
  type = "text",
  maxLength,
  min,
  max,
  rules
}: FormInputProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: {
      required: required ? "This field is required" : false,
      maxLength: maxLength ? { value: maxLength, message: `Maximum ${maxLength} characters` } : undefined,
      min: min !== undefined ? { value: min, message: `Minimum value is ${min}` } : undefined,
      max: max !== undefined ? { value: max, message: `Maximum value is ${max}` } : undefined,
      ...rules
    } as Omit<RegisterOptions<T, Path<T>>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">
  });

  const valueLength = value ? String(value).length : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-bold text-pink-950 flex items-center gap-1">
          {label}
          {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
        </label>
        {type === "text" && maxLength && (
          <span className={`text-xs font-semibold ${valueLength >= maxLength ? "text-brand-primary" : "text-pink-950/40"}`}>
            {valueLength}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative group">
        <input
          id={name}
          type={type}
          ref={ref}
          value={value ?? ""}
          onChange={(e) => {
            const val = type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value;
            onChange(val);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-xl border-2 bg-white/50 px-4 py-3 text-sm text-pink-950 shadow-sm outline-none transition-all duration-300 placeholder:text-pink-950/30 focus:bg-white focus:shadow-soft ${
            error 
              ? "border-red-400 focus:border-red-500" 
              : "border-pink-100 hover:border-pink-200 focus:border-brand-primary"
          }`}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <Icon icon="mdi:alert-circle" className="size-5" />
          </div>
        )}
      </div>

      {(error || helperText || (type === "number" && (min !== undefined || max !== undefined))) && (
        <div className="mt-1">
          {error ? (
            <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
              {error.message}
            </p>
          ) : (
            <p className="text-xs font-medium text-pink-950/60">
              {helperText}
              {type === "number" && (min !== undefined || max !== undefined) && (
                <span className="block mt-0.5">
                  Valid range: {min !== undefined ? min : "-∞"} to {max !== undefined ? max : "∞"}
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
