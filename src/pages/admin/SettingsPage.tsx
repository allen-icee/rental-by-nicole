import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getSettings, saveSettings } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/components/ui/toast-context";

type SettingsFormData = {
  id?: string;
  business_name: string;
  tagline: string;
  phone: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  business_hours: string;
  service_areas: string; // We'll convert to/from array
  seo_title: string;
  seo_description: string;
};

export function SettingsPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsFormData>();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const settings = await getSettings();
      if (settings) {
        reset({
          id: settings.id,
          business_name: settings.business_name,
          tagline: settings.tagline || "",
          phone: settings.phone || "",
          email: settings.email || "",
          facebook_url: settings.facebook_url || "",
          instagram_url: settings.instagram_url || "",
          business_hours: settings.business_hours || "",
          service_areas: settings.service_areas.join(", "),
          seo_title: settings.seo_title || "",
          seo_description: settings.seo_description || "",
        });
      }
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to load settings." });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(formData: SettingsFormData) {
    try {
      const payload = {
        ...formData,
        service_areas: formData.service_areas.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await saveSettings(payload);
      showToast({ tone: "success", title: "Success", message: "Settings saved successfully." });
      fetchData();
    } catch (error) {
      console.error(error);
      showToast({ tone: "error", title: "Error", message: "Failed to save settings." });
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Website Settings"
        description="Update global business information, social links, and SEO metadata."
      />

      <div className="rounded-2xl bg-white p-6 shadow-soft max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* General Information */}
          <section>
            <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-pink-100 pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Business Name</label>
                <input
                  {...register("business_name", { required: "Business name is required" })}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
                {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Tagline</label>
                <input
                  {...register("tagline")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section>
            <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-pink-100 pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Phone</label>
                <input
                  {...register("phone")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section>
            <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-pink-100 pb-2">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Instagram URL</label>
                <input
                  type="url"
                  {...register("instagram_url")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Facebook URL</label>
                <input
                  type="url"
                  {...register("facebook_url")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </section>

          {/* Operations */}
          <section>
            <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-pink-100 pb-2">Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Business Hours</label>
                <input
                  {...register("business_hours")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  placeholder="e.g. Mon-Fri 9am - 5pm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">Service Areas (comma separated)</label>
                <input
                  {...register("service_areas")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  placeholder="e.g. Toronto, Mississauga, Markham"
                />
              </div>
            </div>
          </section>

          {/* SEO Metadata */}
          <section>
            <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-pink-100 pb-2">SEO Metadata</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">SEO Title</label>
                <input
                  {...register("seo_title")}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-950 mb-1">SEO Description</label>
                <textarea
                  {...register("seo_description")}
                  rows={3}
                  className="w-full rounded-lg border-pink-200 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
              </div>
            </div>
          </section>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-accent px-8 py-3 font-semibold text-white shadow-soft hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}