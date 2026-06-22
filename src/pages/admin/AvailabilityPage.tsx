import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, getAllCatalogItems, saveAvailability, deleteAvailability, type AvailabilityRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";

type AvailabilityFormData = {
  catalog_item_id: string;
  start_date: string;
  end_date: string;
  label: string;
  notes: string;
};

type BasicCatalogItem = {
  id: string;
  name: string;
};

export function AvailabilityPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<AvailabilityRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [catalogItems, setCatalogItems] = useState<BasicCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AvailabilityFormData>();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [paginated, allItems] = await Promise.all([
        getPaginatedData("availability_ranges", currentPage, pageSize, "created_at", false),
        getAllCatalogItems()
      ]);

      setData(paginated.data);
      setTotalItems(paginated.count);
      setCatalogItems(allItems as BasicCatalogItem[]);

      const totalPages = Math.ceil(paginated.count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load availability data." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal() {
    reset({
      catalog_item_id: "",
      start_date: "",
      end_date: "",
      label: "",
      notes: "",
    });
    setIsModalOpen(true);
  }

  function confirmDelete(id: string) {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      await deleteAvailability(itemToDelete);
      showToast({ tone: "success", title: "Deleted", message: "Availability block removed." });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to delete availability block." });
    }
  }

  async function onSubmit(formData: AvailabilityFormData) {
    try {
      await saveAvailability(formData);
      showToast({ tone: "success", title: "Success", message: "Availability block added." });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save availability." });
    }
  }

  const columns: Column<AvailabilityRow>[] = [
    {
      header: "Item",
      cell: (row) => {
        const item = catalogItems.find((c) => c.id === row.catalog_item_id);
        return <span className="font-medium">{item?.name || "Unknown Item"}</span>;
      },
    },
    {
      header: "Start Date",
      cell: (row) => (row.start_date ? new Date(row.start_date).toLocaleDateString() : "N/A"),
    },
    {
      header: "End Date",
      cell: (row) => (row.end_date ? new Date(row.end_date).toLocaleDateString() : "N/A"),
    },
    { header: "Label", accessorKey: "label" },
    {
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => confirmDelete(row.id)}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <Icon icon="mdi:trash-can-outline" className="size-5" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Availability Management"
        description="Block out dates for items when they are rented, in for cleaning, or unavailable."
        actionLabel="Block Dates"
        onAction={handleOpenModal}
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

      {/* Add Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Block Availability"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Catalog Item</label>
            <select
              {...register("catalog_item_id", { required: "Item is required" })}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-white"
            >
              <option value="">Select an item...</option>
              {catalogItems.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {errors.catalog_item_id && <p className="mt-1 text-sm text-red-600">{errors.catalog_item_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Start Date</label>
              <input
                type="date"
                {...register("start_date", { required: "Start date is required" })}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
              {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">End Date</label>
              <input
                type="date"
                {...register("end_date", { required: "End date is required" })}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
              {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Label (Optional)</label>
            <input
              {...register("label")}
              placeholder="e.g. Rented, Cleaning"
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Notes (Optional)</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
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
              {isSubmitting ? "Saving..." : "Save Block"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-pink-950/70">Are you sure you want to remove this availability block? This will make the item available for booking on these dates again.</p>
          <div className="flex justify-end gap-3 border-t border-pink-100 pt-5">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-pink-950/70 hover:bg-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-soft hover:-translate-y-0.5 transition-transform"
            >
              Delete Block
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}