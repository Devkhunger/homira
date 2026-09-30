import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { darken, hexToRgbTriplet } from "@/lib/utils";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-serif" });
const sans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: `${s.brandName} | ${s.tagline}`, template: `%s | ${s.brandName}` },
    description: s.metaDescription,
    openGraph: { siteName: s.brandName, type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const vars = `:root{--brand:${hexToRgbTriplet(s.colorBrand, "42 138 126")};--brand-dark:${hexToRgbTriplet(
    darken(s.colorBrand),
    "32 104 95",
  )};--accent:${hexToRgbTriplet(s.colorAccent, "200 150 46")};--soft:${hexToRgbTriplet(
    s.colorSoft,
    "79 158 147",
  )};--cream:${hexToRgbTriplet(s.colorCream, "248 245 234")};}`;

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
