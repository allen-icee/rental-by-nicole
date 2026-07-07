// src/pages/admin/InquiriesPage.tsx
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

const ITEMS_PER_PAGE = 10;

export function InquiriesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "contacted" | "completed">("all");
  
  const [deleteTarget, setDeleteTarget] = useState<InquiryRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast({ tone: "error", title: "Error", message: error.message });
      return;
    }
    setItems(data ?? []);
  };

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        showToast({ tone: "error", title: "Error", message: error.message });
      } else if (mounted) {
        setItems(data ?? []);
      }
    };

    void fetchInitial();
    return () => { mounted = false; };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const updateStatus = async (item: InquiryRow, status: "new" | "contacted" | "completed") => {
    if (!item.id) return;
    setUpdatingId(item.id);

    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", item.id);

    setUpdatingId(null);

    if (error) {
      showToast({ tone: "error", title: "Error", message: error.message });
      return;
    }

    showToast({ tone: "success", title: "Success", message: `Inquiry marked ${status}.` });
    await loadItems();
  };

  const deleteItem = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", deleteTarget.id);

    setIsDeleting(false);

    if (error) {
      showToast({ tone: "error", title: "Error", message: error.message });
      return;
    }

    showToast({ tone: "success", title: "Deleted", message: "Inquiry deleted." });
    setDeleteTarget(null);

    if (paginatedItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    await loadItems();
  };

  return (
    <div>
      <AdminPageHeader title="Inquiries" description="Customer inquiries and messages." />
      
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Icon
            icon="ph:magnifying-glass-bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary"
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 text-sm text-pink-950 outline-none transition focus:border-brand-primary"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { label: "All", value: "all" },
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Completed", value: "completed" },
          ].map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => {
                setStatusFilter(status.value as typeof statusFilter);
                setCurrentPage(1);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                statusFilter === status.value
                  ? "border-brand-primary bg-brand-primary text-white shadow-md"
                  : "border-pink-100 bg-white text-pink-950/70 hover:border-brand-primary"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-pink-100 bg-white shadow-soft">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-pink-200 bg-pink-100/80 text-[10px] font-extrabold uppercase tracking-widest text-brand-accent">
              <tr>
                <th className="px-5 py-4 font-extrabold text-center">Sender</th>
                <th className="hidden px-5 py-4 font-extrabold md:table-cell text-center">Details</th>
                <th className="hidden px-5 py-4 font-extrabold lg:table-cell text-center">Message</th>
                <th className="px-5 py-4 font-extrabold text-center">Status</th>
                <th className="px-5 py-4 font-extrabold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs font-medium text-pink-950/50">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-pink-100/60 even:bg-pink-50">
                    <td className="px-5 py-3.5 text-center">
                      <div className="font-bold text-pink-950">{item.name}</div>
                      <a href={`mailto:${item.email}`} className="mt-0.5 block text-[11px] font-medium text-brand-primary hover:underline">
                        {item.email || "No email"}
                      </a>
                    </td>
                    <td className="hidden px-5 py-3.5 md:table-cell text-center">
                      <div className="font-semibold text-pink-950">
                        {item.selected_item_id ? "Item Inquiry" : "General Inquiry"}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-950/50">
                        {item.phone} / {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 lg:table-cell text-center">
                      <p className="max-w-[420px] truncate text-xs font-medium text-pink-950/70 mx-auto">
                        {item.message}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                          item.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "contacted"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => updateStatus(item, item.status === "new" ? "contacted" : item.status === "contacted" ? "completed" : "new")}
                          disabled={updatingId === item.id}
                          className="grid size-8 place-items-center rounded-lg text-brand-primary transition-colors hover:bg-pink-50 disabled:opacity-50"
                          title="Cycle Status"
                        >
                          {updatingId === item.id ? (
                            <div className="size-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                          ) : (
                            <Icon
                              icon={
                                item.status === "new" ? "ph:envelope-open-bold" 
                                : item.status === "contacted" ? "ph:check-circle-bold" 
                                : "ph:arrow-counter-clockwise-bold"
                              }
                              className="text-base"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="grid size-8 place-items-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete Inquiry"
                        >
                          <Icon icon="ph:trash-bold" className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-pink-50 bg-pink-50/20 px-5 py-3">
            <span className="text-[11px] font-medium text-pink-950/60">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="grid size-7 place-items-center rounded-lg border border-pink-100 bg-white text-pink-950 transition hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon icon="ph:caret-left-bold" />
              </button>
              <div className="flex items-center px-2 text-xs font-bold text-pink-950/70">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="grid size-7 place-items-center rounded-lg border border-pink-100 bg-white text-pink-950 transition hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon icon="ph:caret-right-bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete inquiry?"
        message={`This will permanently remove "${deleteTarget?.name ?? "this message"}" from inquiries.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Inquiry"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
}