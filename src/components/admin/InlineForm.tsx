"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { FormState } from "@/app/admin/actions";
import { useFormAction } from "@/components/ui/useFormAction";

/** Small form wrapper used by list pages (banners, coupons…). Resets itself after creating a new record. */
export default function InlineForm({
  action,
  children,
  submitLabel = "Save",
  resetOnSuccess = false,
  className = "",
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, onSubmit, pending] = useFormAction<FormState>(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      if (resetOnSuccess) ref.current?.reset();
      router.refresh();
    }
  }, [state, resetOnSuccess, router]);
  return (
    <form ref={ref} method="post" onSubmit={onSubmit} className={className}>
      {children}
      <div className="flex items-center gap-3 sm:col-span-full">
        <button disabled={pending} className="btn-primary py-2">{pending ? "Saving…" : submitLabel}</button>
        {state.error && <p className="text-sm text-sale">{state.error}</p>}
        {state.ok && <p className="text-sm text-green-700">{state.message ?? "Saved"} ✓</p>}
      </div>
    </form>
  );
}
