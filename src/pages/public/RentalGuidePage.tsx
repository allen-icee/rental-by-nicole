// src/pages/public/RentalGuidePage.tsx
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getRentalGuides } from "@/services/catalogue.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const journeySteps = [
  {
    title: "Browse Dresses",
    description: "Explore our curated catalogue and find the perfect piece for your special event.",
    icon: "RN-Logo-Pink"
  },
  {
    title: "Check Availability",
    description: "Look at the item's details to see its reserved dates before making a request.",
    icon: "mdi:calendar-check"
  },
  {
    title: "Send Inquiry",
    description: "Reach out via our form or social links with your event date and fitting preference.",
    icon: "mdi:message-heart"
  },
  {
    title: "Receive Confirmation",
    description: "Nicole will manually confirm your reservation, schedule, and payment details.",
    icon: "mdi:check-decagram"
  },
  {
    title: "Schedule Fitting",
    description: "Meet with Nicole for a private fitting to ensure your piece fits comfortably.",
    icon: "mdi:tape-measure"
  },
  {
    title: "Enjoy Your Event",
    description: "Shine at your event! Simply return the item unwashed on the agreed date.",
    icon: "mdi:sparkles"
  }
];
export function RentalGuidePage() {
  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    getRentalGuides().then(data => setGuides(data));
  }, []);

  return (
    <PublicLayout>
      <main className="relative min-h-screen pb-24 bg-transparent">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse" />
        </div>

        <section className="mx-auto max-w-6xl px-5 py-20 relative z-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-accent">How to Rent?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-16 gap-x-6 md:gap-x-10">
            {journeySteps.map((step, index) => {
              const isLast = index === journeySteps.length - 1;

              const desktopGridClass = [
                "md:col-start-1 md:row-start-1",
                "md:col-start-2 md:row-start-1",
                "md:col-start-3 md:row-start-1",
                "md:col-start-3 md:row-start-2",
                "md:col-start-2 md:row-start-2",
                "md:col-start-1 md:row-start-2",
              ][index];

              return (
                <ScrollReveal key={step.title} delay={index * 100} className={`relative flex flex-col items-center text-center gap-5 ${desktopGridClass}`}>

                  <div className="absolute inset-0 pointer-events-none -z-10">
                    
                    {!isLast && (
                      <div className="md:hidden absolute top-[24px] left-[50%] w-px h-[calc(100%+48px)] bg-brand-primary/20" />
                    )}

                    {(index === 0 || index === 1) && (
                      <div className="hidden md:block absolute top-[24px] left-[50%] w-[calc(100%+40px)] h-px bg-brand-primary/20" />
                    )}
                    {index === 2 && (
                      <div className="hidden md:block absolute top-[24px] left-[50%] w-px h-[calc(100%+64px)] bg-brand-primary/20" />
                    )}
                    {(index === 3 || index === 4) && (
                      <div className="hidden md:block absolute top-[24px] right-[50%] w-[calc(100%+40px)] h-px bg-brand-primary/20" />
                    )}
                  </div>

                  <div className="relative shrink-0 z-10 transition-transform duration-500 hover:scale-110">
                    <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-full" />
                    <div className="relative grid size-12 place-items-center rounded-full bg-white border-2 border-pink-100 shadow-sm text-brand-primary">
                      <Icon icon="mdi:heart" className="size-5" />
                    </div>
                  </div>

                  <div className="group relative w-full rounded-[2.5rem] glass-card p-6 md:p-8 shadow-crystal transition-all duration-500 hover:-translate-y-2 hover:shadow-barbie overflow-hidden flex-1 flex flex-col animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <div className="absolute -top-4 -right-4 text-brand-primary/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:text-brand-primary/20">
                      {step.icon === "RN-Logo-Pink" ? (
                        <img src="/assets/RN-Logo-Pink.png" alt="" className="size-32 object-contain opacity-10" />
                      ) : (
                        <Icon icon={step.icon} className="size-32" />
                      )}
                    </div>
                    <div className="relative z-10 flex flex-col items-center flex-1">
                      <span className="inline-flex h-6 items-center justify-center rounded-full bg-brand-background px-3 text-[9px] font-bold tracking-widest text-brand-primary mb-4 border border-pink-100 shadow-sm">
                        STEP {index + 1}
                      </span>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-brand-accent">{step.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-pink-950/70">{step.description}</p>
                    </div>
                  </div>

                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 relative z-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-accent">Things to Know</h2>
          </div>
          <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {guides.map((section, index) => (
              <ScrollReveal as="article" key={section.title} delay={index * 100} className="rounded-[2.5rem] glass-panel p-6 shadow-crystal hover:shadow-barbie transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <span className="grid size-12 place-items-center rounded-full glass-card text-brand-primary shadow-sm mb-4 border border-white/60">
                  <Icon icon="mdi:information-variant" className="size-6" />
                </span>
                <h3 className="font-bold text-brand-accent text-base">{section.title}</h3>
                <p className="mt-2 text-pink-950/70 leading-relaxed text-xs">{section.body}</p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ScrollReveal className="mx-auto max-w-4xl px-5 relative z-10" as="section">
          <div className="rounded-[3rem] crystal-button p-8 md:p-14 shadow-crystal overflow-hidden relative text-center text-white">
            <div className="absolute inset-0 bg-brand-primary/20 backdrop-blur-md" />
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-white/20 blur-2xl animate-float" style={{ animationDelay: '2s' }} />

            <div className="relative z-10">
              <img src="/assets/RN-Logo-White.png" alt="" className="size-14 mx-auto mb-5 object-contain drop-shadow-sm" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to find what you love?</h2>
              <p className="mt-4 text-base md:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
                Browse to our catalogue and send an inquiry to begin your rental.
              </p>

              <div className="mt-8 relative z-20">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/90 backdrop-blur-xl px-8 py-4 text-sm font-bold tracking-widest uppercase text-brand-accent shadow-barbie transition-all duration-500 hover:scale-105 hover:bg-white"
                >
                  Browse Catalogue
                  <Icon icon="mdi:magic-staff" className="text-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </PublicLayout>
  );
}
