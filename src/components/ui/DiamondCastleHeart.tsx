import React from 'react';
import { Icon } from "@iconify/react";

type DiamondCastleHeartProps = {
  children: React.ReactNode;
  className?: string;
  sparkles?: boolean;
  rating?: number;
  style?: React.CSSProperties;
};

export function DiamondCastleHeart({ children, className = "", sparkles = true, rating, style }: DiamondCastleHeartProps) {
  return (
    <div className={`relative block w-full aspect-[1/0.85] ${className}`} style={style}>
      {/* viewBox expanded slightly to prevent stroke clipping */}
      <svg viewBox="-5 -5 110 95" className="absolute inset-0 w-full h-full drop-shadow-[0_12px_20px_rgba(155,14,86,0.6)] pointer-events-none z-0">
        <defs>
          <linearGradient id="diamond-heart" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e81e8c" />
            <stop offset="60%" stopColor="#d11275" />
            <stop offset="100%" stopColor="#8a0c4d" />
          </linearGradient>
          <linearGradient id="silver-frame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <path
          d="M 50 80 C 50 80 0 45 0 25 A 25 25 0 0 1 50 25 A 25 25 0 0 1 100 25 C 100 45 50 80 50 80 Z"
          fill="url(#diamond-heart)"
          stroke="url(#silver-frame)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner subtle glow ring */}
        <path
          d="M 50 78 C 50 78 2 44 2 25 A 23 23 0 0 1 50 25 A 23 23 0 0 1 98 25 C 98 44 50 78 50 78 Z"
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          opacity="0.5"
        />
      </svg>

      {sparkles && (
        <>
          <Icon icon="mdi:star-four-points" className="absolute top-[25%] right-[12%] text-white/90 text-2xl animate-pulse pointer-events-none z-10 drop-shadow-sm" />
          <Icon icon="mdi:star-four-points-outline" className="absolute bottom-[25%] right-[15%] text-white/80 text-xl animate-pulse pointer-events-none z-10 drop-shadow-sm" style={{ animationDelay: '1s' }} />
          <Icon icon="mdi:sparkles" className="absolute top-[18%] right-[22%] text-white/70 text-lg animate-pulse pointer-events-none z-10 drop-shadow-sm" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      {/* Tilted Rating Stars hugging the left curve */}
      {rating !== undefined && (
        <div className="absolute top-[16%] left-[6%] -rotate-[40deg] flex gap-0.5 text-[#fcf6ba] drop-shadow-md z-20 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              icon={i < rating ? "mdi:star" : "mdi:star-outline"}
              className="text-[10px] md:text-[12px]"
            />
          ))}
        </div>
      )}

      {/* Changed to absolute positioning, justify-start, and anchored slightly lower (top-[28%]). */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 z-10 w-[64%] h-[52%] flex flex-col items-center justify-start text-white text-center pt-2">
        {children}
      </div>
    </div>
  );
}