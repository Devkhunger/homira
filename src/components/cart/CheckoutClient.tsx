"use client";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { COUPON_KEY, useQuote } from "./useQuote";
import OrderSummary from "./OrderSummary";
import AddressForm, { type AddressData } from "@/components/account/AddressForm";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function brandColor() {
  const parts = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim().split(/\s+/);
  return parts.length === 3 ? `rgb(${parts.join(",")})` : "#2a8a7e";
}

type Props = {
  addresses: AddressData[];
  user: { name: string; email: string | null; phone: string | null };
  online: boolean;
  cod: boolean;
  codFee: number;
  brandName: string;
};

export default function CheckoutClient({ addresses, user, online, cod, codFee, brandName }: Props) {
  const router = useRouter();
  const { items, ready, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const { quote, loading } = useQuote(coupon);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [adding, setAdding] = useState(addresses.length === 0);
  const [method, setMethod] = useState<"ONLINE" | "COD">(online ? "ONLINE" : "COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setCoupon(localStorage.getItem(COUPON_KEY) ?? ""), []);
  useEffect(() => {
    if (!addressId && addresses[0]) setAddressId(addresses[0].id);
  }, [addresses, addressId]);

  if (ready && items.length === 0)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="mb-6 text-4xl">Your cart is empty</h1>
        <Link href="/collections/all" className="btn-primary">Shop now</Link>
      </div>
    );

  const finish = (orderId: string) => {
    clear();
    localStorage.removeItem(COUPON_KEY);
    router.push(`/account/orders/${orderId}?placed=1`);
  };

  const placeOrder = async () => {
    setError("");
    if (!addressId) return setError("Please add a delivery address.");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
          coupon: coupon || undefined,
          addressId,
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place order");

      if (method === "COD") return finish(data.orderId);

      if (!window.Razorpay) throw new Error("Payment window failed to load. Please refresh and try again.");
      const rzp = new window.Razorpay({
        key: data.razorpay.key,
        amount: data.razorpay.amount,
        currency: "INR",
        name: brandName,
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpay.orderId,
        prefill: { name: user.name, email: user.email ?? "", contact: user.phone ?? "" },
        theme: { color: brandColor() },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...resp }),
          });
          if (v.ok) finish(data.orderId);
          else {
            setError("Payment verification failed. If money was deducted, please contact us with your order number " + data.orderNumber);
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again or choose Cash on Delivery.");
        setPlacing(false);
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPlacing(false);
    }
  };

  const codTotal = quote ? quote.total + (method === "COD" ? codFee : 0) : 0;

  return (
    <div className="container-x py-12">
      {online && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />}
      <h1 className="mb-8 text-4xl">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="card">
            <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider">1. Delivery address</h2>
            {addresses.length > 0 && !adding && (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer gap-3 border p-4 text-sm ${addressId === a.id ? "border-brand bg-brand-cream" : "border-neutral-200"}`}>
                    <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-[rgb(var(--brand))]" />
                    <span>
                      <span className="font-semibold">{a.name}</span> · {a.phone}
                      <br />
                      {a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} - {a.pincode}
                    </span>
                  </label>
                ))}
                <button onClick={() => setAdding(true)} className="text-sm font-semibold text-brand link-underline">+ Add a new address</button>
              </div>
            )}
            {adding && (
              <AddressForm
                initial={{ name: user.name, phone: user.phone ?? "" }}
                onSaved={(id) => {
                  setAddressId(id);
                  setAdding(false);
                  router.refresh();
                }}
                onCancel={addresses.length ? () => setAdding(false) : undefined}
              />
            )}
          </section>

          <section className="card">
            <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider">2. Payment method</h2>
            <div className="space-y-3 text-sm">
              {online && (
                <label className={`flex cursor-pointer items-start gap-3 border p-4 ${method === "ONLINE" ? "border-brand bg-brand-cream" : ""}`}>
                  <input type="radio" checked={method === "ONLINE"} onChange={() => setMethod("ONLINE")} className="mt-1 accent-[rgb(var(--brand))]" />
                  <span><span className="font-semibold">Pay online</span><br /><span className="text-neutral-600">UPI, Cards, Netbanking, Wallets — secured by Razorpay</span></span>
                </label>
              )}
              {cod && (
                <label className={`flex cursor-pointer items-start gap-3 border p-4 ${method === "COD" ? "border-brand bg-brand-cream" : ""}`}>
                  <input type="radio" checked={method === "COD"} onChange={() => setMethod("COD")} className="mt-1 accent-[rgb(var(--brand))]" />
                  <span><span className="font-semibold">Cash on Delivery</span><br /><span className="text-neutral-600">Pay when your order arrives{codFee > 0 && ` (+${formatINR(codFee)} COD fee)`}</span></span>
                </label>
              )}
              {!online && !cod && <p className="text-sale">No payment methods are enabled. Please contact the store.</p>}
            </div>
          </section>
        </div>

        <aside className="card h-fit space-y-5">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider">Order summary</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto">
            {quote?.lines.map((l) => (
              <li key={`${l.productId}${l.size}${l.color}`} className="flex gap-3 text-sm">
                <div className="h-16 w-14 shrink-0 overflow-hidden bg-brand-cream">
                  {l.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-2">{l.name}</p>
                  <p className="text-xs text-neutral-500">Qty {l.quantity}{l.size && ` · ${l.size}`}{l.color && ` · ${l.color}`}</p>
                  {l.problem && <p className="text-xs text-sale">{l.problem}</p>}
                </div>
                <p className="font-medium">{formatINR(l.lineTotal)}</p>
              </li>
            ))}
          </ul>
          {quote && <OrderSummary quote={quote} />}
          {method === "COD" && codFee > 0 && quote && (
            <p className="flex justify-between text-sm"><span>COD fee</span><span>{formatINR(codFee)}</span></p>
          )}
          {error && <p className="bg-red-50 p-3 text-sm text-sale">{error}</p>}
          <button
            onClick={placeOrder}
            disabled={placing || loading || !quote || quote.hasProblems || (!online && !cod)}
            className="btn-primary w-full"
          >
            {placing ? "Processing…" : method === "COD" ? `Place order · ${formatINR(codTotal)}` : `Pay ${formatINR(codTotal)}`}
          </button>
          <p className="text-center text-xs text-neutral-500">By placing the order you agree to our <Link href="/pages/terms" className="underline">Terms</Link>.</p>
        </aside>
      </div>
    </div>
  );
}
