"use client";
import Link from "next/link";
import { saveCategory, type FormState } from "@/app/admin/actions";
import { useFormAction } from "@/components/ui/useFormAction";

type C = {
  id: string; name: string; slug: string; description: string | null; image: string | null; bannerImage: string | null;
  bannerTitle: string | null; bannerSubtitle: string | null; bannerColor: string | null; showInMenu: boolean; sortOrder: number; parentId: string | null;
};

export default function CategoryForm({ category, parents }: { category?: C; parents: { id: string; name: string }[] }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(saveCategory, {});
  return (
    <form method="post" onSubmit={onSubmit} className="grid max-w-4xl gap-6 lg:grid-cols-2">
      {category && <input type="hidden" name="id" value={category.id} />}
      <section className="card space-y-4">
        <h2 className="font-sans font-semibold">Category</h2>
        <div><label className="label">Name *</label><input name="name" required defaultValue={category?.name} className="input" placeholder="e.g. Sofa Covers" /></div>
        <div><label className="label">Description</label><textarea name="description" rows={3} defaultValue={category?.description ?? ""} className="input" /></div>
        <div>
          <label className="label">Parent category (for sub-menus)</label>
          <select name="parentId" defaultValue={category?.parentId ?? ""} className="input">
            <option value="">— Top level (shown in main menu) —</option>
            {parents.filter((p) => p.id !== category?.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Menu order</label><input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className="input" /></div>
          <div><label className="label">URL name</label><input name="slug" defaultValue={category?.slug} className="input" placeholder="auto" /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showInMenu" defaultChecked={category?.showInMenu ?? true} /> Show in menu</label>
        <div>
          <label className="label">Tile image (home page “Shop by Category”)</label>
          {category?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <div className="mb-2 flex items-center gap-3"><img src={category.image} alt="" className="h-20 w-16 rounded object-cover" /><label className="text-xs"><input type="checkbox" name="removeImage" /> remove</label></div>
          )}
          <input type="file" name="image" accept="image/*" className="text-sm" />
        </div>
      </section>
      <section className="card space-y-4">
        <h2 className="font-sans font-semibold">Collection banner</h2>
        <p className="text-xs text-neutral-500">Shown at the top of the collection page. Upload a wide image (e.g. 1920×400), or leave empty to use the text banner with “starting at ₹___” calculated automatically.</p>
        <div><label className="label">Banner headline</label><input name="bannerTitle" defaultValue={category?.bannerTitle ?? ""} className="input" placeholder="e.g. Cushion Goals" /></div>
        <div><label className="label">Banner sub-heading</label><input name="bannerSubtitle" defaultValue={category?.bannerSubtitle ?? ""} className="input" placeholder="e.g. Cushion cover sets" /></div>
        <div><label className="label">Banner colour</label><input name="bannerColor" type="color" defaultValue={category?.bannerColor ?? "#4f9e93"} className="h-10 w-20 cursor-pointer" /></div>
        <div>
          <label className="label">Banner image (optional)</label>
          {category?.bannerImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <div className="mb-2"><img src={category.bannerImage} alt="" className="h-20 w-full rounded object-cover" /><label className="text-xs"><input type="checkbox" name="removeBanner" /> remove</label></div>
          )}
          <input type="file" name="bannerImage" accept="image/*" className="text-sm" />
        </div>
      </section>
      <div className="flex items-center gap-3 lg:col-span-2">
        <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save category"}</button>
        <Link href="/admin/categories" className="btn-outline">Cancel</Link>
        {state.error && <p className="text-sm text-sale">{state.error}</p>}
      </div>
    </form>
  );
}
