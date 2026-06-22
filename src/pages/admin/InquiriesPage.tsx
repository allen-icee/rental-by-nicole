import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getPaginatedData, updateInquiryStatus, type InquiryRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";

export function InquiriesPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<InquiryRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewingItem, setViewingItem] = useState<InquiryRow | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: items, count } = await getPaginatedData("inquiries", currentPage, pageSize, "created_at", false);
      setData(items);
      setTotalItems(count);

      const totalPages = Math.ceil(count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load inquiries." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: InquiryRow["status"]) {
    try {
      await updateInquiryStatus(id, status);
      showToast({ tone: "success", title: "Status Updated", message: `Inquiry marked as ${status}.` });
      fetchData();
      if (viewingItem?.id === id) {
        setViewingItem({ ...viewingItem, status });
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to update inquiry status." });
    }
  }

  const columns: Column<InquiryRow>[] = [
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    { header: "Name", accessorKey: "name", className: "font-medium" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            row.status === "new"
              ? "bg-blue-100 text-blue-700"
              : row.status === "contacted"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {row.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => setViewingItem(row)}
          className="text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <Icon icon="mdi:eye-outline" className="size-5" />
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Customer Inquiries"
        description="View and manage messages sent through the contact form."
      />

      <AdminTable
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
      />

      <AdminPagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <AdminModal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title="Inquiry Details"
        maxWidth="lg"
      >
        {viewingItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-pink-950/60 mb-1">From</p>
                <p className="font-medium text-pink-950">{viewingItem.name}</p>
                <p className="text-pink-950">{viewingItem.email}</p>
                {viewingItem.phone && <p className="text-pink-950">{viewingItem.phone}</p>}
              </div>
              <div>
                <p className="text-pink-950/60 mb-1">Date</p>
                <p className="font-medium text-pink-950">
                  {new Date(viewingItem.created_at).toLocaleString()}
                </p>
                <p className="text-pink-950/60 mt-2 mb-1">Current Status</p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    viewingItem.status === "new"
                      ? "bg-blue-100 text-blue-700"
                      : viewingItem.status === "contacted"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {viewingItem.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <p className="text-pink-950/60 text-sm mb-2">Message</p>
              <div className="rounded-xl bg-brand-background p-4 text-pink-950 whitespace-pre-wrap text-sm leading-relaxed">
                {viewingItem.message}
              </div>
            </div>

            <div className="border-t border-pink-100 pt-5 flex items-center justify-between">
              <div className="text-sm text-pink-950/70">Change Status:</div>
              <div className="flex gap-2">
                {viewingItem.status !== "new" && (
                  <button
                    onClick={() => handleStatusChange(viewingItem.id, "new")}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    Mark New
                  </button>
                )}
                {viewingItem.status !== "contacted" && (
                  <button
                    onClick={() => handleStatusChange(viewingItem.id, "contacted")}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  >
                    Mark Contacted
                  </button>
                )}
                {viewingItem.status !== "completed" && (
                  <button
                    onClick={() => handleStatusChange(viewingItem.id, "completed")}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}