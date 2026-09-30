import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { deleteProduct } from "../../actions";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parentId: true } }),
  ]);
  if (!product) notFound();
  return (
    <>
      <PageHeader title="Edit product" subtitle={product.name} />
      <ProductForm categories={categories} product={{ ...product, images: product.images.map((i) => i.url) }} />
      <form action={deleteProduct} className="mt-10 border-t pt-6">
        <input type="hidden" name="id" value={product.id} />
        <ConfirmButton message="Delete this product permanently? Past orders will still show it." className="text-sm font-semibold text-sale hover:underline">
          Delete this product
        </ConfirmButton>
      </form>
    </>
  );
}
