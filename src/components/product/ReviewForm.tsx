"use client";
import { useActionState, useState } from "react";
import { submitReview } from "@/app/(store)/products/[slug]/actions";
import { StarIcon } from "@/components/ui/Icons";

export default function ReviewForm({ productId, existing }: { productId: string; existing: { rating: number; comment: string } | null }) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [state, action, pending] = useActionState(submitReview, { ok: false, message: "" });
  return (
    <form action={action} className="space-y-4">
      <h3 className="text-xl">{existing ? "Update your review" : "Write a review"}</h3>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1 text-brand-accent">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <StarIcon filled={n <= rating} className="h-6 w-6" />
          </button>
        ))}
      </div>
      <textarea name="comment" required minLength={3} maxLength={1000} rows={4} defaultValue={existing?.comment} className="input" placeholder="How did you like the product?" />
      {state.message && <p className={`text-sm ${state.ok ? "text-green-700" : "text-sale"}`}>{state.message}</p>}
      <button disabled={pending} className="btn-dark w-full">{pending ? "Saving…" : "Submit review"}</button>
    </form>
  );
}
