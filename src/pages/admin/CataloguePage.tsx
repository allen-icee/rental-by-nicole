// src/pages/admin/CataloguePage.tsx
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, fetchItemDetails, getAllCategories, getAllTags, saveCatalogItem, deleteCatalogItem, updateCatalogAvailabilityStatus, updateCatalogFeaturedStatus, updateCatalogNewArrivalStatus, saveAvailability, deleteAvailability, type CatalogRow, type CategoryRow, type CatalogFormInput, type TagRow } from "@/services/admin.service";
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
import { FormMultipleImageUpload } from "@/components/ui/forms/FormMultipleImageUpload";
import { FormMultiSelect } from "@/components/ui/forms/FormMultiSelect";

export function CataloguePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<CatalogRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogRow | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful } } = useForm<CatalogFormInput>({
    mode: "onChange"
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: "sizes"
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [paginated, allCategories, allTags] = await Promise.all([
        getPaginatedData(
          "catalog_items",
          currentPage,
          pageSize,
          "name",
          true,
          searchQuery,
          ["name", "slug"]
        ),
        getAllCategories(),
        getAllTags()
      ]);

      setData(paginated.data);
      setTotalItems(paginated.count);
      setCategories(allCategories);
      setTags(allTags);

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

  async function handleOpenModal(item?: CatalogRow) {
    if (item) {
      setEditingItem(item);
      setIsModalLoading(true);
      setIsModalOpen(true);
      try {
        const details = await fetchItemDetails(item.id);
        reset({
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          availability_status: item.availability_status,
          featured: item.featured,
          is_new_arrival: item.is_new_arrival,
          price: item.price || 0,
          rental_days: item.rental_days || 2,
          reel_url: item.reel_url || "",
          sizes: details.sizes,
          reservedRanges: details.reservedRanges,
          images: details.images,
          tags: details.tags
        });
      } catch (err) {
        console.error(err);
        showToast({ tone: "error", title: "Error", message: "Failed to load Descriptions." });
      } finally {
        setIsModalLoading(false);
      }
    } else {
      setEditingItem(null);
      reset({
        category_id: "",
        name: "",
        slug: "",
        description: "",
        availability_status: "available",
        featured: false,
        is_new_arrival: false,
        price: 0,
        rental_days: 2,
        reel_url: "",
        sizes: [],
        reservedRanges: [],
        images: [],
        tags: []
      });
      setIsModalOpen(true);
    }
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

  async function handleAvailabilityChange(id: string, newStatus: CatalogRow["availability_status"]) {
    try {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, availability_status: newStatus } : item
        )
      );
      await updateCatalogAvailabilityStatus(id, newStatus);
      showToast({ tone: "success", title: "Updated", message: "Item availability changed." });
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to update availability." });
      fetchData();
    }
  }

  async function handleToggleFeatured(id: string, currentVal: boolean) {
    try {
      setData(prev => prev.map(i => i.id === id ? { ...i, featured: !currentVal } : i));
      await updateCatalogFeaturedStatus(id, !currentVal);
      showToast({ tone: "success", title: "Updated", message: "Featured status updated." });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  }

  async function handleToggleNewArrival(id: string, currentVal: boolean) {
    try {
      setData(prev => prev.map(i => i.id === id ? { ...i, is_new_arrival: !currentVal } : i));
      await updateCatalogNewArrivalStatus(id, !currentVal);
      showToast({ tone: "success", title: "Updated", message: "New Arrival status updated." });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  }

  const columns: Column<CatalogRow>[] = [
    { header: "Name", accessorKey: "name", className: "font-medium text-center" },
    {
      header: "Category",
      className: "text-center",
      cell: (row) => {
        const cat = categories.find((c) => c.id === row.category_id);
        return cat ? cat.name : <span className="text-pink-950/40">None</span>;
      },
    },
    { header: "Price", accessorKey: "price_display", className: "text-center" },
    {
      header: "Featured",
      className: "text-center",
      cell: (row) => (
        <button
          onClick={() => handleToggleFeatured(row.id, row.featured)}
          title="Toggle Featured"
          className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 mx-auto ${
            row.featured ? "bg-yellow-400" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <span
            className={`flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 ease-in-out ${
              row.featured ? "translate-x-6 text-yellow-500" : "translate-x-0.5 text-gray-400"
            }`}
          >
            <Icon icon="mdi:star" className="size-3.5" />
          </span>
        </button>
      ),
    },
    {
      header: "New Arrival",
      className: "text-center",
      cell: (row) => (
        <button
          onClick={() => handleToggleNewArrival(row.id, row.is_new_arrival)}
          title="Toggle New Arrival"
          className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 mx-auto ${
            row.is_new_arrival ? "bg-pink-500" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <span
            className={`flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 ease-in-out ${
              row.is_new_arrival ? "translate-x-6 text-pink-500" : "translate-x-0.5 text-gray-400"
            }`}
          >
            <Icon icon="mdi:sparkles" className="size-3.5" />
          </span>
        </button>
      ),
    },
    {
      header: "Actions",
      className: "text-center",
      cell: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1 text-gray-400 hover:text-brand-primary transition-colors"
            title="Edit Item"
          >
            <Icon icon="mdi:pencil" className="size-5" />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete Item"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isModalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="mdi:loading" className="size-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormMultiSelect
                  name="tags"
                  control={control}
                  label="Tags"
                  options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
                  placeholder="Select tags..."
                />
                <FormInput
                  name="reel_url"
                  control={control}
                  type="url"
                  label="Reel URL (Optional)"
                  placeholder="https://tiktok.com/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="price"
                  control={control}
                  type="number"
                  label="Price (PHP)"
                  placeholder="e.g. 499"
                  required
                />
                <FormInput
                  name="rental_days"
                  control={control}
                  type="number"
                  label="Rental Days"
                  placeholder="e.g. 2"
                  required
                />
              </div>

              <FormTextarea
                name="description"
                control={control}
                label="Description"
                maxLength={1000}
                rows={3}
                placeholder="Detailed description of the item..."
              />

              <div className="border-t border-pink-100 pt-4">
                <h3 className="text-sm font-bold text-pink-950 mb-3">Images</h3>
                <FormMultipleImageUpload
                  name="images"
                  control={control}
                  label="Catalogue Images"
                  maxSizeMB={5}
                  maxFiles={10}
                  helperText="Upload up to 10 images. They will be automatically compressed."
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

              <div className="border-t border-pink-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-pink-950">Sizes & Measurements</h3>
                </div>
                {sizeFields.length === 0 && <p className="text-sm text-pink-950/60 italic mb-4">No sizes added yet.</p>}
                <div className="space-y-4">
                  {sizeFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-pink-50/50 rounded-xl border border-pink-100 relative">
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="absolute top-4 right-4 text-pink-950/40 hover:text-red-500 transition-colors"
                      >
                        <Icon icon="mdi:trash-can-outline" className="size-5" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                        <FormInput name={`sizes.${index}.size_label`} control={control} label="Size Label" placeholder="e.g. S, M, L or One Size" required />
                        <FormInput name={`sizes.${index}.inventory_quantity`} control={control} label="Quantity" type="number" required />
                        <FormInput name={`sizes.${index}.sort_order`} control={control} label="Sort Order" type="number" required />
                      </div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pink-950/60 mb-3">Measurements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormInput name={`sizes.${index}.bust`} control={control} label="Bust" placeholder="e.g. 32-34&quot;" />
                        <FormInput name={`sizes.${index}.chest`} control={control} label="Chest" placeholder="e.g. 79-83cm" />
                        <FormInput name={`sizes.${index}.waist`} control={control} label="Waist" placeholder="e.g. 26-28&quot;" />
                        <FormInput name={`sizes.${index}.hips`} control={control} label="Hips" placeholder="e.g. 90cm" />
                        <FormInput name={`sizes.${index}.length`} control={control} label="Length" placeholder="e.g. 45&quot;" />
                        <FormInput name={`sizes.${index}.notes`} control={control} label="Notes" placeholder="e.g. Open fit" />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendSize({ size_label: "", inventory_quantity: 1, sort_order: sizeFields.length, bust: "", chest: "", waist: "", hips: "", length: "", notes: "" })}
                  className="mt-4 w-full py-2 text-xs font-semibold text-brand-primary bg-pink-50/50 hover:bg-pink-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-dashed border-pink-200"
                >
                  <Icon icon="mdi:plus" className="size-4" /> Add Size
                </button>
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
            </>
          )}
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