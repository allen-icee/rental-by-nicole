import { Icon } from "@iconify/react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon = "mdi:plus",
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-brand-accent">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-pink-950/70 max-w-2xl">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Icon icon={actionIcon} className="size-5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
