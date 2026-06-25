// src/components/admin/AdminTable.tsx
import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyMessage = "No items found.",
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-soft">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white shadow-soft p-6 text-center">
        <p className="text-lg font-medium text-pink-950/70">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
      <table className="w-full text-left text-sm text-pink-950">
        <thead className="bg-brand-background/50 text-xs uppercase text-brand-accent border-b border-pink-100">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-6 py-4 font-semibold ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-pink-100">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-brand-background/30 transition-colors">
              {columns.map((col, i) => (
                <td key={i} className={`px-6 py-4 ${col.className || ""}`}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? (row[col.accessorKey] as ReactNode)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
