// src/components/ui/ScrollReveal.tsx
import { motion } from "framer-motion";
import { type ReactNode, type ElementType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motionComponentCache = new Map<ElementType | string, any>();

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType | string;
  once?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function ScrollReveal({ children, delay = 0, className = "", as = "div", once = false, ...props }: ScrollRevealProps) {
  if (!motionComponentCache.has(as)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    motionComponentCache.set(as, motion(as as any));
  }
  const Component = motionComponentCache.get(as);

  return (
    <Component
      initial={{ opacity: 0, y: 26, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, margin: "-10%" }}
      transition={{ 
        duration: 0.7, 
        ease: [0.4, 0, 0.2, 1], 
        delay: delay / 1000 
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
