import React from 'react';
import { Icon } from "@iconify/react";

export function PrincessPlaqueCard({ children, className = "", delay = "0s", variant = "pink" }: { children: React.ReactNode, className?: string, delay?: string, variant?: "pink" | "light" }) {
  const isLight = variant === "light";
  
  const bgClass = isLight 
    ? "bg-[#FFF0F5] shadow-[0_15px_35px_rgba(200,160,210,0.3)] hover:shadow-[0_20px_40px_rgba(200,160,210,0.5)]" 
    : "bg-gradient-to-b from-[#ffb6c1] via-[#ff69b4] to-[#ff1493] shadow-[0_15px_35px_rgba(238,187,77,0.3)] hover:shadow-[0_20px_40px_rgba(238,187,77,0.5)]";

  return (
    <div 
      className={`group relative w-full rounded-[2.5rem] border-[4px] border-[#eebb4d] p-8 transition-all duration-500 hover:-translate-y-2 overflow-visible flex-1 flex flex-col animate-float ${bgClass} ${className}`}
      style={{ animationDelay: delay }}
    >
      
      {/* Outer shadow/glow for 3D effect */}
      <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] pointer-events-none" />
      
      {/* Inner gold lines */}
      <div className={`absolute inset-[6px] border ${isLight ? 'border-[#eebb4d]/40' : 'border-[#f3e5ab] mix-blend-overlay'} rounded-[2.2rem] pointer-events-none`} />
      <div className={`absolute inset-[10px] border ${isLight ? 'border-[#eebb4d]/20' : 'border-[#f3e5ab]/50'} rounded-[1.9rem] pointer-events-none`} />
      
      {/* Corner Ornaments */}
      <div className="absolute top-2 left-2 size-6 border-t-2 border-l-2 border-[#eebb4d] rounded-tl-[1.2rem] pointer-events-none" />
      <div className="absolute top-2 right-2 size-6 border-t-2 border-r-2 border-[#eebb4d] rounded-tr-[1.2rem] pointer-events-none" />
      <div className="absolute bottom-2 left-2 size-6 border-b-2 border-l-2 border-[#eebb4d] rounded-bl-[1.2rem] pointer-events-none" />
      <div className="absolute bottom-2 right-2 size-6 border-b-2 border-r-2 border-[#eebb4d] rounded-br-[1.2rem] pointer-events-none" />

      {/* Top Center Double Heart Crest */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)] z-20">
        <div className="relative flex items-center">
          {/* Left Heart */}
          <div className="relative transform -rotate-[15deg] translate-x-2">
            <Icon icon="mdi:heart" className="text-[#eebb4d] text-[3rem]" />
            <Icon icon="mdi:heart" className={`absolute top-[5px] left-[5px] text-[2.2rem] ${isLight ? 'text-[#ff69b4]' : 'text-[#ffb6c1]'}`} />
          </div>
          {/* Right Heart */}
          <div className="relative transform rotate-[15deg] -translate-x-2 z-10">
            <Icon icon="mdi:heart" className="text-[#eebb4d] text-[3rem]" />
            <Icon icon="mdi:heart" className={`absolute top-[5px] left-[5px] text-[2.2rem] ${isLight ? 'text-[#ff69b4]' : 'text-[#ffb6c1]'}`} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center flex-1 w-full text-center h-full">
        {children}
      </div>
    </div>
  );
}
