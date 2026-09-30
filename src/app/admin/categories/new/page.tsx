import { db } from "@/lib/db";
import CategoryForm from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/ui";

export default async function NewCategory() {
  const parents = await db.category.findMany({ where: { parentId: null }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader title="Add category" />
      <CategoryForm parents={parents} />
    </>
  );
}
