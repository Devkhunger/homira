import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CategoryForm from "@/components/admin/CategoryForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { PageHeader } from "@/components/admin/ui";
import { deleteCategory } from "../../actions";

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, parents] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({ where: { parentId: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!category) notFound();
  return (
    <>
      <PageHeader title="Edit category" subtitle={category.name} />
      <CategoryForm category={category} parents={parents} />
      <form action={deleteCategory} className="mt-10 border-t pt-6">
        <input type="hidden" name="id" value={category.id} />
        <ConfirmButton message="Delete this category? Its products will stay but become uncategorised." className="text-sm font-semibold text-sale hover:underline">
          Delete this category
        </ConfirmButton>
      </form>
    </>
  );
}
