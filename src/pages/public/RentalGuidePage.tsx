import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { rentalGuideSections } from "@/data/site-content";

export function RentalGuidePage() {
  return (
    <PublicLayout>
      <main>
        <section className="section-shell">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
              Rental Guide
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-pink-950">
              How reservations work
            </h1>
            <p className="mt-5 text-lg leading-8 text-pink-950/70">
              This website is a catalogue and inquiry system. Nicole still
              confirms reservations, fitting schedules, deposits, and payments
              manually for a more personal rental experience.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rentalGuideSections.map((section) => (
              <article key={section.title} className="rounded-2xl bg-white p-6 shadow-soft">
                <Icon icon="mdi:clipboard-check-outline" className="size-8 text-brand-primary" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-brand-accent">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-pink-950/70">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white/70">
          <div className="section-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold">Ready to ask about a piece?</h2>
              <p className="mt-3 text-pink-950/70">
                Send the item name, event date, and fitting preference so Nicole can reply clearly.
              </p>
            </div>
            <Link to="/contact" className="rounded-full bg-brand-accent px-6 py-3 text-center font-semibold text-white shadow-soft">
              Send Inquiry
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
