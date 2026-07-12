import { Icon } from "@iconify/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-lg bg-white border border-pink-200 text-brand-accent hover:bg-pink-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-semibold flex items-center text-xs"
      >
        <Icon icon="mdi:chevron-left" className="size-4 mr-1" /> Prev
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`px-3 py-1 rounded-lg border font-semibold text-xs transition-colors ${
            page === currentPage
              ? "bg-brand-primary border-brand-primary text-white shadow-sm"
              : page === "..."
              ? "bg-transparent border-transparent text-pink-950/50 cursor-default"
              : "bg-white border-pink-200 text-brand-accent hover:bg-pink-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-lg bg-white border border-pink-200 text-brand-accent hover:bg-pink-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-semibold flex items-center text-xs"
      >
        Next <Icon icon="mdi:chevron-right" className="size-4 ml-1" />
      </button>
    </div>
  );
}
