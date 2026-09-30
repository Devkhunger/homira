"use client";
import { useFormAction } from "@/components/ui/useFormAction";
import { changePassword, updateProfile } from "@/app/(store)/account/actions";

type S = { ok: boolean; message: string };

export default function ProfileForms({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [p, pAction, pPending] = useFormAction<S>(updateProfile as (s: S, f: FormData) => Promise<S>, { ok: false, message: "" });
  const [pw, pwAction, pwPending] = useFormAction<S>(changePassword as (s: S, f: FormData) => Promise<S>, { ok: false, message: "" });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={pAction} className="card space-y-4">
        <h3 className="text-xl">Your details</h3>
        <div><label className="label">Name</label><input name="name" defaultValue={name} required className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" defaultValue={email} className="input" /></div>
        <div><label className="label">Mobile</label><input value={phone ? `+91 ${phone}` : "Not added"} disabled className="input bg-neutral-50" /></div>
        {p.message && <p className={`text-sm ${p.ok ? "text-green-700" : "text-sale"}`}>{p.message}</p>}
        <button disabled={pPending} className="btn-dark">Save</button>
      </form>
      <form onSubmit={pwAction} className="card space-y-4">
        <h3 className="text-xl">Change password</h3>
        <div><label className="label">Current password (leave blank if you never set one)</label><input name="current" type="password" autoComplete="current-password" className="input" /></div>
        <div><label className="label">New password</label><input name="next" type="password" minLength={8} required autoComplete="new-password" className="input" /></div>
        {pw.message && <p className={`text-sm ${pw.ok ? "text-green-700" : "text-sale"}`}>{pw.message}</p>}
        <button disabled={pwPending} className="btn-dark">Update password</button>
      </form>
    </div>
  );
}
