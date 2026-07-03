// src/features/catalogue/types/catalogue.ts

export type AvailabilityStatus = "available" | "reserved" | "unavailable";

export type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  isNewArrival: boolean;
  priceDisplay: string;
  reelUrl?: string;
  images: string[];
  sizes: string[];
  measurements: {
    size: string;
    bust: string;
    chest?: string;
    waist: string;
    hips?: string;
    length: string;
    notes?: string;
  }[];
  inventoryQuantity: number;
  reservedRanges: string[];
};
