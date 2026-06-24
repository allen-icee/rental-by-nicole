import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";

type FormToggleProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  description?: string;
  required?: boolean;
  rules?: Omit<RegisterOptions<T, Path<T>>, "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate">;
};

export function FormToggle<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  description,
  required,
  rules
}: FormToggleProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: {
      required: required ? "This field is required" : false,
      ...rules
    }
  });

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          ref={ref}
          onBlur={onBlur}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 ${
            value ? "bg-brand-accent" : "bg-pink-200"
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              value ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-pink-950 flex items-center gap-1 cursor-pointer" onClick={() => onChange(!value)}>
            {label}
            {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
          </label>
          {description && (
            <p className="text-xs text-pink-950/60 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="min-h-[20px] pl-14">
        {error ? (
          <p className="text-xs font-semibold text-red-500 mt-0.5 flex items-center gap-1">
            <Icon icon="mdi:alert-circle" className="size-4" />
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
