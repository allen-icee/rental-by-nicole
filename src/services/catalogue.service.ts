// src/services/catalogue.service.ts
import { catalogueItems as fallbackItems, categories as fallbackCategories, tags as fallbackTags } from "@/data/site-content";
import type { CatalogItem } from "@/features/catalogue/types/catalogue";
import { supabase } from "@/lib/supabase/client";

export type CatalogueData = {
  items: CatalogItem[];
  categories: string[];
  tags: string[];
  source: "supabase" | "fallback";
};

type CategoryRow = { id: string; name: string };
type TagRow = { id: string; name: string };
type ItemRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  availability_status: "available" | "reserved" | "unavailable";
  featured: boolean;
  is_new_arrival: boolean;
  price_display: string;
  reel_url: string | null;
};
type ImageRow = { catalog_item_id: string; image_url: string };
type SizeRow = { id: string; catalog_item_id: string; size_label: string; inventory_quantity: number };
type MeasurementRow = {
  catalog_item_size_id: string;
  bust: string | null;
  chest: string | null;
  waist: string | null;
  hips: string | null;
  length: string | null;
  notes: string | null;
};
type AvailabilityRow = {
  catalog_item_id: string;
  start_date: string | null;
  end_date: string | null;
  label: string | null;
};
type ItemTagRow = { catalog_item_id: string; tag_id: string };

export async function getCatalogueData(): Promise<CatalogueData> {
  try {
    const [categoriesResult, tagsResult, itemsResult] = await Promise.all([
      supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("tags").select("id,name").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase
        .from("catalog_items")
        .select("id,category_id,name,slug,description,availability_status,featured,is_new_arrival,price_display,reel_url")
        .order("featured", { ascending: false })
        .order("name", { ascending: true })
    ]);

    if (categoriesResult.error || tagsResult.error || itemsResult.error) {
      throw categoriesResult.error ?? tagsResult.error ?? itemsResult.error;
    }

    const items = (itemsResult.data ?? []) as ItemRow[];
    if (items.length === 0) {
      return fallbackCatalogueData();
    }

    const itemIds = items.map((item) => item.id);
    const [imagesResult, sizesResult, itemTagsResult, availabilityResult] = await Promise.all([
      supabase.from("catalog_item_images").select("catalog_item_id,image_url").in("catalog_item_id", itemIds).order("sort_order"),
      supabase.from("catalog_item_sizes").select("id,catalog_item_id,size_label,inventory_quantity").in("catalog_item_id", itemIds).order("sort_order"),
      supabase.from("catalog_item_tags").select("catalog_item_id,tag_id").in("catalog_item_id", itemIds),
      supabase.from("availability_ranges").select("catalog_item_id,start_date,end_date,label").in("catalog_item_id", itemIds).order("start_date")
    ]);

    if (imagesResult.error || sizesResult.error || itemTagsResult.error || availabilityResult.error) {
      throw imagesResult.error ?? sizesResult.error ?? itemTagsResult.error ?? availabilityResult.error;
    }

    const sizes = (sizesResult.data ?? []) as SizeRow[];
    const sizeIds = sizes.map((size) => size.id);
    const measurementsResult = sizeIds.length
      ? await supabase
          .from("catalog_item_measurements")
          .select("catalog_item_size_id,bust,chest,waist,hips,length,notes")
          .in("catalog_item_size_id", sizeIds)
      : { data: [], error: null };

    if (measurementsResult.error) {
      throw measurementsResult.error;
    }

    const categories = (categoriesResult.data ?? []) as CategoryRow[];
    const tags = (tagsResult.data ?? []) as TagRow[];
    const images = (imagesResult.data ?? []) as ImageRow[];
    const itemTags = (itemTagsResult.data ?? []) as ItemTagRow[];
    const availability = (availabilityResult.data ?? []) as AvailabilityRow[];
    const measurements = (measurementsResult.data ?? []) as MeasurementRow[];

    const categoryById = new Map(categories.map((category) => [category.id, category.name]));
    const tagById = new Map(tags.map((tag) => [tag.id, tag.name]));
    const placeholderImage = "/assets/boutique-hero.png";

    return {
      source: "supabase",
      categories: categories.map((category) => category.name),
      tags: tags.map((tag) => tag.name),
      items: items.map((item) => {
        const itemSizes = sizes.filter((size) => size.catalog_item_id === item.id);
        const itemMeasurements = itemSizes.map((size) => {
          const measurement = measurements.find((entry) => entry.catalog_item_size_id === size.id);

          return {
            size: size.size_label,
            bust: measurement?.bust ?? "N/A",
            chest: measurement?.chest ?? undefined,
            waist: measurement?.waist ?? "N/A",
            hips: measurement?.hips ?? undefined,
            length: measurement?.length ?? "N/A",
            notes: measurement?.notes ?? undefined
          };
        });
          const itemImages = images.filter((image) => image.catalog_item_id === item.id).map((image) => image.image_url);

          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            category: item.category_id ? categoryById.get(item.category_id) ?? "Uncategorized" : "Uncategorized",
            tags: itemTags
              .filter((itemTag) => itemTag.catalog_item_id === item.id)
              .map((itemTag) => tagById.get(itemTag.tag_id))
              .filter((tagName): tagName is string => Boolean(tagName)),

            availabilityStatus: item.availability_status,
            featured: item.featured,
            isNewArrival: item.is_new_arrival,
            priceDisplay: item.price_display,
            reelUrl: item.reel_url ?? undefined,
            images: itemImages.length > 0 ? itemImages : [placeholderImage],
            sizes: itemSizes.map((size) => size.size_label),
          measurements: itemMeasurements.length > 0 ? itemMeasurements : [{ size: "One Size", bust: "N/A", waist: "N/A", length: "N/A" }],
          inventoryQuantity: itemSizes.reduce((total, size) => total + size.inventory_quantity, 0),
          reservedRanges: availability
            .filter((range) => range.catalog_item_id === item.id)
            .map((range) => range.label ?? formatDateRange(range.start_date, range.end_date))
        } satisfies CatalogItem;
      })
    };
  } catch (error) {
    console.warn("Using fallback catalogue data because Supabase is not ready.", error);
    return fallbackCatalogueData();
  }
}

function fallbackCatalogueData(): CatalogueData {
  return {
    items: fallbackItems,
    categories: fallbackCategories,
    tags: fallbackTags,
    source: "fallback"
  };
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) {
    return "Unavailable date";
  }

  if (startDate === endDate || !endDate) {
    return startDate ?? "Unavailable date";
  }

  return `${startDate} - ${endDate}`;
}

export async function getTestimonials() {
  try {
    const { data, error } = await supabase.from("customer_reviews").select("*").eq("status", "approved").order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(item => ({
        ...item,
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }));
    }
  } catch (error) {
    console.warn("Using fallback testimonials", error);
  }
  return import("@/data/site-content").then(m => m.testimonials);
}

export async function getFaqs() {
  try {
    const { data, error } = await supabase.from("faqs").select("*").eq("is_published", true).order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (error) {
    console.warn("Using fallback faqs", error);
  }
  return import("@/data/site-content").then(m => m.faqs);
}

export async function getRentalGuides() {
  try {
    const { data, error } = await supabase.from("rental_guides").select("*").eq("is_published", true).order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (error) {
    console.warn("Using fallback rental guides", error);
  }
  return import("@/data/site-content").then(m => m.rentalGuideSections);
}

