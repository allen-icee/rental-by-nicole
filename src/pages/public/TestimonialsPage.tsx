// src/pages/public/TestimonialsPage.tsx
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getTestimonials } from "@/services/catalogue.service";
import GradientText from "@/components/ui/GradientText";
import ShinyText from "@/components/ui/ShinyText";
import { useToast } from "@/components/ui/toast-context";
import { submitReview } from "@/services/forms.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { DiamondCastleHeart } from "@/components/ui/DiamondCastleHeart";

const formatTestimonialDate = (dateStr: string) => {
  const parts = dateStr.split(" ");
  if (parts.length >= 2) return `${parts[0].substring(0, 3)} ${parts[1]}`;
  return dateStr;
};

const truncateWords = (str: string, max: number) => {
  const words = str.split(" ");
  if (words.length <= max) return str;
  return words.slice(0, max).join(" ") + "...";
};

export function TestimonialsPage() {
  const { showToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testimonials, setTestimonials] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openReviewModal) {
      setIsReviewModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
      <main className="min-h-screen bg-transparent">
        <ScrollReveal as="section" className="relative overflow-hidden px-5 py-12 md:py-20">
          <div className="absolute -left-[10%] top-0 -z-10 h-[400px] w-[400px] rounded-full bg-brand-primary/10 blur-[100px] animate-pulse" />
          <div className="absolute -right-[5%] bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-brand-accent/10 blur-[100px] animate-pulse" />

          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-6 md:mb-12 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">
                  <ShinyText text="Customer Feedback" disabled={false} speed={3} />
                </p>
                <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-accent sm:text-5xl lg:text-6xl">
                  <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                    Loved by Clients
                  </GradientText>
                </h1>
                <p className="mt-3 text-base font-bold text-pink-950 sm:text-lg">
                  See how exceptional pieces and dedicated service have helped clients feel their best.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetReviewForm();
                  setIsReviewModalOpen(true);
                }}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-8 py-4 text-sm font-bold text-brand-primary shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all hover:scale-105 hover:bg-white hover:shadow-barbie"
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
                    className="group relative shrink-0 snap-center w-[75vw] max-w-[320px] text-center transition-all duration-500 hover:scale-105 focus:outline-none"
                  >
                    <DiamondCastleHeart className="animate-float" style={{ animationDelay: `${index * 1.5}s` }} rating={item.rating}>
                      
                      <div className="relative mt-2">
                        <p className="text-xs md:text-sm font-serif italic leading-relaxed text-white drop-shadow-sm px-4">
                          "{truncateWords(item.comment, 5)}"
                        </p>
                      </div>

                      <div className="mt-2 flex flex-col items-center">
                        <h4 className="font-display text-xl md:text-2xl font-bold text-white drop-shadow-md">
                          {item.name.split(' ')[0]}
                        </h4>
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/80 mt-1">
                          {formatTestimonialDate(item.date)}
                        </p>
                      </div>
                      
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white bg-white/20 px-3 py-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm border border-white/30">
                        Read full review
                      </p>
                    </DiamondCastleHeart>
                  </button>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 pr-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="group grid size-12 place-items-center rounded-full border border-pink-100 bg-white/80 shadow-sm transition hover:border-brand-primary hover:bg-brand-primary"
                >
                  <div 
                    className="w-6 h-6 bg-brand-accent group-hover:bg-white transition-colors"
                    style={{
                      WebkitMaskImage: 'url(/assets/svg/barbie.svg)',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskImage: 'url(/assets/svg/barbie.svg)',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      maskSize: 'contain'
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="group grid size-12 place-items-center rounded-full border border-pink-100 bg-white/80 shadow-sm transition hover:border-brand-primary hover:bg-brand-primary"
                >
                  <div 
                    className="w-6 h-6 bg-brand-accent group-hover:bg-white transition-colors scale-x-[-1]"
                    style={{
                      WebkitMaskImage: 'url(/assets/svg/barbie.svg)',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskImage: 'url(/assets/svg/barbie.svg)',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      maskSize: 'contain'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {selectedTestimonial && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-fuchsia-900/20 p-4 backdrop-blur-sm"
            onClick={() => setSelectedTestimonial(null)}
            data-lenis-prevent="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] max-w-sm md:max-w-md bg-gradient-to-br from-white to-pink-50 border border-white rounded-[2rem] shadow-[0_10px_40px_rgba(232,30,140,0.25)] flex flex-col items-center animate-scale-in"
            >
              {/* Decorative Corner Sparkles */}
              <div className="absolute top-4 left-4 text-pink-300">
                 <Icon icon="mdi:sparkles" className="text-2xl animate-pulse" />
              </div>
              <div className="absolute bottom-4 right-4 text-pink-300">
                 <Icon icon="mdi:star-four-points" className="text-xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Heart Close Button (Top Right) */}
              <button
                type="button"
                onClick={() => setSelectedTestimonial(null)}
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-50 text-white hover:scale-110 transition-transform drop-shadow-md bg-[#e81e8c] rounded-full p-1 border-2 border-white"
              >
                <div className="relative flex items-center justify-center">
                  <Icon icon="mdi:cards-heart" className="text-3xl md:text-4xl" />
                  <Icon icon="mdi:close" className="absolute text-[#e81e8c] text-sm md:text-base font-bold -translate-y-[10%]" />
                </div>
              </button>

              <div className="w-full p-6 md:p-8 flex flex-col relative z-10">
                <div className="w-full flex items-center gap-3 md:gap-4 mb-4 mt-2">
                  <div className="relative size-12 md:size-14 shrink-0 flex items-center justify-center rounded-full bg-pink-50 border border-pink-100 shadow-sm overflow-hidden">
                    <img src="/assets/svg/profile-feedback.svg" alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <span className="relative z-10 text-[10px] md:text-xs font-bold text-white drop-shadow-md">
                      {getInitials(selectedTestimonial.name)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-baseline gap-2">
                      <div className="font-display text-xl md:text-2xl font-bold">
                        <ShinyText text={selectedTestimonial.name} color="#e81e8c" shineColor="#ffb6e4" />
                      </div>
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-pink-400">
                        {formatTestimonialDate(selectedTestimonial.date)}
                      </p>
                    </div>
                    <div className="flex gap-1 text-[#e81e8c] drop-shadow-sm mt-1">
                      <ShinyText 
                        text={"★".repeat(selectedTestimonial.rating) + "☆".repeat(5 - selectedTestimonial.rating)} 
                        className="text-lg md:text-xl tracking-widest" 
                        color="#e81e8c" 
                        shineColor="#ffb6e4" 
                      />
                    </div>
                  </div>
                </div>

                <p className="w-full text-left text-base md:text-lg font-serif italic leading-relaxed text-pink-950 max-h-[35vh] overflow-y-auto custom-scrollbar px-1">
                  "{selectedTestimonial.comment}"
                </p>
              </div>
            </div>
          </div>
        )}

        {isReviewModalOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-fuchsia-900/20 p-4 backdrop-blur-sm"
            onClick={() => setIsReviewModalOpen(false)}
            data-lenis-prevent="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] max-w-sm md:max-w-md bg-gradient-to-br from-white to-pink-50 border border-white rounded-[2rem] shadow-[0_10px_40px_rgba(232,30,140,0.25)] flex flex-col animate-scale-in max-h-[90svh]"
            >
              {/* Decorative Corner Sparkles */}
              <div className="absolute top-4 left-4 text-pink-300">
                 <Icon icon="mdi:sparkles" className="text-2xl animate-pulse" />
              </div>
              <div className="absolute bottom-4 right-4 text-pink-300">
                 <Icon icon="mdi:star-four-points" className="text-xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Heart Close Button (Top Right) */}
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-50 text-white hover:scale-110 transition-transform drop-shadow-md bg-[#e81e8c] rounded-full p-1 border-2 border-white"
              >
                <div className="relative flex items-center justify-center">
                  <Icon icon="mdi:cards-heart" className="text-3xl md:text-4xl" />
                  <Icon icon="mdi:close" className="absolute text-[#e81e8c] text-sm md:text-base font-bold -translate-y-[10%]" />
                </div>
              </button>

              <div className="flex flex-col items-center border-b border-pink-100 bg-white/40 px-5 md:px-6 py-4 md:py-5 backdrop-blur-md rounded-t-[2rem] mt-6">
                <h3 className="font-display text-xl md:text-2xl font-bold text-brand-accent">
                  Share Your Experience
                </h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                  We'd love to hear your feedback
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-white/20 hide-scrollbar rounded-b-[2rem]" data-lenis-prevent="true">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onReviewSubmit)}>

                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-white/60 shadow-inner">
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

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
                      Your Name <span className="text-[#e81e8c]">*</span>
                    </label>
                    <input
                      {...register("name", { required: true, minLength: 2, maxLength: 50 })}
                      required
                      minLength={2}
                      maxLength={50}
                      type="text"
                      placeholder="e.g. Maria Theresa"
                      className="w-full rounded-xl border-2 border-white/60 bg-white/40 px-4 py-2.5 text-sm text-pink-950 shadow-inner transition-all focus:border-brand-primary focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
                      Your Feedback <span className="text-[#e81e8c]">*</span>
                    </label>
                    <textarea
                      {...register("comment", { required: true, minLength: 10, maxLength: 500 })}
                      required
                      minLength={10}
                      maxLength={500}
                      rows={3}
                      placeholder="Tell us about your event and how you felt in your rental..."
                      className="w-full resize-none rounded-xl border-2 border-white/60 bg-white/40 px-4 py-2.5 text-sm text-pink-950 shadow-inner transition-all focus:border-brand-primary focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2 text-pink-950/60">
                      Photo Link <span className="text-[9px] lowercase opacity-80">(optional)</span>
                    </label>
                    <input
                      {...register("photoUrl", { 
                        pattern: {
                          value: /^$|^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                          message: "Please enter a valid URL"
                        }
                      })}
                      type="url"
                      placeholder="https://..."
                      className="w-full rounded-xl border-2 border-white/60 bg-white/40 px-4 py-2.5 text-sm text-pink-950 shadow-inner transition-all focus:border-brand-primary focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || rating === 0 || isSubmittingReview}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff66b2] via-[#e81e8c] to-[#d11275] bg-[length:200%_auto] hover:bg-right active:scale-[0.98] px-6 py-3 text-sm font-bold tracking-widest uppercase text-white shadow-[0_8px_20px_rgba(232,30,140,0.3)] hover:shadow-[0_12px_25px_rgba(232,30,140,0.5)] hover:-translate-y-0.5 transition-all duration-500 disabled:opacity-50 disabled:bg-none disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:hover:-translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    <Icon icon="mdi:magic-staff" className="text-lg" />
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

