// src/features/inquiries/schemas/inquiry.schema.ts
import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10),
  selectedItemId: z.string().uuid().optional()
});

export type InquiryInput = z.infer<typeof inquirySchema>;
