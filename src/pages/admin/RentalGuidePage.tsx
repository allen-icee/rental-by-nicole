import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, saveGuide, type GuideRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";

type GuideFormData = {
  id?: string;
  title: string;
  body: string;
  sort_order: number;
  is_published: boolean;
};

export function RentalGuidePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<GuideRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GuideRow | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GuideFormData>();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: items, count } = await getPaginatedData("rental_guides", currentPage, pageSize, "sort_order", true);
      setData(items);
      setTotalItems(count);

      const totalPages = Math.ceil(count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load guides." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(item?: GuideRow) {
    if (item) {
      setEditingItem(item);
      reset({
        id: item.id,
        title: item.title,
        body: item.body,
        sort_order: item.sort_order,
        is_published: item.is_published,
      });
    } else {
      setEditingItem(null);
      reset({
        title: "",
        body: "",
        sort_order: totalItems * 10,
        is_published: true,
      });
    }
    setIsModalOpen(true);
  }

  async function onSubmit(formData: GuideFormData) {
    try {
      await saveGuide(formData);
      showToast({ tone: "success", title: "Success", message: "Guide saved successfully." });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save guide." });
    }
  }

  const columns: Column<GuideRow>[] = [
    { header: "Title", accessorKey: "title", className: "font-medium" },
    { header: "Sort Order", accessorKey: "sort_order" },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            row.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.is_published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleOpenModal(row)}
          className="text-brand-primary hover:text-brand-accent transition-colors"
        >
          <Icon icon="mdi:pencil" className="size-5" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Rental Guides"
        description="Manage the instructional guides on the rental process."
        actionLabel="Add Guide"
        onAction={() => handleOpenModal()}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Guide" : "Add Guide"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Body (Markdown allowed)</label>
            <textarea
              {...register("body", { required: "Body is required" })}
              rows={8}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent font-mono text-sm"
            />
            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Sort Order</label>
              <input
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_published")}
                  className="rounded border-pink-300 text-brand-accent focus:ring-brand-accent size-5 cursor-pointer"
                />
                <span className="text-sm font-medium text-pink-950">Published</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-pink-100 pt-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-pink-950/70 hover:bg-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-accent px-6 py-2 text-sm font-semibold text-white shadow-soft hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Guide"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}