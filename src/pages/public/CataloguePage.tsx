// src/pages/public/CataloguePage.tsx
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useToast } from "@/components/ui/toast-context";
import type { CatalogItem } from "@/features/catalogue/types/catalogue";
import { getCatalogueData, type CatalogueData } from "@/services/catalogue.service";
import { ImageViewer } from "@/components/ui/ImageViewer";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Accordion } from "@/components/ui/Accordion";
import GradientText from "@/components/ui/GradientText";
import ShinyText from "@/components/ui/ShinyText";

const pageSize = 12;

const availabilityClasses = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-amber-100 text-amber-700",
  unavailable: "bg-pink-100 text-brand-accent"
};

const initialCatalogueData: CatalogueData = {
  items: [],
  categories: [],
  tags: [],
  source: "fallback"
};

export function CataloguePage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get("tag");
  const categoryParam = searchParams.get("category");
  const itemParam = searchParams.get("item");

  const [catalogueData, setCatalogueData] = useState<CatalogueData>(initialCatalogueData);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryParam || "All");
  const [tag, setTag] = useState(tagParam || "All");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (tagParam) setTag(tagParam);
    if (categoryParam) setCategory(categoryParam);
  }, [tagParam, categoryParam]);

  useEffect(() => {
    document.body.classList.add("catalogue-page");
    return () => document.body.classList.remove("catalogue-page");
  }, []);

  useEffect(() => {
    let mounted = true;

    getCatalogueData().then((data) => {
      if (mounted) {
        setCatalogueData(data);
        setLoading(false);

        if (itemParam) {
          const item = data.items.find((i) => i.id === itemParam);
          if (item) {
            setSelectedItem(item);

            const newParams = new URLSearchParams(searchParams);
            newParams.delete("item");
            setSearchParams(newParams, { replace: true });
          }
        }

        if (data.source === "fallback") {
          showToast({
            tone: "info",
            title: "Demo catalogue",
            message: "Supabase is not returning live catalogue items yet."
          });
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [showToast, itemParam, searchParams, setSearchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const duration = 600;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, start * (1 - easeInOutQuad(progress)));

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
    requestAnimationFrame(animateScroll);
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return catalogueData.items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [item.name, item.description, item.category, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesCategory = category === "All" || item.category === category;
      const matchesTag = tag === "All" || item.tags.includes(tag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [catalogueData.items, category, search, tag]);


  const visibleItems = filteredItems.slice(0, page * pageSize);
  const activeImageUrl = selectedItem?.images[activeImage] ?? "";

  function openItem(item: CatalogItem) {
    setSelectedItem(item);
    setActiveImage(0);
  }

  function openFullscreen(imageUrl: string) {
    setFullscreenImage(imageUrl);
  }

  function closeFullscreen() {
    setFullscreenImage(null);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setTag("All");
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("category");
    newParams.delete("tag");
    setSearchParams(newParams, { replace: true });
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (fullscreenImage) closeFullscreen();
        else if (selectedItem) setSelectedItem(null);
      }
    }

    if (selectedItem || fullscreenImage) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, fullscreenImage]);

  return (
    <PublicLayout>
      <main>
        <ScrollReveal as="section" className="mx-auto max-w-7xl px-4 pt-8 pb-8 relative z-30">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                <ShinyText text="Catalogue" disabled={false} speed={3} />
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-pink-950">
                <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                  Browse rental pieces
                </GradientText>
              </h1>
              <p className="mt-3 leading-7 text-pink-950/70">
                Explore the collection using categories, tags, and style filters.
                Open any item to view measurements and availability.
              </p>
              {catalogueData.source === "fallback" && !loading ? (
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-brand-accent shadow-soft">
                  Demo catalogue is showing until the Supabase migration and live
                  catalogue records are added.
                </p>
              ) : null}
            </div>
            <div className="relative z-20 rounded-[2rem] glass-panel p-3 shadow-crystal">
              <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <div className="relative">
                  <input
                    className="w-full rounded-full border-2 border-white/60 bg-white/40 backdrop-blur-md py-3 pl-12 pr-4 text-sm font-medium focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-pink-950/60 text-brand-accent shadow-inner"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search dresses, gowns, tags..."
                  />
                  <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-pink-950/40" />
                </div>
                <div className="relative z-50">
                  <CustomSelect
                    value={category}
                    onChange={(val) => {
                      setCategory(val);
                      setPage(1);
                      const newParams = new URLSearchParams(searchParams);
                      if (val !== "All") newParams.set("category", val);
                      else newParams.delete("category");
                      setSearchParams(newParams, { replace: true });
                    }}
                    options={["All", ...catalogueData.categories]}
                  />
                </div>
                <div className="relative z-40">
                  <CustomSelect
                    value={tag}
                    onChange={(val) => {
                      setTag(val);
                      setPage(1);
                      const newParams = new URLSearchParams(searchParams);
                      if (val !== "All") newParams.set("tag", val);
                      else newParams.delete("tag");
                      setSearchParams(newParams, { replace: true });
                    }}
                    options={["All", ...catalogueData.tags]}
                  />
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center justify-center rounded-full border-2 border-white/80 bg-white/50 px-4 py-3 text-brand-accent transition hover:border-brand-primary hover:text-white hover:bg-brand-primary hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-brand-primary/10 backdrop-blur-md"
                  title="Reset filters"
                  aria-label="Reset filters"
                >
                  <Icon icon="mdi:refresh" className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="mb-5 flex items-center justify-between text-sm text-pink-950/65">
            <span>{loading ? "Loading catalogue..." : `${filteredItems.length} item(s) found`}</span>
            <span>
              Showing {visibleItems.length} of {filteredItems.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/90 shadow-barbie" />
              ))}
            </div>
          ) : visibleItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibleItems.map((item, index) => (
                <ScrollReveal as="article" key={item.id} delay={index * 50} className="group transition-all" style={{ animationDelay: `${index * 0.2}s` }}>
                  <button type="button" onClick={() => openItem(item)} className="block w-full text-left transition-transform duration-500 hover:-translate-y-2 active:scale-[0.98]">
                    <div className="barbie-card w-full h-full">
                      <div className="barbie-card-oval">
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        <span
                          className={`absolute left-1/2 -translate-x-1/2 top-4 sm:top-5 rounded-full px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold shadow-sm z-10 ${availabilityClasses[item.availabilityStatus]}`}
                        >
                          {item.availabilityStatus}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 z-10 pointer-events-none">
                          <Icon icon="game-icons:ample-dress" className="size-8 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="barbie-card-ribbon">
                        <div className="ribbon-tail ribbon-tail-left"></div>
                        <div className="ribbon-tail ribbon-tail-right"></div>
                        <div className="ribbon-content flex flex-col justify-center">
                          <h3 className="ribbon-title line-clamp-1">{item.name}</h3>
                          <p className="ribbon-subtitle">{item.priceDisplay}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] glass-panel p-10 text-center shadow-crystal">
              <Icon icon="mdi:magnify-close" className="mx-auto size-12 text-brand-primary opacity-60" />
              <h2 className="mt-4 font-display text-3xl font-semibold">No magical items found</h2>
              <p className="mt-2 text-pink-950/70">Try a different search, category, or tag.</p>
            </div>
          )}

          {visibleItems.length < filteredItems.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                className="crystal-button rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-crystal transition-transform active:scale-95"
              >
                Load More
              </button>
            </div>
          )}
        </section>

        {selectedItem ? (
          <div
            className="fixed inset-0 z-[70] overflow-y-auto bg-pink-950/20 p-4 backdrop-blur-md flex items-center"
            onClick={() => setSelectedItem(null)}
            data-lenis-prevent="true"
          >
            <div
              className="mx-auto my-auto max-w-5xl storybook-modal w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr] md:p-5 min-w-0">
                <div className="min-w-0">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/80 backdrop-blur-md text-brand-accent shadow-soft transition hover:bg-white md:hidden"
                      aria-label="Close modal"
                    >
                      <Icon icon="mdi:close" className="size-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openFullscreen(activeImageUrl)}
                      className="block w-full rounded-2xl overflow-hidden shadow-inner border border-white/60"
                      aria-label="Open image viewer"
                    >
                      <img
                        src={activeImageUrl}
                        alt={selectedItem.name}
                        className="h-[390px] w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </button>

                    {selectedItem.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-white/80 text-brand-accent shadow-soft backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/20 opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
                        >
                          <Icon icon="mdi:chevron-left" className="size-6" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage((prev) => (prev + 1) % selectedItem.images.length);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-white/80 text-brand-accent shadow-soft backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/20 opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
                        >
                          <Icon icon="mdi:chevron-right" className="size-6" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => openFullscreen(activeImageUrl)}
                      className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-white text-brand-accent shadow-soft"
                      aria-label="Open image viewer"
                      title="Open image viewer"
                    >
                      <Icon icon="mdi:fullscreen" className="size-6" />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-3 pt-1 px-1 storybook-scrollbar">
                    {selectedItem.images.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => setActiveImage(index)}
                        className={`h-20 w-20 shrink-0 overflow-hidden storybook-thumbnail ${activeImage === index ? "storybook-thumbnail-active" : ""}`}
                      >
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col p-4 md:p-5 lg:p-6 md:max-h-[85svh] z-10 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full text-center">
                      <div className="storybook-divider">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-accent`}>
                          <Icon icon="game-icons:ribbon-medal" className="inline size-3 mr-1" />
                          {selectedItem.availabilityStatus}
                        </span>
                      </div>
                      <h2 className="text-4xl sm:text-5xl text-brand-accent leading-tight pb-1" style={{ fontFamily: "'Pacifico', cursive", textTransform: 'capitalize' }}>
                        {selectedItem.name}
                      </h2>
                      <p className="mt-1 text-lg font-bold text-pink-950/80 font-sans tracking-wide">{selectedItem.priceDisplay}</p>
                      <div className="storybook-divider mt-2 mb-0"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="absolute right-4 top-4 grid size-10 shrink-0 place-items-center rounded-full bg-pink-50 text-brand-accent transition hover:bg-brand-primary hover:text-white z-20 shadow-sm border border-pink-200"
                      aria-label="Close"
                    >
                      <Icon icon="game-icons:rose" className="size-6" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row shrink-0 px-2">
                    <Link
                      to={`/contact?item=${encodeURIComponent(selectedItem.name)}`}
                      className="storybook-btn inline-flex flex-1 items-center justify-center gap-2"
                    >
                      <Icon icon="game-icons:crown" className="size-5 mb-0.5" />
                      Inquire
                    </Link>
                    {selectedItem.reelUrl ? (
                      <a
                        href={selectedItem.reelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-primary/20 bg-white/50 px-4 py-3 text-sm font-bold uppercase tracking-widest text-brand-accent transition hover:border-brand-primary/50 hover:shadow-soft"
                      >
                        <Icon icon="game-icons:play-button" className="size-5 text-brand-primary" />
                        Watch Reel
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-5 shrink-0 md:shrink md:flex md:flex-col md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-2 storybook-scrollbar px-1 pb-2">
                    {/* Descriptions */}
                    <div className="storybook-page">
                      <div className="storybook-page-content">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-950 mb-3 font-sans">
                          <Icon icon="game-icons:flower-twirl" className="size-5 text-brand-primary" />
                          Description
                        </h3>
                        <p className="mb-4 text-sm text-pink-950/80 leading-relaxed font-serif italic text-lg">{selectedItem.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="shrink-0 flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                            <Icon icon="game-icons:ribbon-medal" className="size-3" />
                            {selectedItem.category}
                          </span>
                          {selectedItem.tags.map((tag) => (
                            <span key={tag} className="shrink-0 flex items-center gap-1 rounded-full bg-pink-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-900/70 border border-pink-100">
                              <Icon icon="game-icons:star-swirl" className="size-3 text-pink-300" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sizing & Measurements */}
                    <div className="storybook-page">
                      <Accordion
                        title={<span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-sans"><Icon icon="mdi:ruler" className="size-5 text-brand-primary" /> Sizing & Measurements</span>}
                      >
                        <p className="mb-3 text-sm text-pink-950/70 font-serif italic"><span className="font-bold text-pink-950 not-italic">Available Sizes:</span> {selectedItem.sizes.join(", ") || "N/A"}</p>
                        <div className="space-y-3">
                          {selectedItem.measurements.map((measurement, index) => (
                            <div key={`${measurement.size}-${index}`} className="rounded-lg border border-pink-100 bg-white/50 p-3 shadow-sm">
                              <p className="text-xs font-bold text-brand-accent mb-2 font-sans">Size {measurement.size}</p>
                              <div className="grid grid-cols-2 gap-2 text-[12px] text-pink-950/80 font-serif">
                                {measurement.bust && measurement.bust !== "N/A" && <p>Bust: {measurement.bust}</p>}
                                {measurement.chest && measurement.chest !== "N/A" && <p>Chest: {measurement.chest}</p>}
                                {measurement.waist && measurement.waist !== "N/A" && <p>Waist: {measurement.waist}</p>}
                                {measurement.hips && measurement.hips !== "N/A" && <p>Hips: {measurement.hips}</p>}
                                {measurement.length && measurement.length !== "N/A" && <p>Length: {measurement.length}</p>}
                                {measurement.notes && <p className="col-span-2 mt-1 text-brand-primary italic">Note: {measurement.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    </div>

                    {/* Availability Calendar */}
                    <div className="storybook-page">
                      <Accordion
                        title={<span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-sans"><Icon icon="game-icons:crown" className="size-5 text-brand-primary" /> Availability</span>}
                      >
                        {selectedItem.reservedRanges.length > 0 ? (
                          <ul className="space-y-2 mt-2">
                            {selectedItem.reservedRanges.map((range, index) => (
                              <li key={`${range}-${index}`} className="flex items-center gap-2 rounded-md border border-pink-100 bg-white/50 px-3 py-2 text-xs text-brand-accent font-semibold font-sans shadow-sm">
                                <Icon icon="game-icons:padlock" className="size-4 text-brand-primary" />
                                Reserved: {range}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="flex items-center gap-2 mt-2 text-sm text-emerald-600 font-semibold font-serif italic"><Icon icon="game-icons:sparkles" className="size-5" /> Currently no reserved dates.</p>
                        )}
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {fullscreenImage ? (
          <ImageViewer
            images={selectedItem?.images || [fullscreenImage]}
            initialIndex={activeImage}
            onClose={closeFullscreen}
          />
        ) : null}

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:bg-brand-accent focus:outline-none focus:ring-4 focus:ring-brand-primary/30"
            aria-label="Scroll to top"
          >
            <Icon icon="mdi:chevron-up" className="size-8" />
          </button>
        )}
      </main>
    </PublicLayout>
  );
}
