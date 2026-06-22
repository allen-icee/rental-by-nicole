import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getPaginatedData, updateReviewStatus, type ReviewRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useToast } from "@/components/ui/toast-context";

export function ReviewsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ReviewRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: items, count } = await getPaginatedData("customer_reviews", currentPage, pageSize, "created_at", false);
      setData(items);
      setTotalItems(count);

      const totalPages = Math.ceil(count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load reviews." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: ReviewRow["status"]) {
    try {
      await updateReviewStatus(id, status);
      showToast({ tone: "success", title: "Status Updated", message: `Review marked as ${status}.` });
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to update review status." });
    }
  }

  const columns: Column<ReviewRow>[] = [
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    { header: "Customer", accessorKey: "name", className: "font-medium" },
    {
      header: "Rating",
      cell: (row) => (
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              icon={i < row.rating ? "mdi:star" : "mdi:star-outline"}
              className="size-4"
            />
          ))}
        </div>
      ),
    },
    { header: "Review", accessorKey: "comment", className: "max-w-xs truncate" },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            row.status === "approved"
              ? "bg-green-100 text-green-700"
              : row.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          {row.status !== "approved" && (
            <button
              onClick={() => handleStatusChange(row.id, "approved")}
              className="rounded p-1 text-green-600 hover:bg-green-50 transition-colors"
              title="Approve"
            >
              <Icon icon="mdi:check-circle-outline" className="size-5" />
            </button>
          )}
          {row.status !== "rejected" && (
            <button
              onClick={() => handleStatusChange(row.id, "rejected")}
              className="rounded p-1 text-red-600 hover:bg-red-50 transition-colors"
              title="Reject"
            >
              <Icon icon="mdi:close-circle-outline" className="size-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Customer Reviews"
        description="Moderate customer reviews. Approved reviews will be shown on the public site."
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
    </div>
  );
}