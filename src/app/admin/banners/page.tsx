import { db } from "@/lib/db";
import { deleteBanner, saveBanner } from "../actions";
import InlineForm from "@/components/admin/InlineForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { PageHeader } from "@/components/admin/ui";

type B = Awaited<ReturnType<typeof db.banner.findMany>>[number];

function Fields({ b }: { b?: B }) {
  return (
    <>
      {b && <input type="hidden" name="id" value={b.id} />}
      <div className="sm:col-span-2"><label className="label">Headline *</label><input name="title" required defaultValue={b?.title} className="input" placeholder="Festive Handloom Edit" /></div>
      <div className="sm:col-span-2"><label className="label">Sub-text</label><input name="subtitle" defaultValue={b?.subtitle ?? ""} className="input" placeholder="Handwoven silk sarees starting ₹2,499" /></div>
      <div><label className="label">Link (where the banner goes)</label><input name="link" defaultValue={b?.link ?? ""} className="input" placeholder="/collections/sarees" /></div>
      <div><label className="label">Button text</label><input name="cta" defaultValue={b?.cta ?? ""} className="input" placeholder="Shop now" /></div>
      <div><label className="label">Background colour</label><input name="bgColor" type="color" defaultValue={b?.bgColor ?? "#4f9e93"} className="h-10 w-20" /></div>
      <div><label className="label">Order</label><input name="sortOrder" type="number" defaultValue={b?.sortOrder ?? 0} className="input" /></div>
      <div className="sm:col-span-2">
        <label className="label">Image (wide, e.g. 1920×700 — optional)</label>
        {b?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="mb-2 flex items-center gap-3"><img src={b.image} alt="" className="h-16 w-40 rounded object-cover" /><label className="text-xs"><input type="checkbox" name="removeImage" /> remove</label></div>
        )}
        <input type="file" name="image" accept="image/*" className="text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={b?.active ?? true} /> Show on home page</label>
    </>
  );
}

export default async function AdminBanners() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Home page banners" subtitle="The big sliding banners at the top of your home page." />
      <div className="space-y-6">
        {banners.map((b) => (
          <div key={b.id} className="card">
            <InlineForm action={saveBanner} className="grid gap-4 sm:grid-cols-4"><Fields b={b} /></InlineForm>
            <form action={deleteBanner} className="mt-3 text-right">
              <input type="hidden" name="id" value={b.id} />
              <ConfirmButton message="Delete this banner?" className="text-xs text-sale hover:underline">Delete banner</ConfirmButton>
            </form>
          </div>
        ))}
        <div className="card border-dashed">
          <h2 className="mb-4 font-sans font-semibold">+ Add a banner</h2>
          <InlineForm action={saveBanner} resetOnSuccess submitLabel="Add banner" className="grid gap-4 sm:grid-cols-4"><Fields /></InlineForm>
        </div>
      </div>
    </>
  );
}
