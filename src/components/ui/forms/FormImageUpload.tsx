import { useState, useRef } from "react";
import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";

type FormImageUploadProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  dropzoneText?: string;
  required?: boolean;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  rules?: Omit<RegisterOptions<T, Path<T>>, "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate">;
};

export function FormImageUpload<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  dropzoneText = "Drag and drop or click to upload",
  required,
  acceptedFileTypes = "image/png, image/jpeg, image/webp",
  maxSizeMB = 5,
  rules
}: FormImageUploadProps<T>) {
  const {
    field: { onChange, value },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: {
      required: required ? "This field is required" : false,
      ...rules
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // value can be a string (URL) or a File object
  const previewUrl = (value as any) instanceof File ? URL.createObjectURL(value as any) : typeof value === "string" ? value : null;
  const fileName = (value as any) instanceof File ? (value as any).name : typeof value === "string" && value ? value.split("/").pop() : null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB`);
      return;
    }
    // Update react-hook-form state
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-pink-950 flex items-center gap-1">
        {label}
        {required && <span className="text-brand-primary" aria-hidden="true">*</span>}
      </label>

      <div
        className={`relative mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${
          isDragging
            ? "border-brand-primary bg-pink-50/50"
            : error
            ? "border-red-400 bg-red-50/20"
            : "border-pink-200 bg-white/50 hover:border-brand-primary hover:bg-white"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={acceptedFileTypes}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelection(e.target.files[0]);
            }
          }}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative h-40 w-full max-w-[200px] overflow-hidden rounded-xl border border-pink-100 shadow-sm">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
            
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm font-semibold text-pink-950 truncate max-w-[250px]">{fileName}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-accent transition-colors"
                >
                  Replace
                </button>
                <div className="w-px h-3 bg-pink-200" />
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="mb-3 grid size-12 place-items-center rounded-full bg-pink-50 text-brand-primary">
              <Icon icon="mdi:cloud-upload-outline" className="size-6" />
            </div>
            <p className="text-sm font-semibold text-pink-950">{dropzoneText}</p>
            <p className="mt-1 text-xs text-pink-950/50">Accepted: {acceptedFileTypes} (Max: {maxSizeMB}MB)</p>
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
