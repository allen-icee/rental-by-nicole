export type CatalogItemStatus = "draft" | "published" | "archived";

export type AvailabilityStatus = "available" | "reserved" | "unavailable";

export type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CatalogItemStatus;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  priceDisplay: string;
  instagramReelUrl?: string;
};
