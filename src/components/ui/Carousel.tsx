// src/components/ui/Carousel.tsx
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type CarouselProps = {
  children: ReactNode;
  autoScrollDelay?: number;
};

export function Carousel({ children, autoScrollDelay = 3500 }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
    
    checkScrollState();

    const interval = setInterval(() => {
      if (scrollContainerRef.current && !isHovered.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          
          scrollContainerRef.current.scrollBy({ left: 350, behavior: "smooth" });
        }
      }
    }, autoScrollDelay);

    return () => clearInterval(interval);
  }, [autoScrollDelay]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="group/carousel relative md:-mx-4"
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
      onTouchStart={() => (isHovered.current = true)}
      onTouchEnd={() => (isHovered.current = false)}
    >
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollState}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-4 px-5 md:px-4 hide-scrollbar"
      >
        {children}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 z-10 hidden md:grid size-12 place-items-center rounded-full border border-pink-100 bg-white/90 text-brand-accent shadow-soft opacity-0 transition-all hover:border-brand-primary hover:bg-brand-primary hover:text-white group-hover/carousel:opacity-100 disabled:opacity-0"
          aria-label="Scroll left"
        >
          <Icon icon="mdi:chevron-left" className="text-2xl" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-10 hidden md:grid size-12 place-items-center rounded-full border border-pink-100 bg-white/90 text-brand-accent shadow-soft opacity-0 transition-all hover:border-brand-primary hover:bg-brand-primary hover:text-white group-hover/carousel:opacity-100 disabled:opacity-0"
          aria-label="Scroll right"
        >
          <Icon icon="mdi:chevron-right" className="text-2xl" />
        </button>
      )}
    </div>
  );
}
