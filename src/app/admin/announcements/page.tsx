import { db } from "@/lib/db";
import { deleteAnnouncement, saveAnnouncement } from "../actions";
import InlineForm from "@/components/admin/InlineForm";
import { PageHeader } from "@/components/admin/ui";

type A = { id: string; text: string; link: string | null; sortOrder: number; active: boolean };

function Fields({ a }: { a?: A }) {
  return (
    <>
      {a && <input type="hidden" name="id" value={a.id} />}
      <div className="sm:col-span-2"><label className="label">Text *</label><input name="text" required defaultValue={a?.text} className="input" placeholder="Festive Sale: 20% OFF | SHOP NOW" /></div>
      <div><label className="label">Link</label><input name="link" defaultValue={a?.link ?? ""} className="input" placeholder="/collections/sale" /></div>
      <div><label className="label">Order</label><input name="sortOrder" type="number" defaultValue={a?.sortOrder ?? 0} className="input" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={a?.active ?? true} /> Active</label>
    </>
  );
}

export default async function AdminAnnouncements() {
  const items = await db.announcement.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Announcement bar" subtitle="Offers that slide in the thin bar at the very top of every page." />
      <div className="space-y-4">
        {items.map((a) => (
          <div key={a.id} className="card">
            <InlineForm action={saveAnnouncement} className="grid gap-4 sm:grid-cols-5"><Fields a={a} /></InlineForm>
            <form action={deleteAnnouncement} className="mt-2 text-right">
              <input type="hidden" name="id" value={a.id} />
              <button className="text-xs text-sale hover:underline">Delete</button>
            </form>
          </div>
        ))}
        <div className="card border-dashed">
          <h2 className="mb-4 font-sans font-semibold">+ Add announcement</h2>
          <InlineForm action={saveAnnouncement} resetOnSuccess submitLabel="Add" className="grid gap-4 sm:grid-cols-5"><Fields /></InlineForm>
        </div>
      </div>
    </>
  );
}
