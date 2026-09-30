/* Sample data so the store looks complete on day one.
 * Everything here can be edited or deleted from the Owner Dashboard. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const img = (n: number) => `/placeholders/fabric-${((n - 1) % 12) + 1}.svg`;

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "owner@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
  const name = process.env.ADMIN_NAME || "Store Owner";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    console.log(`✓ Owner account exists: ${email}`);
    return;
  }
  await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`✓ Owner account created: ${email} / ${password}  (change this password after first login!)`);
}

async function main() {
  await ensureAdmin();
  if ((await db.product.count()) > 0) {
    console.log("✓ Products already exist, skipping sample catalogue.");
    return;
  }

  const cat = async (name: string, slug: string, sortOrder: number, extra: Record<string, unknown> = {}) =>
    db.category.create({ data: { name, slug, sortOrder, ...extra } });

  const sarees = await cat("Sarees", "sarees", 1, { bannerTitle: "Saree Stories", bannerSubtitle: "Handwoven sarees", bannerColor: "#4f9e93", image: img(4) });
  const cotton = await cat("Cotton Sarees", "cotton-sarees", 1, { parentId: sarees.id, bannerTitle: "Cotton Calm", bannerSubtitle: "Breathable cotton sarees", bannerColor: "#c9a26b" });
  const silk = await cat("Silk Sarees", "silk-sarees", 2, { parentId: sarees.id, bannerTitle: "Silk Rhythms", bannerSubtitle: "Pure silk handlooms", bannerColor: "#2a8a7e" });
  const dupattas = await cat("Dupattas & Stoles", "dupattas-stoles", 2, { bannerTitle: "Drape Goals", bannerSubtitle: "Dupattas & stoles", bannerColor: "#b98a9a", image: img(3) });
  const fabrics = await cat("Fabrics", "fabrics", 3, { bannerTitle: "By The Metre", bannerSubtitle: "Handloom running fabric", bannerColor: "#6b8f71", image: img(2) });
  const home = await cat("Home & Decor", "home-decor", 4, { bannerTitle: "Cushion Goals", bannerSubtitle: "Cushion cover sets", bannerColor: "#4f9e93", image: img(9) });
  const cushions = await cat("Cushion Covers", "cushion-covers", 1, { parentId: home.id, bannerTitle: "Cushion Goals", bannerSubtitle: "Cushion cover sets", bannerColor: "#4f9e93" });
  const bed = await cat("Bedsheets & Throws", "bedsheets-throws", 2, { parentId: home.id, bannerTitle: "Sleep Woven", bannerSubtitle: "Handloom bedsheets", bannerColor: "#9c6b30" });

  const products = [
    { name: "Pochampally Ikat Cotton Saree – Indigo Diamonds", cat: cotton.id, price: 2499, mrp: 3299, stock: 12, fabric: "Cotton", weave: "Ikat", origin: "Pochampally, Telangana", colors: "Indigo", badge: "Bestseller", imgs: [3, 7, 11], sold: 34 },
    { name: "Maroon Kanchi Silk Saree with Zari Border", cat: silk.id, price: 8999, mrp: 11999, stock: 4, fabric: "Mulberry Silk", weave: "Kanjivaram", origin: "Kanchipuram, Tamil Nadu", colors: "Maroon", badge: "Limited Edition", imgs: [1, 4, 5], sold: 9 },
    { name: "Chanderi Silk-Cotton Saree – Mint Buti", cat: silk.id, price: 3799, mrp: 4499, stock: 8, fabric: "Cotton Silk", weave: "Chanderi", origin: "Chanderi, Madhya Pradesh", colors: "Mint, Peach", badge: "New Arrival", imgs: [7, 3], sold: 5 },
    { name: "Bengal Tant Cotton Saree – Red & White", cat: cotton.id, price: 1599, mrp: 1999, stock: 20, fabric: "Cotton", weave: "Tant", origin: "Nadia, West Bengal", colors: "Red, White", badge: "Fast Moving", imgs: [6, 12], sold: 51 },
    { name: "Maheshwari Stripe Saree – Mustard", cat: cotton.id, price: 2199, mrp: 2199, stock: 10, fabric: "Maheshwari", weave: "Maheshwari", origin: "Maheshwar, Madhya Pradesh", colors: "Mustard", badge: null, imgs: [8, 1], sold: 12 },
    { name: "Handwoven Khadi Dupatta – Natural Dye", cat: dupattas.id, price: 899, mrp: 1299, stock: 25, fabric: "Khadi", weave: "Plain weave", origin: "Gujarat", colors: "Beige, Rust", badge: "New Arrival", imgs: [10, 2], sold: 18 },
    { name: "Ikat Silk Stole – Plum", cat: dupattas.id, price: 1499, mrp: 1799, stock: 7, fabric: "Silk", weave: "Ikat", origin: "Odisha", colors: "Plum", badge: null, imgs: [5, 3], sold: 6 },
    { name: "Handloom Cotton Fabric – Teal Checks (per metre)", cat: fabrics.id, price: 349, mrp: 449, stock: 120, fabric: "Cotton", weave: "Checks", origin: "Andhra Pradesh", colors: "Teal", sizes: "", badge: null, imgs: [2, 7], sold: 40 },
    { name: "Mangalagiri Cotton Fabric – Kurta Length 2.5m", cat: fabrics.id, price: 899, mrp: 999, stock: 30, fabric: "Cotton", weave: "Mangalagiri", origin: "Mangalagiri, Andhra Pradesh", colors: "Rust, Olive", badge: "Fast Moving", imgs: [9, 10], sold: 22 },
    { name: "Ikat Cushion Cover Set of 3 – 16\"", cat: cushions.id, price: 1295, mrp: 1595, stock: 15, fabric: "Cotton", weave: "Ikat", origin: "Telangana", colors: "Blue, Mustard", dimensions: "16 x 16 inches, set of 3", badge: "Bestseller", imgs: [3, 11, 7], sold: 28 },
    { name: "Handloom Stripe Cushion Cover – 16\"", cat: cushions.id, price: 499, mrp: 699, stock: 40, fabric: "Cotton", weave: "Stripes", origin: "Karur, Tamil Nadu", colors: "Rust", dimensions: "16 x 16 inches", badge: null, imgs: [1, 9], sold: 15 },
    { name: "Handwoven Double Bedsheet with 2 Pillow Covers", cat: bed.id, price: 2299, mrp: 2999, stock: 9, fabric: "Cotton", weave: "Checks", origin: "Panipat, Haryana", colors: "Green", dimensions: "90 x 108 inches", badge: "New Arrival", imgs: [2, 10], sold: 7 },
  ];

  let n = 0;
  for (const p of products) {
    n++;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await db.product.create({
      data: {
        name: p.name,
        slug,
        description: `A beautiful ${p.weave?.toLowerCase()} ${p.fabric?.toLowerCase()} piece, handwoven by artisan weavers of ${p.origin}. Each piece takes days on the loom, and small irregularities are the signature of true handloom.\n\n(Sample product — replace this description from your Owner Dashboard.)`,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        fabric: p.fabric,
        weave: p.weave,
        origin: p.origin,
        care: p.fabric?.includes("Silk") ? "Dry clean only" : "Gentle hand wash in cold water. Dry in shade.",
        dimensions: p.dimensions ?? (p.cat === cotton.id || p.cat === silk.id ? "5.5 m saree + 0.8 m blouse piece" : null),
        colors: p.colors,
        sizes: p.sizes ?? "",
        badge: p.badge,
        featured: n <= 4,
        soldCount: p.sold,
        categoryId: p.cat,
        sku: `HL-${String(n).padStart(4, "0")}`,
        createdAt: new Date(Date.now() - (products.length - n) * 3 * 864e5),
        images: { create: p.imgs.map((i, idx) => ({ url: img(i), sortOrder: idx })) },
      },
    });
  }

  await db.banner.createMany({
    data: [
      { title: "Woven by hand, worn with pride", subtitle: "Authentic handloom sarees direct from weaver families", link: "/collections/sarees", cta: "Shop sarees", bgColor: "#4f9e93", sortOrder: 1 },
      { title: "Cushion Goals", subtitle: "Handloom cushion cover sets starting at ₹499", link: "/collections/cushion-covers", cta: "Explore home", bgColor: "#c9a26b", sortOrder: 2 },
      { title: "Festive Edit", subtitle: "Silk sarees & dupattas for the season", link: "/collections/silk-sarees", cta: "Shop festive", bgColor: "#2a8a7e", sortOrder: 3 },
    ],
  });
  await db.announcement.createMany({
    data: [
      { text: "Free shipping on orders above ₹999 | SHOP NOW", link: "/collections/all", sortOrder: 1 },
      { text: "Festive Sale: Up to 30% OFF on sarees", link: "/collections/sale", sortOrder: 2 },
      { text: "Cash on Delivery available across India", link: null, sortOrder: 3 },
    ],
  });
  await db.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% OFF on your first order (max ₹500)", type: "PERCENT", value: 10, maxDiscount: 500 },
      { code: "FESTIVE15", description: "15% OFF on orders above ₹2999", type: "PERCENT", value: 15, minOrder: 2999 },
    ],
  });
  console.log(`✓ Sample catalogue created: ${products.length} products, 8 categories, banners, offers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
