import Link from "next/link";
import { db } from "@/lib/db";
import { Empty, PageHeader, Table } from "@/components/admin/ui";

export default async function AdminCategories() {
  const cats = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { parent: true, _count: { select: { products: true } } },
  });
  return (
    <>
      <PageHeader title="Categories" subtitle="These appear in the top menu and as collection pages." action={{ href: "/admin/categories/new", label: "+ Add category" }} />
      {cats.length === 0 ? <Empty text="No categories yet." /> : (
        <Table head={["Name", "Parent", "Products", "In menu", "Order", ""]}>
          {cats.map((c) => (
            <tr key={c.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium"><Link href={`/admin/categories/${c.id}`} className="hover:text-brand hover:underline">{c.name}</Link></td>
              <td className="px-4 py-3">{c.parent?.name ?? "—"}</td>
              <td className="px-4 py-3">{c._count.products}</td>
              <td className="px-4 py-3">{c.showInMenu ? "Yes" : "No"}</td>
              <td className="px-4 py-3">{c.sortOrder}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/categories/${c.id}`} className="mr-3 text-brand hover:underline">Edit</Link>
                <Link href={`/collections/${c.slug}`} target="_blank" className="text-neutral-500 hover:underline">View</Link>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
