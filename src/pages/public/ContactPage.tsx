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

  useEffect(() => {
    setSelectedItemId(selectedItemFromUrl);
  }, [selectedItemFromUrl]);

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
      title: response.ok ? "Inquiry updated" : "Inquiry needs attention",
      message: response.message
    });

    if (response.ok) {
      event.currentTarget.reset();
      setSelectedItemId("");
    }
  }

  return (
    <PublicLayout>
      <main className="section-shell">
        <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-accent">
              Contact
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-pink-950">
              Send Nicole an inquiry
            </h1>
            <p className="mt-3 leading-7 text-pink-950/70">
              Tell Nicole which item you like, your event date, and your fitting
              preference. Reservations and payment remain manual.
            </p>

            <div className="mt-5 grid gap-3">
              <ContactRow icon="mdi:storefront-outline" label="Business" value={siteConfig.name} />
              <ContactRow icon="mdi:phone-outline" label="Phone" value={siteConfig.phone} />
              <ContactRow icon="mdi:email-outline" label="Email" value={siteConfig.email} />
              <ContactRow icon="mdi:clock-outline" label="Hours" value={siteConfig.businessHours} />
              <ContactRow icon="mdi:map-marker-outline" label="Areas" value={siteConfig.serviceAreas.join(", ")} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={siteConfig.social.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-brand-accent shadow-soft"
              >
                <Icon icon="mdi:facebook" className="size-5" />
                Facebook
              </a>
              <a
                href={siteConfig.social.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-brand-accent shadow-soft"
              >
                <Icon icon="mdi:instagram" className="size-5" />
                Instagram
              </a>
            </div>
          </section>

          <section className="rounded-2xl bg-white/90 p-5 shadow-barbie md:p-6">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-pink-950/70">Name</label>
                <input className="input-field" name="name" required minLength={2} placeholder="Your name" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-pink-950/70">Phone</label>
                  <input className="input-field" name="phone" required minLength={7} placeholder="Phone number" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-pink-950/70">Email optional</label>
                  <input className="input-field" name="email" type="email" placeholder="Email address" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-pink-950/70">Selected Item</label>
                <select
                  className="input-field"
                  value={selectedItemId}
                  onChange={(event) => setSelectedItemId(event.target.value)}
                >
                  <option value="">General inquiry</option>
                  {catalogueItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-pink-950/70">Message</label>
                <textarea
                  className="input-field"
                  name="message"
                  required
                  minLength={10}
                  placeholder="Event date, fitting preference, questions..."
                />
              </div>
              {result ? (
                <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${result.ok ? "bg-brand-secondary text-brand-accent" : "bg-pink-50 text-brand-accent"}`}>
                  {result.message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-brand-accent px-6 py-3 font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </PublicLayout>
  );
}

function ContactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white/90 p-4 shadow-soft">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-secondary text-brand-accent">
        <Icon icon={icon} className="size-6" />
      </span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.18em] text-pink-950/45">{label}</span>
        <span className="mt-1 block font-semibold text-pink-950">{value}</span>
      </span>
    </div>
  );
}


