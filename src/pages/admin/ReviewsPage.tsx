// src/pages/admin/ReviewsPage.tsx
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/toast-context";
import { supabase } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminModal } from "@/components/admin/AdminModal";
import type { ReviewRow } from "@/services/admin.service";

const ITEMS_PER_PAGE = 8;

export function ReviewsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);
  const [viewTarget, setViewTarget] = useState<ReviewRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    setIsLoading(false);
    if (error) {
      showToast({ tone: "error", title: "Error", message: error.message });
      return;
    }
    setItems((data as ReviewRow[]) ?? []);
  };

  useEffect(() => {
    loadItems();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.comment.toLowerCase().includes(q);
      
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && item.status === "approved") ||
      (statusFilter === "pending" && item.status === "pending");

    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const deleteItem = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", deleteTarget.id);
    
    setIsDeleting(false);

    if (error) {
      showToast({ tone: "error", title: "Error", message: error.message });
      return;
    }

    showToast({ tone: "success", title: "Deleted", message: "Customer review removed." });
    setDeleteTarget(null);

    if (paginatedItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }

    await loadItems();
  };

  const updateApproval = async (item: ReviewRow, isApproved: boolean) => {
    if (!item.id) return;

    setUpdatingId(item.id);
    const newStatus = isApproved ? "approved" : "pending";

    const { error } = await supabase
      .from("customer_reviews")
      .update({ status: newStatus })
      .eq("id", item.id);

    setUpdatingId(null);

    if (error) {
      showToast({ tone: "error", title: "Error", message: error.message });
      return;
    }

    showToast({ tone: "success", title: "Success", message: isApproved ? "Review published." : "Review hidden." });
    await loadItems();
  };

  return (
    <div>
      <AdminPageHeader
        title="Customer Reviews"
        description="Moderate customer reviews. Approved reviews will be shown on the public site."
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Icon
              icon="mdi:magnify"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
            />
            <input
              type="text"
              placeholder="Search by customer or feedback..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 w-full rounded-full border-2 border-pink-100 bg-white pl-11 pr-4 text-sm text-pink-950 shadow-sm outline-none transition-all focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Published", value: "approved" },
            ].map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => {
                  setStatusFilter(status.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className={`shrink-0 rounded-full border-2 px-5 py-2 text-sm font-bold transition-all ${
                  statusFilter === status.value
                    ? "border-brand-accent bg-brand-accent text-white shadow-soft"
                    : "border-pink-100 bg-white text-pink-950/70 hover:border-brand-accent hover:text-brand-accent"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </AdminPageHeader>

      <div className="flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-soft">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-pink-200 bg-pink-100/80 text-xs font-extrabold uppercase tracking-widest text-brand-accent">
              <tr>
                <th className="px-6 py-5 font-extrabold text-center">Customer</th>
                <th className="hidden px-6 py-5 font-extrabold md:table-cell text-center">Date</th>
                <th className="px-6 py-5 font-extrabold text-center">Rating</th>
                <th className="px-6 py-5 font-extrabold text-center">Status</th>
                <th className="hidden px-6 py-5 font-extrabold lg:table-cell text-center">Review</th>
                <th className="px-6 py-5 font-extrabold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm font-medium text-pink-950/50">
                    {searchQuery ? "No reviews match your search." : "No reviews found."}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-pink-100/60 even:bg-pink-50">
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-pink-950">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-pink-950/50 md:hidden">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="hidden px-6 py-4 md:table-cell text-center">
                      <div className="font-semibold text-pink-950/70">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Icon
                            key={index}
                            icon={index < item.rating ? "mdi:star" : "mdi:star-outline"}
                            className="size-4"
                          />
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status === "approved" ? "Published" : item.status === "rejected" ? "Rejected" : "Pending"}
                      </span>
                    </td>

                    <td className="hidden px-6 py-4 lg:table-cell text-center">
                      <p className="max-w-[300px] truncate text-xs font-medium text-pink-950/70 mx-auto">
                        "{item.comment}"
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewTarget(item)}
                          className="grid size-9 place-items-center rounded-xl bg-pink-50 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                          title="View Full Feedback"
                        >
                          <Icon icon="mdi:text-box-search-outline" className="size-5" />
                        </button>
                        <button
                          onClick={() => updateApproval(item, item.status !== "approved")}
                          disabled={updatingId === item.id}
                          className="grid size-9 place-items-center rounded-xl bg-pink-50 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-50"
                          title={item.status === "approved" ? "Hide Feedback" : "Publish Feedback"}
                        >
                          <Icon
                            icon={item.status === "approved" ? "mdi:eye-off-outline" : "mdi:check-circle-outline"}
                            className="size-5"
                          />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          title="Delete Feedback"
                        >
                          <Icon icon="mdi:trash-can-outline" className="size-5" />
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
          <div className="flex items-center justify-between border-t border-pink-100 bg-pink-50/50 px-6 py-4">
            <span className="text-xs font-medium text-pink-950/60">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="grid size-8 place-items-center rounded-lg border-2 border-pink-200 bg-white text-pink-950 transition hover:border-brand-accent hover:text-brand-accent disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon icon="mdi:chevron-left" className="size-5" />
              </button>
              <div className="flex items-center px-2 text-sm font-bold text-pink-950/70">
                {safeCurrentPage} / {totalPages}
              </div>
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="grid size-8 place-items-center rounded-lg border-2 border-pink-200 bg-white text-pink-950 transition hover:border-brand-accent hover:text-brand-accent disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon icon="mdi:chevron-right" className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={Boolean(viewTarget)}
        title="Review Details"
        onClose={() => setViewTarget(null)}
      >
        {viewTarget && (
          <div className="flex flex-col gap-6 p-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary">Customer</h4>
                <p className="mt-1 text-base font-medium text-pink-950">{viewTarget.name}</p>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary">Date</h4>
                <p className="mt-1 text-sm font-medium text-pink-950">{new Date(viewTarget.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary">Rating</h4>
              <div className="mt-2 flex gap-1 text-yellow-400 bg-yellow-50 inline-flex px-3 py-1.5 rounded-full">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon
                    key={index}
                    icon={index < viewTarget.rating ? "mdi:star" : "mdi:star-outline"}
                    className="size-5"
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary">Review Comment</h4>
              <p className="mt-2 text-sm leading-relaxed text-pink-950 whitespace-pre-wrap rounded-2xl border-2 border-pink-100 bg-pink-50/50 p-5">
                {viewTarget.comment}
              </p>
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setViewTarget(null)}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold text-pink-950 hover:bg-pink-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  updateApproval(viewTarget, viewTarget.status !== "approved");
                  setViewTarget(null);
                }}
                className="rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:-translate-y-0.5 transition-transform"
              >
                {viewTarget.status === "approved" ? "Unpublish Review" : "Publish Review"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Review"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-pink-950/70">
            Are you sure you want to permanently delete the review from <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 border-t border-pink-100 pt-5">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-pink-950 hover:bg-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteItem}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Review"}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}