import type { Metadata } from "next";
import { db } from "@/lib/db";
import { cardInclude } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const words = q.split(/\s+/).filter(Boolean);
  const products = words.length
    ? await db.product.findMany({
        where: {
          isActive: true,
          AND: words.map((w) => ({
            OR: [
              { name: { contains: w } },
              { description: { contains: w } },
              { fabric: { contains: w } },
              { weave: { contains: w } },
              { colors: { contains: w } },
              { category: { name: { contains: w } } },
            ],
          })),
        },
        include: cardInclude,
        take: 100,
      })
    : [];

  return (
    <div className="container-x py-12">
      <h1 className="mb-2 text-center text-4xl">Search</h1>
      <p className="mb-10 text-center text-sm text-neutral-600">
        {q ? `${products.length} results for “${q}”` : "Type in the search box to find products."}
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
