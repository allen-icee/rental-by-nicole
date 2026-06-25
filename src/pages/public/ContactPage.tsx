import { useState } from "react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { siteConfig } from "@/config/site";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast-context";
import { submitInquiry } from "@/services/forms.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ContactPage() {
  const { showToast } = useToast();
  const { settings } = useSettings();

  type ContactFormInputs = {
    rentedItems: string;
    name: string;
    phone: string;
    email: string;
    message: string;
  };

  const { register, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm<ContactFormInputs>({
    mode: "onChange"
  });

  async function onSubmit(data: ContactFormInputs) {
    const finalMessage = data.rentedItems ? `Interested in renting: ${data.rentedItems}\n\n${data.message}` : data.message;

    const response = await submitInquiry({
      name: data.name,
      phone: data.phone,
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

              <ScrollReveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-3">
                  Contact Informations
                </p>
                <h1 className="font-display text-2xl font-bold leading-tight text-brand-accent md:text-3xl">
                  Don't be shy, send a message.
                </h1>
                <p className="mt-4 text-base leading-relaxed text-pink-950/70 font-medium">
                  Every inquiry is handled personally.
                </p>
              </ScrollReveal>

              {/* Consolidated Contact Card */}
              <ScrollReveal delay={100} className="rounded-[2rem] bg-white/60 backdrop-blur-md p-6 md:p-8 shadow-sm border border-pink-50 transition-all hover:shadow-soft">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <Icon icon="mdi:email-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Email</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{settings?.email || siteConfig.contact.primaryEmail}</p>
                      <p className="mt-0.5 text-xs text-pink-950/60">{settings?.secondary_email || siteConfig.contact.secondaryEmail}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-pink-50" />
                  <div className="flex gap-4">

                    <Icon icon="mdi:phone-outline" className="size-6 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Phone</p>
                      <p className="mt-1 text-sm font-semibold text-pink-950">{settings?.phone || siteConfig.contact.primaryPhone}</p>
                      <p className="mt-0.5 text-xs text-pink-950/60">{settings?.secondary_phone || siteConfig.contact.secondaryPhone}</p>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1 text-center">Preferred Methods</p>
                <div className="flex gap-4">
                  {settings?.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-br from-white to-[#1877F2]/5 p-4 md:p-5 font-bold shadow-sm transition-all hover:-translate-y-1 hover:shadow-barbie border border-[#1877F2]/20"
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
                      className="group flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-br from-white to-[#E1306C]/5 p-4 md:p-5 font-bold shadow-sm transition-all hover:-translate-y-1 hover:shadow-barbie border border-[#E1306C]/20"
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
            <ScrollReveal delay={300} className="rounded-[2.5rem] bg-white p-6 md:p-10 shadow-barbie border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />

              <form className="relative z-10 flex flex-col gap-6 md:gap-7" onSubmit={handleSubmit(onSubmit)}>

                {/* Custom Modal Item Selector */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">What are you looking to rent? (Can be multiples)</label>
                  <input {...register("rentedItems")} className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" placeholder="e.g. Rose Atelier Ball Gown, Pearl Sheer Bolero" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Your Name</label>
                    <input {...register("name", { required: true, minLength: 2 })} className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" placeholder="e.g. Maria Theresa" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Phone Number (Optional)</label>
                    <input {...register("phone")} className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" placeholder="0916 123 4567" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Email Address</label>
                  <input {...register("email", { required: true })} className="w-full rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10" type="email" placeholder="maria@example.com" />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">Message</label>
                  <textarea
                    {...register("message", { required: true, minLength: 10 })}
                    className="w-full resize-none rounded-2xl border-2 border-pink-50 bg-brand-background/10 px-6 py-4 text-sm font-medium text-pink-950 placeholder-pink-950/30 transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                    rows={4}
                    placeholder="Tell us your rental dates, fitting preference, or any questions you have..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-8 py-5 text-sm font-bold tracking-widest uppercase text-white shadow-barbie transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"}
                  <Icon icon="mdi:sparkles" className="text-lg" />
                </button>
              </form>
            </ScrollReveal>

          </div>
        </section>

      </main>
    </PublicLayout>
  );
}
