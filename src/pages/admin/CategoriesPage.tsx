import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, saveCategory, deleteCategory, type CategoryRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal, ConfirmModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormTextarea } from "@/components/ui/forms/FormTextarea";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { FormToggle } from "@/components/ui/forms/FormToggle";

type CategoryFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export function CategoriesPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<CategoryRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryRow | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { control, register, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful } } = useForm<CategoryFormData>({
    mode: "onChange"
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: items, count } = await getPaginatedData(
        "categories",
        currentPage,
        pageSize,
        "sort_order",
        true,
        searchQuery,
        ["name", "description"]
      );
      setData(items);
      setTotalItems(count);

      const totalPages = Math.ceil(count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load categories." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(item?: CategoryRow) {
    if (item) {
      setEditingItem(item);
      reset({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        sort_order: item.sort_order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      reset({
        name: "",
        slug: "",
        description: "",
        sort_order: data.length > 0 ? Math.max(...data.map((d) => d.sort_order)) + 1 : 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  }

  async function onSubmit(formData: CategoryFormData) {
    try {
      await saveCategory(formData);
      showToast({ tone: "success", title: "Success", message: "Category saved successfully." });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save category." });
    }
  }

  function confirmDelete(id: string) {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      await deleteCategory(itemToDelete);
      showToast({ tone: "success", title: "Deleted", message: "Category removed." });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to delete category." });
    }
  }

  const columns: Column<CategoryRow>[] = [
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
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="text-brand-primary hover:text-brand-accent transition-colors"
          >
            <Icon icon="mdi:pencil" className="size-5" />
          </button>
          <button
            onClick={() => confirmDelete(row.id!)}
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
        title="Categories"
        description="Manage the product categories shown in the catalogue."
        actionLabel="Add Category"
        onAction={() => handleOpenModal()}
      >
        <div className="relative w-full max-w-sm">
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
          />
          <input
            type="text"
            placeholder="Search categories..."
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
        title={editingItem ? "Edit Category" : "Add Category"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            name="name"
            control={control}
            label="Name"
            required
            maxLength={100}
            placeholder="e.g. Dresses"
          />

          <FormInput
            name="slug"
            control={control}
            label="Slug (optional)"
            placeholder="Leave blank to auto-generate"
            helperText="The URL friendly version of the name."
          />

          <FormTextarea
            name="description"
            control={control}
            label="Description (optional)"
            maxLength={500}
            rows={3}
            placeholder="A short description of this category..."
          />

          <FormInput
            name="sort_order"
            control={control}
            type="number"
            label="Sort Order"
            min={0}
            helperText="Lower numbers appear first."

          />
          <FormToggle
            name="is_active"
            control={control}
            label="Active Category"
            description="Inactive categories are hidden from customers."
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
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        message="Are you sure you want to delete this category? Ensure no catalogue items are using it."
        onConfirm={handleDelete}
      />
    </div>
  );
}