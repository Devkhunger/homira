import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/utils";
import { Empty, PageHeader, Table } from "@/components/admin/ui";

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER", ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : {}) },
    include: { orders: { where: { status: { not: "CANCELLED" }, OR: [{ paymentMethod: "COD" }, { paymentStatus: "PAID" }] }, select: { total: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} customers`} />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email or phone" className="input max-w-xs" />
        <button className="btn-dark py-2">Search</button>
      </form>
      {customers.length === 0 ? <Empty text="No customers yet." /> : (
        <Table head={["Name", "Email", "Mobile", "Joined", "Orders", "Total spent"]}>
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3">{c.email ?? "—"}</td>
              <td className="px-4 py-3">{c.phone ? `+91 ${c.phone}` : "—"}</td>
              <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-3">{c.orders.length}</td>
              <td className="px-4 py-3">{formatINR(c.orders.reduce((s, o) => s + o.total, 0))}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
