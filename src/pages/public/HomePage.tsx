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
  { title: "Browse the Collection", desc: "Find the perfect dress or gown." },
  { title: "Check Availability", desc: "View availability notes on each item." },
  { title: "Send an Inquiry", desc: "Reach out to request a reservation." },
  { title: "Manual Confirmation", desc: "Fittings and details are finalized privately." }
];

export function HomePage() {
  const featuredItems = catalogueItems.filter((item) => item.featured).slice(0, 3);

  return (
    <PublicLayout>
      <main>
        {/* Left-Aligned Hero Section */}
        <section className="relative isolate overflow-hidden bg-white min-h-[85vh] flex items-center">
          <img
            src="/assets/boutique-hero.png"
            alt="Elegant rack of gowns and boutique accessories for fashion rental"
            className="absolute inset-0 h-full w-full object-cover object-top blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          
          <div className="relative mx-auto w-full max-w-7xl px-5 py-20 z-10">
            <div className="max-w-2xl text-left">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-brand-primary">
                {siteConfig.name}
              </p>
              <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-brand-accent bg-gradient-to-r from-brand-accent to-brand-primary bg-clip-text text-transparent md:text-7xl">
                {siteConfig.tagline}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-pink-950/80 font-medium">
                Browse an exquisite catalogue of dresses, gowns, Filipiniana pieces, boleros,
                and accessories. Send an inquiry when you find the perfect look for your event.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/catalogue"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-8 py-4 font-bold text-white shadow-barbie transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_30px_rgba(255,47,168,0.3)] overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative z-10 flex items-center gap-2">
                    Browse Catalogue
                    <Icon icon="mdi:arrow-right" className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border-2 border-brand-accent/20 bg-white/90 px-8 py-4 font-bold text-brand-accent backdrop-blur-md transition-all duration-300 hover:border-brand-accent hover:bg-brand-background/90 hover:shadow-soft"
                >
                  Send Inquiry
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals with Mobile Carousel */}
        <section className="section-shell bg-brand-background/30 overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-5 md:px-0">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-primary">
                New Arrivals
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-brand-accent">
                Fresh looks ready for your next event
              </h2>
            </div>
            <Link to="/catalogue" className="hidden md:inline-flex group items-center gap-1 font-semibold text-brand-accent transition-colors hover:text-brand-primary">
              View all items
              <Icon icon="mdi:chevron-right" className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 px-5 md:px-0 md:grid-cols-3">
            {featuredItems.map((item) => (
              <Link key={item.id} to={`/catalogue?item=${item.id}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md border border-white/50 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-barbie">
                <div className="overflow-hidden h-80 relative">
                  <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-8 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-brand-accent px-5 py-2 rounded-full text-sm font-bold shadow-soft">
                      Explore Item <Icon icon="mdi:arrow-right" className="size-4" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 items-center text-center">
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent border border-pink-100">
                    {item.availabilityStatus}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold text-pink-950 group-hover:text-brand-primary transition-colors">{item.name}</h3>
                  <p className="mt-3 text-lg font-bold text-brand-accent">{item.priceDisplay}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 px-5 text-center">
            <Link to="/catalogue" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-brand-accent shadow-sm border border-pink-100 transition hover:border-brand-primary hover:text-brand-primary hover:shadow-barbie">
              See More Arrivals
              <Icon icon="mdi:arrow-right" className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* Curated Collections with Mobile Carousel */}
        <section className="bg-white py-20 overflow-hidden">
          <div className="section-shell">
            <div className="text-center max-w-2xl mx-auto px-5 md:px-0">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
                Curated Collections
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-brand-accent md:text-5xl leading-tight">
                Shop by occasion
              </h2>
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:flex md:justify-center gap-4 md:gap-8 px-5 md:px-0">
              {collections.map((collection) => (
                <Link
                  key={collection}
                  to="/catalogue"
                  className="group relative flex flex-col items-center justify-center p-6 md:p-8 md:w-[220px] bg-gradient-to-br from-brand-accent to-pink-600 rounded-[2rem] shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-barbie aspect-[1/1] md:aspect-[1/1.2] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="grid size-10 md:size-12 place-items-center rounded-full bg-white/20 backdrop-blur-sm text-white mb-3 md:mb-4">
                      <Icon icon="mdi:hanger" className="size-5 md:size-6" />
                    </span>
                    <p className="font-display text-lg md:text-xl font-bold text-white text-balance leading-tight group-hover:text-pink-100 transition-colors">
                      {collection}
                    </p>
                    <p className="mt-2 md:mt-3 text-[10px] font-bold uppercase tracking-widest text-white/80 flex items-center gap-1 group-hover:text-white transition-colors">
                      Explore <Icon icon="mdi:arrow-right" className="size-3 md:size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Rental Process */}
        <section className="bg-pink-50/60 py-24">
          <div className="section-shell text-center">
            <div className="max-w-2xl mx-auto px-5 md:px-0">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
                Rental Process
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-brand-accent md:text-5xl">
                Simple inquiry, personal confirmation
              </h2>
            </div>
            <div className="mt-20 relative px-5 md:px-0">
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-brand-background via-brand-primary/30 to-brand-background" />
              <div className="md:hidden absolute top-10 bottom-10 left-[48px] w-[2px] bg-gradient-to-b from-brand-background via-brand-primary/30 to-brand-background" />
              
              <div className="grid gap-10 md:gap-6 md:grid-cols-4 relative z-10">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="group flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-0">
                    <span className="shrink-0 grid size-16 md:size-20 place-items-center rounded-full bg-white border-4 border-pink-50 shadow-soft font-sans font-medium text-2xl md:text-3xl text-brand-primary transition-all duration-500 group-hover:scale-110 group-hover:border-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-barbie">
                      {index + 1}
                    </span>
                    <div className="mt-1 md:mt-6">
                      <h3 className="font-bold text-xl text-brand-accent md:px-2">{step.title}</h3>
                      <p className="mt-2 text-sm text-pink-950/70 md:px-4 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Customer Feedback */}
        <section className="bg-white py-24">
          <div className="section-shell grid gap-12 lg:grid-cols-[1fr_1.5fr] items-center px-5 md:px-0">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-primary">
                Customer Feedback
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-brand-accent leading-tight">
                Loved by clients
              </h2>
              <p className="mt-5 text-lg text-pink-950/70 leading-relaxed">
                We pride ourselves on offering exquisite pieces and personalized service that makes every event unforgettable.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link to="/testimonials" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-brand-accent px-8 py-3.5 font-bold text-white shadow-barbie transition hover:scale-105 hover:bg-brand-primary">
                  Read More Customer Feedback
                </Link>
                <Link to="/contact" className="group inline-flex items-center gap-2 text-sm font-bold text-brand-accent transition hover:text-brand-primary">
                  Leave Feedback
                  <Icon icon="mdi:arrow-right" className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.slice(0, 2).map((review) => (
                <article key={review.name} className="relative rounded-3xl bg-white p-10 shadow-soft border border-pink-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-barbie">
                  <div className="absolute top-8 right-8 text-brand-secondary/30">
                    <Icon icon="mdi:format-quote-open" className="size-12" />
                  </div>
                  <div className="flex gap-1 text-brand-primary">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Icon key={i} icon="mdi:star" className="size-4" />
                    ))}
                  </div>
                  <p className="mt-6 text-base italic leading-relaxed text-pink-950/80 relative z-10">"{review.comment}"</p>
                  <p className="mt-8 font-bold tracking-widest uppercase text-xs text-brand-accent">— {review.name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Preview - Redesigned Cards */}
        <section className="bg-brand-background/30 py-24">
          <div className="section-shell px-5 md:px-0">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
                FAQ Preview
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-brand-accent md:text-5xl">
                Quick answers
              </h2>
            </div>
            <div className="mt-16 max-w-3xl mx-auto space-y-4">
              {faqs.slice(0, 4).map((faq) => (
                <details key={faq.question} className="group rounded-3xl bg-white border border-pink-100 p-6 md:p-8 shadow-[0_4px_20px_rgba(255,47,168,0.03)] transition-all duration-300 hover:border-brand-primary/40 hover:shadow-barbie [&_summary::-webkit-details-marker]:hidden overflow-hidden relative">
                  <summary className="relative z-10 flex cursor-pointer items-center justify-between font-bold text-brand-accent text-lg md:text-xl outline-none">
                    {faq.question}
                    <span className="ml-4 flex size-10 items-center justify-center shrink-0 rounded-full bg-pink-50 text-brand-primary transition-all duration-500 group-open:rotate-180 group-open:bg-brand-primary group-open:text-white group-hover:scale-110">
                      <Icon icon="mdi:chevron-down" className="size-6" />
                    </span>
                  </summary>
                  <div className="relative z-10 mt-4 text-base leading-relaxed text-pink-950/80 pt-4 border-t border-pink-50/50">
                    <p>{faq.answer}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-50/30 opacity-0 transition-opacity duration-300 group-open:opacity-100 pointer-events-none" />
                </details>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/faq" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold uppercase tracking-widest text-xs text-brand-accent shadow-sm border border-pink-100 transition-all hover:border-brand-primary hover:text-brand-primary hover:shadow-barbie">
                Explore All FAQs
                <Icon icon="mdi:arrow-right" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-accent via-brand-primary to-pink-400 text-white">
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-5 py-28 text-center">
            <div className="max-w-3xl">
              <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight">Found the right look?</h2>
              <p className="mt-6 text-xl md:text-2xl text-white/90 font-medium">Send an inquiry and the details will be confirmed with you personally.</p>
            </div>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-12 py-6 text-xl font-bold text-brand-accent shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 hover:scale-105 hover:bg-brand-background"
            >
              Contact
              <Icon icon="mdi:paper-plane" className="size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
