import "server-only";
import { db } from "./db";
import { getSettings } from "./settings";

export type CartInput = { productId: string; quantity: number; size?: string | null; color?: string | null };

export type QuoteLine = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  mrp: number;
  quantity: number;
  size: string | null;
  color: string | null;
  stock: number;
  lineTotal: number;
  problem?: string;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  mrpTotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: { code: string; description: string } | null;
  couponError?: string;
  freeShippingAbove: number;
  hasProblems: boolean;
};

export function computeCouponDiscount(
  c: { type: string; value: number; minOrder: number; maxDiscount: number | null },
  subtotal: number,
) {
  if (subtotal < c.minOrder) return 0;
  let d = c.type === "PERCENT" ? Math.floor((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
  return Math.min(d, subtotal);
}

/** Prices are ALWAYS recalculated on the server from the database — never trusted from the browser. */
export async function buildQuote(items: CartInput[], couponCode?: string | null): Promise<Quote> {
  const settings = await getSettings();
  const clean = items
    .filter((i) => i && typeof i.productId === "string")
    .map((i) => ({ ...i, quantity: Math.max(1, Math.min(20, Math.floor(Number(i.quantity) || 1))) }))
    .slice(0, 50);

  const products = await db.product.findMany({
    where: { id: { in: clean.map((i) => i.productId) } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: QuoteLine[] = [];
  for (const i of clean) {
    const p = byId.get(i.productId);
    if (!p) continue;
    let problem: string | undefined;
    if (!p.isActive) problem = "This product is no longer available";
    else if (p.stock <= 0) problem = "Out of stock";
    else if (i.quantity > p.stock) problem = `Only ${p.stock} left in stock`;
    lines.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0]?.url ?? null,
      price: p.price,
      mrp: p.mrp,
      quantity: i.quantity,
      size: i.size || null,
      color: i.color || null,
      stock: p.stock,
      lineTotal: p.price * i.quantity,
      problem,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const mrpTotal = lines.reduce((s, l) => s + Math.max(l.mrp, l.price) * l.quantity, 0);

  let discount = 0;
  let coupon: Quote["coupon"] = null;
  let couponError: string | undefined;
  if (couponCode) {
    const c = await db.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    if (!c || !c.active) couponError = "Invalid coupon code";
    else if (subtotal < c.minOrder) couponError = `Add items worth ₹${c.minOrder - subtotal} more to use ${c.code}`;
    else {
      discount = computeCouponDiscount(c, subtotal);
      coupon = { code: c.code, description: c.description };
    }
  }

  const freeAbove = Number(settings.freeShippingAbove) || 0;
  const fee = Number(settings.shippingFee) || 0;
  const shipping = lines.length === 0 || subtotal - discount >= freeAbove ? 0 : fee;

  return {
    lines,
    subtotal,
    mrpTotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    coupon,
    couponError,
    freeShippingAbove: freeAbove,
    hasProblems: lines.some((l) => l.problem),
  };
}
