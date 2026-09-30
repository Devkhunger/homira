import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import OrderList from "@/components/account/OrderList";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, orderCount, wishCount, addrCount] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { items: { select: { name: true, image: true } } } }),
    db.order.count({ where: { userId: user.id } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
    db.address.count({ where: { userId: user.id } }),
  ]);
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="card hover:border-brand"><p className="text-3xl font-serif font-semibold">{orderCount}</p><p className="text-sm text-neutral-600">Orders</p></Link>
        <Link href="/account/wishlist" className="card hover:border-brand"><p className="text-3xl font-serif font-semibold">{wishCount}</p><p className="text-sm text-neutral-600">Wishlist items</p></Link>
        <Link href="/account/addresses" className="card hover:border-brand"><p className="text-3xl font-serif font-semibold">{addrCount}</p><p className="text-sm text-neutral-600">Saved addresses</p></Link>
      </div>
      <section>
        <h2 className="mb-4 text-2xl">Recent orders</h2>
        <OrderList orders={orders} />
      </section>
    </div>
  );
}
