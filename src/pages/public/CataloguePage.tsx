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

  useEffect(() => {
    if (tagParam) setTag(tagParam);
    if (categoryParam) setCategory(categoryParam);
  }, [tagParam, categoryParam]);

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
        <ScrollReveal as="section" className="section-shell pb-8 relative z-30">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                Catalogue
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-pink-950">
                Browse rental pieces
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
            <div className="relative z-20 rounded-2xl bg-white/90 p-3 shadow-barbie">
              <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <div className="relative">
                  <input
                    className="w-full rounded-full border-2 border-pink-100 bg-white py-3 pl-12 pr-4 text-sm font-medium focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-pink-950/40 text-brand-accent"
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
                  className="flex items-center justify-center rounded-full border-2 border-pink-100 bg-white px-4 py-3 text-brand-accent transition hover:border-brand-primary hover:text-brand-primary hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
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
                <ScrollReveal as="article" key={item.id} delay={index * 50} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-soft border border-pink-50">
                  <button type="button" onClick={() => openItem(item)} className="block w-full text-left transition-transform active:scale-[0.98]">
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-background">
                      <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      <span
                        className={`absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold shadow-sm ${availabilityClasses[item.availabilityStatus]}`}
                      >
                        {item.availabilityStatus}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h2 className="font-display text-sm sm:text-base lg:text-lg font-bold text-brand-accent line-clamp-2 sm:line-clamp-1">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-pink-950/70">{item.priceDisplay}</p>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
              <Icon icon="mdi:magnify-close" className="mx-auto size-10 text-brand-primary" />
              <h2 className="mt-4 font-display text-3xl font-semibold">No matching items</h2>
              <p className="mt-2 text-pink-950/70">Try a different search, category, or tag.</p>
            </div>
          )}

          {visibleItems.length < filteredItems.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                className="rounded-full bg-brand-accent px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-soft transition-transform active:scale-95 hover:shadow-barbie"
              >
                Load More
              </button>
            </div>
          )}
        </section>

        {selectedItem ? (
          <div
            className="fixed inset-0 z-[70] overflow-y-auto bg-pink-950/55 p-4 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
            data-lenis-prevent="true"
          >
            <div
              className="mx-auto my-4 max-w-5xl rounded-2xl bg-brand-background shadow-barbie"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr] md:p-5">
                <div>
                  <div className="relative">
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
                      className="block w-full"
                      aria-label="Open image viewer"
                    >
                      <img
                        src={activeImageUrl}
                        alt={selectedItem.name}
                        className="h-[390px] w-full rounded-2xl object-cover"
                      />
                    </button>
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
                  <div className="mt-3 flex gap-3 overflow-x-auto">
                    {selectedItem.images.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => setActiveImage(index)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? "border-brand-accent" : "border-transparent"}`}
                      >
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col p-4 md:p-6 lg:p-8 md:max-h-[85vh]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block rounded-full px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white ${availabilityClasses[selectedItem.availabilityStatus]}`}>
                        {selectedItem.availabilityStatus}
                      </span>
                      <h2 className="font-display text-3xl font-bold text-brand-accent">
                        {selectedItem.name}
                      </h2>
                      <p className="mt-2 text-xl font-semibold text-pink-950/80">{selectedItem.priceDisplay}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-pink-50 text-brand-accent transition hover:bg-brand-primary hover:text-white"
                      aria-label="Close item details"
                    >
                      <Icon icon="mdi:close" className="size-5" />
                    </button>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row shrink-0">
                    <Link
                      to={`/contact?item=${selectedItem.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-6 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-barbie transition-transform hover:scale-[1.02]"
                    >
                      Reserve
                      <Icon icon="mdi:sparkles" className="size-4" />
                    </Link>
                    {selectedItem.instagramReelUrl ? (
                      <a
                        href={selectedItem.instagramReelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand-primary/20 bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-brand-accent transition hover:border-brand-primary/50 hover:shadow-soft"
                      >
                        <Icon icon="mdi:instagram" className="size-5 text-[#E1306C]" />
                        Watch Reel
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-8 grid gap-4 shrink-0 md:shrink md:flex md:flex-col md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-2 custom-scrollbar">
                    <div className="group rounded-2xl bg-white p-5 shadow-sm border border-pink-50">
                      <div className="flex cursor-pointer items-center justify-between font-bold text-brand-accent outline-none">
                        <span className="flex items-center gap-2 text-sm uppercase tracking-widest"><Icon icon="mdi:ruler" className="size-5 text-brand-primary" /> Sizing & Measurements</span>
                        <Icon icon="mdi:chevron-down" className="size-5 text-brand-primary transition-transform" />
                      </div>
                      <div className="mt-4 border-t border-pink-50 pt-4 text-sm leading-relaxed text-pink-950/70">
                        <p className="mb-2"><span className="font-semibold text-pink-950">Available Sizes:</span> {selectedItem.sizes.join(", ") || "N/A"}</p>
                        {selectedItem.measurements.map((measurement, index) => (
                          <div key={`${measurement.size}-${index}`} className="mt-3 rounded-xl bg-brand-background/50 p-4">
                            <p className="font-bold text-brand-accent mb-2">Size {measurement.size}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <p>Bust: {measurement.bust}</p>
                              <p>Waist: {measurement.waist}</p>
                              <p>Length: {measurement.length}</p>
                              {measurement.notes && <p className="col-span-2 mt-1 text-brand-primary italic">Note: {measurement.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="group rounded-2xl bg-white p-5 shadow-sm border border-pink-50">
                      <div className="flex cursor-pointer items-center justify-between font-bold text-brand-accent outline-none">
                        <span className="flex items-center gap-2 text-sm uppercase tracking-widest"><Icon icon="mdi:calendar-multiselect" className="size-5 text-brand-primary" /> Availability Calendar</span>
                        <Icon icon="mdi:chevron-down" className="size-5 text-brand-primary transition-transform" />
                      </div>
                      <div className="mt-4 border-t border-pink-50 pt-4 text-sm text-pink-950/70">
                        {selectedItem.reservedRanges.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedItem.reservedRanges.map((range, index) => (
                              <li key={`${range}-${index}`} className="flex items-center gap-2 rounded-lg bg-pink-50/50 p-2 text-brand-accent font-medium">
                                <Icon icon="mdi:calendar-remove" className="size-4 text-brand-primary" />
                                Reserved: {range}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="flex items-center gap-2 text-emerald-600 font-medium"><Icon icon="mdi:calendar-check" className="size-5" /> Currently no reserved dates.</p>
                        )}
                      </div>
                    </div>

                    <div className="group rounded-2xl bg-white p-5 shadow-sm border border-pink-50">
                      <div className="flex cursor-pointer items-center justify-between font-bold text-brand-accent outline-none">
                        <span className="flex items-center gap-2 text-sm uppercase tracking-widest"><Icon icon="mdi:information-variant" className="size-5 text-brand-primary" /> Additional Detailss</span>
                        <Icon icon="mdi:chevron-down" className="size-5 text-brand-primary transition-transform" />
                      </div>
                      <div className="mt-4 border-t border-pink-50 pt-4 text-sm leading-relaxed text-pink-950/70">
                        <p className="mb-4">{selectedItem.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                            {selectedItem.category}
                          </span>
                          {selectedItem.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-900/70 border border-pink-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {fullscreenImage ? (
          <ImageViewer imageUrl={fullscreenImage} onClose={closeFullscreen} />
        ) : null}
      </main>
    </PublicLayout>
  );
}
