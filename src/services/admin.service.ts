// src/services/admin.service.ts
import { catalogueItems } from "@/data/site-content";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

export type AdminStats = {
  publishedItems: number;
  newInquiries: number;
  pendingReviews: number;
  storageBuckets: number;
  source: "supabase" | "fallback";
};

export type CategoryRow = Tables["categories"]["Row"];
export type TagRow = Tables["tags"]["Row"];
export type CatalogRow = Tables["catalog_items"]["Row"];
export type AvailabilityRow = Tables["availability_ranges"]["Row"];
export type GuideRow = Tables["rental_guides"]["Row"];
export type FaqRow = Tables["faqs"]["Row"];
export type ReviewRow = Tables["customer_reviews"]["Row"];
export type InquiryRow = Tables["inquiries"]["Row"];
export type SettingsRow = Tables["settings"]["Row"];

export type CatalogFormInput = {
  id?: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  status: CatalogRow["status"];
  availability_status: CatalogRow["availability_status"];
  featured: boolean;
  is_new_arrival: boolean;
  price_display: string;
  instagram_reel_url: string | null;
  sort_order: number;
  sizes: {
    id?: string;
    size_label: string;
    inventory_quantity: number;
    sort_order: number;
    bust: string;
    waist: string;
    length: string;
    notes: string;
  }[];
  reservedRanges: {
    id?: string;
    start_date: string;
    end_date: string;
    label: string;
  }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [items, inquiries, reviews] = await Promise.all([
      supabase.from("catalog_items").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("customer_reviews").select("id", { count: "exact", head: true }).eq("status", "pending")
    ]);

    if (items.error || inquiries.error || reviews.error) {
      throw items.error ?? inquiries.error ?? reviews.error;
    }

    return {
      publishedItems: items.count ?? 0,
      newInquiries: inquiries.count ?? 0,
      pendingReviews: reviews.count ?? 0,
      storageBuckets: 3,
      source: "supabase"
    };
  } catch (error) {
    console.warn("Using fallback admin stats because Supabase is not ready.", error);
    return {
      publishedItems: catalogueItems.length,
      newInquiries: 0,
      pendingReviews: 0,
      storageBuckets: 3,
      source: "fallback"
    };
  }
}

export async function getPaginatedData<T extends keyof Tables>(
  table: T,
  page: number,
  pageSize: number,
  orderBy: string,
  ascending: boolean = true,
  searchQuery?: string,
  searchColumns?: string[]
): Promise<{ data: Tables[T]["Row"][]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select("*", { count: "exact" });

  if (searchQuery && searchColumns && searchColumns.length > 0) {
    const safeQuery = `"%${searchQuery.replace(/"/g, '""')}%"`;
    const orFilter = searchColumns.map(col => `${col}.ilike.${safeQuery}`).join(',');
    query = query.or(orFilter);
  }

  const { data, count, error } = await query
    .order(orderBy, { ascending })
    .range(from, to);

  if (error) throw error;
  return { data: data as any, count: count || 0 };
}

export async function getAllCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

export async function getAllCatalogItems() {
  const { data, error } = await supabase.from("catalog_items").select("id, name").order("sort_order");
  if (error) throw error;
  return data;
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveCategory(input: { id?: string; name: string; slug: string; description?: string; sort_order: number; is_active: boolean }) {
  const payload = {
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description || null,
    sort_order: input.sort_order,
    is_active: input.is_active
  };

  return input.id
    ? supabase.from("categories").update(payload).eq("id", input.id)
    : supabase.from("categories").insert(payload);
}

export async function deleteCategory(id: string) {
  return supabase.from("categories").delete().eq("id", id);
}

export async function saveTag(input: { id?: string; name: string; slug: string; sort_order: number; is_active: boolean }) {
  const payload = {
    name: input.name,
    slug: input.slug || slugify(input.name),
    sort_order: input.sort_order,
    is_active: input.is_active
  };

  return input.id
    ? supabase.from("tags").update(payload).eq("id", input.id)
    : supabase.from("tags").insert(payload);
}

export async function deleteTag(id: string) {
  return supabase.from("tags").delete().eq("id", id);
}

export async function fetchItemDetails(itemId: string) {
  const [sizesResult, measurementsResult, availabilityResult] = await Promise.all([
    supabase.from('catalog_item_sizes').select('*').eq('catalog_item_id', itemId).order('sort_order'),
    supabase.from('catalog_item_measurements').select('*'),
    supabase.from('availability_ranges').select('*').eq('catalog_item_id', itemId)
  ]);

  const sizes = sizesResult.data || [];
  const measurements = measurementsResult.data || [];
  const reservedRanges = availabilityResult.data || [];

  const formattedSizes = sizes.map(size => {
    const measurement = measurements.find(m => m.catalog_item_size_id === size.id);
    return {
      id: size.id,
      size_label: size.size_label,
      inventory_quantity: size.inventory_quantity,
      sort_order: size.sort_order,
      bust: measurement?.bust || '',
      waist: measurement?.waist || '',
      length: measurement?.length || '',
      notes: measurement?.notes || ''
    };
  });

  const formattedRanges = reservedRanges.map(range => ({
    id: range.id,
    start_date: range.start_date || '',
    end_date: range.end_date || '',
    label: range.label || ''
  }));

  return { sizes: formattedSizes, reservedRanges: formattedRanges };
}

export async function saveCatalogItem(input: CatalogFormInput) {
  const itemPayload = {
    category_id: input.category_id,
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    status: input.status,
    availability_status: input.availability_status,
    featured: input.featured,
    is_new_arrival: input.is_new_arrival,
    price_display: input.price_display,
    instagram_reel_url: input.instagram_reel_url || null,
    sort_order: input.sort_order,
    archived_at: input.status === "archived" ? new Date().toISOString() : null
  };

  let itemId = input.id;
  if (itemId) {
    const { error } = await supabase.from("catalog_items").update(itemPayload).eq("id", itemId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("catalog_items").insert(itemPayload).select("id").single();
    if (error) throw error;
    itemId = data.id;
  }

  if (!itemId) throw new Error("Failed to save catalog item");

  // Handle sizes
  const { data: existingSizes } = await supabase.from("catalog_item_sizes").select("id").eq("catalog_item_id", itemId);
  const existingSizeIds = new Set(existingSizes?.map(s => s.id) || []);
  const inputSizeIds = new Set(input.sizes.map(s => s.id).filter(Boolean));
  
  const sizesToDelete = [...existingSizeIds].filter(id => !inputSizeIds.has(id));
  if (sizesToDelete.length > 0) {
    await supabase.from("catalog_item_sizes").delete().in("id", sizesToDelete);
  }

  for (const size of input.sizes) {
    const sizePayload = {
      catalog_item_id: itemId,
      size_label: size.size_label,
      inventory_quantity: Number(size.inventory_quantity),
      sort_order: Number(size.sort_order)
    };
    
    let sizeId = size.id;
    if (sizeId) {
      await supabase.from("catalog_item_sizes").update(sizePayload).eq("id", sizeId);
    } else {
      const { data } = await supabase.from("catalog_item_sizes").insert(sizePayload).select("id").single();
      sizeId = data?.id;
    }

    if (sizeId) {
      const measurementPayload = {
        catalog_item_size_id: sizeId,
        bust: size.bust || null,
        waist: size.waist || null,
        length: size.length || null,
        notes: size.notes || null
      };
      
      const { data: existingMeasurement } = await supabase.from("catalog_item_measurements").select("id").eq("catalog_item_size_id", sizeId).maybeSingle();
      if (existingMeasurement) {
        await supabase.from("catalog_item_measurements").update(measurementPayload).eq("id", existingMeasurement.id);
      } else {
        await supabase.from("catalog_item_measurements").insert(measurementPayload);
      }
    }
  }

  // Handle reservedRanges
  const { data: existingRanges } = await supabase.from("availability_ranges").select("id").eq("catalog_item_id", itemId);
  const existingRangeIds = new Set(existingRanges?.map(r => r.id) || []);
  const inputRangeIds = new Set(input.reservedRanges.map(r => r.id).filter(Boolean));

  const rangesToDelete = [...existingRangeIds].filter(id => !inputRangeIds.has(id));
  if (rangesToDelete.length > 0) {
    await supabase.from("availability_ranges").delete().in("id", rangesToDelete);
  }

  for (const range of input.reservedRanges) {
    if (!range.start_date || !range.end_date) continue;
    const rangePayload = {
      catalog_item_id: itemId,
      start_date: range.start_date,
      end_date: range.end_date,
      label: range.label || null
    };
    if (range.id) {
      await supabase.from("availability_ranges").update(rangePayload).eq("id", range.id);
    } else {
      await supabase.from("availability_ranges").insert(rangePayload);
    }
  }

  return { id: itemId };
}

export async function deleteCatalogItem(id: string) {
  return supabase.from("catalog_items").delete().eq("id", id);
}

export async function updateCatalogStatus(id: string, status: CatalogRow["status"]) {
  return supabase
    .from("catalog_items")
    .update({ status, archived_at: status === "archived" ? new Date().toISOString() : null })
    .eq("id", id);
}

export async function updateCatalogAvailabilityStatus(id: string, availability_status: CatalogRow["availability_status"]) {
  return supabase
    .from("catalog_items")
    .update({ availability_status })
    .eq("id", id);
}

export async function saveAvailability(input: { id?: string; catalog_item_id: string; start_date: string; end_date: string; label?: string; notes?: string }) {
  const payload = {
    catalog_item_id: input.catalog_item_id,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    label: input.label || null,
    notes: input.notes || null,
  };
  return input.id
    ? supabase.from("availability_ranges").update(payload).eq("id", input.id)
    : supabase.from("availability_ranges").insert(payload);
}

export async function deleteAvailability(id: string) {
  return supabase.from("availability_ranges").delete().eq("id", id);
}

export async function saveGuide(input: { id?: string; title: string; body: string; sort_order: number; is_published: boolean }) {
  const payload = {
    title: input.title,
    body: input.body,
    sort_order: input.sort_order,
    is_published: input.is_published
  };

  return input.id
    ? supabase.from("rental_guides").update(payload).eq("id", input.id)
    : supabase.from("rental_guides").insert(payload);
}

export async function deleteGuide(id: string) {
  return supabase.from("rental_guides").delete().eq("id", id);
}

export async function saveFaq(input: { id?: string; category?: string; question: string; answer: string; sort_order: number; is_published: boolean }) {
  const payload = {
    category: input.category || null,
    question: input.question,
    answer: input.answer,
    sort_order: input.sort_order,
    is_published: input.is_published
  };

  return input.id
    ? supabase.from("faqs").update(payload).eq("id", input.id)
    : supabase.from("faqs").insert(payload);
}

export async function deleteFaq(id: string) {
  return supabase.from("faqs").delete().eq("id", id);
}

export async function updateReviewStatus(id: string, status: ReviewRow["status"]) {
  return supabase.from("customer_reviews").update({ status }).eq("id", id);
}

export async function updateInquiryStatus(id: string, status: InquiryRow["status"]) {
  return supabase.from("inquiries").update({ status }).eq("id", id);
}

export async function saveSettings(input: {
  id?: string;
  business_name: string;
  tagline: string;
  phone?: string;
  secondary_phone?: string;
  email?: string;
  secondary_email?: string;
  facebook_url?: string;
  instagram_url?: string;
  business_hours?: string;
  service_areas: string[];
  seo_title?: string;
  seo_description?: string;
  announcement_text?: string;
  announcement_is_active?: boolean;
}) {
  const payload = {
    business_name: input.business_name,
    tagline: input.tagline,
    phone: input.phone || null,
    secondary_phone: input.secondary_phone || null,
    email: input.email || null,
    secondary_email: input.secondary_email || null,
    facebook_url: input.facebook_url || null,
    instagram_url: input.instagram_url || null,
    business_hours: input.business_hours || null,
    service_areas: input.service_areas,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    announcement_text: input.announcement_text || null,
    announcement_is_active: input.announcement_is_active ?? false
  };

  return input.id
    ? supabase.from("settings").update(payload).eq("id", input.id)
    : supabase.from("settings").insert(payload);
}
