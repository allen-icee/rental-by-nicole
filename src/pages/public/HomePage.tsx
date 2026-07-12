// src/pages/public/HomePage.tsx
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Carousel } from "@/components/ui/Carousel";
import { DiamondMirrorCard } from "@/components/ui/DiamondMirrorCard";
import { DiamondCastleHeart } from "@/components/ui/DiamondCastleHeart";
import { PrincessPlaqueCard } from "@/components/ui/PrincessPlaqueCard";
import { useEffect, useState } from "react";
import { getCatalogueData, getTestimonials, getFaqs } from "@/services/catalogue.service";
import type { CatalogItem } from "@/features/catalogue/types/catalogue";
import { useSettings } from "@/contexts/SettingsContext";
import { siteConfig } from "@/config/site";
import { AnnouncementToast } from "@/components/ui/AnnouncementToast";
import GradientText from "@/components/ui/GradientText";
import ShinyText from "@/components/ui/ShinyText";
import GlassSurface from "@/components/ui/GlassSurface";
import RotatingText from "@/components/ui/RotatingText";
import { useTrackPageView } from "@/features/analytics/usePageViews";

const availabilityClasses = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-amber-100 text-amber-700",
  unavailable: "bg-pink-100 text-brand-accent"
};

const formatTestimonialDate = (dateStr: string) => {
  const parts = dateStr.split(" ");
  if (parts.length >= 2) return `${parts[0].substring(0, 3)} ${parts[1]}`;
  return dateStr;
};

const truncateWords = (str: string, max: number) => {
  const words = str.split(" ");
  if (words.length <= max) return str;
  return words.slice(0, max).join(" ") + "...";
};

const processSteps = [
  { title: "Browse the Collection", desc: "Find the perfect dress or gown." },
  { title: "Check Availability", desc: "View availability notes on each item." },
  { title: "Send an Inquiry", desc: "Reach out to request a reservation." },
  { title: "Manual Confirmation", desc: "Fittings and details are finalized privately." }
];

export function HomePage() {
  useSettings();
  useTrackPageView();

  const [newArrivals, setNewArrivals] = useState<CatalogItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<CatalogItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testimonials, setTestimonials] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [curatedTags, setCuratedTags] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const [{ items, tags }, fetchedTestimonials, fetchedFaqs] = await Promise.all([
        getCatalogueData(),
        getTestimonials(),
        getFaqs()
      ]);

      setNewArrivals(items.filter((item) => item.isNewArrival));
      setFeaturedItems(items.filter((item) => item.featured));
      setTestimonials(fetchedTestimonials);
      setFaqs(fetchedFaqs);
      setCuratedTags(tags.slice(0, 4));
    }
    loadData();
  }, []);



  return (
    <PublicLayout>
      <main>
        <AnnouncementToast />

        <section className="relative isolate bg-transparent min-h-[85vh] flex items-center">

          <ScrollReveal delay={100} className="relative mx-auto w-full max-w-7xl px-5 py-24 z-10 flex items-center justify-center md:justify-center">
            {/* Cloudy Magical Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[60vh] max-h-[600px] bg-white/60 blur-[100px] rounded-[100%] -z-10 pointer-events-none" />

            <div className="max-w-3xl text-center relative z-10 flex flex-col items-center">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-brand-primary drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                <ShinyText text={siteConfig.name} disabled={false} speed={3} />
              </p>
              <h1 className="mt-4 font-display text-5xl font-bold leading-tight md:text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] flex justify-center">
                <span className="relative inline-block">
                  <Icon
                    icon="game-icons:crown"
                    className="absolute -top-3 left-8 md:-top-5 md:left-[3.5rem] -rotate-[20deg] text-4xl md:text-6xl text-[#d11275] z-10 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] pointer-events-none"
                  />
                  <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                    <span style={{ fontFamily: "'Pacifico', cursive", textTransform: 'capitalize', paddingBottom: '0.15em' }}>
                      {siteConfig.tagline}
                    </span>
                  </GradientText>
                </span>
              </h1>
              <div className="mt-8 max-w-2xl text-lg leading-relaxed text-brand-accent font-bold drop-shadow-[0_0_12px_rgba(255,255,255,1)] flex flex-wrap items-center justify-center gap-2">
                <span>Browse our curated collections like</span>
                <RotatingText
                  texts={newArrivals.length > 0 ? [...newArrivals, ...featuredItems].map(i => i.name) : ['dresses', 'gowns', 'Filipiniana pieces', 'boleros', 'accessories']}
                  mainClassName="inline-flex overflow-hidden bg-gradient-to-r from-brand-primary to-brand-accent text-white px-4 py-1.5 rounded-xl shadow-barbie border border-white/40"
                  staggerDuration={0.025}
                  staggerFrom="last"
                  rotationInterval={3000}
                />
              </div>
              <div className="mt-16 flex justify-center w-full relative z-10">
                <Link
                  to="/catalogue"
                  className="animate-float inline-flex items-center justify-center transition-transform hover:scale-110 text-[#ff66b2] drop-shadow-[0_0_15px_rgba(255,102,178,0.6)] hover:drop-shadow-[0_0_25px_rgba(255,102,178,0.9)]"
                  aria-label="Go to catalogue"
                >
                  <Icon icon="game-icons:ample-dress" className="size-12 md:size-16" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section id="new-arrivals" className="bg-transparent overflow-hidden py-16 md:py-24">
          <ScrollReveal className="mx-auto max-w-7xl px-5 relative">
            <div className="absolute inset-0 bg-white/50 blur-[60px] rounded-[5rem] scale-[1.1] -z-10 pointer-events-none" />
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between relative z-10 py-4">
              <div className="text-center md:text-left">
                <p className="text-sm md:text-base font-bold uppercase tracking-[0.24em] text-brand-primary drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
                  <ShinyText text="New Arrivals" disabled={false} speed={3} />
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold text-brand-accent md:text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,1)] relative z-10">
                  <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                    Fresh styles you'll love to wear
                  </GradientText>
                </h2>
              </div>
              <Link to="/catalogue" className="hidden md:inline-flex group items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-6 py-2.5 text-sm font-bold text-brand-accent border border-pink-100 shadow-sm transition-all hover:bg-white hover:text-brand-primary hover:shadow-barbie">
                View all items
                <Icon icon="mdi:chevron-right" className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="mx-auto max-w-7xl mt-10">
            {newArrivals.length > 0 ? (
              <Carousel>
                {newArrivals.map((item) => (
                  <Link key={item.id} to={`/catalogue?item=${item.id}`} className="w-[75vw] max-w-[280px] shrink-0 snap-center group flex flex-col overflow-hidden rounded-2xl bg-pink-50/90 backdrop-blur-md border border-pink-200/50 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-barbie">
                  <div className="overflow-hidden h-80 relative">
                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-8 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md border border-white/40 text-white px-5 py-2 rounded-full text-sm font-bold shadow-soft">
                        Explore Item <Icon icon="game-icons:ample-dress" className="size-5" />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4 items-center text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-sm ${item.availabilityStatus.toLowerCase().startsWith('available') ? availabilityClasses.available : availabilityClasses[item.availabilityStatus as keyof typeof availabilityClasses] ?? availabilityClasses.unavailable}`}>
                      {item.availabilityStatus}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-black text-pink-950 group-hover:text-brand-primary transition-colors">{item.name}</h3>
                    <p className="mt-1 text-base font-bold text-brand-accent">{item.priceDisplay.replace(/\s*\/\s*/, ' for ')}</p>
                  </div>
                  </Link>
                ))}
              </Carousel>
            ) : (
              <div className="text-center py-10 text-pink-950/50">
                <p>New arrivals coming soon!</p>
              </div>
            )}
          </ScrollReveal>

          <ScrollReveal delay={200} className="mt-10 px-5 text-center md:hidden">
            <Link to="/catalogue" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-brand-accent shadow-soft transition-all hover:bg-white/60 hover:scale-105 hover:shadow-barbie">
              See More Arrivals
              <Icon icon="game-icons:ample-dress" className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </section>

        {/* Curated Collections */}
        <section className="bg-transparent py-16 md:py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-5">
            <ScrollReveal className="text-center max-w-2xl mx-auto relative py-6">
              <div className="absolute inset-0 bg-white/50 blur-[60px] rounded-[5rem] scale-[1.2] -z-10 pointer-events-none" />
              <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-brand-primary drop-shadow-[0_0_8px_rgba(255,255,255,1)] relative z-10">
                <ShinyText text="Curated Collection" disabled={false} speed={3} />
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-brand-accent md:text-5xl leading-tight drop-shadow-[0_0_12px_rgba(255,255,255,1)] relative z-10">
                <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                  Discover looks for every moment
                </GradientText>
              </h2>
            </ScrollReveal>

            <div className="mt-12 md:mt-16 grid grid-cols-2 md:flex md:justify-center gap-4 md:gap-8">
              {curatedTags.map((collection, index) => (
                <ScrollReveal
                  key={collection}
                  delay={index * 100}
                >
                  <DiamondMirrorCard collection={collection} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Rental Process */}
        <section className="bg-transparent py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 text-center">
            <ScrollReveal className="max-w-2xl mx-auto relative py-6 text-center">
              <div className="absolute inset-0 bg-white/50 blur-[60px] rounded-[5rem] scale-[1.2] -z-10 pointer-events-none" />
              <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-brand-primary drop-shadow-[0_0_8px_rgba(255,255,255,1)] relative z-10">
                <ShinyText text="Rental Process" disabled={false} speed={3} />
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-brand-accent md:text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,1)] relative z-10">
                <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                  From inquiry to confirmation, made simple
                </GradientText>
              </h2>
            </ScrollReveal>

            <div className="mt-16 md:mt-20 relative">
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-[3px] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)]" />
              <div className="md:hidden absolute top-10 bottom-10 left-8 w-[3px] bg-[linear-gradient(110deg,#eebb4d,45%,#fff,55%,#eebb4d)] bg-[length:200%_100%] animate-shine-line shadow-[0_0_8px_rgba(238,187,77,0.8)]" />

              <div className="grid gap-10 md:gap-6 md:grid-cols-4 relative z-10 mt-6">
                {processSteps.map((step, index) => (
                  <ScrollReveal key={step.title} delay={index * 150} className="group flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-0">
                    <span className="shrink-0 grid size-16 md:size-20 place-items-center rounded-full bg-white border-4 border-[#eebb4d] shadow-[0_4px_10px_rgba(238,187,77,0.5)] font-sans font-bold text-2xl md:text-3xl text-[#d11275] transition-all duration-500 group-hover:scale-110 group-hover:border-[#ff66b2] group-hover:bg-[#ff66b2] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,102,178,0.8)]">
                      {index + 1}
                    </span>
                    <div className="mt-1 md:mt-6 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-pink-100 shadow-sm">
                      <h3 className="font-['Pacifico'] text-xl text-[#d11275]">{step.title}</h3>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <div className="mt-16 text-center relative z-10 max-w-2xl mx-auto">
              <Link to="/rental-guide" className="block group">
                <PrincessPlaqueCard className="!p-8 transition-transform duration-500 group-hover:scale-105">
                  <span className="inline-flex items-center gap-2 font-['Pacifico'] text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transition-all">
                    Explore Full Rental Guide
                    <Icon icon="mdi:arrow-right" className="size-6 transition-transform group-hover:translate-x-2" />
                  </span>
                </PrincessPlaqueCard>
              </Link>
            </div>
          </div>
        </section>

        {/* Customer Feedback */}
        <section className="bg-transparent py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 grid gap-12 lg:grid-cols-[1fr_1.5fr] items-center">
            <ScrollReveal className="relative py-8 md:py-12 text-center md:text-left">
              <div className="absolute inset-0 bg-white/40 blur-[80px] rounded-[5rem] scale-[1.3] -z-10 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-sm md:text-base font-bold uppercase tracking-[0.24em] text-brand-primary drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
                  <ShinyText text="Customer Feedback" disabled={false} speed={3} />
                </p>
                <h2 className="mt-1 font-display text-4xl font-semibold text-brand-accent leading-tight drop-shadow-[0_0_12px_rgba(255,255,255,1)]">
                  <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                    Loved by clients
                  </GradientText>
                </h2>
                <p className="mt-5 text-lg text-pink-950 font-medium leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                  See how exceptional pieces and dedicated service have helped clients feel their best.
                </p>
                <div className="mt-6 flex flex-row flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
                  <Link to="/testimonials" className="inline-flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm border border-pink-200 px-6 py-2 text-sm font-bold text-brand-accent shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all hover:bg-white hover:text-brand-primary hover:shadow-[0_0_20px_rgba(255,255,255,1)] hover:-translate-y-0.5">
                    Read More
                  </Link>
                  <Link to="/testimonials" state={{ openReviewModal: true }} className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-2 text-sm font-bold text-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all hover:bg-brand-accent hover:shadow-[0_0_20px_rgba(255,255,255,1)] hover:-translate-y-0.5">
                    Share Your Experience
                    <Icon icon="ix:feedback-filled" className="size-4 transition-transform group-hover:scale-110" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.slice(0, 2).map((item, index) => (
                <ScrollReveal key={item.name} delay={index * 200} className={`group relative w-full max-w-[320px] mx-auto text-center transition-all duration-500 hover:scale-105 ${index === 1 ? 'hidden sm:block' : ''}`}>
                  <Link to="/testimonials" className="block outline-none">
                    <DiamondCastleHeart className="animate-float" style={{ animationDelay: `${index * 1.5}s` }} rating={item.rating}>
                      
                      <div className="relative mt-2">
                        <p className="text-xs md:text-sm font-serif italic leading-relaxed text-white drop-shadow-sm px-4">
                          "{truncateWords(item.comment, 5)}"
                        </p>
                      </div>

                      <div className="mt-2 flex flex-col items-center">
                        <h4 className="font-display text-xl md:text-2xl font-bold text-white drop-shadow-md">
                          {item.name.split(' ')[0]}
                        </h4>
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/80 mt-1">
                          {formatTestimonialDate(item.date)}
                        </p>
                      </div>
                      
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white bg-white/20 px-3 py-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm border border-white/30">
                        Read full review
                      </p>
                    </DiamondCastleHeart>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Preview - Redesigned Cards */}
        <section className="bg-transparent py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5">
            <ScrollReveal className="text-center max-w-2xl mx-auto relative py-6">
              <div className="absolute inset-0 bg-white/50 blur-[60px] rounded-[5rem] scale-[1.2] -z-10 pointer-events-none" />
              <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-brand-primary drop-shadow-[0_0_8px_rgba(255,255,255,1)] relative z-10">
                <ShinyText text="FAQ Preview" disabled={false} speed={3} />
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-brand-accent md:text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,1)] relative z-10">
                <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                  Find answers to common questions
                </GradientText>
              </h2>
            </ScrollReveal>
            <div className="mt-12 md:mt-16 max-w-3xl mx-auto space-y-4">
              {faqs.slice(0, 2).map((faq, index) => {
                const isOpen = openFaqId === faq.question;
                return (
                  <ScrollReveal
                    key={faq.question}
                    delay={Math.min(index * 150, 500)} 
                    className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 animate-float ${isOpen
                      ? "glass-panel border-white/80 shadow-crystal"
                      : "glass-card border-white/60 shadow-soft hover:border-brand-primary/40 hover:shadow-barbie hover:-translate-y-1 hover:bg-white/80"
                      }`}
                  >
                    {isOpen && (
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-background/40 to-transparent pointer-events-none" />
                    )}
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.question)}
                      className="relative z-10 w-full text-left px-5 py-5 md:px-6 flex items-start md:items-center justify-between gap-6 outline-none"
                    >
                      <div className="flex-1">
                        <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-primary border border-pink-100 mb-2 transition-colors duration-300 group-hover:bg-brand-background group-hover:border-brand-primary/20">
                          {faq.category}
                        </span>
                        <h3 className={`font-display text-lg md:text-xl font-bold transition-colors duration-300 ${isOpen ? "text-brand-primary" : "text-brand-accent"}`}>
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
                        <div className="px-5 pb-5 md:px-6 pt-2">
                          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-100 to-transparent mb-4" />
                          <p className="text-sm md:text-base font-medium leading-relaxed text-pink-950">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Link to="/faq" className="group inline-flex items-center gap-2 rounded-full bg-brand-primary px-8 py-3.5 font-bold uppercase tracking-widest text-xs text-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,1)] hover:bg-brand-accent">
                Explore All FAQs
                <Icon icon="wpf:faq" className="size-4 transition-transform group-hover:scale-110" />
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden bg-transparent py-16 md:py-20">
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5">
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={48}
              className="p-10 md:p-16 lg:p-20 w-full"
            >
              {/* Decorative sparkles kept on the edges */}
              <Icon icon="mdi:sparkles" className="absolute top-8 left-8 text-2xl text-pink-300 animate-pulse hidden md:block" />
              <Icon icon="mdi:star-four-points" className="absolute bottom-8 right-8 text-3xl text-brand-primary/40 animate-pulse hidden md:block" style={{ animationDelay: '1s' }} />

              <div className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full relative z-10 text-center">
                
                {/* Row 1: Heading */}
                <div className="py-2 pb-4">
                  <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-normal md:leading-[1.3] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
                    Found the right look?
                  </h2>
                </div>

                {/* Row 2: Description */}
                <div className="max-w-[320px] sm:max-w-[420px] md:max-w-[500px]">
                  <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                    Send an inquiry and the details will be confirmed with you personally. Let's make your dream outfit a reality.
                  </p>
                </div>

                {/* Row 3: Button */}
                <div>
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-white px-8 md:px-12 py-3.5 md:py-4 text-sm md:text-base font-bold text-brand-primary shadow-[0_0_16px_rgba(255,255,255,0.7)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_24px_rgba(255,255,255,1)]"
                  >
                    Contact Us
                    <Icon icon="mdi:paper-plane" className="size-5 md:size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </div>

              </div>
            </GlassSurface>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
