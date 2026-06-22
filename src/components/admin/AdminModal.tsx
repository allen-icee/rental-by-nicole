import { ReactNode, useEffect } from "react";
import { Icon } from "@iconify/react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: AdminModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pink-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidthClass} rounded-2xl bg-white shadow-xl transition-all transform max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-pink-100 p-5">
          <h2 className="font-display text-xl font-semibold text-brand-accent">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-pink-950/50 hover:bg-pink-50 hover:text-brand-accent transition-colors"
          >
            <Icon icon="mdi:close" className="size-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
