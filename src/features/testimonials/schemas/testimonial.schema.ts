import { z } from "zod";

export const testimonialSchema = z.object({
  name: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10),
  photoUrl: z.string().url().optional().or(z.literal(""))
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
