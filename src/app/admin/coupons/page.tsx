import { db } from "@/lib/db";
import { deleteCoupon, saveCoupon } from "../actions";
import InlineForm from "@/components/admin/InlineForm";
import { PageHeader } from "@/components/admin/ui";

type C = Awaited<ReturnType<typeof db.coupon.findMany>>[number];

function Fields({ c }: { c?: C }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div><label className="label">Code *</label><input name="code" required defaultValue={c?.code} className="input uppercase" placeholder="FESTIVE15" /></div>
      <div>
        <label className="label">Type</label>
        <select name="type" defaultValue={c?.type ?? "PERCENT"} className="input"><option value="PERCENT">% off</option><option value="FLAT">₹ flat off</option></select>
      </div>
      <div><label className="label">Value *</label><input name="value" type="number" min={1} required defaultValue={c?.value} className="input" /></div>
      <div><label className="label">Min. order ₹</label><input name="minOrder" type="number" min={0} defaultValue={c?.minOrder ?? 0} className="input" /></div>
      <div><label className="label">Max discount ₹</label><input name="maxDiscount" type="number" min={0} defaultValue={c?.maxDiscount ?? ""} className="input" placeholder="no limit" /></div>
      <div className="sm:col-span-3"><label className="label">Description shown to customers</label><input name="description" defaultValue={c?.description} className="input" placeholder="15% OFF on orders above ₹2999" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={c?.active ?? true} /> Active</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showOnSite" defaultChecked={c?.showOnSite ?? true} /> Show in “Best offers”</label>
    </>
  );
}

export default async function AdminCoupons() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="Coupons & offers" subtitle="Discount codes. Offers marked “Show” appear in the Best Offers box on product pages." />
      <div className="space-y-4">
        {coupons.map((c) => (
          <div key={c.id} className="card">
            <InlineForm action={saveCoupon} className="grid gap-4 sm:grid-cols-5"><Fields c={c} /></InlineForm>
            <form action={deleteCoupon} className="mt-2 text-right">
              <input type="hidden" name="id" value={c.id} />
              <button className="text-xs text-sale hover:underline">Delete</button>
            </form>
          </div>
        ))}
        <div className="card border-dashed">
          <h2 className="mb-4 font-sans font-semibold">+ New coupon</h2>
          <InlineForm action={saveCoupon} resetOnSuccess submitLabel="Create coupon" className="grid gap-4 sm:grid-cols-5"><Fields /></InlineForm>
        </div>
      </div>
    </>
  );
}
