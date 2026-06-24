import { motion } from "framer-motion";
import { type ReactNode, type ElementType } from "react";

// Cache to prevent React from remounting elements when creating dynamic motion components
const motionComponentCache = new Map<ElementType | string, any>();

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType | string;
  [key: string]: any;
};

export function ScrollReveal({ children, delay = 0, className = "", as = "div", ...props }: ScrollRevealProps) {
  if (!motionComponentCache.has(as)) {
    motionComponentCache.set(as, motion(as as any));
  }
  const Component = motionComponentCache.get(as);

  return (
    <Component
      initial={{ opacity: 0, y: 26, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ 
        duration: 0.7, 
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier equivalent
        delay: delay / 1000 // Framer motion uses seconds for delay
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
