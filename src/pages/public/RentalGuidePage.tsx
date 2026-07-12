// src/pages/public/RentalGuidePage.tsx
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getRentalGuides, getRentalTerms } from "@/services/catalogue.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import ShinyText from "@/components/ui/ShinyText";
import { PrincessPlaqueCard } from "@/components/ui/PrincessPlaqueCard";

export function RentalGuidePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guides, setGuides] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [terms, setTerms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"terms" | "guidelines">("terms");

  useEffect(() => {
    getRentalGuides().then(data => setGuides(data));
    getRentalTerms().then(data => setTerms(data));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id as "terms" | "guidelines");
          }
        });
      },
      { threshold: 0.3 }
    );

    setTimeout(() => {
      const termsEl = document.getElementById("terms");
      const guidelinesEl = document.getElementById("guidelines");
      if (termsEl) observer.observe(termsEl);
      if (guidelinesEl) observer.observe(guidelinesEl);
    }, 500);

    return () => observer.disconnect();
  }, [terms.length, guides.length]);

  const parseBoldText = (text: string) => {
    if (!text) return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-[#d11275]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const gridClasses = [
    "md:col-start-1 md:row-start-1", "md:col-start-2 md:row-start-1", "md:col-start-3 md:row-start-1", // 0,1,2
    "md:col-start-3 md:row-start-2", "md:col-start-2 md:row-start-2", "md:col-start-1 md:row-start-2", // 3,4,5
    "md:col-start-1 md:row-start-3", "md:col-start-2 md:row-start-3", "md:col-start-3 md:row-start-3", // 6,7,8
    "md:col-start-3 md:row-start-4", "md:col-start-2 md:row-start-4", "md:col-start-1 md:row-start-4", // 9,10,11
    "md:col-start-1 md:row-start-5", "md:col-start-2 md:row-start-5", "md:col-start-3 md:row-start-5", // 12,13,14
  ];

  return (
    <PublicLayout>
      <main className="relative min-h-screen pb-32 bg-transparent">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse" />
        </div>

        <section id="terms" className="mx-auto max-w-6xl px-5 pt-12 pb-16 md:py-20 relative z-10">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-accent">
              <ShinyText text="Terms & Conditions" disabled={false} speed={3} />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 md:gap-y-16 gap-x-6 md:gap-x-10">
              {terms.map((step, index) => {
                const isLast = index === terms.length - 1;
                const isRowEnd = index % 3 === 2;
                const row = Math.floor(index / 3);
                const isEvenRow = row % 2 === 0;

                const desktopGridClass = gridClasses[index] || "";

                return (
                  <ScrollReveal key={step.title} delay={index * 100} once={true} className={`relative flex flex-col items-center text-center gap-5 ${desktopGridClass}`}>

                    <div className="absolute inset-0 pointer-events-none -z-10">
                      
                      {!isLast && (
                        <div className="md:hidden absolute top-[24px] left-[50%] w-[3px] h-[calc(100%+20px)] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                      )}

                      {(!isLast && !isRowEnd && isEvenRow) && (
                        <div className="hidden md:block absolute top-[24px] left-[50%] w-[calc(100%+40px)] h-[3px] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                      )}
                      {(!isLast && isRowEnd) && (
                        <div className="hidden md:block absolute top-[24px] left-[50%] w-[3px] h-[calc(100%+64px)] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                      )}
                      {(!isLast && !isRowEnd && !isEvenRow) && (
                        <div className="hidden md:block absolute top-[24px] right-[50%] w-[calc(100%+40px)] h-[3px] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)] z-0" />
                      )}
                    </div>

                    <div className="relative shrink-0 z-10 transition-transform duration-500 hover:scale-110">
                      <div className="absolute inset-0 bg-yellow-400/20 blur-md rounded-full" />
                      <div className="relative grid size-12 md:size-14 place-items-center rounded-full bg-white border-2 border-yellow-400 shadow-sm overflow-hidden">
                        <img src="/assets/svg/profile-feedback.svg" alt="Step" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <PrincessPlaqueCard delay={`${index * 0.5}s`} className="h-full w-full">
                      <div className="absolute -top-4 -right-4 text-white/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:text-white/20 z-0">
                        {step.icon && step.icon !== "RN-Logo-Pink" ? (
                          <Icon icon={step.icon} className="size-32" />
                        ) : (
                          <img src="/assets/RN-Logo-White.png" alt="" className="size-32 object-contain opacity-20" />
                        )}
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center flex-1 text-center mt-2">
                        <span className="inline-flex h-7 items-center justify-center rounded-full bg-white px-5 text-[11px] md:text-xs font-bold tracking-widest text-[#d11275] mb-3 shadow-sm">
                          CONDITION {index + 1}
                        </span>
                        <p className="mt-1 text-xs md:text-sm leading-relaxed text-white drop-shadow-sm font-medium">
                          {step.description}
                        </p>
                      </div>
                    </PrincessPlaqueCard>

                  </ScrollReveal>
                );
              })}
            </div>
          </section>

        <section id="guidelines" className="mx-auto max-w-6xl px-5 pt-8 pb-16 md:py-20 relative z-10">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-accent">
              <ShinyText text="Fitting Guidelines" disabled={false} speed={3} />
            </h2>
          </div>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {guides.map((section, index) => (
                <ScrollReveal as="article" key={section.title} delay={index * 100} once={true} className="flex h-full">
                  <PrincessPlaqueCard delay={`${index * 0.2}s`} variant="light" className="!p-8 w-full flex flex-col">
                    <h3 className="font-['Pacifico'] text-xl font-bold z-10 tracking-wide mt-2 text-[#d11275] drop-shadow-sm w-full text-center">
                      {section.title}
                    </h3>
                    <p className="mt-4 text-[#4A0E4E] font-sans font-medium leading-loose text-[13px] md:text-sm z-10 whitespace-pre-line flex-1 w-full text-left text-justify">
                      {parseBoldText(section.body)}
                    </p>
                  </PrincessPlaqueCard>
                </ScrollReveal>
              ))}
            </div>
          </section>

        <ScrollReveal className="mx-auto max-w-4xl px-5 relative z-10 mb-8" as="section">
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

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-1 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(209,18,117,0.2)]">
          <div className="relative flex">
            {/* Sliding Background */}
            <div 
              className={`absolute top-0 bottom-0 left-0 w-1/2 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                activeTab === "guidelines" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            
            <button
              onClick={() => {
                setActiveTab("terms");
                document.getElementById("terms")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`relative z-10 flex items-center justify-center gap-1.5 w-[90px] md:w-[110px] py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest transition-colors duration-300 ${
                activeTab === "terms" 
                  ? "text-[#d11275]" 
                  : "text-pink-800/60 hover:text-[#d11275]"
              }`}
            >
              <Icon icon="mdi:file-document-outline" className="text-sm md:text-base" />
              T&C
            </button>
            <button
              onClick={() => {
                setActiveTab("guidelines");
                document.getElementById("guidelines")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`relative z-10 flex items-center justify-center gap-1.5 w-[90px] md:w-[110px] py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest transition-colors duration-300 ${
                activeTab === "guidelines" 
                  ? "text-[#d11275]" 
                  : "text-pink-800/60 hover:text-[#d11275]"
              }`}
            >
              <Icon icon="game-icons:ample-dress" className="text-sm md:text-base" />
              FG
            </button>
          </div>
        </div>

      </main>
    </PublicLayout>
  );
}
