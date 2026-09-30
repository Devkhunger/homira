import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { productId } = (await req.json().catch(() => ({}))) as { productId?: string };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) {
    await db.wishlistItem.delete({ where: key });
    return NextResponse.json({ wishlisted: false });
  }
  await db.wishlistItem.create({ data: { userId: user.id, productId } });
  return NextResponse.json({ wishlisted: true });
}
