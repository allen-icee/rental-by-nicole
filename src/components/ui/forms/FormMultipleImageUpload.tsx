// src/components/ui/forms/FormMultipleImageUpload.tsx
import { useState, useRef, useEffect } from "react";
import { useController, type Control, type RegisterOptions, type FieldValues, type Path } from "react-hook-form";
import { Icon } from "@iconify/react";
import imageCompression from "browser-image-compression";

type FileWithPreview = {
  id?: string;
  file?: File;
  previewUrl: string;
  name: string;
  size?: number;
};

type FormMultipleImageUploadProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  dropzoneText?: string;
  required?: boolean;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  rules?: Omit<RegisterOptions<T, Path<T>>, "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate">;
};

export function FormMultipleImageUpload<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  dropzoneText = "Drag and drop or click to upload multiple images",
  required,
  acceptedFileTypes = "image/png, image/jpeg, image/webp",
  maxSizeMB = 5,
  maxFiles = 10,
  rules
}: FormMultipleImageUploadProps<T>) {
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
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images: FileWithPreview[] = Array.isArray(value)
    ? value.map((img: { id?: string; file?: File; image_url: string; alt_text?: string }) => ({
        id: img.id,
        file: img.file,
        previewUrl: img.file ? URL.createObjectURL(img.file) : img.image_url,
        name: img.file ? img.file.name : (img.alt_text || "Existing Image"),
      }))
    : [];

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    const urlsToRevoke = images.filter(img => img.file && img.previewUrl).map(img => img.previewUrl);
    return () => {
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelection(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelection = async (files: File[]) => {
    if (images.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    setIsCompressing(true);
    try {
      const validFiles = files.filter(file => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`File ${file.name} exceeds ${maxSizeMB}MB and will be skipped.`);
          return false;
        }
        return true;
      });

      const compressedFiles = await Promise.all(
        validFiles.map(async (file) => {
          const options = {
            maxSizeMB: 1, // Compress to max 1MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          try {
            return await imageCompression(file, options);
          } catch (error) {
            console.error("Compression error:", error);
            return file; // fallback to original file if compression fails
          }
        })
      );

      const newImages = compressedFiles.map((file) => ({
        file,
        image_url: "", // will be set after upload
        alt_text: file.name,
        sort_order: images.length + 1, // placeholder
      }));

      // Append new images to the existing value array
      const currentValue = Array.isArray(value) ? value : [];
      onChange([...currentValue, ...newImages]);
      
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentValue = Array.isArray(value) ? value : [];
    const updatedValue = currentValue.filter((_, index) => index !== indexToRemove);
    onChange(updatedValue);
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
          multiple
          className="hidden"
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              await handleFileSelection(Array.from(e.target.files));
              e.target.value = ''; // reset input
            }
          }}
        />

        <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="mb-3 grid size-12 place-items-center rounded-full bg-pink-50 text-brand-primary">
            {isCompressing ? (
              <Icon icon="mdi:loading" className="size-6 animate-spin" />
            ) : (
              <Icon icon="mdi:cloud-upload-outline" className="size-6" />
            )}
          </div>
          <p className="text-sm font-semibold text-pink-950">
            {isCompressing ? "Compressing images..." : dropzoneText}
          </p>
          <p className="mt-1 text-xs text-pink-950/50">Accepted: {acceptedFileTypes} (Max: {maxSizeMB}MB)</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <div key={index} className="group relative aspect-square w-full overflow-hidden rounded-xl border border-pink-100 shadow-sm">
              <img src={img.previewUrl} alt={img.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                  title="Remove Image"
                >
                  <Icon icon="mdi:trash-can-outline" className="size-5" />
                </button>
              </div>
              {img.file && (
                <div className="absolute top-2 left-2 rounded-md bg-brand-primary/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  NEW
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
