import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  const [products, cats] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  const pages = ["", "/collections/all", "/collections/new-arrivals", "/collections/sale", "/pages/our-story", "/pages/contact", "/pages/faqs"];
  return [
    ...pages.map((p) => ({ url: `${site}${p}` })),
    ...cats.map((c) => ({ url: `${site}/collections/${c.slug}` })),
    ...products.map((p) => ({ url: `${site}/products/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
