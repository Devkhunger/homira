import Link from "next/link";
import { formatDate, formatINR, orderStatusLabel } from "@/lib/utils";

type O = { id: string; orderNumber: string; createdAt: Date; status: string; total: number; paymentMethod: string; paymentStatus: string; items: { name: string; image: string | null }[] };

export function StatusPill({ status, payment = false }: { status: string; payment?: boolean }) {
  const paymentLabels: Record<string, string> = { PENDING: "Payment pending", PAID: "Paid", FAILED: "Payment failed", REFUNDED: "Refunded" };
  const tone: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-neutral-200 text-neutral-700",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-neutral-200 text-neutral-700",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[status] ?? "bg-neutral-100"}`}>{payment ? paymentLabels[status] ?? status : orderStatusLabel(status)}</span>;
}

export default function OrderList({ orders }: { orders: O[] }) {
  if (!orders.length)
    return (
      <div className="card text-center">
        <p className="mb-4 text-sm text-neutral-600">You haven&apos;t placed any orders yet.</p>
        <Link href="/collections/all" className="btn-primary">Start shopping</Link>
      </div>
    );
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="card flex items-center gap-4 hover:border-brand">
            <div className="flex -space-x-3">
              {o.items.slice(0, 3).map((i, n) => (
                <div key={n} className="h-14 w-12 overflow-hidden border-2 border-white bg-brand-cream">
                  {i.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold">{o.orderNumber}</p>
              <p className="text-neutral-600">{formatDate(o.createdAt)} · {o.items.length} item(s) · {o.paymentMethod === "COD" ? "Cash on Delivery" : "Paid online"}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{formatINR(o.total)}</p>
              {o.paymentMethod === "ONLINE" && o.paymentStatus !== "PAID" ? <StatusPill status={o.paymentStatus} payment /> : <StatusPill status={o.status} />}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
