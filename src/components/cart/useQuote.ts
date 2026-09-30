"use client";
import { useEffect, useState } from "react";
import type { Quote } from "@/lib/pricing";
import { useCart } from "./CartContext";

export const COUPON_KEY = "hl_coupon";

/** Asks the server for up-to-date prices, stock, coupon discount and shipping. */
export function useQuote(coupon: string) {
  const { items, ready } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
        coupon: coupon || undefined,
      }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((q: Quote) => setQuote(q))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [items, ready, coupon]);

  return { quote, loading };
}
