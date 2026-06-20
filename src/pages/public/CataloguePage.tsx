import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useToast } from "@/components/ui/toast-context";
import type { CatalogItem } from "@/features/catalogue/types/catalogue";
import { getCatalogueData, type CatalogueData } from "@/services/catalogue.service";

const pageSize = 4;
const minZoom = 1;
const maxZoom = 4;

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
  const [catalogueData, setCatalogueData] = useState<CatalogueData>(initialCatalogueData);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tag, setTag] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenZoom, setFullscreenZoom] = useState(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDistance = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    getCatalogueData().then((data) => {
      if (mounted) {
        setCatalogueData(data);
        setLoading(false);
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
  }, [showToast]);

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

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  const activeImageUrl = selectedItem?.images[activeImage] ?? "";

  function openItem(item: CatalogItem) {
    setSelectedItem(item);
    setActiveImage(0);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setTag("All");
    setPage(1);
    showToast({ tone: "info", title: "Filters reset", message: "Showing all catalogue pieces again." });
  }

  function clampZoom(value: number) {
    return Math.min(maxZoom, Math.max(minZoom, Number(value.toFixed(2))));
  }

  function openFullscreen(imageUrl: string) {
    setFullscreenImage(imageUrl);
    setFullscreenZoom(1);
    pointers.current.clear();
    lastPinchDistance.current = null;
    showToast({ tone: "info", title: "Image viewer", message: "Use the slider, mouse wheel, or pinch gesture to zoom." });
  }

  function closeFullscreen() {
    setFullscreenImage(null);
    setFullscreenZoom(1);
    pointers.current.clear();
    lastPinchDistance.current = null;
  }

  function zoomBy(delta: number) {
    setFullscreenZoom((current) => clampZoom(current + delta));
  }

  function handleFullscreenWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.18 : -0.18;
    zoomBy(delta);
  }

  function getPinchDistance() {
    const points = Array.from(pointers.current.values());

    if (points.length < 2) {
      return null;
    }

    const [first, second] = points;
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    lastPinchDistance.current = getPinchDistance();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }

    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const distance = getPinchDistance();

    if (!distance || !lastPinchDistance.current) {
      lastPinchDistance.current = distance;
      return;
    }

    const change = (distance - lastPinchDistance.current) / 180;
    setFullscreenZoom((current) => clampZoom(current + change));
    lastPinchDistance.current = distance;
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    lastPinchDistance.current = getPinchDistance();
  }

  return (
    <PublicLayout>
      <main>
        <section className="section-shell pb-8">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
                Catalogue
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-pink-950">
                Browse rental pieces
              </h1>
              <p className="mt-3 leading-7 text-pink-950/70">
                Search by occasion, filter by admin-managed categories and
                tags, then open an item to view availability and measurements.
              </p>
              {catalogueData.source === "fallback" && !loading ? (
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-brand-accent shadow-soft">
                  Demo catalogue is showing until the Supabase migration and live
                  catalogue records are added.
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl bg-white/90 p-3 shadow-barbie">
              <div className="grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <input
                  className="input-field"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search dresses, gowns, tags..."
                />
                <select
                  className="input-field"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  {catalogueData.categories.map((itemCategory) => (
                    <option key={itemCategory}>{itemCategory}</option>
                  ))}
                </select>
                <select
                  className="input-field"
                  value={tag}
                  onChange={(event) => {
                    setTag(event.target.value);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  {catalogueData.tags.map((itemTag) => (
                    <option key={itemTag}>{itemTag}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-pink-200 px-5 py-3 font-semibold text-brand-accent"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="mb-5 flex items-center justify-between text-sm text-pink-950/65">
            <span>{loading ? "Loading catalogue..." : `${filteredItems.length} item(s) found`}</span>
            <span>
              Page {page} of {pageCount}
            </span>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-96 animate-pulse rounded-2xl bg-white/90 shadow-barbie" />
              ))}
            </div>
          ) : visibleItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl bg-white/90 shadow-barbie">
                  <button type="button" onClick={() => openItem(item)} className="block w-full text-left">
                    <div className="relative">
                      <img src={item.images[0]} alt={item.name} className="h-64 w-full object-cover" loading="lazy" />
                      <span
                        className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${availabilityClasses[item.availabilityStatus]}`}
                      >
                        {item.availabilityStatus}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent">
                        {item.category}
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-semibold text-pink-950">
                        {item.name}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-pink-950/70">
                        {item.description}
                      </p>
                      <p className="mt-4 font-bold text-brand-accent">{item.priceDisplay}</p>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
              <Icon icon="mdi:magnify-close" className="mx-auto size-10 text-brand-primary" />
              <h2 className="mt-4 font-display text-3xl font-semibold">No matching items</h2>
              <p className="mt-2 text-pink-950/70">Try a different search, category, or tag.</p>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-full border border-pink-200 px-5 py-3 font-semibold text-brand-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="rounded-full bg-brand-accent px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>

        {selectedItem ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-pink-950/55 p-4 backdrop-blur-sm">
            <div className="mx-auto my-4 max-w-5xl rounded-2xl bg-brand-background shadow-barbie">
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr] md:p-5">
                <div>
                  <div className="relative">
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
                        key={image}
                        onClick={() => setActiveImage(index)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? "border-brand-accent" : "border-transparent"}`}
                      >
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 md:p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-accent">
                        {selectedItem.category}
                      </p>
                      <h2 className="mt-2 font-display text-3xl font-semibold text-pink-950">
                        {selectedItem.name}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand-accent shadow-soft"
                      aria-label="Close item details"
                    >
                      <Icon icon="mdi:close" className="size-5" />
                    </button>
                  </div>

                  <p className="mt-3 leading-7 text-pink-950/70">{selectedItem.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedItem.tags.map((itemTag) => (
                      <span key={itemTag} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-accent">
                        {itemTag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Info label="Availability" value={selectedItem.availabilityStatus} />
                    <Info label="Price" value={selectedItem.priceDisplay} />
                    <Info label="Sizes" value={selectedItem.sizes.join(", ") || "N/A"} />
                    <Info label="Inventory" value={`${selectedItem.inventoryQuantity} item(s)`} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-soft">
                    <p className="font-semibold text-brand-accent">Measurements</p>
                    {selectedItem.measurements.map((measurement) => (
                      <div key={measurement.size} className="mt-3 text-sm leading-6 text-pink-950/75">
                        <p className="font-semibold text-pink-950">Size {measurement.size}</p>
                        <p>Bust: {measurement.bust}</p>
                        <p>Waist: {measurement.waist}</p>
                        <p>Length: {measurement.length}</p>
                        {measurement.notes ? <p>Notes: {measurement.notes}</p> : null}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-soft">
                    <p className="font-semibold text-brand-accent">Unavailable Dates</p>
                    {selectedItem.reservedRanges.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-pink-950/75">
                        {selectedItem.reservedRanges.map((range) => (
                          <li key={range} className="flex items-center gap-2">
                            <Icon icon="mdi:calendar-alert" className="size-5 text-brand-primary" />
                            {range}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-pink-950/70">No reserved dates listed.</p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/contact?item=${selectedItem.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-accent px-5 py-3 font-semibold text-white"
                    >
                      Inquire About This Item
                    </Link>
                    {selectedItem.instagramReelUrl ? (
                      <a
                        href={selectedItem.instagramReelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-accent px-5 py-3 font-semibold text-brand-accent"
                      >
                        <Icon icon="mdi:instagram" className="size-5" />
                        Watch Reel
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {fullscreenImage ? (
          <div className="fixed inset-0 z-[60] bg-pink-950/92 p-3">
            <div className="absolute right-4 top-4 z-20 flex gap-2">
              <button
                type="button"
                onClick={() => zoomBy(-0.25)}
                className="grid size-10 place-items-center rounded-full bg-white text-brand-accent shadow-barbie"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <Icon icon="mdi:magnify-minus-outline" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFullscreenZoom(1);
                  showToast({ tone: "info", title: "Zoom reset" });
                }}
                className="grid size-10 place-items-center rounded-full bg-white text-brand-accent shadow-barbie"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <Icon icon="mdi:image-filter-center-focus" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(0.25)}
                className="grid size-10 place-items-center rounded-full bg-white text-brand-accent shadow-barbie"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <Icon icon="mdi:magnify-plus-outline" className="size-5" />
              </button>
              <button
                type="button"
                onClick={closeFullscreen}
                className="grid size-10 place-items-center rounded-full bg-white text-brand-accent shadow-barbie"
                aria-label="Close image viewer"
                title="Close image viewer"
              >
                <Icon icon="mdi:fullscreen-exit" className="size-5" />
              </button>
            </div>

            <div
              className="h-full overflow-auto rounded-2xl bg-black/10 p-12"
              onWheel={handleFullscreenWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
            >
              <div className="flex min-h-full min-w-full items-center justify-center">
                <img
                  src={fullscreenImage}
                  alt="Fullscreen catalogue item"
                  className="rounded-2xl object-contain shadow-barbie transition-[width] duration-100"
                  draggable={false}
                  onDoubleClick={() => setFullscreenZoom((current) => (current === 1 ? 2.25 : 1))}
                  style={{ width: `${Math.round(78 * fullscreenZoom)}vw`, maxWidth: "none" }}
                />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 z-20 flex w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-full bg-white/95 px-4 py-3 shadow-barbie backdrop-blur">
              <Icon icon="mdi:magnify-minus-outline" className="size-5 shrink-0 text-brand-accent" />
              <input
                className="barbie-slider w-full"
                type="range"
                min={minZoom}
                max={maxZoom}
                step="0.05"
                value={fullscreenZoom}
                onChange={(event) => setFullscreenZoom(Number(event.target.value))}
                aria-label="Image zoom"
              />
              <Icon icon="mdi:magnify-plus-outline" className="size-5 shrink-0 text-brand-accent" />
            </div>
          </div>
        ) : null}
      </main>
    </PublicLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/90 p-3 shadow-barbie">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-950/45">{label}</p>
      <p className="mt-1 font-semibold capitalize text-pink-950">{value}</p>
    </div>
  );
}


