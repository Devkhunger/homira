import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
} satisfies Prisma.ProductInclude;

export type CardProduct = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export const SORTS = {
  featured: { label: "Featured", orderBy: [{ featured: "desc" }, { createdAt: "desc" }] },
  newest: { label: "Newest", orderBy: [{ createdAt: "desc" }] },
  "price-asc": { label: "Price: Low to High", orderBy: [{ price: "asc" }] },
  "price-desc": { label: "Price: High to Low", orderBy: [{ price: "desc" }] },
  bestselling: { label: "Best Selling", orderBy: [{ soldCount: "desc" }] },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput[] }>;

export type SortKey = keyof typeof SORTS;

export const SPECIAL_COLLECTIONS: Record<string, { name: string; description: string }> = {
  all: { name: "All Products", description: "Every handwoven piece in our collection." },
  "new-arrivals": { name: "New Arrivals", description: "Fresh off the loom." },
  sale: { name: "Sale", description: "Handloom treasures at special prices." },
  bestsellers: { name: "Bestsellers", description: "Our customers' favourites." },
};

export type Filters = {
  minPrice?: number;
  maxPrice?: number;
  fabric?: string[];
  color?: string[];
  inStock?: boolean;
};

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(",") : []).filter(Boolean);
  const num = (v: string | string[] | undefined) => {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    fabric: arr(sp.fabric),
    color: arr(sp.color),
    inStock: sp.stock === "1",
  };
}

export async function getCollectionWhere(slug: string): Promise<{
  where: Prisma.ProductWhereInput;
  meta: { name: string; description: string | null; bannerImage: string | null; bannerTitle: string | null; bannerSubtitle: string | null; bannerColor: string | null } | null;
}> {
  const base: Prisma.ProductWhereInput = { isActive: true };
  if (SPECIAL_COLLECTIONS[slug]) {
    const m = SPECIAL_COLLECTIONS[slug];
    const where: Prisma.ProductWhereInput =
      slug === "new-arrivals"
        ? { ...base, OR: [{ badge: "New Arrival" }, { createdAt: { gte: new Date(Date.now() - 30 * 864e5) } }] }
        : slug === "bestsellers"
          ? { ...base, OR: [{ badge: "Bestseller" }, { soldCount: { gt: 0 } }] }
          : base;
    return { where, meta: { name: m.name, description: m.description, bannerImage: null, bannerTitle: null, bannerSubtitle: null, bannerColor: null } };
  }
  const cat = await db.category.findUnique({ where: { slug }, include: { children: { select: { id: true } } } });
  if (!cat) return { where: base, meta: null };
  return {
    where: { ...base, categoryId: { in: [cat.id, ...cat.children.map((c) => c.id)] } },
    meta: cat,
  };
}

export function applyFilters(where: Prisma.ProductWhereInput, f: Filters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [where];
  if (f.minPrice) and.push({ price: { gte: f.minPrice } });
  if (f.maxPrice) and.push({ price: { lte: f.maxPrice } });
  if (f.fabric?.length) and.push({ fabric: { in: f.fabric } });
  if (f.color?.length) and.push({ OR: f.color.map((c) => ({ colors: { contains: c } })) });
  if (f.inStock) and.push({ stock: { gt: 0 } });
  return { AND: and };
}

/** Sale = products where MRP is higher than price. Prisma can't compare two columns, so filter in JS. */
export async function findProducts(where: Prisma.ProductWhereInput, sort: SortKey, saleOnly: boolean) {
  const products = await db.product.findMany({ where, orderBy: SORTS[sort].orderBy, include: cardInclude, take: 500 });
  return saleOnly ? products.filter((p) => p.mrp > p.price) : products;
}

export async function getFacetOptions(where: Prisma.ProductWhereInput) {
  const rows = await db.product.findMany({ where, select: { fabric: true, colors: true, price: true } });
  const fabrics = new Set<string>();
  const colors = new Set<string>();
  let max = 0;
  for (const r of rows) {
    if (r.fabric) fabrics.add(r.fabric);
    r.colors.split(",").map((c) => c.trim()).filter(Boolean).forEach((c) => colors.add(c));
    max = Math.max(max, r.price);
  }
  return { fabrics: [...fabrics].sort(), colors: [...colors].sort(), maxPrice: max };
}
