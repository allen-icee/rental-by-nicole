import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { catalogueItems } from "@/data/site-content";
import { siteConfig } from "@/config/site";
import { useToast } from "@/components/ui/toast-context";
import { submitInquiry } from "@/services/forms.service";

export function ContactPage() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedItemFromUrl = searchParams.get("item") ?? "";
  const [selectedItemId, setSelectedItemId] = useState(selectedItemFromUrl);
  const [result, setResult] = useState<{ message: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  useEffect(() => {
    setSelectedItemId(selectedItemFromUrl);
  }, [selectedItemFromUrl]);

  const selectedItem = catalogueItems.find((i) => i.id === selectedItemId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const response = await submitInquiry({
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      selectedItemId: selectedItemId || undefined
    });

    setLoading(false);
    setResult({ message: response.message, ok: response.ok });
    showToast({
      tone: response.ok ? "success" : "error",
      title: response.ok ? "Inquiry sent successfully" : "Oops! Something went wrong",
      message: response.message
    });

    if (response.ok) {
      event.currentTarget.reset();
      setSelectedItemId("");
    }
  }

  return (
    <PublicLayout>
      <main className="relative min-h-screen pb-24 bg-gradient-to-b from-brand-background via-white to-brand-background/30">
        
        {/* Global Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-[-5%] h-[600px] w-[600px] rounded-full bg-brand-primary/10 blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px]" />
        </div>

        <section className="relative mx-auto max-w-6xl px-5 pt-8 md:pt-16 z-10">
          <div className="grid gap-8 lg:gap-16 lg:grid-cols-[1fr_1.4fr] items-start">
            
            {/* Left Column: Intro, Contact Info & Socials */}
            <div className="flex flex-col gap-8 lg:sticky lg:top-24">
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-3">
                  Personal Consultation
                </p>
                <h1 className="font-display text-4xl font-bold leading-tight text-brand-accent md:text-5xl">
                  Let's find your perfect piece.
                </h1>
                <p className="mt-4 text-base leading-relaxed text-pink-950/70 font-medium">
                  Every reservation is handled personally by Nicole to ensure you feel beautiful on your special day.
                </p>
              </div>

              {/* Consolidated Contact Card */}
              <div className="rounded-[2rem] bg-white/60 backdrop-blur-md p-6 md:p-8 shadow-sm border border-pink-50 transition-all hover:shadow-soft">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <Icon icon="mdi:storefront-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Boutique</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{siteConfig.name}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-pink-50" />
                  <div className="flex gap-4">
                    <Icon icon="mdi:clock-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Hours</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{siteConfig.businessHours}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-pink-50" />
                  <div className="flex gap-4">
                    <Icon icon="mdi:map-marker-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Service Areas</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{siteConfig.serviceAreas.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Social Buttons */}
              <div className="flex gap-4">
                <a
                  href={siteConfig.social.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-white p-4 md:p-5 font-bold shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft border border-[#1877F2]/10"
                >
                  <Icon icon="mdi:facebook" className="size-6 text-[#1877F2] transition-transform group-hover:scale-110" />
                  <span className="text-[#1877F2] text-sm">Facebook</span>
                </a>
                <a
                  href={siteConfig.social.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-white p-4 md:p-5 font-bold shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft border border-[#E1306C]/10"
                >
                  <Icon icon="mdi:instagram" className="size-6 text-[#E1306C] transition-transform group-hover:scale-110" />
                  <span className="bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] bg-clip-text text-transparent text-sm">
                    Instagram
                  </span>
                </a>
              </div>
            </div>

            {/* Right Column: Premium Inquiry Form */}
            <div className="rounded-[2.5rem] bg-white p-6 md:p-10 shadow-barbie border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />
              
              <form className="relative z-10 flex flex-col gap-6 md:gap-7" onSubmit={handleSubmit}>
                
                {/* Custom Modal Item Selector */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">What are you looking for?</label>
                  {selectedItem ? (
                    <div className="group relative flex items-center gap-4 rounded-[1.5rem] border border-brand-primary/20 bg-brand-background/30 p-3 shadow-sm transition-all hover:border-brand-primary/40 hover:shadow-soft pr-4">
                      <img 
                        src={selectedItem.images[0]} 
                        alt={selectedItem.name} 
                        className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover shadow-sm" 
                      />
                      <div className="flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-brand-primary">Selected Piece</p>
                        <p className="font-display text-lg md:text-xl font-bold text-brand-accent mt-0.5 line-clamp-1">{selectedItem.name}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsItemModalOpen(true)} 
                        className="shrink-0 rounded-full bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary shadow-sm transition hover:bg-brand-primary hover:text-white border border-pink-50"
                      >
                        Change
                      </button>
                      <input type="hidden" name="selectedItemId" value={selectedItemId} />
                    </div>
                  ) : (
                    <div>
                      <button 
                        type="button"
                        onClick={() => setIsItemModalOpen(true)}
                        className="group w-full flex items-center justify-between rounded-2xl border-2 border-pink-50 bg-white px-6 py-5 text-sm font-medium text-pink-950/60 shadow-sm transition-all hover:border-brand-primary hover:shadow-soft"
                      >
                        <span>Click to choose a piece...</span>
                        <div className="grid size-8 place-items-center rounded-full bg-brand-background text-brand-primary transition-transform group-hover:scale-110">
                          <Icon icon="mdi:chevron-right" className="text-lg" />
                        </div>
                      </button>
                      <input type="hidden" name="selectedItemId" value="" />
                    </div>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Your Name</label>
                    <input className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" name="name" required minLength={2} placeholder="e.g. Maria Theresa" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Phone Number</label>
                    <input className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" name="phone" required minLength={7} placeholder="0917 123 4567" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Email Address (Optional)</label>
                  <input className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" name="email" type="email" placeholder="maria@example.com" />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Event Details</label>
                  <textarea
                    className="w-full resize-none rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                    name="message"
                    required
                    minLength={10}
                    rows={4}
                    placeholder="Tell us your event date, fitting preference, or any questions you have..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-8 py-5 text-sm font-bold tracking-widest uppercase text-white shadow-barbie transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? "Sending Inquiry..." : "Send Inquiry"}
                  <Icon icon="mdi:sparkles" className="text-lg" />
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Item Selection Modal */}
        {isItemModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-pink-950/60 p-4 backdrop-blur-md transition-opacity" onClick={() => setIsItemModalOpen(false)}>
            <div className="relative flex max-h-[90svh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-brand-background shadow-barbie" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-pink-100 bg-white px-6 md:px-8 py-5">
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-brand-accent">Select a Piece</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mt-1">What would you like to inquire about?</p>
                </div>
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="grid size-10 place-items-center rounded-full bg-pink-50 text-brand-accent transition hover:bg-brand-primary hover:text-white">
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 md:p-8 bg-white/50">
                <button 
                  type="button" 
                  onClick={() => { setSelectedItemId(""); setIsItemModalOpen(false); }}
                  className="group w-full mb-8 rounded-2xl bg-white p-5 text-center shadow-sm border border-pink-100 transition hover:border-brand-primary hover:shadow-soft flex flex-col items-center justify-center"
                >
                  <Icon icon="mdi:message-heart-outline" className="size-8 text-brand-primary mb-2 transition-transform group-hover:scale-110" />
                  <p className="font-bold text-brand-accent">General Inquiry</p>
                  <p className="text-xs text-pink-950/60 mt-1">I haven't picked a specific piece yet, or I have a general question.</p>
                </button>

                <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4 pl-2">From the Catalogue</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                  {catalogueItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSelectedItemId(item.id); setIsItemModalOpen(false); }}
                      className="group text-left bg-white rounded-2xl border border-pink-50 overflow-hidden shadow-sm transition hover:shadow-barbie hover:border-brand-primary/50 flex flex-col"
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-brand-background">
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="font-bold text-sm text-brand-accent line-clamp-2">{item.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-brand-primary mt-2">{item.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        )}

      </main>
    </PublicLayout>
  );
}
