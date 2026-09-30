import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { quickUpdateProduct } from "../actions";
import { Empty, PageHeader, Table } from "@/components/admin/ui";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; saved?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const [products, cats] = await Promise.all([
    db.product.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
        ...(sp.cat ? { categoryId: sp.cat } : {}),
      },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Products" subtitle={`${products.length} products`} action={{ href: "/admin/products/new", label: "+ Add product" }} />
      {sp.saved && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">Product saved ✓</p>}
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search by name or SKU" className="input max-w-xs" />
        <select name="cat" defaultValue={sp.cat ?? ""} className="input max-w-[200px]">
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-dark py-2">Filter</button>
      </form>
      {products.length === 0 ? (
        <Empty text="No products yet. Click “Add product” to list your first item." />
      ) : (
        <Table head={["", "Product", "Category", "Price", "Stock", "Visible", ""]}>
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-neutral-50">
              <td className="px-4 py-2">
                <div className="h-14 w-12 overflow-hidden rounded bg-neutral-100">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              </td>
              <td className="max-w-xs px-4 py-2">
                <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-brand hover:underline">{p.name}</Link>
                {p.badge && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">{p.badge}</span>}
                {p.sku && <p className="text-xs text-neutral-500">SKU {p.sku}</p>}
              </td>
              <td className="px-4 py-2">{p.category?.name ?? "—"}</td>
              <td className="whitespace-nowrap px-4 py-2">
                {formatINR(p.price)}
                {p.mrp > p.price && <span className="ml-1 text-xs text-neutral-400 line-through">{formatINR(p.mrp)}</span>}
              </td>
              <td className="px-4 py-2">
                <form action={quickUpdateProduct} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="stock" type="number" min={0} defaultValue={p.stock} className={`w-20 rounded border px-2 py-1 ${p.stock === 0 ? "border-sale text-sale" : ""}`} />
                  <button className="rounded border px-2 py-1 text-xs hover:bg-neutral-100">Save</button>
                </form>
              </td>
              <td className="px-4 py-2">
                <form action={quickUpdateProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="isActive" value={p.isActive ? "false" : "true"} />
                  <button className={`rounded-full px-3 py-1 text-xs font-semibold ${p.isActive ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}>
                    {p.isActive ? "Live" : "Hidden"}
                  </button>
                </form>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right">
                <Link href={`/admin/products/${p.id}`} className="mr-3 text-brand hover:underline">Edit</Link>
                <Link href={`/products/${p.slug}`} target="_blank" className="text-neutral-500 hover:underline">View</Link>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
