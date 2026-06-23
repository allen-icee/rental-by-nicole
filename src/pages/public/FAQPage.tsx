import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { faqs } from "@/data/site-content";

export function FAQPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return faqs;
    }

    return faqs.filter((faq) =>
      [faq.category, faq.question, faq.answer].join(" ").toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <PublicLayout>
      <main className="min-h-[90vh] bg-brand-background/30 pb-32">
        {/* Hero & Search Section */}
        <section className="relative overflow-hidden bg-white py-12 md:py-16 shadow-sm border-b border-pink-100">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-background/60 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-5 text-center">
            <span className="inline-grid size-12 place-items-center rounded-full bg-white text-brand-primary shadow-soft mb-3 border border-pink-50">
              <Icon icon="mdi:help" className="size-6" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">
              Support & Information
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-brand-accent md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-base md:text-lg leading-relaxed text-pink-950/70 max-w-2xl mx-auto">
              Find everything you need to know about our rental process, availability, fittings, and more. 
              Search below or browse our curated categories.
            </p>

            {/* Premium Search Bar */}
            <div className="mt-8 mx-auto max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none text-brand-primary">
                <Icon icon="mdi:magnify" className="size-7 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-brand-accent" />
              </div>
              <input
                type="text"
                className="w-full rounded-full border-2 border-pink-100 bg-white py-5 pl-16 pr-14 text-lg font-medium text-brand-accent shadow-soft transition-all duration-300 placeholder:text-pink-950/40 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 hover:shadow-barbie"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for answers..."
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-6 text-pink-950/40 hover:text-brand-primary transition-colors focus:outline-none"
                  aria-label="Clear search"
                >
                  <Icon icon="mdi:close-circle" className="size-6" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Interactive FAQ Cards */}
        <section className="mx-auto mt-16 max-w-3xl px-5 relative z-10">
          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openId === faq.question;
                return (
                  <div
                    key={faq.question}
                    className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${
                      isOpen 
                        ? "bg-white border-brand-primary/30 shadow-barbie" 
                        : "bg-white/70 backdrop-blur-sm border-white shadow-soft hover:border-brand-primary/40 hover:shadow-barbie hover:-translate-y-1 hover:bg-white"
                    }`}
                  >
                    {isOpen && (
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-background/40 to-transparent pointer-events-none" />
                    )}
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.question)}
                      className="relative z-10 w-full text-left px-6 py-8 md:px-10 flex items-start md:items-center justify-between gap-6 outline-none"
                    >
                      <div className="flex-1">
                        <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-primary border border-pink-100 mb-3 transition-colors duration-300 group-hover:bg-brand-background group-hover:border-brand-primary/20">
                          {faq.category}
                        </span>
                        <h3 className={`font-display text-xl md:text-2xl font-bold transition-colors duration-300 ${isOpen ? "text-brand-primary" : "text-brand-accent"}`}>
                          {faq.question}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 flex size-12 items-center justify-center rounded-full transition-all duration-500 shadow-sm ${
                          isOpen 
                            ? "bg-brand-primary text-white rotate-180" 
                            : "bg-white text-brand-primary border border-pink-100 group-hover:bg-brand-background group-hover:scale-110"
                        }`}
                      >
                        <Icon icon="mdi:chevron-down" className="size-6" />
                      </span>
                    </button>
                    
                    <div
                      className={`relative z-10 grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-8 md:px-10 pt-2">
                          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-100 to-transparent mb-6" />
                          <p className="text-base md:text-lg leading-relaxed text-pink-950/70">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[3rem] bg-white p-16 text-center shadow-soft border border-white">
                <div className="mx-auto grid size-24 place-items-center rounded-full bg-brand-background text-brand-primary mb-8 shadow-sm">
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
