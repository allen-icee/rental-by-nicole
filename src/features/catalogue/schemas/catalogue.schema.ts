// src/features/catalogue/schemas/catalogue.schema.ts
import { z } from "zod";

export const catalogItemSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string().uuid(),
  status: z.enum(["draft", "published", "archived"]),
  availabilityStatus: z.enum(["available", "reserved", "unavailable"]),
  featured: z.boolean(),
  priceDisplay: z.string().min(1),
  reelUrl: z.string().url().optional().or(z.literal(""))
});

export type CatalogItemInput = z.infer<typeof catalogItemSchema>;
