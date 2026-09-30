import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import OrderUpdateForm from "@/components/admin/OrderUpdateForm";
import PrintButton from "@/components/admin/PrintButton";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await db.order.findUnique({ where: { id }, include: { items: true, user: true } });
  if (!o) notFound();
  return (
    <>
      <PageHeader title={`Order ${o.orderNumber}`} subtitle={`Placed ${formatDate(o.createdAt)} · ${o.paymentMethod === "COD" ? "Cash on Delivery" : "Online payment"}`} />
      {o.notes?.startsWith("ATTENTION") && <p className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-sale">{o.notes}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6" id="packing-slip">
          <div className="card">
            <h2 className="mb-3 font-sans font-semibold">Items</h2>
            <ul className="divide-y">
              {o.items.map((i) => (
                <li key={i.id} className="flex gap-4 py-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded bg-neutral-100">
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    {i.productId ? <Link href={`/admin/products/${i.productId}`} className="font-medium hover:underline">{i.name}</Link> : <p className="font-medium">{i.name}</p>}
                    <p className="text-xs text-neutral-500">{[i.color, i.size].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="text-sm">{i.quantity} × {formatINR(i.price)}</p>
                  <p className="w-24 text-right text-sm font-semibold">{formatINR(i.quantity * i.price)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 ml-auto max-w-xs space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt>Coupon {o.couponCode}</dt><dd>− {formatINR(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Shipping</dt><dd>{formatINR(o.shipping)}</dd></div>
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
              {o.paymentMethod === "COD" && <p className="text-right text-xs font-semibold text-sale">Collect {formatINR(o.total)} on delivery</p>}
            </dl>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card text-sm">
              <h2 className="mb-2 font-sans font-semibold">Ship to</h2>
              <p className="font-medium">{o.shipName}</p>
              <p>{o.shipLine1}</p>
              {o.shipLine2 && <p>{o.shipLine2}</p>}
              <p>{o.shipCity}, {o.shipState} - {o.shipPincode}</p>
              <p className="mt-1">📞 {o.shipPhone}</p>
            </div>
            <div className="card text-sm">
              <h2 className="mb-2 font-sans font-semibold">Customer</h2>
              <p>{o.user.name}</p>
              {o.user.email && <p>{o.user.email}</p>}
              {o.user.phone && <p>+91 {o.user.phone}</p>}
              {o.razorpayPaymentId && <p className="mt-2 text-xs text-neutral-500">Razorpay payment: {o.razorpayPaymentId}</p>}
              <a href={`https://wa.me/91${o.shipPhone}?text=${encodeURIComponent(`Hello ${o.shipName}, update on your order ${o.orderNumber}: `)}`} target="_blank" rel="noreferrer" className="mt-3 inline-block font-semibold text-green-700 hover:underline">
                Message on WhatsApp →
              </a>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <OrderUpdateForm order={o} />
          <PrintButton />
        </div>
      </div>
    </>
  );
}
