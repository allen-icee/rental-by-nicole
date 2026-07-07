// src/pages/public/ContactPage.tsx
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { siteConfig } from "@/config/site";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast-context";
import { submitInquiry } from "@/services/forms.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useEffect, useState } from "react";
import { getCatalogueData } from "@/services/catalogue.service";
import GradientText from "@/components/ui/GradientText";
import ShinyText from "@/components/ui/ShinyText";
import { FormMultiSelect } from "@/components/ui/forms/FormMultiSelect";

export function ContactPage() {
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const itemParam = searchParams.get("item");

  const secondaryEmail = settings ? settings.secondary_email : siteConfig.contact.secondaryEmail;

  type ContactFormInputs = {
    rentedItems: string[];
    name: string;
    email: string;
    message: string;
  };

  const { register, handleSubmit, reset, control, formState: { isValid, isSubmitting, errors } } = useForm<ContactFormInputs>({
    mode: "onChange",
    defaultValues: {
      rentedItems: itemParam ? [itemParam] : [],
    }
  });

  const [itemOptions, setItemOptions] = useState<{label: string; value: string}[]>([]);

  useEffect(() => {
    getCatalogueData().then(({ items }) => {
      const options = items.map(i => ({ label: i.name, value: i.name }));
      setItemOptions(options);
    });
  }, []);

  async function onSubmit(data: ContactFormInputs) {
    const itemsStr = data.rentedItems.join(", ");
    const finalMessage = itemsStr ? `Interested in renting: ${itemsStr}\n\n${data.message}` : data.message;

    const response = await submitInquiry({
      name: data.name,
      email: data.email,
      message: finalMessage,
      selectedItemId: undefined
    });

    showToast({
      tone: response.ok ? "success" : "error",
      title: response.ok ? "Inquiry sent successfully" : "Oops! Something went wrong",
      message: response.message
    });

    if (response.ok) {
      reset();
    }
  }

  return (
    <PublicLayout>
      <main className="relative min-h-screen pb-24 bg-transparent">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-[-5%] h-[600px] w-[600px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px] animate-pulse" />
        </div>

        <section className="relative mx-auto max-w-6xl px-5 pt-8 md:pt-16 z-10">
          <div className="grid gap-8 lg:gap-16 lg:grid-cols-[1fr_1.4fr] items-start">

            <div className="flex flex-col gap-8 lg:sticky lg:top-24">

              <ScrollReveal>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary mb-3">
                  <ShinyText text="Contact Informations" disabled={false} speed={3} />
                </p>
                <h1 className="font-display text-2xl font-bold leading-tight text-brand-accent md:text-3xl">
                  <GradientText colors={["#d11275", "#ff66b2", "#b091f2", "#d4af37", "#d11275"]} animationSpeed={6}>
                    Don't be shy, send a message.
                  </GradientText>
                </h1>
                <p className="mt-4 text-sm md:text-base leading-relaxed text-pink-950 font-bold">
                  Message us to book a private fitting at our home based location
                </p>
              </ScrollReveal>

              {/* Consolidated Contact Card */}
              <ScrollReveal delay={100} className="glass-panel p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <Icon icon="mdi:email-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Email</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{settings?.email || siteConfig.contact.primaryEmail}</p>
                      {secondaryEmail ? <p className="mt-0.5 text-xs text-pink-950/60">{secondaryEmail}</p> : null}
                    </div>
                  </div>

                  <div className="h-px w-full bg-pink-50" />

                  <div className="flex gap-4">
                    <Icon icon="mdi:clock-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Availability</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{settings?.business_hours || siteConfig.businessHours}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-pink-50" />

                  <div className="flex gap-4">
                    <Icon icon="mdi:map-marker-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Service Areas</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{settings?.service_areas?.join(", ") || siteConfig.serviceAreas.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Premium Social Buttons */}
              <ScrollReveal delay={200} className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] mb-2 text-center">Preferred Methods</p>
                <div className="flex gap-4">
                  {settings?.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] glass-card p-4 md:p-5 font-bold transition-all hover:shadow-crystal"
                    >
                      <Icon icon="mdi:facebook" className="size-6 text-[#1877F2] transition-transform group-hover:scale-110" />
                      <span className="text-[#1877F2] text-sm">Facebook</span>
                    </a>
                  )}
                  {settings?.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] glass-card p-4 md:p-5 font-bold transition-all hover:shadow-crystal"
                    >
                      <Icon icon="mdi:instagram" className="size-6 text-[#E1306C] transition-transform group-hover:scale-110" />
                      <span className="bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] bg-clip-text text-transparent text-sm">
                        Instagram
                      </span>
                    </a>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Premium Inquiry Form */}
            <ScrollReveal delay={300} className="glass-panel p-6 md:p-10 shadow-crystal relative animate-float">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none" />

              <form className="relative z-10 flex flex-col gap-6 md:gap-7" onSubmit={handleSubmit(onSubmit)}>

                {/* Custom Modal Item Selector */}
                <FormMultiSelect
                  name="rentedItems"
                  control={control}
                  label="What are you looking to rent? (Can be multiples)"
                  placeholder="Select items..."
                  options={itemOptions}
                />

                <div className="grid gap-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Your Name</label>
                    <input 
                      id="name"
                      {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('email')?.focus();
                        }
                      }}
                      className={`w-full rounded-2xl border-2 bg-white/40 shadow-inner px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/40 transition-all focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10 ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-white/60 focus:border-brand-primary'}`} 
                      placeholder="e.g. Maria Theresa" 
                    />
                    {errors.name && <p className="mt-2 ml-2 text-xs font-semibold text-red-500">{errors.name.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Email Address</label>
                  <input 
                    id="email"
                    {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email address" } })} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('message')?.focus();
                      }
                    }}
                    className={`w-full rounded-2xl border-2 bg-white/40 shadow-inner px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/40 transition-all focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-white/60 focus:border-brand-primary'}`} 
                    type="email" 
                    placeholder="maria@example.com" 
                  />
                  {errors.email && <p className="mt-2 ml-2 text-xs font-semibold text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Message</label>
                  <textarea
                    id="message"
                    {...register("message", { required: "Message is required", minLength: { value: 10, message: "Message must be at least 10 characters" } })}
                    className={`w-full resize-none rounded-2xl border-2 bg-white/40 shadow-inner px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/40 transition-all focus:bg-white/80 focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10 ${errors.message ? 'border-red-400 focus:border-red-500' : 'border-white/60 focus:border-brand-primary'}`}
                    rows={4}
                    placeholder="Tell us your rental dates, fitting preference, or any questions you have..."
                  />
                  {errors.message && <p className="mt-2 ml-2 text-xs font-semibold text-red-500">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary hover:bg-brand-accent px-8 py-5 text-sm font-bold tracking-widest uppercase text-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"}
                  <div 
                    className="w-6 h-6 bg-white"
                    style={{
                      WebkitMaskImage: 'url(/assets/svg/barbie.svg)',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskImage: 'url(/assets/svg/barbie.svg)',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      maskSize: 'contain'
                    }}
                  />
                </button>
              </form>
            </ScrollReveal>

          </div>
        </section>

      </main>
    </PublicLayout>
  );
}
