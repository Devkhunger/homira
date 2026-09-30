import Link from "next/link";
import { db } from "@/lib/db";
import OrderTracker from "@/components/account/OrderTracker";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Track Order" };

export default async function TrackOrder({ searchParams }: { searchParams: Promise<{ order?: string; phone?: string }> }) {
  const sp = await searchParams;
  const orderNumber = (sp.order ?? "").trim().toUpperCase();
  const phone = (sp.phone ?? "").replace(/\D/g, "").slice(-10);
  const order = orderNumber && phone ? await db.order.findFirst({ where: { orderNumber, shipPhone: phone } }) : null;

  return (
    <div className="container-x max-w-xl py-16">
      <h1 className="mb-2 text-center text-4xl">Track your order</h1>
      <p className="mb-8 text-center text-sm text-neutral-600">
        Enter your order number and the mobile number used for delivery. Logged-in customers can also see all orders in{" "}
        <Link href="/account/orders" className="link-underline">My Orders</Link>.
      </p>
      <form className="card space-y-4">
        <div><label className="label">Order number</label><input name="order" defaultValue={sp.order} placeholder="ORD-XXXXXX-XXXXXX" required className="input" /></div>
        <div><label className="label">Mobile number</label><input name="phone" defaultValue={sp.phone} inputMode="numeric" required className="input" /></div>
        <button className="btn-dark w-full">Track</button>
      </form>
      {orderNumber && phone && (
        <div className="mt-8">
          {order ? (
            <div className="card space-y-5">
              <p className="text-sm">Order <b>{order.orderNumber}</b> · placed {formatDate(order.createdAt)}</p>
              <OrderTracker status={order.status} />
              {order.trackingNumber && (
                <p className="text-sm">{order.courier} · AWB <b>{order.trackingNumber}</b> {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="link-underline text-brand">Track →</a>}</p>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-sale">No order found with those details.</p>
          )}
        </div>
      )}
    </div>
  );
}
