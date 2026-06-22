import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { getPaginatedData, getAllCategories, saveCatalogItem, type CatalogRow, type CategoryRow, type CatalogFormInput } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast-context";

export function CataloguePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<CatalogRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogRow | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CatalogFormInput>();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [paginated, allCategories] = await Promise.all([
        getPaginatedData("catalog_items", currentPage, pageSize, "sort_order", true),
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
        price_display: "",
        instagram_reel_url: "",
        sort_order: totalItems * 10,
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
        title="Catalogue Items"
        description="Manage your dresses, accessories, and other rental items."
        actionLabel="Add Item"
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
        title={editingItem ? "Edit Catalogue Item" : "Add Catalogue Item"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Category</label>
              <select
                {...register("category_id")}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-white"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Price Display</label>
              <input
                {...register("price_display")}
                placeholder="e.g. $50/day"
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Slug (optional)</label>
              <input
                {...register("slug")}
                placeholder="Leave blank to auto-generate"
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-950 mb-1">Instagram Reel URL</label>
            <input
              type="url"
              {...register("instagram_reel_url")}
              placeholder="https://instagram.com/reel/..."
              className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-pink-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Availability</label>
              <select
                {...register("availability_status")}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent bg-white"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-pink-950 mb-1">Sort Order</label>
              <input
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
                className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("featured")}
                className="rounded border-pink-300 text-brand-accent focus:ring-brand-accent size-5 cursor-pointer"
              />
              <span className="text-sm font-medium text-pink-950">Featured Item</span>
            </label>
            <p className="text-xs text-pink-950/60 mt-1 pl-7">Featured items are highlighted on the home page.</p>
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
              {isSubmitting ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}