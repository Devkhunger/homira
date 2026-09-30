/* Sample data so the store looks complete on day one.
 * Everything here can be edited or deleted from the Owner Dashboard. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const img = (n: number) => `/placeholders/fabric-${((n - 1) % 12) + 1}.svg`;

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "owner@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
  if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || password.length < 8)) {
    console.warn("⚠ ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) must be set to create the owner account. Skipping.");
    return;
  }
  const name = process.env.ADMIN_NAME || "Store Owner";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    console.log(`✓ Owner account exists: ${email}`);
    return;
  }
  await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  const shown = process.env.NODE_ENV === "production" ? "(password from ADMIN_PASSWORD)" : `/ ${password}`;
  console.log(`✓ Owner account created: ${email} ${shown}  (change this password after first login!)`);
}

const CATALOG_VERSION = "2";
const OLD_CATEGORY_SLUGS = ["sarees", "cotton-sarees", "silk-sarees", "dupattas-stoles", "fabrics", "home-decor", "bedsheets-throws"];
const OLD_BANNER_TITLES = ["Woven by hand, worn with pride", "Cushion Goals", "Festive Edit"];

const CATEGORIES = [
  { slug: "sofa-covers", name: "Sofa Covers", bannerTitle: "Sofa Makeover", bannerSubtitle: "Sofa covers", bannerColor: "#4f9e93", image: img(3) },
  { slug: "cushion-covers", name: "Cushion Covers", bannerTitle: "Cushion Goals", bannerSubtitle: "Cushion cover sets", bannerColor: "#c9a26b", image: img(9) },
  { slug: "bolster-covers", name: "Bolster Covers", bannerTitle: "Bolster Love", bannerSubtitle: "Bolster cover pairs", bannerColor: "#2a8a7e", image: img(8) },
  { slug: "table-covers", name: "Table Covers", bannerTitle: "Dress Your Table", bannerSubtitle: "Table covers", bannerColor: "#9c6b30", image: img(2) },
  { slug: "cushions", name: "Cushions", bannerTitle: "Sink In", bannerSubtitle: "Filled cushions", bannerColor: "#4f9e93", image: img(10) },
];

type Sample = { name: string; cat: string; price: number; mrp: number; stock: number; fabric: string; weave: string; colors: string; dimensions: string; badge: string | null; imgs: number[]; sold: number };
const SAMPLES: Sample[] = [
  { name: "Jacquard Sofa Cover – 3 Seater, Teal", cat: "sofa-covers", price: 2499, mrp: 3299, stock: 10, fabric: "Jacquard", weave: "Jacquard", colors: "Teal", dimensions: "Fits 3 seater sofas (72–90 inches)", badge: "Bestseller", imgs: [3, 7], sold: 21 },
  { name: "Quilted Cotton Sofa Cover Set (3+1+1) – Beige", cat: "sofa-covers", price: 3999, mrp: 4999, stock: 6, fabric: "Cotton", weave: "Quilted", colors: "Beige", dimensions: "Set for a 5 seater sofa (3+1+1)", badge: "New Arrival", imgs: [10, 2], sold: 4 },
  { name: "Velvet Sofa Cover – 2 Seater, Maroon", cat: "sofa-covers", price: 1799, mrp: 2199, stock: 8, fabric: "Velvet", weave: "Solid", colors: "Maroon", dimensions: "Fits 2 seater sofas (50–65 inches)", badge: null, imgs: [1, 5], sold: 7 },
  { name: "Jacquard Cushion Covers 16x16 – Set of 5, Teal", cat: "cushion-covers", price: 999, mrp: 1499, stock: 25, fabric: "Jacquard", weave: "Jacquard", colors: "Teal", dimensions: "16 x 16 inches, set of 5", badge: "Bestseller", imgs: [3, 11], sold: 38 },
  { name: "Printed Cotton Cushion Covers 16x16 – Set of 2, Floral", cat: "cushion-covers", price: 449, mrp: 599, stock: 40, fabric: "Cotton", weave: "Printed", colors: "Multicolour", dimensions: "16 x 16 inches, set of 2", badge: "Fast Moving", imgs: [9, 12], sold: 26 },
  { name: "Velvet Cushion Cover 18x18 – Mustard", cat: "cushion-covers", price: 399, mrp: 549, stock: 30, fabric: "Velvet", weave: "Solid", colors: "Mustard", dimensions: "18 x 18 inches", badge: "New Arrival", imgs: [8, 4], sold: 9 },
  { name: "Jacquard Bolster Covers 15x30 – Pair, Gold", cat: "bolster-covers", price: 699, mrp: 899, stock: 20, fabric: "Jacquard", weave: "Jacquard", colors: "Gold", dimensions: "15 x 30 inches, pair", badge: null, imgs: [8, 1], sold: 11 },
  { name: "Cotton Bolster Covers 16x32 – Pair, Ivory Stripes", cat: "bolster-covers", price: 549, mrp: 699, stock: 18, fabric: "Cotton", weave: "Striped", colors: "Ivory", dimensions: "16 x 32 inches, pair", badge: "New Arrival", imgs: [5, 6], sold: 3 },
  { name: "Jacquard Dining Table Cover 6 Seater – Beige", cat: "table-covers", price: 899, mrp: 1199, stock: 15, fabric: "Jacquard", weave: "Jacquard", colors: "Beige", dimensions: "60 x 90 inches (6 seater)", badge: "Fast Moving", imgs: [2, 10], sold: 17 },
  { name: "Cotton Centre Table Cover 40x60 – Teal Checks", cat: "table-covers", price: 449, mrp: 599, stock: 22, fabric: "Cotton", weave: "Checks", colors: "Teal", dimensions: "40 x 60 inches", badge: null, imgs: [7, 2], sold: 8 },
  { name: "Soft Filled Cushions 16x16 – Set of 2, Teal", cat: "cushions", price: 699, mrp: 899, stock: 20, fabric: "Microfibre", weave: "Solid", colors: "Teal", dimensions: "16 x 16 inches, set of 2, with filling", badge: "Bestseller", imgs: [11, 3], sold: 19 },
  { name: "Velvet Filled Cushion 12x18 – Mustard", cat: "cushions", price: 499, mrp: 649, stock: 15, fabric: "Velvet", weave: "Solid", colors: "Mustard", dimensions: "12 x 18 inches, with filling", badge: "New Arrival", imgs: [4, 8], sold: 2 },
];

const slugOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  await ensureAdmin();
  const version = await db.setting.findUnique({ where: { key: "catalogVersion" } });
  if (version?.value === CATALOG_VERSION) {
    console.log("✓ Catalogue up to date.");
    return;
  }

  // 1. Remove old sample data (SKU HL-…). Products the owner added are kept.
  const removed = await db.product.deleteMany({ where: { sku: { startsWith: "HL-" } } });
  await db.category.deleteMany({ where: { slug: { in: OLD_CATEGORY_SLUGS } } }); // owner products in them become uncategorised
  await db.banner.deleteMany({ where: { title: { in: OLD_BANNER_TITLES } } });
  await db.announcement.deleteMany({ where: { text: { contains: "sarees" } } });
  if (removed.count) console.log(`✓ Removed ${removed.count} old sample products`);

  // 2. Homira categories (top level, in menu order)
  const catId: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const data = { name: c.name, parentId: null, sortOrder: i + 1, showInMenu: true, bannerTitle: c.bannerTitle, bannerSubtitle: c.bannerSubtitle, bannerColor: c.bannerColor, image: c.image };
    const row = await db.category.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...data }, update: data });
    catId[c.slug] = row.id;
  }

  // 3. Sample products only in categories that are still empty
  let n = 0, created = 0;
  for (const p of SAMPLES) {
    n++;
    const count = await db.product.count({ where: { categoryId: catId[p.cat], OR: [{ sku: null }, { NOT: { sku: { startsWith: "HM-" } } }] } });
    if (count > 0) continue;
    const slug = slugOf(p.name);
    if (await db.product.findUnique({ where: { slug } })) continue;
    await db.product.create({
      data: {
        name: p.name, slug, price: p.price, mrp: p.mrp, stock: p.stock, fabric: p.fabric, weave: p.weave, colors: p.colors,
        dimensions: p.dimensions, badge: p.badge, soldCount: p.sold, featured: n % 3 === 1,
        origin: "Panipat, Haryana",
        care: p.fabric === "Velvet" ? "Dry clean or gentle hand wash in cold water. Do not wring." : "Machine wash gentle in cold water. Dry in shade. Warm iron.",
        description: `Beautifully made ${p.fabric.toLowerCase()} ${CATEGORIES.find((c) => c.slug === p.cat)!.name.toLowerCase()} from Homira, crafted in Panipat by Balaji Handicrafts. Neat stitching, rich colour and a perfect fit to make your home feel warm and elegant.\n\n(Sample product: replace the photos and description from your Owner Dashboard.)`,
        categoryId: catId[p.cat],
        sku: `HM-${String(n).padStart(4, "0")}`,
        createdAt: new Date(Date.now() - (SAMPLES.length - n) * 2 * 864e5),
        images: { create: p.imgs.map((i, idx) => ({ url: img(i), sortOrder: idx })) },
      },
    });
    created++;
  }

  // 4. Home banners, offers bar, coupons (only if missing)
  if ((await db.banner.count()) === 0) {
    await db.banner.createMany({
      data: [
        { title: "Elegance that feels like home", subtitle: "Sofa covers, cushion covers & more, made in Panipat", link: "/collections/sofa-covers", cta: "Shop sofa covers", bgColor: "#4f9e93", sortOrder: 1 },
        { title: "Cushion Goals", subtitle: "Cushion cover sets starting at ₹399", link: "/collections/cushion-covers", cta: "Shop cushion covers", bgColor: "#c9a26b", sortOrder: 2 },
        { title: "Dress Your Table", subtitle: "Table covers for every dining & centre table", link: "/collections/table-covers", cta: "Shop table covers", bgColor: "#2a8a7e", sortOrder: 3 },
      ],
    });
  }
  if ((await db.announcement.count()) === 0) {
    await db.announcement.createMany({
      data: [
        { text: "Free shipping on orders above ₹999 | SHOP NOW", link: "/collections/all", sortOrder: 1 },
        { text: "Cash on Delivery available across India", link: null, sortOrder: 3 },
      ],
    });
  }
  await db.announcement.create({ data: { text: "Festive Sale: Up to 30% OFF on sofa & cushion covers", link: "/collections/sale", sortOrder: 2 } });
  if ((await db.coupon.count()) === 0) {
    await db.coupon.createMany({
      data: [
        { code: "WELCOME10", description: "10% OFF on your first order (max ₹500)", type: "PERCENT", value: 10, maxDiscount: 500 },
        { code: "FESTIVE15", description: "15% OFF on orders above ₹2999", type: "PERCENT", value: 15, minOrder: 2999 },
      ],
    });
  }

  await db.setting.upsert({ where: { key: "catalogVersion" }, create: { key: "catalogVersion", value: CATALOG_VERSION }, update: { value: CATALOG_VERSION } });
  console.log(`✓ Homira catalogue ready: ${CATEGORIES.length} categories, ${created} sample products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
