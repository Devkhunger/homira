"use server";
// Every action here starts with requireAdmin(): only store owners can change the catalogue or orders.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage, saveImages } from "@/lib/uploads";
import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/settings";
import { ORDER_STATUSES, slugify } from "@/lib/utils";
import { restoreStock } from "@/lib/orders";

export type FormState = { ok?: boolean; error?: string; message?: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const files = (f: FormData, k: string) => f.getAll(k).filter((x): x is File => x instanceof File && x.size > 0);
const cleanList = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean).join(",");

async function uniqueSlug(model: "product" | "category", base: string, excludeId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let n = 2; ; n++) {
    const found =
      model === "product"
        ? await db.product.findUnique({ where: { slug }, select: { id: true } })
        : await db.category.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
    slug = `${root}-${n}`;
  }
}

function refreshStore() {
  revalidatePath("/", "layout");
}

/* ---------------- Products ---------------- */

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(200),
  description: z.string().max(10000),
  price: z.coerce.number().int("Price must be a whole number").min(1, "Price must be at least ₹1"),
  mrp: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    name: str(f, "name"),
    description: str(f, "description"),
    price: str(f, "price"),
    mrp: str(f, "mrp") || str(f, "price"),
    stock: str(f, "stock") || "0",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.mrp && d.mrp < d.price) return { error: "MRP should be equal to or higher than the selling price." };

  const id = str(f, "id");
  const existing = id ? await db.product.findUnique({ where: { id }, include: { images: true } }) : null;
  if (id && !existing) return { error: "Product not found" };

  // Images: keep/reorder existing ones, append new uploads.
  let kept: string[] = [];
  try {
    kept = JSON.parse(str(f, "keepImages") || "[]");
  } catch {
    kept = [];
  }
  const existingUrls = new Set(existing?.images.map((i) => i.url) ?? []);
  kept = kept.filter((u) => existingUrls.has(u));
  let uploaded: string[];
  try {
    uploaded = await saveImages(files(f, "newImages"));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }
  const allImages = [...kept, ...uploaded];
  if (allImages.length === 0) return { error: "Please add at least one product photo." };

  const data = {
    name: d.name,
    description: d.description,
    price: d.price,
    mrp: d.mrp || d.price,
    stock: d.stock,
    sku: opt(f, "sku"),
    fabric: opt(f, "fabric"),
    weave: opt(f, "weave"),
    origin: opt(f, "origin"),
    care: opt(f, "care"),
    dimensions: opt(f, "dimensions"),
    sizes: cleanList(str(f, "sizes")),
    colors: cleanList(str(f, "colors")),
    badge: opt(f, "badge"),
    featured: f.get("featured") === "on",
    isActive: f.get("isActive") === "on",
    categoryId: opt(f, "categoryId"),
  };

  let productId = id;
  if (existing) {
    await db.product.update({ where: { id }, data: { ...data, slug: await uniqueSlug("product", str(f, "slug") || d.name, id) } });
    const removed = existing.images.filter((i) => !kept.includes(i.url));
    await db.productImage.deleteMany({ where: { productId: id } });
    for (const r of removed) await deleteImage(r.url);
  } else {
    const p = await db.product.create({ data: { ...data, slug: await uniqueSlug("product", str(f, "slug") || d.name) } });
    productId = p.id;
  }
  await db.productImage.createMany({ data: allImages.map((url, i) => ({ productId, url, sortOrder: i })) });

  refreshStore();
  redirect(`/admin/products?saved=1`);
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const p = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (!p) return;
  await db.product.delete({ where: { id } });
  for (const i of p.images) await deleteImage(i.url);
  refreshStore();
  redirect("/admin/products");
}

export async function quickUpdateProduct(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const stock = Number(str(f, "stock"));
  const isActive = f.get("isActive");
  await db.product.update({
    where: { id },
    data: {
      ...(Number.isInteger(stock) && stock >= 0 ? { stock } : {}),
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    },
  });
  refreshStore();
}

/* ---------------- Categories ---------------- */

export async function saveCategory(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(f, "name");
  if (name.length < 2) return { error: "Category name is required" };
  const id = str(f, "id");
  const existing = id ? await db.category.findUnique({ where: { id } }) : null;
  const parentId = opt(f, "parentId");
  if (parentId && parentId === id) return { error: "A category cannot be its own parent" };

  let image = existing?.image ?? null;
  let bannerImage = existing?.bannerImage ?? null;
  try {
    const img = files(f, "image")[0];
    if (img) { await deleteImage(image); image = await saveImage(img); }
    const ban = files(f, "bannerImage")[0];
    if (ban) { await deleteImage(bannerImage); bannerImage = await saveImage(ban); }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
  if (f.get("removeImage") === "on") { await deleteImage(image); image = null; }
  if (f.get("removeBanner") === "on") { await deleteImage(bannerImage); bannerImage = null; }

  const data = {
    name,
    description: opt(f, "description"),
    bannerTitle: opt(f, "bannerTitle"),
    bannerSubtitle: opt(f, "bannerSubtitle"),
    bannerColor: /^#[0-9a-f]{6}$/i.test(str(f, "bannerColor")) ? str(f, "bannerColor") : null,
    showInMenu: f.get("showInMenu") === "on",
    sortOrder: Number(str(f, "sortOrder")) || 0,
    parentId,
    image,
    bannerImage,
  };
  if (existing) await db.category.update({ where: { id }, data: { ...data, slug: await uniqueSlug("category", str(f, "slug") || name, id) } });
  else await db.category.create({ data: { ...data, slug: await uniqueSlug("category", str(f, "slug") || name) } });
  refreshStore();
  redirect("/admin/categories");
}

export async function deleteCategory(f: FormData) {
  await requireAdmin();
  const c = await db.category.findUnique({ where: { id: str(f, "id") } });
  if (!c) return;
  await db.category.delete({ where: { id: c.id } }); // products keep existing, just uncategorised
  await deleteImage(c.image);
  await deleteImage(c.bannerImage);
  refreshStore();
  redirect("/admin/categories");
}

/* ---------------- Orders ---------------- */

export async function updateOrder(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(f, "id");
  const status = str(f, "status");
  const paymentStatus = str(f, "paymentStatus");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return { error: "Invalid status" };
  if (!["PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus)) return { error: "Invalid payment status" };
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return { error: "Order not found" };

  const stockWasReserved = order.paymentMethod === "COD" || order.paymentStatus === "PAID";
  if (status === "CANCELLED" && order.status !== "CANCELLED" && stockWasReserved) await restoreStock(id);

  await db.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
      courier: opt(f, "courier"),
      trackingNumber: opt(f, "trackingNumber"),
      trackingUrl: opt(f, "trackingUrl"),
      notes: opt(f, "notes"),
    },
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true, message: "Order updated" };
}

/* ---------------- Banners, announcements, coupons ---------------- */

export async function saveBanner(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const title = str(f, "title");
  if (!title) return { error: "Title is required" };
  const id = str(f, "id");
  const existing = id ? await db.banner.findUnique({ where: { id } }) : null;
  let image = existing?.image ?? null;
  try {
    const img = files(f, "image")[0];
    if (img) { await deleteImage(image); image = await saveImage(img); }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
  if (f.get("removeImage") === "on") { await deleteImage(image); image = null; }
  const data = {
    title,
    subtitle: opt(f, "subtitle"),
    link: opt(f, "link"),
    cta: opt(f, "cta"),
    bgColor: /^#[0-9a-f]{6}$/i.test(str(f, "bgColor")) ? str(f, "bgColor") : null,
    sortOrder: Number(str(f, "sortOrder")) || 0,
    active: f.get("active") === "on",
    image,
  };
  if (existing) await db.banner.update({ where: { id }, data });
  else await db.banner.create({ data });
  refreshStore();
  return { ok: true, message: "Banner saved" };
}

export async function deleteBanner(f: FormData) {
  await requireAdmin();
  const b = await db.banner.findUnique({ where: { id: str(f, "id") } });
  if (!b) return;
  await db.banner.delete({ where: { id: b.id } });
  await deleteImage(b.image);
  refreshStore();
}

export async function saveAnnouncement(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const text = str(f, "text");
  if (!text) return { error: "Text is required" };
  const id = str(f, "id");
  const data = { text, link: opt(f, "link"), sortOrder: Number(str(f, "sortOrder")) || 0, active: f.get("active") === "on" };
  if (id) await db.announcement.update({ where: { id }, data });
  else await db.announcement.create({ data });
  refreshStore();
  return { ok: true, message: "Saved" };
}

export async function deleteAnnouncement(f: FormData) {
  await requireAdmin();
  await db.announcement.deleteMany({ where: { id: str(f, "id") } });
  refreshStore();
}

export async function saveCoupon(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const code = str(f, "code").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const type = str(f, "type");
  const value = Number(str(f, "value"));
  if (code.length < 3) return { error: "Code must be at least 3 letters/numbers" };
  if (!["PERCENT", "FLAT"].includes(type)) return { error: "Choose a discount type" };
  if (!Number.isInteger(value) || value <= 0 || (type === "PERCENT" && value > 90)) return { error: "Enter a valid discount value (max 90%)" };
  const id = str(f, "id");
  const data = {
    code,
    type,
    value,
    description: str(f, "description") || (type === "PERCENT" ? `${value}% OFF` : `₹${value} OFF`),
    minOrder: Number(str(f, "minOrder")) || 0,
    maxDiscount: Number(str(f, "maxDiscount")) || null,
    active: f.get("active") === "on",
    showOnSite: f.get("showOnSite") === "on",
  };
  const clash = await db.coupon.findUnique({ where: { code } });
  if (clash && clash.id !== id) return { error: "A coupon with this code already exists" };
  if (id) await db.coupon.update({ where: { id }, data });
  else await db.coupon.create({ data });
  refreshStore();
  return { ok: true, message: "Coupon saved" };
}

export async function deleteCoupon(f: FormData) {
  await requireAdmin();
  await db.coupon.deleteMany({ where: { id: str(f, "id") } });
  refreshStore();
}

/* ---------------- Settings & owners ---------------- */

const IMAGE_SETTINGS: SettingKey[] = ["logoUrl", "storyImage", "story2Image"];

export async function saveSettings(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const current = new Map((await db.setting.findMany()).map((s) => [s.key, s.value]));
  const updates: [string, string][] = [];

  for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
    if (IMAGE_SETTINGS.includes(key)) {
      const file = files(f, key)[0];
      const old = current.get(key) ?? "";
      if (file) {
        try {
          const url = await saveImage(file);
          await deleteImage(old);
          updates.push([key, url]);
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Upload failed" };
        }
      } else if (f.get(`remove_${key}`) === "on") {
        await deleteImage(old);
        updates.push([key, ""]);
      }
      continue;
    }
    if (key === "codEnabled") {
      if (f.has("__codEnabled")) updates.push([key, f.get("codEnabled") === "on" ? "true" : "false"]);
      continue;
    }
    if (!f.has(key)) continue;
    let v = String(f.get(key) ?? "");
    if (key.startsWith("color") && !/^#[0-9a-f]{6}$/i.test(v)) continue;
    if (["freeShippingAbove", "shippingFee", "codFee", "deliveryDays", "expressDays"].includes(key)) v = String(Math.max(0, Math.floor(Number(v) || 0)));
    updates.push([key, v.slice(0, 20000)]);
  }

  await db.$transaction(updates.map(([key, value]) => db.setting.upsert({ where: { key }, create: { key, value }, update: { value } })));
  refreshStore();
  return { ok: true, message: "Settings saved" };
}

export async function addOwner(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const email = str(f, "email").toLowerCase();
  const name = str(f, "name") || "Owner";
  const password = str(f, "password");
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email" };
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    revalidatePath("/admin/settings");
    return { ok: true, message: `${email} is now an owner` };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters for a new owner account" };
  await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await hashPassword(password) } });
  revalidatePath("/admin/settings");
  return { ok: true, message: `Owner account created for ${email}` };
}

export async function removeOwner(f: FormData) {
  const me = await requireAdmin();
  const id = str(f, "id");
  if (id === me.id) return; // cannot remove yourself
  const owners = await db.user.count({ where: { role: "ADMIN" } });
  if (owners <= 1) return;
  await db.user.update({ where: { id }, data: { role: "CUSTOMER" } });
  revalidatePath("/admin/settings");
}
