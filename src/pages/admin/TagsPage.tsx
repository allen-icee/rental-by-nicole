import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, saveTag, type TagRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";

type TagFormData = {
  id?: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export function TagsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<TagRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TagRow | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TagFormData>();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: items, count } = await getPaginatedData("tags", currentPage, pageSize, "sort_order", true);
      setData(items);
      setTotalItems(count);

      const totalPages = Math.ceil(count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load tags." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(item?: TagRow) {
    if (item) {
      setEditingItem(item);
      reset({
        id: item.id,
        name: item.name,
        slug: item.slug,
        sort_order: item.sort_order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      reset({
        name: "",
        slug: "",
        sort_order: totalItems * 10,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  }

  async function onSubmit(formData: TagFormData) {
    try {
      await saveTag(formData);
      showToast({ tone: "success", title: "Success", message: "Tag saved successfully." });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save tag." });
    }
  }

  const columns: Column<TagRow>[] = [
    { header: "Name", accessorKey: "name", className: "font-medium" },
    { header: "Slug", accessorKey: "slug" },
    { header: "Sort Order", accessorKey: "sort_order" },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            row.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
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
        title="Tags"
        description="Manage the tags associated with your catalogue items."
        actionLabel="Add Tag"
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
        title={editingItem ? "Edit Tag" : "Add Tag"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              placeholder="e.g. Vintage"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Slug (optional)</label>
            <input
              {...register("slug")}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              placeholder="Leave blank to auto-generate"
            />
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
                  {...register("is_active")}
                  className="rounded border-pink-300 text-brand-accent focus:ring-brand-accent size-5 cursor-pointer"
                />
                <span className="text-sm font-medium text-pink-950">Active</span>
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
              {isSubmitting ? "Saving..." : "Save Tag"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}