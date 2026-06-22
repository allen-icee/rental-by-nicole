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
  price_display: string;
  instagram_reel_url: string | null;
  sort_order: number;
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

// Data Fetching Helpers
export async function getPaginatedData<T extends keyof Tables>(
  table: T,
  page: number,
  pageSize: number,
  orderBy: string,
  ascending: boolean = true
): Promise<{ data: Tables[T]["Row"][]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from(table)
    .select("*", { count: "exact" })
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

// Mutations
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

export async function saveCatalogItem(input: CatalogFormInput) {
  const payload = {
    category_id: input.category_id,
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    status: input.status,
    availability_status: input.availability_status,
    featured: input.featured,
    price_display: input.price_display,
    instagram_reel_url: input.instagram_reel_url || null,
    sort_order: input.sort_order,
    archived_at: input.status === "archived" ? new Date().toISOString() : null
  };

  return input.id
    ? supabase.from("catalog_items").update(payload).eq("id", input.id)
    : supabase.from("catalog_items").insert(payload);
}

export async function updateCatalogStatus(id: string, status: CatalogRow["status"]) {
  return supabase
    .from("catalog_items")
    .update({ status, archived_at: status === "archived" ? new Date().toISOString() : null })
    .eq("id", id);
}

export async function saveAvailability(input: { catalog_item_id: string; start_date: string; end_date: string; label?: string; notes?: string }) {
  return supabase.from("availability_ranges").insert({
    catalog_item_id: input.catalog_item_id,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    label: input.label || null,
    notes: input.notes || null
  });
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
  email?: string;
  facebook_url?: string;
  instagram_url?: string;
  business_hours?: string;
  service_areas: string[];
  seo_title?: string;
  seo_description?: string;
}) {
  const payload = {
    business_name: input.business_name,
    tagline: input.tagline,
    phone: input.phone || null,
    email: input.email || null,
    facebook_url: input.facebook_url || null,
    instagram_url: input.instagram_url || null,
    business_hours: input.business_hours || null,
    service_areas: input.service_areas,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null
  };

  return input.id
    ? supabase.from("settings").update(payload).eq("id", input.id)
    : supabase.from("settings").insert(payload);
}
