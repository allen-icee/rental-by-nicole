import { siteConfig } from "@/config/site";

export function HomePage() {
  return (
    <main className="min-h-screen bg-brand-background px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
        {siteConfig.name}
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold text-brand-accent">
        {siteConfig.tagline}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-pink-950/75">
        Browse dresses, gowns, Filipiniana pieces, boleros, and accessories,
        then send Nicole an inquiry when you find the right look.
      </p>
    </main>
  );
}
