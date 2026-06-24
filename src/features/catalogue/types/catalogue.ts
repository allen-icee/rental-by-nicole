export type CatalogItemStatus = "draft" | "published" | "archived";

export type AvailabilityStatus = "available" | "reserved" | "unavailable";

export type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  status: CatalogItemStatus;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  isNewArrival: boolean;
  priceDisplay: string;
  instagramReelUrl?: string;
  images: string[];
  sizes: string[];
  measurements: {
    size: string;
    bust: string;
    waist: string;
    length: string;
    notes?: string;
  }[];
  inventoryQuantity: number;
  reservedRanges: string[];
};
