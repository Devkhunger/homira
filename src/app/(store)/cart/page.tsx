"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { itemKey, useCart } from "@/components/cart/CartContext";
import { COUPON_KEY, useQuote } from "@/components/cart/useQuote";
import OrderSummary from "@/components/cart/OrderSummary";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { items, ready, setQty, remove } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const { quote, loading } = useQuote(coupon);

  useEffect(() => {
    const c = localStorage.getItem(COUPON_KEY) ?? "";
    setCoupon(c);
    setCouponInput(c);
  }, []);

  const applyCoupon = (code: string) => {
    const c = code.trim().toUpperCase();
    setCoupon(c);
    if (c) localStorage.setItem(COUPON_KEY, c);
    else localStorage.removeItem(COUPON_KEY);
  };

  if (!ready) return <div className="container-x py-24 text-center text-neutral-500">Loading cart…</div>;

  if (items.length === 0)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="mb-4 text-4xl">Your cart is empty</h1>
        <p className="mb-8 text-neutral-600">Discover handwoven pieces made with love.</p>
        <Link href="/collections/all" className="btn-primary">Continue shopping</Link>
      </div>
    );

  const lineInfo = new Map(quote?.lines.map((l) => [itemKey(l), l]));

  return (
    <div className="container-x py-12">
      <h1 className="mb-8 text-4xl">Shopping Cart</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y border-y">
          {items.map((i) => {
            const k = itemKey(i);
            const live = lineInfo.get(k);
            const price = live?.price ?? i.price;
            return (
              <li key={k} className="flex gap-4 py-5">
                <Link href={`/products/${i.slug}`} className="h-28 w-24 shrink-0 overflow-hidden bg-brand-cream">
                  {i.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link href={`/products/${i.slug}`} className="text-sm font-medium hover:text-brand">{i.name}</Link>
                    <button onClick={() => remove(k)} aria-label={`Remove ${i.name}`} className="text-neutral-400 hover:text-ink">
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{[i.color, i.size && `Size ${i.size}`].filter(Boolean).join(" · ")}</p>
                  {live?.problem && <p className="mt-1 text-xs font-semibold text-sale">{live.problem}</p>}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center border border-neutral-300">
                      <button className="px-2.5 py-1.5" aria-label="Decrease" onClick={() => setQty(k, i.quantity - 1)}><MinusIcon className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <button className="px-2.5 py-1.5" aria-label="Increase" onClick={() => setQty(k, i.quantity + 1)}><PlusIcon className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="text-sm font-semibold">{formatINR(price * i.quantity)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="card h-fit space-y-5">
          <div>
            <p className="label">Coupon code</p>
            <div className="flex">
              <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter code" className="input" />
              {coupon ? (
                <button onClick={() => { applyCoupon(""); setCouponInput(""); }} className="btn-outline px-4">Remove</button>
              ) : (
                <button onClick={() => applyCoupon(couponInput)} className="btn-dark px-4">Apply</button>
              )}
            </div>
            {quote?.couponError && <p className="mt-1 text-xs text-sale">{quote.couponError}</p>}
            {quote?.coupon && <p className="mt-1 text-xs text-green-700">{quote.coupon.description} applied!</p>}
          </div>
          {quote && <OrderSummary quote={quote} />}
          <Link
            href="/checkout"
            aria-disabled={loading || quote?.hasProblems}
            className={`btn-primary w-full ${loading || quote?.hasProblems ? "pointer-events-none opacity-50" : ""}`}
          >
            Checkout
          </Link>
          {quote?.hasProblems && <p className="text-center text-xs text-sale">Please fix the items marked in red to continue.</p>}
          <Link href="/collections/all" className="block text-center text-sm link-underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
