import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, getAllCategories, saveCatalogItem, deleteCatalogItem, type CatalogRow, type CategoryRow, type CatalogFormInput } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal, ConfirmModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormTextarea } from "@/components/ui/forms/FormTextarea";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { FormToggle } from "@/components/ui/forms/FormToggle";

export function CataloguePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<CatalogRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogRow | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { control, register, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful } } = useForm<CatalogFormInput>({
    mode: "onChange"
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [paginated, allCategories] = await Promise.all([
        getPaginatedData(
          "catalog_items",
          currentPage,
          pageSize,
          "sort_order",
          true,
          searchQuery,
          ["name", "slug"]
        ),
        getAllCategories()
      ]);
      
      setData(paginated.data);
      setTotalItems(paginated.count);
      setCategories(allCategories);

      const totalPages = Math.ceil(paginated.count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load catalogue data." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(item?: CatalogRow) {
    if (item) {
      setEditingItem(item);
      reset({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        status: item.status,
        availability_status: item.availability_status,
        featured: item.featured,
        is_new_arrival: item.is_new_arrival,
        price_display: item.price_display || "",
        instagram_reel_url: item.instagram_reel_url || "",
        sort_order: item.sort_order,
      });
    } else {
      setEditingItem(null);
      reset({
        category_id: "",
        name: "",
        slug: "",
        description: "",
        status: "draft",
        availability_status: "available",
        featured: false,
        is_new_arrival: false,
        price_display: "",
        instagram_reel_url: "",
        sort_order: data.length > 0 ? Math.max(...data.map(d => d.sort_order)) + 1 : 1,
      });
    }
    setIsModalOpen(true);
  }

  async function onSubmit(formData: CatalogFormInput) {
    try {
      await saveCatalogItem(formData);
      showToast({ tone: "success", title: "Success", message: "Catalogue item saved." });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save catalogue item." });
    }
  }

  function confirmDelete(id: string) {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      await deleteCatalogItem(itemToDelete);
      showToast({ tone: "success", title: "Deleted", message: "Catalogue item removed." });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to delete item." });
    }
  }

  const columns: Column<CatalogRow>[] = [
    { header: "Name", accessorKey: "name", className: "font-medium" },
    {
      header: "Category",
      cell: (row) => {
        const cat = categories.find((c) => c.id === row.category_id);
        return cat ? cat.name : <span className="text-pink-950/40">None</span>;
      },
    },
    { header: "Price", accessorKey: "price_display" },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            row.status === "published"
              ? "bg-green-100 text-green-700"
              : row.status === "archived"
              ? "bg-gray-100 text-gray-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Availability",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            row.availability_status === "available"
              ? "bg-blue-100 text-blue-700"
              : row.availability_status === "reserved"
              ? "bg-purple-100 text-purple-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {row.availability_status.charAt(0).toUpperCase() + row.availability_status.slice(1)}
        </span>
      ),
    },
    {
      header: "Featured",
      cell: (row) => (
        row.featured ? <Icon icon="mdi:star" className="size-5 text-yellow-400" /> : null
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="text-brand-primary hover:text-brand-accent transition-colors"
          >
            <Icon icon="mdi:pencil" className="size-5" />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
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
        title="Catalogue"
        description="Manage your rental inventory, pricing, and availability."
        actionLabel="Add Item"
        onAction={() => handleOpenModal()}
      >
        <div className="relative w-full max-w-sm">
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
          />
          <input
            type="text"
            placeholder="Search items..."
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
        title={editingItem ? "Edit Catalogue Item" : "Add Catalogue Item"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="name"
              control={control}
              label="Name"
              required
              maxLength={100}
              placeholder="e.g. Barbie Dream Dress"
            />

            <FormSelect
              name="category_id"
              control={control}
              label="Category"
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              placeholder="Select a category..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="price_display"
              control={control}
              label="Price Display"
              placeholder="e.g. $50/day"
            />
            <FormInput
              name="slug"
              control={control}
              label="Slug (optional)"
              placeholder="Leave blank to auto-generate"
              helperText="The URL friendly version of the name."
            />
          </div>

          <FormTextarea
            name="description"
            control={control}
            label="Description"
            maxLength={1000}
            rows={4}
            placeholder="Detailed description of the item..."
          />

          <FormInput
            name="instagram_reel_url"
            control={control}
            type="url"
            label="Instagram Reel URL"
            placeholder="https://instagram.com/reel/..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-pink-100 pt-6">
            <FormSelect
              name="status"
              control={control}
              label="Status"
              searchable={false}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" }
              ]}
            />

            <FormSelect
              name="availability_status"
              control={control}
              label="Availability"
              searchable={false}
              options={[
                { value: "available", label: "Available" },
                { value: "reserved", label: "Reserved" },
                { value: "unavailable", label: "Unavailable" }
              ]}
            />

            <FormInput
              name="sort_order"
              control={control}
              type="number"
              label="Sort Order"
              min={0}
              helperText="Lower numbers appear first."
              rules={{ valueAsNumber: true }}
            />
          </div>

          <div className="pt-2 flex flex-col gap-4 sm:flex-row sm:gap-8">
            <FormToggle
              name="featured"
              control={control}
              label="Featured Item"
            />
            <FormToggle
              name="is_new_arrival"
              control={control}
              label="New Arrival"
            />
          </div>

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
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        message="Are you sure you want to delete this item? All images, sizes, and availability ranges will be lost. This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}