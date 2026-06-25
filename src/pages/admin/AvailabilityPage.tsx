// src/pages/admin/AvailabilityPage.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, getAllCatalogItems, saveAvailability, deleteAvailability, type AvailabilityRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { FormTextarea } from "@/components/ui/forms/FormTextarea";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";

type AvailabilityFormData = {
  id?: string;
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
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful } } = useForm<AvailabilityFormData>({
    mode: "onChange"
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [paginated, allItems] = await Promise.all([
        getPaginatedData(
          "availability_ranges",
          currentPage,
          pageSize,
          "created_at",
          false,
          searchQuery,
          ["label", "notes"]
        ),
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

  function handleOpenModal(row?: AvailabilityRow) {
    if (row) {
      reset({
        id: row.id,
        catalog_item_id: row.catalog_item_id,
        start_date: row.start_date || "",
        end_date: row.end_date || "",
        label: row.label || "",
        notes: row.notes || "",
      });
    } else {
      reset({
        catalog_item_id: "",
        start_date: "",
        end_date: "",
        label: "",
        notes: "",
      });
    }
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
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="text-brand-primary hover:text-brand-accent transition-colors"
            title="Edit"
          >
            <Icon icon="mdi:pencil-outline" className="size-5" />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <Icon icon="mdi:trash-can-outline" className="size-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Availability Management"
        description="Block out dates for items when they are rented, in for cleaning, or unavailable."
        actionLabel="Block Dates"
        onAction={() => handleOpenModal()}
      >
        <div className="relative w-full max-w-sm">
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
          />
          <input
            type="text"
            placeholder="Search availability blocks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-full border-2 border-pink-100 bg-white pl-11 pr-4 text-sm text-pink-950 shadow-sm outline-none transition-all focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
          />
        </div>
      </AdminPageHeader>

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
        title="Block Availability"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSelect
            name="catalog_item_id"
            control={control}
            label="Catalog Item"
            required
            searchable
            options={catalogItems.map((item) => ({ value: item.id, label: item.name }))}
            placeholder="Select an item..."
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="start_date"
              control={control}
              type="date"
              label="Start Date"
              required
              helperText="First day of unavailability."
            />
            <FormInput
              name="end_date"
              control={control}
              type="date"
              label="End Date"
              required
              helperText="Last day of unavailability."
            />
          </div>

          <FormInput
            name="label"
            control={control}
            label="Label (Optional)"
            placeholder="e.g. Rented, Cleaning"
          />

          <FormTextarea
            name="notes"
            control={control}
            label="Notes (Optional)"
            rows={3}
          />

          <div className="pt-6 flex justify-end gap-3 border-t border-pink-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-6 py-3 font-semibold text-pink-950 hover:bg-pink-50 transition-colors"
            >
              Cancel
            </button>
            <FormSubmitButton 
              isDirty={isDirty} 
              isValid={isValid} 
              isSubmitting={isSubmitting} 
              isSubmitSuccessful={isSubmitSuccessful} 
              defaultText="Save Block"
            />
          </div>
        </form>
      </AdminModal>

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