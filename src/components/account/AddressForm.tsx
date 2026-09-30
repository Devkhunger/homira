"use client";
import { useState, useTransition } from "react";
import { saveAddress } from "@/app/(store)/account/actions";
import { INDIAN_STATES } from "@/lib/validation";

export type AddressData = {
  id: string; name: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean;
};

export default function AddressForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<AddressData>;
  onSaved?: (id: string) => void;
  onCancel?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveAddress(form);
      if (r.ok && r.address) {
        setErrors({});
        setMessage("");
        onSaved?.(r.address.id);
      } else {
        setErrors(r.errors ?? {});
        setMessage(r.message ?? "Could not save address");
      }
    });
  };

  const field = (name: keyof AddressData, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`addr-${name}`}>{label}</label>
      <input id={`addr-${name}`} name={name} defaultValue={(initial?.[name] as string) ?? ""} className={`input ${errors[name] ? "border-sale" : ""}`} {...props} />
      {errors[name] && <p className="mt-1 text-xs text-sale">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {field("name", "Full name", { autoComplete: "name", required: true })}
      {field("phone", "Mobile number", { autoComplete: "tel", inputMode: "tel", required: true })}
      <div className="sm:col-span-2">{field("line1", "House no., building, street", { autoComplete: "address-line1", required: true })}</div>
      <div className="sm:col-span-2">{field("line2", "Area, landmark (optional)", { autoComplete: "address-line2" })}</div>
      {field("city", "City", { autoComplete: "address-level2", required: true })}
      <div>
        <label className="label" htmlFor="addr-state">State</label>
        <select id="addr-state" name="state" defaultValue={initial?.state ?? ""} className={`input ${errors.state ? "border-sale" : ""}`} required>
          <option value="" disabled>Select state</option>
          {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {errors.state && <p className="mt-1 text-xs text-sale">{errors.state}</p>}
      </div>
      {field("pincode", "Pincode", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 6, required: true })}
      <label className="flex items-center gap-2 self-end pb-3 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={initial?.isDefault} className="accent-[rgb(var(--brand))]" /> Make this my default address
      </label>
      {message && <p className="text-sm text-sale sm:col-span-2">{message}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-dark">{pending ? "Saving…" : "Save address"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>}
      </div>
    </form>
  );
}
