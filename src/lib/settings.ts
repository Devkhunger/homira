import { cache } from "react";
import { db } from "./db";

// Every editable piece of site-wide content lives here.
// Owners change these from Admin → Settings; defaults are placeholders.
export const DEFAULT_SETTINGS = {
  brandName: "Homira",
  parentCompany: "Balaji Handicrafts",
  tagline: "Elegance that feels like home",
  logoUrl: "",
  colorBrand: "#2a8a7e", // Homira teal (from logo)
  colorAccent: "#c8962e", // warm gold for motifs
  colorSoft: "#4f9e93", // soft teal (announcement bar / footer)
  colorCream: "#f8f5ea", // logo cream background
  whatsapp: "+91 92534 78277",
  phone: "+91 92534 78277",
  email: "homirakhungers@gmail.com",
  hours: "Mon-Sat 10AM - 6PM IST",
  address: "Panipat, Haryana",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  youtube: "",
  pinterest: "",
  storyTitle: "The Beginning",
  storyText:
    "Homira was started in 2025 by Mr. Lalit Kumar and his daughter, Ms. Cheshta Khunger. A father and daughter with a simple dream: to bring warmth, comfort and elegance into every home.\n\nFrom our workshop in Panipat, India's textile city, we make sofa covers, cushion covers, bolster covers, table covers and cushions, crafted with care from quality fabrics in designs that make a house feel like home.\n\nHomira is a brand of Balaji Handicrafts, Panipat.\n\nHomira: elegance that feels like home.",
  storyImage: "",
  story2Title: "Our Craft",
  story2Text:
    "Every Homira piece is made in Panipat, a city known across the world for its home textiles. We choose each fabric carefully, cut and stitch every cover with attention to detail, and check it by hand before it reaches you, so it fits well, lasts long and looks beautiful in your home.",
  story2Image: "",
  freeShippingAbove: "999",
  shippingFee: "79",
  codEnabled: "true",
  codFee: "0",
  deliveryDays: "5",
  expressPincodes: "", // comma separated pincode prefixes for faster delivery, e.g. "110,400"
  expressDays: "2",
  gstin: "",
  metaDescription: "Homira by Balaji Handicrafts, Panipat: sofa covers, cushion covers, bolster covers, table covers and cushions. Elegance that feels like home.",

  // Page content. Simple format: "## Heading" lines become headings, blank lines separate paragraphs.
  pageFaqs: `## Where are Homira products made?
Every product is made by us in Panipat, Haryana, India's textile city, under our parent company Balaji Handicrafts.

## How do I choose the right size?
Each product page lists the exact size. For cushion and bolster covers, pick the size of your cushion insert. For sofa covers, choose by the number of seats.

## How long does delivery take?
Orders are usually delivered within 4-7 working days across India. You can check the expected date on any product page using your pincode.

## Do you offer Cash on Delivery?
Yes, Cash on Delivery is available on most pincodes.

## How do I wash the covers?
Most covers can be gently hand washed or machine washed on a delicate cycle in cold water. Dry in shade. The exact care instructions are on each product page.

## Can I return or exchange a product?
Yes, see our Shipping & Returns page for details.`,
  pageShipping: `## Shipping
We ship across India. Orders are dispatched within 1-2 working days and usually delivered within 4-7 working days. Shipping is free on orders above the free-shipping amount shown at checkout.

## Returns & Exchange
If you are not happy with your purchase, you may request a return or exchange within 7 days of delivery. Products must be unused, unwashed and with original tags.

To request a return, contact us on WhatsApp or email with your order number.

## Refunds
Refunds for prepaid orders are made to the original payment method within 5-7 working days after we receive the product. For Cash on Delivery orders, refunds are made by bank transfer/UPI.`,
  pagePrivacy: `## Information we collect
We collect your name, contact details and delivery address to process your orders. Payments are processed securely by our payment partner; we never store your card details.

## How we use it
Your information is used only to deliver your orders, provide support, and — if you agree — send you updates about new collections.

## Your choices
You can update your account details at any time or ask us to delete your account by contacting us.`,
  pageTerms: `## General
By using this website you agree to these terms. Prices and availability may change without notice.

## Products
As our products are handcrafted, slight variations in colour and size are natural and not defects. Colours may look slightly different on different screens.

## Orders
We reserve the right to cancel any order in case of pricing errors, stock issues or suspected fraud. Any amount paid will be refunded in full.`,
};

export type Settings = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof Settings;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const s: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  }
  return s;
});
