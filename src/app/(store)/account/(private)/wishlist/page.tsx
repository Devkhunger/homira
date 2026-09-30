import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cardInclude } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");
  const items = await db.wishlistItem.findMany({
    where: { userId: user.id, product: { isActive: true } },
    include: { product: { include: cardInclude } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <h2 className="mb-6 text-2xl">My wishlist</h2>
      {items.length === 0 ? (
        <div className="card text-center">
          <p className="mb-4 text-sm text-neutral-600">Tap the ♡ on any product to save it here.</p>
          <Link href="/collections/all" className="btn-primary">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {items.map((w) => <ProductCard key={w.id} p={w.product} />)}
        </div>
      )}
    </>
  );
}
