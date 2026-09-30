import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/utils";
import { StatusPill } from "@/components/account/OrderList";
import { PageHeader, Table } from "@/components/admin/ui";

export default async function Dashboard() {
  const since = new Date(Date.now() - 29 * 864e5);
  since.setHours(0, 0, 0, 0);
  const validOrder = { status: { not: "CANCELLED" }, OR: [{ paymentMethod: "COD" }, { paymentStatus: "PAID" }] };

  const [revenueAll, orders30, pending, customers, products, lowStock, recent] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, _count: true, where: validOrder }),
    db.order.findMany({ where: { ...validOrder, createdAt: { gte: since } }, select: { total: true, createdAt: true } }),
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] }, OR: [{ paymentMethod: "COD" }, { paymentStatus: "PAID" }] } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count({ where: { isActive: true } }),
    db.product.findMany({ where: { stock: { lte: 3 }, isActive: true }, orderBy: { stock: "asc" }, take: 8, select: { id: true, name: true, stock: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
  ]);

  // Daily sales for the last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    return { key: d.toDateString(), label: d.getDate(), total: 0 };
  });
  for (const o of orders30) {
    const day = days.find((d) => d.key === new Date(o.createdAt).toDateString());
    if (day) day.total += o.total;
  }
  const max = Math.max(1, ...days.map((d) => d.total));
  const revenue30 = orders30.reduce((s, o) => s + o.total, 0);

  const stats = [
    ["Sales (30 days)", formatINR(revenue30), `${orders30.length} orders`],
    ["Total sales", formatINR(revenueAll._sum.total ?? 0), `${revenueAll._count} orders`],
    ["To ship", String(pending), "orders waiting", "/admin/orders?status=CONFIRMED"],
    ["Customers", String(customers), `${products} live products`, "/admin/customers"],
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your store at a glance" action={{ href: "/admin/products/new", label: "+ Add product" }} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, sub, href]) => {
          const inner = (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
              <p className="text-xs text-neutral-500">{sub}</p>
            </>
          );
          return href ? <Link key={label} href={href} className="card hover:border-brand">{inner}</Link> : <div key={label} className="card">{inner}</div>;
        })}
      </div>

      <div className="card mt-6">
        <p className="mb-4 text-sm font-semibold">Sales — last 30 days</p>
        <div className="flex h-44 items-end gap-1">
          {days.map((d) => (
            <div key={d.key} className="group relative flex flex-1 flex-col items-center justify-end">
              <div className="w-full rounded-t bg-brand/80 transition group-hover:bg-brand" style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total ? 4 : 1 }} />
              <span className="mt-1 text-[9px] text-neutral-400">{d.label}</span>
              <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-ink px-2 py-1 text-[10px] text-white group-hover:block">{formatINR(d.total)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-sans font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm link-underline">All orders</Link></div>
          <Table head={["Order", "Customer", "Date", "Total", "Status"]}>
            {recent.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand hover:underline">{o.orderNumber}</Link></td>
                <td className="px-4 py-3">{o.user.name}</td>
                <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">{formatINR(o.total)}</td>
                <td className="px-4 py-3">{o.paymentMethod === "ONLINE" && o.paymentStatus !== "PAID" ? <StatusPill status={o.paymentStatus} payment /> : <StatusPill status={o.status} />}</td>
              </tr>
            ))}
          </Table>
        </div>
        <div className="card h-fit">
          <h2 className="mb-3 font-sans font-semibold">Low stock</h2>
          {lowStock.length === 0 ? <p className="text-sm text-neutral-500">All good 👍</p> : (
            <ul className="space-y-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <Link href={`/admin/products/${p.id}`} className="truncate hover:underline">{p.name}</Link>
                  <span className={`font-semibold ${p.stock === 0 ? "text-sale" : "text-yellow-700"}`}>{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
