"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddressForm, { type AddressData } from "./AddressForm";
import { deleteAddress } from "@/app/(store)/account/actions";

export default function AddressBook({ addresses }: { addresses: AddressData[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(addresses.length ? null : "new");
  const done = () => {
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {addresses.map((a) =>
        editing === a.id ? (
          <div key={a.id} className="card"><AddressForm initial={a} onSaved={done} onCancel={() => setEditing(null)} /></div>
        ) : (
          <div key={a.id} className="card flex flex-wrap justify-between gap-4 text-sm">
            <div>
              <p className="font-semibold">{a.name} · {a.phone} {a.isDefault && <span className="ml-2 bg-brand-cream px-2 py-0.5 text-xs text-brand">Default</span>}</p>
              <p className="text-neutral-600">{a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} - {a.pincode}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setEditing(a.id)} className="link-underline">Edit</button>
              <form action={async (f) => { await deleteAddress(f); router.refresh(); }}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-sale link-underline">Delete</button>
              </form>
            </div>
          </div>
        ),
      )}
      {editing === "new" ? (
        <div className="card"><AddressForm onSaved={done} onCancel={addresses.length ? () => setEditing(null) : undefined} /></div>
      ) : (
        <button onClick={() => setEditing("new")} className="btn-outline">+ Add new address</button>
      )}
    </div>
  );
}
