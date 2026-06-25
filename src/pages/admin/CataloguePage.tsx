// src/pages/admin/CataloguePage.tsx
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, fetchItemDetails, getAllCategories, getAllTags, saveCatalogItem, deleteCatalogItem, updateCatalogAvailabilityStatus, type CatalogRow, type CategoryRow, type CatalogFormInput, type TagRow } from "@/services/admin.service";
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

  const { fields: rangeFields, append: appendRange, remove: removeRange } = useFieldArray({
    control,
    name: "reservedRanges"
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
          "sort_order",
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
          status: item.status,
          availability_status: item.availability_status,
          featured: item.featured,
          is_new_arrival: item.is_new_arrival,
          price_display: item.price_display || "",
          reel_url: item.reel_url || "",
          sort_order: item.sort_order,
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
        status: "draft",
        availability_status: "available",
        featured: false,
        is_new_arrival: false,
        price_display: "",
        reel_url: "",
        sort_order: data.length > 0 ? Math.max(...data.map(d => d.sort_order)) + 1 : 1,
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
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${row.status === "published"
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
        <div className="relative inline-flex items-center">
          <select
            value={row.availability_status}
            onChange={(e) => handleAvailabilityChange(row.id, e.target.value as CatalogRow["availability_status"])}
            className={`cursor-pointer appearance-none rounded-full py-1 pl-2.5 pr-6 text-xs font-semibold outline-none transition-colors ${row.availability_status === "available"
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : row.availability_status === "reserved"
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
          >
            <option value="available" className="bg-white text-pink-950 font-medium">Available</option>
            <option value="reserved" className="bg-white text-pink-950 font-medium">Reserved</option>
            <option value="unavailable" className="bg-white text-pink-950 font-medium">Unavailable</option>
          </select>
          <Icon
            icon="mdi:chevron-down"
            className={`pointer-events-none absolute right-1.5 size-3.5 ${row.availability_status === "available" ? "text-blue-700" :
                row.availability_status === "reserved" ? "text-purple-700" :
                  "text-orange-700"
              }`}
          />
        </div>
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
          {isModalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="mdi:loading" className="size-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <>
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

                <FormMultiSelect
                  name="tags"
                  control={control}
                  label="Tags"
                  options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
                  placeholder="Select tags..."
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
                  name="reel_url"
                  control={control}
                  type="url"
                  label="Reel URL (Optional)"
                  placeholder="https://tiktok.com/..."
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

              <div className="border-t border-pink-100 pt-6">
                <h3 className="text-lg font-bold text-pink-950 mb-4">Images</h3>
                <FormMultipleImageUpload
                  name="images"
                  control={control}
                  label="Catalogue Images"
                  maxSizeMB={5}
                  maxFiles={10}
                  helperText="Upload up to 10 images. They will be automatically compressed."
                />
              </div>

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

              <div className="border-t border-pink-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-pink-950">Sizes & Measurements</h3>
                  <button
                    type="button"
                    onClick={() => appendSize({ size_label: "", inventory_quantity: 1, sort_order: sizeFields.length, bust: "", chest: "", waist: "", hips: "", length: "", notes: "" })}
                    className="text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
                  >
                    <Icon icon="mdi:plus" /> Add Size
                  </button>
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
              </div>

              <div className="border-t border-pink-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-pink-950">Availability Calendar</h3>
                  <button
                    type="button"
                    onClick={() => appendRange({ start_date: "", end_date: "", label: "" })}
                    className="text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
                  >
                    <Icon icon="mdi:plus" /> Add Reserved Range
                  </button>
                </div>
                {rangeFields.length === 0 && <p className="text-sm text-pink-950/60 italic mb-4">No dates blocked.</p>}
                <div className="space-y-4">
                  {rangeFields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                      <div className="flex-1 w-full"><FormInput name={`reservedRanges.${index}.start_date`} control={control} label="Start Date" type="date" required /></div>
                      <div className="flex-1 w-full"><FormInput name={`reservedRanges.${index}.end_date`} control={control} label="End Date" type="date" required /></div>
                      <div className="flex-1 w-full"><FormInput name={`reservedRanges.${index}.label`} control={control} label="Label (optional)" placeholder="e.g. Dry Cleaning" /></div>
                      <button
                        type="button"
                        onClick={() => removeRange(index)}
                        className="mb-1 h-11 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Icon icon="mdi:trash-can-outline" className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
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