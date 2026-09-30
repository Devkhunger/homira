"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export async function submitReview(_prev: { ok: boolean; message: string }, form: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in to review." };
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "Please add a rating and a short comment." };
  const { productId, rating, comment } = parsed.data;
  const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (!product) return { ok: false, message: "Product not found." };
  await db.review.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    create: { productId, userId: user.id, rating, comment },
    update: { rating, comment },
  });
  revalidatePath(`/products/${product.slug}`);
  return { ok: true, message: "Thank you for your review!" };
}
