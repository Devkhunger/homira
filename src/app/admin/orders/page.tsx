import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatINR, ORDER_STATUSES, orderStatusLabel } from "@/lib/utils";
import { StatusPill } from "@/components/account/OrderList";
import { Empty, PageHeader, Table } from "@/components/admin/ui";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; unpaid?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const showUnpaid = sp.unpaid === "1";
  const orders = await db.order.findMany({
    where: {
      ...(sp.status ? { status: sp.status } : {}),
      // Hide abandoned online payments unless asked
      ...(showUnpaid ? {} : { OR: [{ paymentMethod: "COD" }, { paymentStatus: { not: "PENDING" } }] }),
      ...(q ? { AND: [{ OR: [{ orderNumber: { contains: q.toUpperCase() } }, { shipName: { contains: q } }, { shipPhone: { contains: q } }] }] } : {}),
    },
    include: { user: { select: { name: true } }, _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const tabs = [["", "All"], ...ORDER_STATUSES.map((s) => [s, orderStatusLabel(s)])];

  return (
    <>
      <PageHeader title="Orders" subtitle="Update status as you pack and ship: Confirmed → Shipped → Delivered" />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([s, label]) => (
          <Link key={s} href={`/admin/orders${s ? `?status=${s}` : ""}`} className={`rounded-full border px-4 py-1.5 text-sm ${(sp.status ?? "") === s ? "border-ink bg-ink text-white" : "bg-white"}`}>{label}</Link>
        ))}
      </div>
      <form className="mb-4 flex flex-wrap items-center gap-2">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input name="q" defaultValue={q} placeholder="Order no., name or phone" className="input max-w-xs" />
        <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="unpaid" value="1" defaultChecked={showUnpaid} /> include unpaid online attempts</label>
        <button className="btn-dark py-2">Search</button>
      </form>
      {orders.length === 0 ? <Empty text="No orders found." /> : (
        <Table head={["Order", "Date", "Customer", "Items", "Total", "Payment", "Status"]}>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand hover:underline">{o.orderNumber}</Link>
                {o.notes?.startsWith("ATTENTION") && <span className="ml-1 text-sale" title={o.notes}>⚠</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-3">{formatDate(o.createdAt)}</td>
              <td className="px-4 py-3">{o.shipName}<p className="text-xs text-neutral-500">{o.shipCity}</p></td>
              <td className="px-4 py-3">{o._count.items}</td>
              <td className="px-4 py-3">{formatINR(o.total)}</td>
              <td className="px-4 py-3 text-xs">{o.paymentMethod}<br /><StatusPill status={o.paymentStatus} payment /></td>
              <td className="px-4 py-3"><StatusPill status={o.status} /></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
