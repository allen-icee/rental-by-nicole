// src/pages/admin/RentalGuidePage.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, saveGuide, deleteGuide, type GuideRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal, ConfirmModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormTextarea } from "@/components/ui/forms/FormTextarea";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { FormToggle } from "@/components/ui/forms/FormToggle";

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
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GuideRow | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful } } = useForm<GuideFormData>({
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
        "rental_guides",
        currentPage,
        pageSize,
        "sort_order",
        true,
        searchQuery,
        ["title", "body"]
      );
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
        sort_order: data.length > 0 ? Math.max(...data.map(d => d.sort_order)) + 1 : 1,
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

  function confirmDelete(id: string) {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      await deleteGuide(itemToDelete);
      showToast({ tone: "success", title: "Deleted", message: "Guide removed." });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to delete guide." });
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
          {row.is_published ? "Active" : "Inactive"}
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
        title="Rental Guides"
        description="Manage the instructional guides on the rental process."
        actionLabel="Add Guide"
        onAction={() => handleOpenModal()}
      >
        <div className="relative w-full max-w-sm">
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
          />
          <input
            type="text"
            placeholder="Search guides..."
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
        title={editingItem ? "Edit Guide" : "Add Guide"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            name="title"
            control={control}
            label="Title"
            required
            maxLength={100}
          />

          <FormTextarea
            name="body"
            control={control}
            label="Body"
            required
            maxLength={2000}
            rows={5}
            helperText="Markdown formatting is allowed."
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
            name="is_published"
            control={control}
            label="Active Guide"
            description="Inactive guides are hidden from customers."
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
        message="Are you sure you want to delete this guide? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}