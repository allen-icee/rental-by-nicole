// src/components/admin/AdminPagination.tsx
import { Icon } from "@iconify/react";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function AdminPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 py-3 gap-4">
      <div className="text-sm text-pink-950/70">
        Showing <span className="font-semibold text-brand-accent">{totalItems === 0 ? 0 : startItem}</span> to{" "}
        <span className="font-semibold text-brand-accent">{endItem}</span> of{" "}
        <span className="font-semibold text-brand-accent">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-pink-950/70">
            Rows per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1); 
            }}
            className="rounded-lg border-pink-200 bg-white py-1 pl-2 pr-6 text-sm text-pink-950 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-lg text-pink-950/50 hover:bg-pink-50 hover:text-brand-accent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-pink-950/50 transition-colors"
          >
            <Icon icon="mdi:chevron-left" className="size-6" />
          </button>
          
          <span className="text-sm font-medium px-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg text-pink-950/50 hover:bg-pink-50 hover:text-brand-accent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-pink-950/50 transition-colors"
          >
            <Icon icon="mdi:chevron-right" className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
