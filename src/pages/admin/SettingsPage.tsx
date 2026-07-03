// src/pages/admin/SettingsPage.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getSettings, saveSettings } from "@/services/admin.service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/components/ui/toast-context";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormTextarea } from "@/components/ui/forms/FormTextarea";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { FormToggle } from "@/components/ui/forms/FormToggle";

type SettingsFormData = {
  id?: string;
  email: string;
  secondary_email: string;
  facebook_url: string;
  instagram_url: string;
  business_hours: string;
  service_areas: string;
  seo_title: string;
  seo_description: string;
  announcement_text: string;
  announcement_is_active: boolean;
};

export function SettingsPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const { control, handleSubmit, reset, formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful }, register } = useForm<SettingsFormData>({
    mode: "onChange"
  });

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
          email: settings.email || "",
          secondary_email: settings.secondary_email || "",
          facebook_url: settings.facebook_url || "",
          instagram_url: settings.instagram_url || "",
          business_hours: settings.business_hours || "",
          service_areas: settings.service_areas ? settings.service_areas.join(", ") : "",
          seo_title: settings.seo_title || "",
          seo_description: settings.seo_description || "",
          announcement_text: settings.announcement_text || "",
          announcement_is_active: settings.announcement_is_active || false,
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

      <div className="rounded-2xl bg-white p-6 shadow-soft w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <section>
            <h3 className="text-sm font-semibold text-brand-accent mb-3 border-b border-pink-100 pb-2">Homepage Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2 space-y-3">
                <FormToggle
                  name="announcement_is_active"
                  control={control}
                  label="Show Announcement Banner"
                  description="Toggle the banner on the top of the website."
                />
                <FormTextarea
                  name="announcement_text"
                  control={control}
                  label="Announcement Text"
                  maxLength={500}
                  rows={2}
                  placeholder="e.g. Free shipping on all rentals this month!"
                  helperText="Displayed globally on the website."
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-accent mb-3 border-b border-pink-100 pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="email"
                control={control}
                type="email"
                label="Primary Email Address"
                placeholder="hello@rentalbynicole.com"
                helperText="Primary email for customer inquiries."
              />
              <FormInput
                name="secondary_email"
                control={control}
                type="email"
                label="Secondary Email Address"
                placeholder="info@rentalbynicole.com"
                helperText="Alternative email address."
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-accent mb-3 border-b border-pink-100 pb-2">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="instagram_url"
                control={control}
                label="Instagram URL"
                placeholder="https://instagram.com/rentalbynicole"
                helperText="Link to your Instagram profile."
              />
              <FormInput
                name="facebook_url"
                control={control}
                label="Facebook URL"
                placeholder="https://facebook.com/rentalbynicole"
                helperText="Link to your Facebook page."
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-accent mb-3 border-b border-pink-100 pb-2">Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="business_hours"
                control={control}
                label="Business Hours"
                placeholder="Mon-Fri 9am - 5pm"
                helperText="Your operating hours shown on the contact page."
              />
              <FormInput
                name="service_areas"
                control={control}
                label="Service Areas"
                placeholder="Toronto, Mississauga, Markham"
                helperText="Comma separated list of areas you serve."
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-accent mb-3 border-b border-pink-100 pb-2">SEO Metadata</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormInput
                name="seo_title"
                control={control}
                label="SEO Title"
                maxLength={60}
                placeholder="Rental by Nicole | Wear Your Dream Dress"
                helperText="The title shown in search engine results (aim for ~60 chars)."
              />
              <FormTextarea
                name="seo_description"
                control={control}
                label="SEO Description"
                maxLength={160}
                rows={2}
                placeholder="Discover our curated collection of designer dresses..."
                helperText="The description shown in search engine results (aim for ~160 chars)."
              />
            </div>
          </section>

          <div className="pt-4 flex justify-end">
            <FormSubmitButton
              isDirty={isDirty}
              isValid={isValid}
              isSubmitting={isSubmitting}
              isSubmitSuccessful={isSubmitSuccessful}
            />
          </div>
        </form>
      </div>
    </div>
  );
}