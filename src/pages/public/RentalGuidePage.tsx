// src/pages/public/RentalGuidePage.tsx
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getRentalGuides } from "@/services/catalogue.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import ShinyText from "@/components/ui/ShinyText";
import { PrincessPlaqueCard } from "@/components/ui/PrincessPlaqueCard";

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
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-accent">
              <ShinyText text="How to Rent?" disabled={false} speed={3} />
            </h2>
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
                      <div className="md:hidden absolute top-[24px] left-[50%] w-[3px] h-[calc(100%+48px)] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                    )}

                    {(index === 0 || index === 1) && (
                      <div className="hidden md:block absolute top-[24px] left-[50%] w-[calc(100%+40px)] h-[3px] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                    )}
                    {index === 2 && (
                      <div className="hidden md:block absolute top-[24px] left-[50%] w-[3px] h-[calc(100%+64px)] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                    )}
                    {(index === 3 || index === 4) && (
                      <div className="hidden md:block absolute top-[24px] right-[50%] w-[calc(100%+40px)] h-[3px] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                    )}
                  </div>

                  <div className="relative shrink-0 z-10 transition-transform duration-500 hover:scale-110">
                    <div className="absolute inset-0 bg-yellow-400/20 blur-md rounded-full" />
                    <div className="relative grid size-12 md:size-14 place-items-center rounded-full bg-white border-2 border-yellow-400 shadow-sm overflow-hidden">
                      <img src="/assets/svg/profile-feedback.svg" alt="Step" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <PrincessPlaqueCard delay={`${index * 0.5}s`}>
                    <div className="absolute -top-4 -right-4 text-white/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:text-white/20 z-0">
                      {step.icon === "RN-Logo-Pink" ? (
                        <img src="/assets/RN-Logo-White.png" alt="" className="size-32 object-contain opacity-20" />
                      ) : (
                        <Icon icon={step.icon} className="size-32" />
                      )}
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center flex-1 text-center mt-2">
                      <span className="inline-flex h-6 items-center justify-center rounded-full bg-white px-4 text-[10px] font-bold tracking-widest text-[#d11275] mb-4 shadow-sm">
                        STEP {index + 1}
                      </span>
                      <h3 className="font-['Pacifico'] text-xl md:text-2xl font-bold tracking-wide text-white drop-shadow-md">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-xs md:text-sm leading-relaxed text-white drop-shadow-sm font-medium">
                        {step.description}
                      </p>
                    </div>
                  </PrincessPlaqueCard>

                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 relative z-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-accent">
              <ShinyText text="Things to Know" disabled={false} speed={3} />
            </h2>
          </div>
          <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {guides.map((section, index) => (
              <ScrollReveal as="article" key={section.title} delay={index * 100} className="flex">
                <PrincessPlaqueCard delay={`${index * 0.2}s`} className="!p-6">
                  <h3 className="font-['Pacifico'] text-lg md:text-xl font-bold z-10 tracking-wide mt-2 text-white drop-shadow-md">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-white font-medium drop-shadow-sm leading-relaxed text-[11px] md:text-xs z-10">{section.body}</p>
                </PrincessPlaqueCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ScrollReveal className="mx-auto max-w-4xl px-5 relative z-10" as="section">
          <PrincessPlaqueCard className="text-center overflow-hidden !py-12 md:!py-16">
            <div className="relative z-10">
              <img src="/assets/RN-Logo-White.png" alt="" className="size-14 mx-auto mb-5 object-contain drop-shadow-sm" />
              <h2 className="font-['Pacifico'] text-3xl md:text-4xl font-bold text-white drop-shadow-md tracking-wide">Ready to find what you love?</h2>
              <p className="mt-4 text-base md:text-lg text-white max-w-xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                Browse to our catalogue and send an inquiry to begin your rental.
              </p>

              <div className="mt-8 relative z-20">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white backdrop-blur-xl px-8 py-4 text-sm font-bold tracking-widest uppercase text-[#d11275] shadow-barbie transition-all duration-500 hover:scale-105 hover:bg-white/90 border border-pink-100"
                >
                  Browse Catalogue
                  <Icon icon="mdi:magic-staff" className="text-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />
                </Link>
              </div>
            </div>
          </PrincessPlaqueCard>
        </ScrollReveal>
      </main>
    </PublicLayout>
  );
}
