// src/services/catalogue.service.ts
import { catalogueItems as fallbackItems, categories as fallbackCategories, tags as fallbackTags } from "@/data/site-content";
import type { CatalogItem } from "@/features/catalogue/types/catalogue";
import { supabase } from "@/lib/supabase/client";
import { getManilaDate, formatDateManila } from "../utils/date-utils";

export type CatalogueData = {
  items: CatalogItem[];
  categories: string[];
  tags: string[];
  source: "supabase" | "fallback";
  errorDetail?: string;
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
  dress_id: string;
  start_date: string;
  end_date: string;
  size_id: string | null;
};
type ItemTagRow = { catalog_item_id: string; tag_id: string };

export async function getCatalogueData(): Promise<CatalogueData> {
  try {
    const [categoriesResult, tagsResult, itemsResult, fittingsResult] = await Promise.all([
      supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("tags").select("id,name").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase
        .from("catalog_items")
        .select("id,category_id,name,slug,description,availability_status,featured,is_new_arrival,price_display,reel_url")
        .is("archived_at", null)
        .order("name", { ascending: true }),
      supabase
        .from("fittings")
        .select("date,time")
        .eq("status", "Scheduled")
        .gte("date", formatDateManila(getManilaDate(), "yyyy-MM-dd"))
        .order("date")
    ]);

    if (categoriesResult.error || tagsResult.error || itemsResult.error) {
      throw categoriesResult.error ?? tagsResult.error ?? itemsResult.error;
    }

    const items = (itemsResult.data ?? []) as ItemRow[];

    const itemIds = items.map((item) => item.id);
    const [imagesResult, sizesResult, itemTagsResult, availabilityResult] = itemIds.length > 0 ? await Promise.all([
      supabase.from("catalog_item_images").select("catalog_item_id,image_url").in("catalog_item_id", itemIds).order("sort_order"),
      supabase.from("catalog_item_sizes").select("id,catalog_item_id,size_label,inventory_quantity").in("catalog_item_id", itemIds).order("sort_order"),
      supabase.from("catalog_item_tags").select("catalog_item_id,tag_id").in("catalog_item_id", itemIds),
      supabase.from("rental_bookings")
        .select("dress_id,start_date,end_date,size_id")
        .in("dress_id", itemIds)
        .neq("status", "Cancelled")
        .neq("status", "Returned")
        .gte("end_date", formatDateManila(getManilaDate(), "yyyy-MM-dd"))
        .order("start_date")
    ]) : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }];

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

          const totalInventory = itemSizes.reduce((total, size) => total + size.inventory_quantity, 0);

          const activeRentals = availability.filter((range) => range.dress_id === item.id);
          
          const todayStr = formatDateManila(getManilaDate(), "yyyy-MM-dd");
          const currentlyRented = activeRentals.filter((r) => {
            return r.start_date <= todayStr && r.end_date >= todayStr;
          }).length;
      
          let computedAvailabilityStatus = "";
          
          if (item.availability_status === "unavailable") {
            computedAvailabilityStatus = "Unavailable";
          } else if (activeRentals.length > 0) {
            computedAvailabilityStatus = "Available (See reserved dates)";
          } else {
            computedAvailabilityStatus = "Available";
          }
      
          const scheduledFittings = (fittingsResult?.data ?? []) as {date: string, time: string}[];
          const fittingRanges = scheduledFittings.map((f) => `Fitting Booked: ${formatDateManila(f.date)} at ${f.time || "TBA"}`);
          
          const reservedRanges = activeRentals.map((range) => {
            const sizeLabel = sizes.find((s) => s.id === range.size_id)?.size_label ?? "Unknown Size";
            return `Reserved (Size ${sizeLabel}): ${formatDateRangeNice(range.start_date, range.end_date)}`;
          });

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

            availabilityStatus: computedAvailabilityStatus,
            featured: item.featured,
            isNewArrival: item.is_new_arrival,
            priceDisplay: item.price_display,
            reelUrl: item.reel_url ?? undefined,
            images: itemImages.length > 0 ? itemImages : [placeholderImage],
            sizes: itemSizes.map((size) => size.size_label),
          measurements: itemMeasurements.length > 0 ? itemMeasurements : [{ size: "One Size", bust: "N/A", waist: "N/A", length: "N/A" }],
          inventoryQuantity: totalInventory,
          reservedRanges: [...reservedRanges, ...fittingRanges]
        } satisfies CatalogItem;
      })
    };
  } catch (error) {
    console.warn("Using fallback catalogue data because Supabase is not ready.", error);
    return fallbackCatalogueData(error);
  }
}

function fallbackCatalogueData(error?: any): CatalogueData {
  let errorDetail = "Unknown Error";
  if (error instanceof Error) {
    errorDetail = `${error.name}: ${error.message}`;
  } else if (typeof error === "string") {
    errorDetail = error;
  } else if (error && typeof error === "object") {
    errorDetail = JSON.stringify(error);
  }
  
  return {
    items: fallbackItems,
    categories: fallbackCategories,
    tags: fallbackTags,
    source: "fallback",
    errorDetail: error ? errorDetail : undefined
  };
}

function formatDateRangeNice(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "Unavailable date";

  const s = startDate ? new Date(startDate) : null;
  const e = endDate ? new Date(endDate) : null;

  if (!s || !e || startDate === endDate) {
    return s ? s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unavailable date";
  }

  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const sDay = s.toLocaleDateString('en-US', { day: 'numeric' });
  const sYear = s.toLocaleDateString('en-US', { year: 'numeric' });
  
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  const eDay = e.toLocaleDateString('en-US', { day: 'numeric' });
  const eYear = e.toLocaleDateString('en-US', { year: 'numeric' });

  if (sYear === eYear && sMonth === eMonth) {
    return `${sMonth} ${sDay}–${eDay}, ${sYear}`;
  } else if (sYear === eYear) {
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
  } else {
    return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
  }
}

export async function getTestimonials() {
  try {
    const { data, error } = await supabase.from("customer_reviews").select("*").eq("status", "approved").order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(item => ({
        ...item,
        date: formatDateManila(item.created_at, "MMMM yyyy")
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

export async function getRentalTerms() {
  try {
    const { data, error } = await supabase.from("rental_terms").select("*").eq("is_published", true).order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (error) {
    console.warn("Using fallback rental terms", error);
  }
  
  return [
    { title: "Condition 1", description: "Rental period is for 2 days only (exact 48 hours)", icon: "mdi:clock-outline", sort_order: 1 },
    { title: "Condition 2", description: "A 50% down payment is required to secure your slot.", icon: "mdi:cash-register", sort_order: 2 },
    { title: "Condition 3", description: "P200 security deposit must be paid upon receiving the gown.", icon: "mdi:shield-check", sort_order: 3 },
    { title: "Condition 4", description: "Security deposit is refundable once the gown is returned in good condition.", icon: "mdi:cash-refund", sort_order: 4 },
    { title: "Condition 5", description: "No need to laundry the gown before returning.", icon: "mdi:washing-machine-off", sort_order: 5 },
    { title: "Condition 6", description: "Please handle the gown with proper care and cleanliness.", icon: "mdi:hand-heart", sort_order: 6 },
    { title: "Condition 7", description: "Any damages, excessive stains, missing accessories, or alterations will be charged accordingly.", icon: "mdi:alert-circle-outline", sort_order: 7 },
    { title: "Condition 8", description: "Late returns may incur additional fees.", icon: "mdi:calendar-alert", sort_order: 8 },
    { title: "Condition 9", description: "Reservation/payment is strictly non-refundable once confirmed.", icon: "mdi:cancel", sort_order: 9 },
    { title: "Condition 10", description: "Kindly return the gown on the agreed date and time.", icon: "mdi:calendar-check", sort_order: 10 },
    { title: "Condition 11", description: "We are Gerona-based. Meet-ups within Tarlac City are available with a corresponding fee.", icon: "mdi:map-marker", sort_order: 11 },
    { title: "Condition 12", description: "Shipping via the Grab/Lalamove may also be arranged, with delivery fees to be shouldered by the client.", icon: "mdi:truck-delivery", sort_order: 12 }
  ];
}

