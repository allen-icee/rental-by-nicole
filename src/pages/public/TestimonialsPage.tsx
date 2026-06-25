// src/pages/public/TestimonialsPage.tsx
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getTestimonials } from "@/services/catalogue.service";
import { useToast } from "@/components/ui/toast-context";
import { submitReview } from "@/services/forms.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function TestimonialsPage() {
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    getTestimonials().then(data => setTestimonials(data));
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "RN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  type ReviewFormInputs = {
    name: string;
    comment: string;
    photoUrl: string;
  };

  const { register, handleSubmit, reset, formState: { isValid } } = useForm<ReviewFormInputs>({
    mode: "onChange"
  });

  const resetReviewForm = () => {
    setRating(5);
    setHoverRating(0);
    reset();
  };

  async function onReviewSubmit(data: ReviewFormInputs) {
    setIsSubmittingReview(true);

    const response = await submitReview({
      name: data.name,
      rating: rating,
      comment: data.comment,
      photoUrl: data.photoUrl
    });

    setIsSubmittingReview(false);

    const successMsg = "Thank you so much for your feedback! We deeply appreciate you sharing your experience.";

    showToast({
      tone: response.ok ? "success" : "error",
      title: response.ok ? "Review received" : "Oops! Something went wrong.",
      message: response.ok ? successMsg : response.message
    });

    if (response.ok) {
      resetReviewForm();
      setIsReviewModalOpen(false);
    }
  }

  return (
    <PublicLayout>
      <main className="min-h-screen bg-brand-background/30">
        <ScrollReveal as="section" className="relative overflow-hidden px-5 py-12 md:py-20">
          <div className="absolute -left-[10%] top-0 -z-10 h-[400px] w-[400px] rounded-full bg-brand-primary/10 blur-[100px]" />
          <div className="absolute -right-[5%] bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-brand-accent/10 blur-[100px]" />

          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-6 md:mb-12 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
                  Customer Feedback
                </p>
                <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-accent sm:text-5xl lg:text-6xl">
                  Loved by Clients
                </h1>
                <p className="mt-3 text-base font-medium text-pink-950/70 sm:text-lg">
                  See how exceptional pieces and dedicated service have helped clients feel their best.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetReviewForm();
                  setIsReviewModalOpen(true);
                }}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-brand-accent/20 bg-white/50 px-8 py-4 text-sm font-bold text-brand-accent shadow-sm transition-all hover:border-brand-primary hover:bg-brand-primary hover:text-white"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  className="text-lg transition-transform group-hover:scale-110"
                />
                Share Your Experience
              </button>
            </div>

            <div className="relative -mx-5 md:mx-0">
              <div
                ref={carouselRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-12 pt-4 px-5 md:px-4 md:-mx-4 hide-scrollbar"
              >
                {testimonials.map((item, index) => (
                  <button
                    key={item.name + index}
                    type="button"
                    onClick={() => setSelectedTestimonial(item)}
                    className="group relative flex w-[85vw] max-w-[400px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[2.5rem] border border-pink-100 bg-white/60 p-8 text-left shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-barbie"
                  >
                    <Icon
                      icon="mdi:format-quote-open"
                      className="absolute right-6 top-6 text-5xl text-brand-secondary/20 transition-transform duration-500 group-hover:scale-110 group-hover:text-brand-secondary/40"
                    />

                    <div>
                      <div className="mb-6 flex gap-1 text-brand-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon
                            key={i}
                            icon={i < item.rating ? "mdi:star" : "mdi:star-outline"}
                            className="text-lg"
                          />
                        ))}
                      </div>

                      <p className="text-lg italic leading-relaxed text-pink-950/80 line-clamp-4">
                        "{item.comment}"
                      </p>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Click to read full review
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-4 border-t border-pink-50 pt-6">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-pink-50 text-sm font-bold text-brand-accent shadow-sm border border-pink-100">
                        {getInitials(item.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-pink-950">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-950/50 mt-1">
                          {item.date}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pr-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="grid size-12 place-items-center rounded-full border border-pink-100 bg-white/80 text-brand-accent shadow-sm transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <Icon
                    icon="mdi:chevron-left"
                    className="text-2xl"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="grid size-12 place-items-center rounded-full border border-pink-100 bg-white/80 text-brand-accent shadow-sm transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <Icon
                    icon="mdi:chevron-right"
                    className="text-2xl"
                  />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {selectedTestimonial && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-pink-950/40 p-4 backdrop-blur-sm"
            onClick={() => setSelectedTestimonial(null)}
            data-lenis-prevent="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-brand-background shadow-barbie"
            >
              <div className="flex items-center justify-between border-b border-pink-100 bg-white/90 px-5 md:px-6 py-4 md:py-5 backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                    Client Experience
                  </p>
                  <h3 className="mt-1 font-display text-xl md:text-2xl font-bold text-brand-accent">
                    {selectedTestimonial.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTestimonial(null)}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-pink-100 bg-white text-brand-accent shadow-sm transition hover:bg-brand-primary hover:text-white"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-10 bg-white" data-lenis-prevent="true">
                <div className="mb-6 flex gap-1 text-brand-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      icon={i < selectedTestimonial.rating ? "mdi:star" : "mdi:star-outline"}
                      className="text-xl"
                    />
                  ))}
                </div>

                <div className="relative">
                  <Icon
                    icon="mdi:format-quote-open"
                    className="absolute -left-3 -top-3 text-4xl text-brand-secondary/20"
                  />
                  <p className="relative z-10 text-lg md:text-xl italic leading-relaxed text-pink-950/80">
                    "{selectedTestimonial.comment}"
                  </p>
                </div>

                <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-pink-100 bg-brand-background/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                      Date Shared
                    </p>
                    <p className="mt-1 text-base font-bold text-brand-accent">
                      {selectedTestimonial.date}
                    </p>
                  </div>
                  <div className="hidden h-8 w-px bg-pink-100 sm:block" />
                  <div className="h-px w-full bg-pink-100 sm:hidden" />
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:check-decagram" className="text-brand-primary size-5" />
                    <span className="text-sm font-bold text-brand-accent">Verified Client</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isReviewModalOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-pink-950/40 p-4 backdrop-blur-sm"
            onClick={() => setIsReviewModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90svh] w-full max-w-xl flex-col overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-brand-background shadow-barbie"
            >
              <div className="flex items-center justify-between border-b border-pink-100 bg-white/90 px-5 md:px-6 py-4 md:py-5 backdrop-blur-md">
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-brand-accent">
                    Share Your Experience
                  </h3>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                    We'd love to hear your feedback
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-pink-100 bg-white text-brand-accent shadow-sm transition hover:bg-brand-primary hover:text-white"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-8 bg-white hide-scrollbar" data-lenis-prevent="true">
                <form className="flex flex-col gap-6" onSubmit={handleSubmit(onReviewSubmit)}>

                  <div className="flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl bg-brand-background/30 border border-pink-100 shadow-soft">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-4">
                      How was your experience?
                    </label>
                    <div className="flex gap-1 md:gap-2" role="group">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Icon
                            icon="mdi:star"
                            className={`size-8 md:size-10 transition-colors duration-300 ${star <= (hoverRating || rating) ? "text-brand-primary drop-shadow-sm" : "text-pink-100"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
                      Your Name
                    </label>
                    <input
                      {...register("name", { required: true, minLength: 2 })}
                      type="text"
                      placeholder="e.g. Maria Theresa"
                      className="w-full rounded-xl md:rounded-2xl border-2 border-pink-50 bg-white px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-pink-950 shadow-soft transition-all focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
                      Your Feedback
                    </label>
                    <textarea
                      {...register("comment", { required: true, minLength: 10 })}
                      rows={4}
                      placeholder="Tell us about your event and how you felt in your rental..."
                      className="w-full resize-none rounded-xl md:rounded-2xl border-2 border-pink-50 bg-white px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-pink-950 shadow-soft transition-all focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
                      Photo Link (Optional)
                    </label>
                    <input
                      {...register("photoUrl")}
                      type="url"
                      placeholder="https://..."
                      className="w-full rounded-xl md:rounded-2xl border-2 border-pink-50 bg-white px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-pink-950 shadow-soft transition-all focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || isSubmittingReview}
                    className="mt-2 md:mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-6 md:px-8 py-3.5 md:py-4 text-sm font-bold tracking-widest uppercase text-white shadow-barbie transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    <Icon icon="mdi:heart" className="text-lg" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}

