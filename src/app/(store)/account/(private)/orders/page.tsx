import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import OrderList from "@/components/account/OrderList";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { name: true, image: true } } },
  });
  return (
    <>
      <h2 className="mb-4 text-2xl">My orders</h2>
      <OrderList orders={orders} />
    </>
  );
}
