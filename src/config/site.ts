// src/config/site.ts
export const siteConfig = {
  name: "Rental by Nicole",
  tagline: "Wear Your Dream Dress",
  contact: {
    primaryPhone: "+63 912 345 6789",
    secondaryPhone: "+63 998 765 4321",
    primaryEmail: "hello@rentalbynicole.example",
    secondaryEmail: "support@rentalbynicole.example"
  },
  businessHours: "Always Open",
  serviceAreas: ["Gerona", "Paniqui", "Tarlac City"],
  social: {
    facebookUrl: "https://www.facebook.com/",
    instagramUrl: "https://www.instagram.com/"
  }
} as const;
