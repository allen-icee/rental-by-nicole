// src/components/admin/AdminModal.tsx
import { ReactNode, useEffect } from "react";
import { Icon } from "@iconify/react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "xl",
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
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div
        className="absolute inset-0 bg-pink-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

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

        <div className="overflow-y-auto p-5 hide-scrollbar" data-lenis-prevent="true">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Delete",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <p className="text-pink-950/70">{message}</p>
        <div className="flex justify-end gap-3 border-t border-pink-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-pink-950/70 hover:bg-pink-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-soft hover:-translate-y-0.5 transition-transform"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
