import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

type DiamondMirrorCardProps = {
  collection: string;
};

export function DiamondMirrorCard({ collection }: DiamondMirrorCardProps) {
  return (
    <Link 
      to={`/catalogue?tag=${encodeURIComponent(collection)}`}
      className="group relative flex flex-col items-center w-full max-w-[220px] mx-auto transition-transform duration-500 hover:-translate-y-4 hover:scale-105"
    >
      <div className="relative w-full aspect-[1/1.6] flex flex-col items-center">
        
        {/* Main Mirror SVG */}
        <svg viewBox="0 0 200 320" className="w-full h-full drop-shadow-2xl z-10 overflow-visible">
          <defs>
            {/* The golden gradients */}
            <linearGradient id="gold-frame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bf953f" />
              <stop offset="25%" stopColor="#fcf6ba" />
              <stop offset="50%" stopColor="#b38728" />
              <stop offset="75%" stopColor="#fbf5b7" />
              <stop offset="100%" stopColor="#aa771c" />
            </linearGradient>

            {/* The glassy mirror effect */}
            <linearGradient id="mirror-glass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="40%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* 3D Bevel Filter for the Gold */}
            <filter id="3d-bevel" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feOffset dx="1" dy="2" result="offsetBlur" />
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".8" specularExponent="20" lightingColor="#ffffff" result="specOut">
                <fePointLight x="-50" y="-50" z="200" />
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            </filter>
            
            {/* Clip path for the mirror glare */}
            <clipPath id="heart-clip">
              <path d="M 100 180 C 100 180 20 120 20 60 A 40 40 0 0 1 100 60 A 40 40 0 0 1 180 60 C 180 120 100 180 100 180 Z" />
            </clipPath>
          </defs>

          {/* Handle Base Swirls */}
          <path d="M 80 300 C 60 300 60 280 80 280 C 100 280 120 300 100 310 C 80 320 60 300 80 300 Z" fill="url(#gold-frame)" filter="url(#3d-bevel)" />
          <path d="M 120 300 C 140 300 140 280 120 280 C 100 280 80 300 100 310 C 120 320 140 300 120 300 Z" fill="url(#gold-frame)" filter="url(#3d-bevel)" />

          {/* Handle Body */}
          <path d="M 85 170 L 80 290 Q 100 300 120 290 L 115 170 Z" fill="url(#gold-frame)" filter="url(#3d-bevel)" />
          
          {/* Handle Vines Wrapping */}
          <path d="M 85 190 Q 110 210 82 230 T 80 270" fill="none" stroke="#b38728" strokeWidth="4" filter="url(#3d-bevel)" />
          <path d="M 115 200 Q 90 220 118 240 T 120 280" fill="none" stroke="#b38728" strokeWidth="4" filter="url(#3d-bevel)" />

          {/* Mirror Glass (Heart) */}
          <path 
            d="M 100 180 C 100 180 20 120 20 60 A 40 40 0 0 1 100 60 A 40 40 0 0 1 180 60 C 180 120 100 180 100 180 Z" 
            fill="url(#mirror-glass)" 
          />

          {/* Glass Glare */}
          <path 
            d="M 20 60 L 120 180 L 140 180 L 40 60 Z" 
            fill="#ffffff" 
            opacity="0.3" 
            clipPath="url(#heart-clip)" 
          />

          {/* Thick Golden Heart Frame */}
          <path 
            d="M 100 180 C 100 180 20 120 20 60 A 40 40 0 0 1 100 60 A 40 40 0 0 1 180 60 C 180 120 100 180 100 180 Z" 
            fill="none" 
            stroke="url(#gold-frame)" 
            strokeWidth="18" 
            strokeLinejoin="round"
            filter="url(#3d-bevel)"
          />
          
          {/* Sculpted vines on the frame */}
          <path d="M 20 80 Q 10 50 40 30 Q 70 10 100 35" fill="none" stroke="url(#gold-frame)" strokeWidth="6" filter="url(#3d-bevel)" />
          <path d="M 180 80 Q 190 50 160 30 Q 130 10 100 35" fill="none" stroke="url(#gold-frame)" strokeWidth="6" filter="url(#3d-bevel)" />
          <path d="M 30 130 Q 60 160 100 180" fill="none" stroke="url(#gold-frame)" strokeWidth="6" filter="url(#3d-bevel)" />
          <path d="M 170 130 Q 140 160 100 180" fill="none" stroke="url(#gold-frame)" strokeWidth="6" filter="url(#3d-bevel)" />
        </svg>

        {/* Text HTML Content Layered over the Mirror Glass */}
        <div className="absolute top-0 left-0 w-full h-[62.5%] flex flex-col items-center justify-center z-20 pointer-events-none px-4 md:px-6 text-center">
          <span className="font-display text-xl md:text-2xl font-bold text-pink-900 drop-shadow-sm mt-2 md:mt-4">
            {collection}
          </span>
          <span className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-brand-accent flex items-center gap-1 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            Explore <Icon icon="mdi:arrow-right" className="size-3" />
          </span>
        </div>

        {/* Decorative Roses HTML Layer (Fully Responsive) */}
        <img src="/assets/svg/red-rose.svg" alt="Rose" className="absolute top-[3%] -left-[5%] w-[30%] z-30 drop-shadow-lg -rotate-12 transform group-hover:scale-110 transition-transform duration-500" />
        <img src="/assets/svg/violet-rose.svg" alt="Violet Rose" className="absolute top-[1%] -right-[2%] w-[25%] z-30 drop-shadow-lg rotate-12 transform group-hover:scale-110 transition-transform duration-500" />
        <img src="/assets/svg/red-rose.svg" alt="Rose" className="absolute top-[42%] left-[15%] w-[22%] z-30 drop-shadow-lg rotate-[30deg] transform group-hover:scale-110 transition-transform duration-500" />
        
      </div>
    </Link>
  );
}
