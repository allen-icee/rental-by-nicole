import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";

type FormTextareaProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  rules?: Omit<RegisterOptions<T, Path<T>>, "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate">;
};

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  placeholder,
  required,
  maxLength,
  rows = 4,
  rules
}: FormTextareaProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: {
      required: required ? "This field is required" : false,
      maxLength: maxLength ? { value: maxLength, message: `Maximum ${maxLength} characters` } : undefined,
      ...rules
    }
  });

  const valueLength = value ? String(value).length : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-bold text-pink-950 flex items-center gap-1">
          {label}
          {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
        </label>
        {maxLength && (
          <span className={`text-xs font-semibold ${valueLength >= maxLength ? "text-brand-primary" : "text-pink-950/40"}`}>
            {valueLength}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative group">
        <textarea
          id={name}
          ref={ref}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          className={`w-full rounded-xl border-2 bg-white/50 px-4 py-3 text-sm text-pink-950 shadow-sm outline-none transition-all duration-300 placeholder:text-pink-950/30 focus:bg-white focus:shadow-soft resize-y min-h-[100px] ${
            error 
              ? "border-red-400 focus:border-red-500" 
              : "border-pink-100 hover:border-pink-200 focus:border-brand-primary"
          }`}
        />
        {error && (
          <div className="absolute right-3 top-3 text-red-500 pointer-events-none">
            <Icon icon="mdi:alert-circle" className="size-5" />
          </div>
        )}
      </div>

      <div className="min-h-[20px]">
        {error ? (
          <p className="text-xs font-semibold text-red-500 mt-0.5 flex items-center gap-1">
            {error.message}
          </p>
        ) : helperText ? (
          <p className="text-xs font-medium text-pink-950/60 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
