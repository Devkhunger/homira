import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export default async function NewProduct() {
  const categories = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parentId: true } });
  return (
    <>
      <PageHeader title="Add product" subtitle="Fill in the details and upload photos — just like listing on a marketplace." />
      <ProductForm categories={categories} />
    </>
  );
}
