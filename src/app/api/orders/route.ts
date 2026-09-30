import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildQuote } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { createRazorpayOrder, razorpayEnabled } from "@/lib/razorpay";
import { newOrderNumber, reserveStock, StockError } from "@/lib/orders";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20), size: z.string().nullish(), color: z.string().nullish() }))
    .min(1)
    .max(50),
  coupon: z.string().max(40).optional(),
  addressId: z.string().min(1),
  paymentMethod: z.enum(["COD", "ONLINE"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  const { items, coupon, addressId, paymentMethod } = parsed.data;

  const settings = await getSettings();
  if (paymentMethod === "COD" && settings.codEnabled !== "true") return NextResponse.json({ error: "Cash on Delivery is not available" }, { status: 400 });
  if (paymentMethod === "ONLINE" && !razorpayEnabled()) return NextResponse.json({ error: "Online payment is not available" }, { status: 400 });

  const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!address) return NextResponse.json({ error: "Please choose a delivery address" }, { status: 400 });

  const quote = await buildQuote(items, coupon);
  if (!quote.lines.length) return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  if (quote.hasProblems) return NextResponse.json({ error: quote.lines.find((l) => l.problem)?.problem ?? "Some items are unavailable" }, { status: 409 });
  if (coupon && quote.couponError) return NextResponse.json({ error: quote.couponError }, { status: 400 });

  const codFee = paymentMethod === "COD" ? Number(settings.codFee) || 0 : 0;
  const total = quote.total + codFee;
  const orderItems = quote.lines.map((l) => ({
    productId: l.productId, name: l.name, image: l.image, price: l.price, quantity: l.quantity, size: l.size, color: l.color,
  }));

  try {
    const order = await db.$transaction(async (tx) => {
      // COD: reserve stock now. Online: reserve when payment is confirmed.
      if (paymentMethod === "COD") await reserveStock(tx, orderItems);
      return tx.order.create({
        data: {
          orderNumber: newOrderNumber(),
          userId: user.id,
          paymentMethod,
          status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
          subtotal: quote.subtotal,
          discount: quote.discount,
          shipping: quote.shipping + codFee,
          total,
          couponCode: quote.coupon?.code ?? null,
          shipName: address.name,
          shipPhone: address.phone,
          shipLine1: address.line1,
          shipLine2: address.line2,
          shipCity: address.city,
          shipState: address.state,
          shipPincode: address.pincode,
          items: { create: orderItems },
        },
      });
    });

    if (paymentMethod === "COD") return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });

    const rp = await createRazorpayOrder(total, order.orderNumber);
    await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rp.id } });
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpay: { key: process.env.RAZORPAY_KEY_ID, orderId: rp.id, amount: rp.amount },
    });
  } catch (e) {
    if (e instanceof StockError) return NextResponse.json({ error: e.message }, { status: 409 });
    console.error("Order creation failed", e);
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
}
