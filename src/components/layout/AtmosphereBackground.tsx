import { memo, useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import { useLocation } from "react-router-dom";

export const AtmosphereBackground = memo(() => {
  const location = useLocation();

  // Initialize engine for tsParticles v4
  const init = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const particlesOptions = useMemo(() => ({
    background: {
      color: { value: "transparent" }
    },
    fpsLimit: 60,
    interactivity: {
      detectsOn: "window" as const,
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { 
          enable: true, 
          mode: "parallax", // Parallax makes stars follow the mouse!
          parallax: { enable: true, force: 60, smooth: 10 }
        }, 
        resize: { enable: true },
      },
      modes: {
        bubble: { distance: 150, size: 6, duration: 1, opacity: 1, color: "#ffffff" },
        push: { quantity: 3 },
        parallax: { force: 60, smooth: 10 }
      },
    },
    particles: {
      color: { value: ["#ffffff", "#ffb6e4", "#d4e8ff"] },
      links: { enable: false },
      move: {
        direction: "none" as const, // Scatters in random directions
        enable: true,
        outModes: { default: "out" as const },
        random: true,
        speed: { min: 0.1, max: 0.6 }, // Slow ethereal drift
        straight: false,
      },
      number: {
        density: { enable: true, width: 800 },
        value: 120, // Dense enough for magic
      },
      opacity: {
        value: { min: 0.1, max: 0.8 },
        animation: { enable: true, speed: 0.8, sync: false }, // Twinkling/Glowing effect
      },
      shadow: {
        blur: 10,
        color: { value: "#ffffff" },
        enable: true,
      },
      shape: { 
        type: ["circle", "star"], // Mix of classic orbs and stars
        options: {
          star: {
            sides: 4,
            inset: 2.5
          }
        }
      },
      size: {
        value: { min: 1, max: 3 },
        animation: { enable: true, speed: 1.5, sync: false }, // Shining/pulsing
      },
    },
    detectRetina: true,
  }), []);

  // Strict exclusion: Do not render on admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <ParticlesProvider init={init}>
      <div className="fixed inset-0 -z-50 overflow-hidden bg-transparent pointer-events-none">
        {/* Soft Ethereal Mesh Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#b091f2]/20 via-[#ffb6e4]/20 to-[#d4e8ff]/30 pointer-events-none" />

        {/* Floating Light Orbs for Magic Vibe */}
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#b091f2]/30 blur-[120px] mix-blend-multiply animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] rounded-full bg-[#ffb6e4]/30 blur-[140px] mix-blend-multiply animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#d4e8ff]/40 blur-[130px] mix-blend-multiply animate-float-slow pointer-events-none" style={{ animationDelay: '4s' }} />

        {/* The Dynamic, Interactive Particles */}
        <div className="pointer-events-auto">
          <Particles id="tsparticles-global" options={particlesOptions} className="absolute inset-0" />
        </div>
      </div>
    </ParticlesProvider>
  );
});

AtmosphereBackground.displayName = "AtmosphereBackground";