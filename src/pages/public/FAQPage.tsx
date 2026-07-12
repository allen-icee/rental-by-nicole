// src/pages/public/FAQPage.tsx
import { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getFaqs } from "@/services/catalogue.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import ShinyText from "@/components/ui/ShinyText";

export function FAQPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [faqs, setFaqs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getFaqs().then(data => setFaqs(data));
  }, []);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return faqs;
    }

    return faqs.filter((faq) =>
      [faq.category, faq.question, faq.answer].join(" ").toLowerCase().includes(normalizedQuery)
    );
  }, [query, faqs]);

  return (
    <PublicLayout>
      <main className="min-h-[90vh] bg-transparent pb-32">
        
        <ScrollReveal as="section" className="relative overflow-hidden bg-transparent py-8 md:py-12 border-b border-white/50">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-background/60 to-transparent mix-blend-overlay" />
          <div className="relative mx-auto max-w-4xl px-5 text-center">

            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-brand-accent md:text-4xl">
              <ShinyText text="Frequently Asked Questions" disabled={false} speed={3} />
            </h1>
            <p className="mt-3 text-sm md:text-base font-medium leading-relaxed text-pink-950 max-w-2xl mx-auto">
              Find everything you need to know about our rental process, availability, fittings, and more.
              Search below or browse.
            </p>

            <div className="mt-6 mx-auto max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-pink-950/60">
                <Icon icon="mdi:magnify" className="size-6 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-brand-accent" />
              </div>
              <input
                type="text"
                className="w-full rounded-full border-2 border-white/60 bg-white/40 backdrop-blur-md py-3 pl-12 pr-12 text-base font-medium text-brand-accent shadow-inner transition-all duration-300 placeholder:text-pink-950/60 focus:border-brand-primary focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for answers..."
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-pink-950/40 hover:text-brand-primary transition-colors focus:outline-none"
                  aria-label="Clear search"
                >
                  <Icon icon="mdi:close-circle" className="size-5" />
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>

        <section className="mx-auto mt-8 max-w-3xl px-5 relative z-10">
          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openId === faq.question;
                return (
                  <ScrollReveal
                    key={faq.question}
                    delay={Math.min(index * 50, 500)} 
                    className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 animate-float ${isOpen
                      ? "glass-panel border-white/80 shadow-crystal"
                      : "glass-card border-white/60 shadow-soft hover:border-brand-primary/40 hover:shadow-barbie hover:-translate-y-1 hover:bg-white/80"
                      }`}
                  >
                    {isOpen && (
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-background/40 to-transparent pointer-events-none" />
                    )}
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.question)}
                      className="relative z-10 w-full text-left px-4 py-3 md:px-5 md:py-4 flex items-start md:items-center justify-between gap-3 md:gap-4 outline-none"
                    >
                      <div className="flex-1">
                        <span className="inline-block rounded-full bg-pink-50 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-primary border border-pink-100 mb-1 transition-colors duration-300 group-hover:bg-brand-background group-hover:border-brand-primary/20">
                          {faq.category}
                        </span>
                        <h3 className={`font-display text-base md:text-lg font-bold leading-tight transition-colors duration-300 ${isOpen ? "text-brand-primary" : "text-brand-accent"}`}>
                          {faq.question}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 flex size-10 items-center justify-center rounded-full transition-all duration-500 shadow-sm ${isOpen
                          ? "bg-brand-primary text-white rotate-180"
                          : "bg-white text-brand-primary border border-pink-100 group-hover:bg-brand-background group-hover:scale-110"
                          }`}
                      >
                        <Icon icon="mdi:chevron-down" className="size-5" />
                      </span>
                    </button>

                    <div
                      className={`relative z-10 grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 md:px-5 pt-1">
                          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-100 to-transparent mb-3" />
                          <p className="text-sm md:text-base font-medium leading-relaxed text-pink-950">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })
            ) : (
              <div className="rounded-[3rem] glass-panel p-16 text-center shadow-crystal border border-white">
                <div className="mx-auto grid size-24 place-items-center rounded-full glass-card text-brand-primary mb-8 shadow-sm">
                  <Icon icon="mdi:comment-search-outline" className="size-12" />
                </div>
                <h3 className="font-display text-3xl font-bold text-brand-accent">No results found</h3>
                <p className="mt-5 text-lg text-pink-950/60 max-w-md mx-auto leading-relaxed">
                  We couldn't find any FAQs matching your search. Please try different keywords or reach out to us directly.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
