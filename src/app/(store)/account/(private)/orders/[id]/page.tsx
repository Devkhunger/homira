import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { restoreStock } from "@/lib/orders";
import { formatDate, formatINR } from "@/lib/utils";
import OrderTracker from "@/components/account/OrderTracker";
import { StatusPill } from "@/components/account/OrderList";

export const metadata = { title: "Order details" };

async function cancelOrder(form: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;
  const order = await db.order.findFirst({ where: { id: String(form.get("id")), userId: user.id } });
  if (!order || order.paymentMethod !== "COD" || !["PENDING", "CONFIRMED"].includes(order.status)) return;
  await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  await restoreStock(order.id);
  revalidatePath(`/account/orders/${order.id}`);
}

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/account/orders/${id}`);
  const o = await db.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!o) notFound();
  const canCancel = o.paymentMethod === "COD" && ["PENDING", "CONFIRMED"].includes(o.status);
  const awaitingPayment = o.paymentMethod === "ONLINE" && o.paymentStatus !== "PAID";

  return (
    <div className="space-y-6">
      {placed && !awaitingPayment && (
        <div className="border border-green-200 bg-green-50 p-5 text-green-900">
          <p className="font-serif text-2xl font-semibold">Thank you! Your order is placed</p>
          <p className="text-sm">Order number <b>{o.orderNumber}</b>. We&apos;ll update you as soon as it ships.</p>
        </div>
      )}
      {awaitingPayment && (
        <div className="border border-yellow-200 bg-yellow-50 p-4 text-sm">
          Payment {o.paymentStatus === "FAILED" ? "failed" : "not completed"} for this order. Please place a new order from your cart or contact us.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">Order {o.orderNumber}</h2>
          <p className="text-sm text-neutral-600">Placed on {formatDate(o.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <StatusPill status={o.status} />
          <StatusPill status={o.paymentStatus} payment />
        </div>
      </div>

      <div className="card"><OrderTracker status={o.status} /></div>

      {(o.trackingNumber || o.courier) && (
        <div className="card text-sm">
          <p className="font-semibold">Shipment</p>
          <p>{o.courier} {o.trackingNumber && <>· AWB <b>{o.trackingNumber}</b></>}</p>
          {o.trackingUrl && <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="link-underline font-semibold text-brand">Track shipment →</a>}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <ul className="card divide-y">
          {o.items.map((i) => (
            <li key={i.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="h-20 w-16 shrink-0 overflow-hidden bg-brand-cream">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-neutral-500">Qty {i.quantity}{i.size && ` · ${i.size}`}{i.color && ` · ${i.color}`}</p>
              </div>
              <p className="text-sm font-semibold">{formatINR(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <div className="card text-sm">
            <p className="mb-1 font-semibold">Delivery address</p>
            <p>{o.shipName} · {o.shipPhone}</p>
            <p className="text-neutral-600">{o.shipLine1}{o.shipLine2 && `, ${o.shipLine2}`}, {o.shipCity}, {o.shipState} - {o.shipPincode}</p>
          </div>
          <dl className="card space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon {o.couponCode}</dt><dd>− {formatINR(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : "FREE"}</dd></div>
            <div className="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
            <p className="text-xs text-neutral-500">{o.paymentMethod === "COD" ? "Cash on Delivery" : "Paid online"}</p>
          </dl>
          {canCancel && (
            <form action={cancelOrder}>
              <input type="hidden" name="id" value={o.id} />
              <button className="btn-outline w-full">Cancel order</button>
            </form>
          )}
          <Link href="/pages/contact" className="block text-center text-sm link-underline">Need help with this order?</Link>
        </div>
      </div>
    </div>
  );
}
