import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { reserveStock, StockError } from "@/lib/orders";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const b = parsed.data;

  const order = await db.order.findFirst({ where: { id: b.orderId, userId: user.id }, include: { items: true } });
  if (!order || order.razorpayOrderId !== b.razorpay_order_id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.paymentStatus === "PAID") return NextResponse.json({ ok: true });

  if (!verifyPaymentSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
    await db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
    return NextResponse.json({ error: "Payment signature mismatch" }, { status: 400 });
  }

  try {
    await db.$transaction(async (tx) => {
      await reserveStock(tx, order.items);
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: b.razorpay_payment_id },
      });
    });
  } catch (e) {
    // Paid but stock ran out meanwhile: keep payment, flag for the owner to resolve (refund or restock).
    if (e instanceof StockError) {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: b.razorpay_payment_id, notes: `ATTENTION: ${e.message} after payment. Refund or restock.` },
      });
    } else throw e;
  }
  return NextResponse.json({ ok: true });
}
