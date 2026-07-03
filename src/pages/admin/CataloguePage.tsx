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

  // Reserve Availability Modal State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reservingItem, setReservingItem] = useState<CatalogRow | null>(null);
  const [existingReservations, setExistingReservations] = useState<any[]>([]);
  const [isReserveLoading, setIsReserveLoading] = useState(false);
  
  const { control: reserveControl, handleSubmit: handleReserveSubmit, reset: resetReserve, setValue: setReserveValue, watch: watchReserve, formState: { isSubmitting: isReserveSubmitting, isValid: isReserveValid, isDirty: isReserveDirty } } = useForm({
    mode: "onChange",
    defaultValues: {
      start_date: "",
      end_date: "",
      customer_name: "",
      label: "",
      availability_status: "available" as CatalogRow["availability_status"]
    }
  });

  const reserveStartDate = watchReserve("start_date");

  useEffect(() => {
    if (reserveStartDate && reservingItem?.rental_days) {
      const start = new Date(reserveStartDate);
      start.setDate(start.getDate() + reservingItem.rental_days);
      setReserveValue("end_date", start.toISOString().split("T")[0], { shouldValidate: true, shouldDirty: true });
    }
  }, [reserveStartDate, reservingItem, setReserveValue]);

  async function onReserveSubmit(data: any) {
    if (!reservingItem) return;
    try {
      await saveAvailability({
        catalog_item_id: reservingItem.id,
        start_date: data.start_date,
        end_date: data.end_date,
        customer_name: data.customer_name,
        label: data.label,
      });
      if (reservingItem.availability_status !== data.availability_status) {
        await handleAvailabilityChange(reservingItem.id, data.availability_status);
      } else {
        fetchData();
      }
      showToast({ tone: "success", title: "Success", message: "Dates reserved successfully." });
      
      // Refresh reservations
      loadReservations(reservingItem);
      
      // Reset form but keep status
      resetReserve({
        start_date: "",
        end_date: "",
        customer_name: "",
        label: "",
        availability_status: data.availability_status
      });
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to reserve dates." });
    }
  }

  async function loadReservations(item: CatalogRow) {
    setIsReserveLoading(true);
    try {
      const details = await fetchItemDetails(item.id);
      setExistingReservations(details.reservedRanges || []);
    } catch (err) {
      console.error(err);
      showToast({ tone: "error", title: "Error", message: "Failed to load existing reservations." });
    } finally {
      setIsReserveLoading(false);
    }
  }

  async function handleOpenReserveModal(item: CatalogRow) {
    setReservingItem(item);
    setExistingReservations([]);
    resetReserve({
      start_date: "",
      end_date: "",
      customer_name: "",
      label: "",
      availability_status: item.availability_status
    });
    setIsReserveModalOpen(true);
    await loadReservations(item);
  }

  async function handleDeleteReservation(id: string) {
    try {
      await deleteAvailability(id);
      showToast({ tone: "success", title: "Success", message: "Reservation deleted." });
      if (reservingItem) {
        await loadReservations(reservingItem);
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to delete reservation." });
    }
  }

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
      if (reservingItem?.id === id) {
        setReservingItem(prev => prev ? { ...prev, availability_status: newStatus } : null);
      }
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
      header: "Featured",
      cell: (row) => (
        <button 
          onClick={() => handleToggleFeatured(row.id, row.featured)}
          className={`p-1 rounded transition-colors ${row.featured ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
          title="Toggle Featured"
        >
          <Icon icon="mdi:star" className="size-5" />
        </button>
      ),
    },
    {
      header: "New Arrival",
      cell: (row) => (
        <button 
          onClick={() => handleToggleNewArrival(row.id, row.is_new_arrival)}
          className={`p-1 rounded transition-colors ${row.is_new_arrival ? "text-pink-500 hover:text-pink-600" : "text-gray-300 hover:text-pink-500"}`}
          title="Toggle New Arrival"
        >
          <Icon icon="mdi:sparkles" className="size-5" />
        </button>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenReserveModal(row)}
            className="text-brand-accent hover:text-brand-primary transition-colors"
            title="Reserve Dates"
          >
            <Icon icon="mdi:calendar-lock" className="size-5" />
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            className="text-brand-primary hover:text-brand-accent transition-colors"
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

      <AdminModal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title={`Reserve Dates: ${reservingItem?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Existing Reservations Section */}
          <div>
            <h3 className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-3">Existing Reservations</h3>
            {isReserveLoading ? (
              <p className="text-sm text-pink-950/60 italic">Loading...</p>
            ) : existingReservations.length === 0 ? (
              <p className="text-sm text-pink-950/60 italic">No existing reservations for this item.</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {existingReservations.map(res => (
                  <li key={res.id} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-lg border border-pink-100 text-sm">
                    <div>
                      <div className="font-semibold text-pink-950">
                        {new Date(res.start_date).toLocaleDateString()} - {new Date(res.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-pink-950/70">
                        {res.customer_name || 'No customer name'} {res.label && `(${res.label})`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReservation(res.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Reservation"
                    >
                      <Icon icon="mdi:trash-can-outline" className="size-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="border-pink-100" />

          {/* Add New Reservation Form */}
          <form onSubmit={handleReserveSubmit(onReserveSubmit)} className="space-y-4">
            <h3 className="text-sm font-bold text-brand-accent uppercase tracking-wider">Add New Reservation</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="start_date"
                control={reserveControl}
                type="date"
                label="Start Date"
                required
              />
              <FormInput
                name="end_date"
                control={reserveControl}
                type="date"
                label="End Date (Auto-computes)"
                required
              />
            </div>

            <FormInput
              name="customer_name"
              control={reserveControl}
              label="Customer Name (Optional)"
              placeholder="e.g. Jane Doe"
            />

            <FormInput
              name="label"
              control={reserveControl}
              label="Label (Optional)"
              placeholder="e.g. Cleaning, Unavailable"
            />

            <FormSelect
              name="availability_status"
              control={reserveControl}
              label="Update Item Availability"
              searchable={false}
              options={[
                { value: "available", label: "Available" },
                { value: "reserved", label: "Reserved" },
                { value: "unavailable", label: "Unavailable" }
              ]}
            />

            <div className="pt-6 flex justify-end gap-3 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(false)}
                className="rounded-xl px-6 py-3 font-semibold text-pink-950 hover:bg-pink-50 transition-colors"
              >
                Close
              </button>
              <FormSubmitButton 
                isDirty={isReserveDirty} 
                isValid={isReserveValid} 
                isSubmitting={isReserveSubmitting} 
                isSubmitSuccessful={false} 
                defaultText="Save Reservation"
              />
            </div>
          </form>
        </div>
      </AdminModal>
    </div>
  );
}