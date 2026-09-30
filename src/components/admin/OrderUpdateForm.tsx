"use client";
import { updateOrder, type FormState } from "@/app/admin/actions";
import { useFormAction } from "@/components/ui/useFormAction";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/utils";

type O = { id: string; status: string; paymentStatus: string; courier: string | null; trackingNumber: string | null; trackingUrl: string | null; notes: string | null };

export default function OrderUpdateForm({ order }: { order: O }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(updateOrder, {});
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <input type="hidden" name="id" value={order.id} />
      <h2 className="font-sans font-semibold">Update order</h2>
      <div>
        <label className="label">Order status</label>
        <select name="status" defaultValue={order.status} className="input">
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Payment status</label>
        <select name="paymentStatus" defaultValue={order.paymentStatus} className="input">
          {["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <p className="mt-1 text-xs text-neutral-500">For COD, set to PAID once cash is collected.</p>
      </div>
      <div><label className="label">Courier</label><input name="courier" defaultValue={order.courier ?? ""} className="input" placeholder="Delhivery, India Post, DTDC…" /></div>
      <div><label className="label">Tracking / AWB number</label><input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="input" /></div>
      <div><label className="label">Tracking link</label><input name="trackingUrl" type="url" defaultValue={order.trackingUrl ?? ""} className="input" placeholder="https://…" /></div>
      <div><label className="label">Internal notes</label><textarea name="notes" rows={3} defaultValue={order.notes ?? ""} className="input" /></div>
      {state.error && <p className="text-sm text-sale">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">{state.message} ✓</p>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
