import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { catalogueItems, faqs, testimonials } from "@/data/site-content";
import { siteConfig } from "@/config/site";

const collections = [
  "Graduation Looks",
  "Wedding Guest Edit",
  "Photoshoot Gowns",
  "Filipiniana Details"
];

const processSteps = [
  "Browse the catalogue",
  "Check availability notes",
  "Send Nicole an inquiry",
  "Confirm fitting and payment manually"
];

export function HomePage() {
  const featuredItems = catalogueItems.filter((item) => item.featured).slice(0, 3);

  return (
    <PublicLayout>
      <main>
        <section className="relative isolate overflow-hidden bg-white">
          <img
            src="/assets/boutique-hero.png"
            alt="Elegant rack of gowns and boutique accessories for fashion rental"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/82 to-white/24" />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center px-5 py-20 md:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-accent">
                {siteConfig.name}
              </p>
              <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-brand-accent md:text-7xl">
                {siteConfig.tagline}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-pink-950/75">
                Browse dresses, gowns, Filipiniana pieces, boleros, and
                accessories, then send Nicole an inquiry when you find the
                right look.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  Browse Catalogue
                  <Icon icon="mdi:arrow-right" className="size-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-brand-accent px-6 py-3 font-semibold text-brand-accent transition hover:bg-brand-secondary/70"
                >
                  Send Inquiry
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-pink-950/70">
                {siteConfig.serviceAreas.map((area) => (
                  <span key={area} className="rounded-full bg-white/80 px-4 py-2 shadow-soft">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                New Arrivals
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-pink-950">
                Fresh looks ready for your next event
              </h2>
            </div>
            <Link to="/catalogue" className="font-semibold text-brand-accent">
              View all items
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                <img src={item.images[0]} alt={item.name} className="h-80 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-accent">
                      {item.category}
                    </p>
                    <span className="rounded-full bg-brand-secondary px-3 py-1 text-xs font-bold text-brand-accent">
                      {item.availabilityStatus}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-pink-950/70">{item.description}</p>
                  <p className="mt-4 font-bold text-brand-accent">{item.priceDisplay}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white/70">
          <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                Curated Collections
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold">
                Shop by occasion, not by guesswork
              </h2>
              <p className="mt-4 leading-7 text-pink-950/70">
                Categories and tags are designed to be admin-managed in
                Supabase, so Nicole can keep expanding the catalogue without
                hardcoded filters.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {collections.map((collection) => (
                <Link
                  key={collection}
                  to="/catalogue"
                  className="rounded-2xl border border-pink-200 bg-brand-background p-6 shadow-soft transition hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:sparkles" className="size-7 text-brand-primary" />
                  <p className="mt-4 font-display text-2xl font-semibold text-brand-accent">
                    {collection}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
              Rental Process
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">
              Simple inquiry, manual confirmation
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-white p-6 text-center shadow-soft">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-secondary font-bold text-brand-accent">
                  {index + 1}
                </span>
                <p className="mt-4 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/70">
          <div className="section-shell grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                Customer Feedback
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold">
                Approved reviews only
              </h2>
            </div>
            <div className="space-y-4">
              {testimonials.slice(0, 2).map((review) => (
                <article key={review.name} className="rounded-2xl bg-white p-6 shadow-soft">
                  <p className="text-brand-accent">{"★".repeat(review.rating)}</p>
                  <p className="mt-3 leading-7 text-pink-950/75">"{review.comment}"</p>
                  <p className="mt-4 font-semibold">{review.name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
              FAQ Preview
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">
              Quick answers before you inquire
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.slice(0, 3).map((faq) => (
              <details key={faq.question} className="rounded-2xl bg-white p-5 shadow-soft">
                <summary className="cursor-pointer font-semibold text-brand-accent">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-pink-950/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-brand-accent text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-14 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-4xl font-semibold">Found the right look?</p>
              <p className="mt-2 text-white/80">Send an inquiry and Nicole will confirm the details manually.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-brand-accent"
            >
              Contact Nicole
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
