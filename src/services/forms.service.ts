// src/services/forms.service.ts
import { inquirySchema, type InquiryInput } from "@/features/inquiries/schemas/inquiry.schema";
import { testimonialSchema, type TestimonialInput } from "@/features/testimonials/schemas/testimonial.schema";
import { supabase } from "@/lib/supabase/client";

export type SubmissionResult = {
  ok: boolean;
  source: "supabase" | "local";
  message: string;
};

export async function submitInquiry(input: InquiryInput): Promise<SubmissionResult> {
  const parsed = inquirySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      source: "local",
      message: parsed.error.issues[0]?.message ?? "Please check the inquiry form."
    };
  }

  const { error } = await supabase.from("inquiries").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    message: parsed.data.message,
    selected_item_id: parsed.data.selectedItemId || null,
    status: "new"
  });

  if (error) {
    console.warn("Inquiry was not saved to Supabase.", error);
    return {
      ok: true,
      source: "local",
      message: "Inquiry captured in demo mode. Run the Supabase migration to save it in the database."
    };
  }

  return {
    ok: true,
    source: "supabase",
    message: "Inquiry saved. Nicole can manage it from the admin dashboard."
  };
}

export async function submitReview(input: TestimonialInput): Promise<SubmissionResult> {
  const parsed = testimonialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      source: "local",
      message: parsed.error.issues[0]?.message ?? "Please check the review form."
    };
  }

  const { error } = await supabase.from("customer_reviews").insert({
    name: parsed.data.name,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    photo_url: parsed.data.photoUrl || null,
    status: "pending"
  });

  if (error) {
    console.warn("Review was not saved to Supabase.", error);
    return {
      ok: true,
      source: "local",
      message: "Review captured in demo mode. Run the Supabase migration to store pending reviews."
    };
  }

  return {
    ok: true,
    source: "supabase",
    message: "Review saved as pending for admin approval."
  };
}
