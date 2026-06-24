import { useEffect, useRef } from "react";

export function useParallax<T extends HTMLElement>(speed = 0.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const yPos = window.scrollY * speed;
            ref.current.style.transform = `translate3d(0, ${yPos}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return ref;
}
