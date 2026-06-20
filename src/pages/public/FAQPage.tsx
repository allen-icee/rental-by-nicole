import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { faqs } from "@/data/site-content";

export function FAQPage() {
  const [query, setQuery] = useState("");

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
      <main className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
            FAQ
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-pink-950">
            Frequently asked questions
          </h1>
          <p className="mt-4 leading-7 text-pink-950/70">
            Search reservation, fitting, catalogue, return, and media questions.
          </p>
          <div className="mt-7 rounded-full bg-white p-2 shadow-soft">
            <input
              className="input-field border-transparent bg-transparent"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search FAQ..."
            />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl bg-white p-6 shadow-soft">
                <summary className="cursor-pointer list-none">
                  <span className="flex items-start justify-between gap-5">
                    <span>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent">
                        {faq.category}
                      </span>
                      <span className="mt-2 block font-semibold text-pink-950">{faq.question}</span>
                    </span>
                    <Icon icon="mdi:chevron-down" className="size-6 shrink-0 text-brand-accent" />
                  </span>
                </summary>
                <p className="mt-4 leading-7 text-pink-950/70">{faq.answer}</p>
              </details>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
              <Icon icon="mdi:comment-question-outline" className="mx-auto size-10 text-brand-primary" />
              <p className="mt-4 font-semibold">No FAQ matched your search.</p>
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
