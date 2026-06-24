import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { ToastContext } from "@/components/ui/toast-context";
import type { ToastInput, ToastTone } from "@/components/ui/toast-context";

type Toast = ToastInput & {
  id: number;
};

const toastStyles: Record<ToastTone, { icon: string; className: string }> = {
  success: {
    icon: "mdi:check-circle",
    className: "border-fuchsia-200 bg-white text-fuchsia-950"
  },
  error: {
    icon: "mdi:alert-circle",
    className: "border-rose-200 bg-white text-rose-950"
  },
  info: {
    icon: "mdi:information",
    className: "border-pink-200 bg-white text-pink-950"
  }
};

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[90] grid w-[min(24rem,calc(100vw-2rem))] gap-3">
        {toasts.map((toast) => {
          const style = toastStyles[toast.tone];

          return (
            <div
              key={toast.id}
              className={`rounded-2xl border px-4 py-3 shadow-barbie backdrop-blur toast-pop ${style.className}`}
              role="status"
            >
              <div className="flex gap-3">
                <Icon icon={style.icon} className="mt-0.5 size-5 shrink-0 text-brand-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{toast.title}</p>
                  {toast.message ? <p className="mt-1 text-xs leading-5 text-pink-950/65">{toast.message}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-pink-950/45 hover:bg-pink-50 hover:text-brand-accent"
                  aria-label="Dismiss notification"
                >
                  <Icon icon="mdi:close" className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
