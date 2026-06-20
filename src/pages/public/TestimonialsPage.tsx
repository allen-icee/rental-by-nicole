import { useState } from "react";
import { Icon } from "@iconify/react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { testimonials } from "@/data/site-content";
import { useToast } from "@/components/ui/toast-context";
import { submitReview } from "@/services/forms.service";

export function TestimonialsPage() {
  const { showToast } = useToast();
  const [result, setResult] = useState<{ message: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const response = await submitReview({
      name: String(formData.get("name") ?? ""),
      rating: Number(formData.get("rating") ?? 5),
      comment: String(formData.get("comment") ?? ""),
      photoUrl: String(formData.get("photoUrl") ?? "")
    });

    setLoading(false);
    setResult({ message: response.message, ok: response.ok });
    showToast({
      tone: response.ok ? "success" : "error",
      title: response.ok ? "Review received" : "Review needs attention",
      message: response.message
    });

    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <PublicLayout>
      <main className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
              Testimonials
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-pink-950">
              Customer feedback
            </h1>
            <p className="mt-5 leading-7 text-pink-950/70">
              Only approved reviews should be shown publicly. New submissions
              stay pending until Nicole approves them in the admin panel.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((review) => (
              <article key={review.name} className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="flex items-center gap-1 text-brand-accent">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Icon key={index} icon="mdi:star" className="size-5" />
                  ))}
                </div>
                <p className="mt-4 leading-7 text-pink-950/75">"{review.comment}"</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="font-semibold text-pink-950">{review.name}</p>
                  <p className="text-sm text-pink-950/50">{review.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-12 rounded-2xl bg-white/90 p-5 shadow-barbie md:p-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                Submit Review
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold">Share your rental experience</h2>
              <p className="mt-3 text-pink-950/70">
                Reviews are saved as pending and need admin approval before
                they appear publicly.
              </p>
            </div>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <input className="input-field" name="name" required minLength={2} placeholder="Your name" />
              <select className="input-field" name="rating" required defaultValue="5">
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
              <textarea className="input-field" name="comment" required minLength={10} placeholder="Your comment" />
              <input className="input-field" name="photoUrl" type="url" placeholder="Photo URL optional" />
              {result ? (
                <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${result.ok ? "bg-brand-secondary text-brand-accent" : "bg-pink-50 text-brand-accent"}`}>
                  {result.message}
                </p>
              ) : null}
              <button
                className="rounded-full bg-brand-accent px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}


