// src/components/ui/Accordion.tsx
import { useState } from "react";
import { Icon } from "@iconify/react";

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm border border-pink-50">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between font-bold text-brand-accent outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title}
        <Icon 
          icon="mdi:chevron-down" 
          className={`size-5 text-brand-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div 
        className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-pink-50 pt-4 text-sm leading-relaxed text-pink-950/70">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
