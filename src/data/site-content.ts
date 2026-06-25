// src/data/site-content.ts
import type { CatalogItem } from "@/features/catalogue/types/catalogue";

export const categories = ["Dress", "Gown", "Filipiniana", "Bolero", "Accessory"];

export const tags = [
  "Graduation",
  "Birthday",
  "Date Night",
  "Photoshoot",
  "Wedding Guest",
  "Pageant"
];

const itemImages = {
  roseGown:
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
  satinDress:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
  filipiniana:
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  bolero:
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80",
  clutch:
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  ivoryGown:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
};

export const catalogueItems: CatalogItem[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Rose Atelier Ball Gown",
    slug: "rose-atelier-ball-gown",
    description:
      "A soft rose formal gown with a structured bodice and graceful skirt for graduations, birthdays, and portraits.",
    category: "Gown",
    tags: ["Graduation", "Photoshoot", "Pageant"],
    status: "published",
    availabilityStatus: "available",
    featured: true,
    isNewArrival: false,
    priceDisplay: "PHP 1,499 / 3 Days",
    reelUrl: "",
    images: [itemImages.roseGown, itemImages.ivoryGown],
    sizes: ["S", "M"],
    measurements: [
      {
        size: "M",
        bust: "85-89 cm",
        waist: "67-70 cm",
        length: "124 cm",
        notes: "Best with 2-3 inch heels"
      }
    ],
    inventoryQuantity: 1,
    reservedRanges: ["June 20 - June 22"]
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Blush Satin Midi Dress",
    slug: "blush-satin-midi-dress",
    description:
      "A polished satin midi dress for dinner dates, wedding guest looks, and intimate celebrations.",
    category: "Dress",
    tags: ["Date Night", "Wedding Guest", "Birthday"],
    status: "published",
    availabilityStatus: "reserved",
    featured: true,
    isNewArrival: false,
    priceDisplay: "PHP 599 / 2 Days",
    reelUrl: "",
    images: [itemImages.satinDress, itemImages.roseGown],
    sizes: ["XS", "S", "M"],
    measurements: [
      {
        size: "S",
        bust: "80-84 cm",
        waist: "62-66 cm",
        length: "104 cm"
      }
    ],
    inventoryQuantity: 1,
    reservedRanges: ["June 10 - June 12", "June 27 - June 29"]
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Modern Filipiniana Sleeve Set",
    slug: "modern-filipiniana-sleeve-set",
    description:
      "A refined Filipiniana-inspired sleeve layer that adds heritage detail to simple gowns and dresses.",
    category: "Filipiniana",
    tags: ["Graduation", "Photoshoot", "Wedding Guest"],
    status: "published",
    availabilityStatus: "available",
    featured: false,
    isNewArrival: false,
    priceDisplay: "Price Upon Inquiry",
    reelUrl: "",
    images: [itemImages.filipiniana, itemImages.bolero],
    sizes: ["One Size"],
    measurements: [
      {
        size: "One Size",
        bust: "Adjustable",
        waist: "Open fit",
        length: "Cropped",
        notes: "Pairs with sleeveless dresses"
      }
    ],
    inventoryQuantity: 2,
    reservedRanges: []
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Pearl Sheer Bolero",
    slug: "pearl-sheer-bolero",
    description:
      "A delicate cover-up for church ceremonies, evening events, and modest styling over formal gowns.",
    category: "Bolero",
    tags: ["Wedding Guest", "Photoshoot"],
    status: "published",
    availabilityStatus: "available",
    featured: false,
    isNewArrival: false,
    priceDisplay: "PHP 299 / 2 Days",
    reelUrl: "",
    images: [itemImages.bolero, itemImages.filipiniana],
    sizes: ["S", "M", "L"],
    measurements: [
      {
        size: "M",
        bust: "Fits 84-92 cm",
        waist: "Open front",
        length: "38 cm"
      }
    ],
    inventoryQuantity: 3,
    reservedRanges: ["July 5 - July 6"]
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Champagne Evening Clutch",
    slug: "champagne-evening-clutch",
    description:
      "A compact champagne clutch for finishing formal looks without buying a one-night accessory.",
    category: "Accessory",
    tags: ["Date Night", "Wedding Guest", "Birthday"],
    status: "published",
    availabilityStatus: "available",
    priceDisplay: "PHP 199 / 2 Days",
    featured: false,
    isNewArrival: false,
    reelUrl: "",
    images: [itemImages.clutch, itemImages.satinDress],
    sizes: ["One Size"],
    measurements: [
      {
        size: "One Size",
        bust: "N/A",
        waist: "N/A",
        length: "20 cm wide"
      }
    ],
    inventoryQuantity: 4,
    reservedRanges: []
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Ivory Garden Gown",
    slug: "ivory-garden-gown",
    description:
      "A romantic ivory gown for prenup shoots, garden birthdays, and soft editorial portraits.",
    category: "Gown",
    tags: ["Photoshoot", "Birthday", "Wedding Guest"],
    status: "published",
    availabilityStatus: "unavailable",
    featured: true,
    isNewArrival: false,
    priceDisplay: "PHP 1,299 / 3 Days",
    reelUrl: "",
    images: [itemImages.ivoryGown, itemImages.roseGown],
    sizes: ["M", "L"],
    measurements: [
      {
        size: "L",
        bust: "90-96 cm",
        waist: "72-78 cm",
        length: "130 cm",
        notes: "Currently in care"
      }
    ],
    inventoryQuantity: 1,
    reservedRanges: ["Unavailable for cleaning"]
  }
];

export const rentalGuideSections = [
  {
    title: "Reservation Process",
    body: "Choose an item, check the visible unavailable dates, then send Nicole an inquiry through the form or social links. Nicole confirms reservations manually."
  },
  {
    title: "Private Fitting",
    body: "Private fitting can be arranged in Gerona, Paniqui, or Tarlac City depending on schedule and item availability."
  },
  {
    title: "Rental Duration",
    body: "Most items are priced for two to three days. Extended use can be discussed before confirmation."
  },
  {
    title: "Payment Information",
    body: "No online payment is collected on the website. Deposit and payment instructions are sent manually after Nicole confirms the request."
  },
  {
    title: "Returns and Care",
    body: "Return items on the agreed date, unwashed and in the same condition. Nicole handles professional care after return."
  },
  {
    title: "Damage Policy",
    body: "Visible stains, missing accessories, or garment damage may require repair or replacement fees after inspection."
  }
];

export const testimonials = [
  {
    name: "Mika Reyes",
    rating: 5,
    comment:
      "The gown looked premium in photos and Nicole helped me pick a size that fit comfortably.",
    date: "June 2026"
  },
  {
    name: "Elaine Santos",
    rating: 5,
    comment:
      "Easy inquiry process and the bolero completed my graduation outfit beautifully.",
    date: "May 2026"
  },
  {
    name: "Alyssa Cruz",
    rating: 4,
    comment:
      "Loved that I could see reserved dates before messaging. The dress was clean and ready on time.",
    date: "April 2026"
  }
];

export const faqs = [
  {
    category: "Reservations",
    question: "Can I book and pay directly on the website?",
    answer:
      "No. The website is for browsing, availability visibility, and inquiries. Nicole confirms reservations and payment manually."
  },
  {
    category: "Fitting",
    question: "Do you allow fitting before renting?",
    answer:
      "Yes, private fitting can be arranged depending on Nicole's schedule and the item's current availability."
  },
  {
    category: "Catalogue",
    question: "Are all filters admin managed?",
    answer:
      "Yes. Categories and tags are designed to come from Supabase so Nicole can add more without code changes."
  },
  {
    category: "Returns",
    question: "What happens if an item is returned late?",
    answer:
      "Late returns may affect the next renter, so Nicole confirms any added fees manually before reservation."
  },
  {
    category: "Media",
    question: "Can I watch an Instagram Reel of an item?",
    answer:
      "Items can store an Instagram Reel URL and open it in a new tab instead of uploading videos to storage."
  }
];
