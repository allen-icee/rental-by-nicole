// src/pages/admin/RentalGuidePage.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, saveGuide, deleteGuide, saveTerm, deleteTerm, type GuideRow, type TermRow } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal, ConfirmModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormTextarea } from "@/components/ui/forms/FormTextarea";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { FormToggle } from "@/components/ui/forms/FormToggle";

type ActiveTab = "terms" | "guides";

type FormData = {
  id?: string;
  title: string;
  bodyOrDescription: string;
  icon?: string;
  sort_order: number;
  is_published: boolean;
};

export function RentalGuidePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("terms");
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({
    mode: "onChange"
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery, activeTab]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const table = activeTab === "terms" ? "rental_terms" : "rental_guides";
      const searchCols = activeTab === "terms" ? ["title", "description"] : ["title", "body"];
      const { data: items, count } = await getPaginatedData(
        table,
        currentPage,
        pageSize,
        "sort_order",
        true,
        searchQuery,
        searchCols
      );
      setData(items);
      setTotalItems(count);

      const totalPages = Math.ceil(count / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load data." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(item?: any) {
    if (item) {
      setEditingItem(item);
      reset({
        id: item.id,
        title: item.title,
        bodyOrDescription: activeTab === "terms" ? item.description : item.body,
        icon: activeTab === "terms" ? item.icon : "",
        sort_order: item.sort_order,
        is_published: item.is_published,
      });
    } else {
      setEditingItem(null);
      reset({
        title: "",
        bodyOrDescription: "",
        icon: "",
        sort_order: data.length > 0 ? Math.max(...data.map(d => d.sort_order)) + 1 : 1,
        is_published: true,
      });
    }
    setIsModalOpen(true);
  }

  async function onSubmit(formData: FormData) {
    try {
      if (activeTab === "terms") {
        await saveTerm({
          id: formData.id,
          title: formData.title,
          description: formData.bodyOrDescription,
          icon: formData.icon || null,
          sort_order: formData.sort_order,
          is_published: formData.is_published
        });
      } else {
        await saveGuide({
          id: formData.id,
          title: formData.title,
          body: formData.bodyOrDescription,
          sort_order: formData.sort_order,
          is_published: formData.is_published
        });
      }
      showToast({ tone: "success", title: "Success", message: "Item saved successfully." });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save item." });
    }
  }

  function confirmDelete(id: string) {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      if (activeTab === "terms") {
        await deleteTerm(itemToDelete);
      } else {
        await deleteGuide(itemToDelete);
      }
      showToast({ tone: "success", title: "Deleted", message: "Item removed." });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to delete item." });
    }
  }

  const columns: Column<any>[] = [
    { header: "Title", accessorKey: "title", className: "font-medium" },
    ...(activeTab === "terms" ? [{ header: "Icon", accessorKey: "icon" }] : []),
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
        title="Rental Guidelines & Terms"
        description="Manage the terms and conditions flowchart and fitting guidelines section."
        actionLabel={activeTab === "terms" ? "Add Term" : "Add Guide"}
        onAction={() => handleOpenModal()}
      >
        <div className="relative w-full max-w-sm">
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-950/40 size-5"
          />
          <input
            type="text"
            placeholder={`Search ${activeTab === "terms" ? "terms" : "guides"}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-full border-2 border-pink-100 bg-white pl-11 pr-4 text-sm text-pink-950 shadow-sm outline-none transition-all focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
          />
        </div>
      </AdminPageHeader>

      <div className="mb-6 flex space-x-1 rounded-xl bg-pink-100/50 p-1 max-w-fit">
        <button
          onClick={() => { setActiveTab("terms"); setCurrentPage(1); setSearchQuery(""); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "terms" ? "bg-white text-brand-primary shadow" : "text-pink-600 hover:text-pink-900 hover:bg-white/50"
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => { setActiveTab("guides"); setCurrentPage(1); setSearchQuery(""); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "guides" ? "bg-white text-brand-primary shadow" : "text-pink-600 hover:text-pink-900 hover:bg-white/50"
          }`}
        >
          Fitting Guidelines
        </button>
      </div>

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
        title={editingItem ? (activeTab === "terms" ? "Edit Term" : "Edit Guide") : (activeTab === "terms" ? "Add Term" : "Add Guide")}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            control={control}
            label="Title"
            required
            maxLength={100}
          />

          <FormTextarea
            name="bodyOrDescription"
            control={control}
            label={activeTab === "terms" ? "Description" : "Body"}
            required
            maxLength={2000}
            rows={5}
            helperText={activeTab === "terms" ? "The short description for the term." : "Markdown formatting is allowed."}
          />

          {activeTab === "terms" && (
            <FormInput
              name="icon"
              control={control}
              label="Icon (Optional)"
              placeholder="e.g. mdi:check-circle"
              helperText="Iconify icon name for the flowchart step."
            />
          )}

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
            label="Active"
            description="Inactive items are hidden from customers."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-pink-100">
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
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}