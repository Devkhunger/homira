"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { Price } from "./ProductCard";
import {
  CashIcon, FacebookIcon, HeartIcon, MailIcon, MinusIcon, PinIcon, PinterestIcon, PlusIcon, ShieldIcon, StarIcon, TruckIcon, WhatsappIcon, XIcon,
} from "@/components/ui/Icons";
import { formatINR } from "@/lib/utils";

type Props = {
  product: { id: string; slug: string; name: string; price: number; mrp: number; stock: number; sizes: string[]; colors: string[]; images: string[]; badge: string | null };
  breadcrumbs: { label: string; href: string }[];
  delivery: { days: number; expressDays: number; expressPrefixes: string[]; freeAbove: number; codEnabled: boolean };
  offers: { code: string; description: string }[];
  wishlisted: boolean;
  loggedIn: boolean;
  rating: { avg: number; count: number };
  siteUrl: string;
  children?: React.ReactNode;
};

export default function ProductDetail({ product: p, breadcrumbs, delivery, offers, wishlisted, loggedIn, rating, siteUrl, children }: Props) {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 ? p.sizes[0] : null);
  const [color, setColor] = useState<string | null>(p.colors[0] ?? null);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [wish, setWish] = useState(wishlisted);
  const [error, setError] = useState("");
  const { add } = useCart();
  const toast = useToast();
  const router = useRouter();
  const soldOut = p.stock <= 0;

  const url = `${siteUrl}/products/${p.slug}`;
  const share = [
    { label: "WhatsApp", Icon: WhatsappIcon, href: `https://wa.me/?text=${encodeURIComponent(`${p.name} ${url}`)}` },
    { label: "Facebook", Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", Icon: XIcon, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.name)}` },
    { label: "Pinterest", Icon: PinterestIcon, href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(p.name)}` },
    { label: "Email", Icon: MailIcon, href: `mailto:?subject=${encodeURIComponent(p.name)}&body=${encodeURIComponent(url)}` },
  ];

  const addToCart = (buyNow = false) => {
    if (p.sizes.length && !size) return setError("Please select a size");
    setError("");
    add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? null, price: p.price, mrp: p.mrp, quantity: qty, size, color });
    if (buyNow) router.push("/cart");
    else toast(`Added "${p.name}" to cart`);
  };

  const checkPin = () => {
    if (!/^[1-9]\d{5}$/.test(pin)) return setPinMsg({ ok: false, text: "Please enter a valid 6-digit pincode" });
    const express = delivery.expressPrefixes.some((pre) => pin.startsWith(pre));
    const days = express ? delivery.expressDays : delivery.days;
    const d = new Date(Date.now() + days * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    setPinMsg({ ok: true, text: `Delivery by ${d}${delivery.codEnabled ? " · Cash on Delivery available" : ""}` });
  };

  const toggleWish = async () => {
    if (!loggedIn) return router.push(`/account/login?next=/products/${p.slug}`);
    const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: p.id }) });
    if (res.ok) {
      const { wishlisted } = await res.json();
      setWish(wishlisted);
      toast(wishlisted ? "Added to wishlist" : "Removed from wishlist");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-3 lg:sticky lg:top-24 lg:h-fit lg:flex-row">
        <div className="no-scrollbar flex gap-3 overflow-x-auto lg:max-h-[640px] lg:flex-col lg:overflow-y-auto">
          {p.images.map((src, i) => (
            <button key={src + i} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={`h-20 w-16 shrink-0 overflow-hidden border-2 lg:h-[76px] lg:w-[60px] ${active === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden bg-brand-cream">
          {p.images[active] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[active]} alt={p.name} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-neutral-400">No image</div>
          )}
          {p.badge && <span className="absolute left-4 top-4 bg-ink px-2 py-1 text-[11px] font-semibold uppercase text-white">{p.badge}</span>}
        </div>
      </div>

      {/* Info */}
      <div>
        <nav className="mb-2 text-[11px] text-neutral-500" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={b.href}>
              {i > 0 && " > "}
              {i < breadcrumbs.length - 1 ? <Link href={b.href} className="hover:underline">{b.label}</Link> : <span>{b.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="font-sans text-2xl font-semibold leading-snug">{p.name}</h1>
        {rating.count > 0 && (
          <a href="#reviews" className="mt-2 flex items-center gap-1 text-sm text-neutral-600">
            <span className="flex text-brand-accent">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < Math.round(rating.avg)} className="h-4 w-4" />)}
            </span>
            {rating.avg.toFixed(1)} ({rating.count} reviews)
          </a>
        )}
        <div className="mt-5">
          <Price price={p.price} mrp={p.mrp} size="lg" />
          <p className="text-sm text-neutral-600">Inclusive of all taxes</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1"><TruckIcon className="h-6 w-6" />Free delivery{delivery.freeAbove > 0 && <span className="text-neutral-500">above {formatINR(delivery.freeAbove)}</span>}</div>
          <div className="flex flex-col items-center gap-1"><ShieldIcon className="h-6 w-6" />Secure payments</div>
          {delivery.codEnabled && <div className="flex flex-col items-center gap-1"><CashIcon className="h-6 w-6" />Cash on delivery</div>}
        </div>

        {p.colors.length > 0 && (
          <div className="mt-6">
            <p className="label">Colour: <span className="normal-case text-ink">{color}</span></p>
            <div className="flex flex-wrap gap-2">
              {p.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`border px-4 py-2 text-sm ${color === c ? "border-ink bg-ink text-white" : "border-neutral-300 hover:border-ink"}`}>{c}</button>
              ))}
            </div>
          </div>
        )}
        {p.sizes.length > 0 && (
          <div className="mt-5">
            <p className="label">Size</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => { setSize(s); setError(""); }} className={`min-w-12 border px-4 py-2 text-sm ${size === s ? "border-ink bg-ink text-white" : "border-neutral-300 hover:border-ink"}`}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <div className="inline-flex items-center border border-neutral-300">
            <button className="px-3 py-2.5" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><MinusIcon className="h-4 w-4" /></button>
            <span className="w-10 text-center text-sm" aria-live="polite">{qty}</span>
            <button className="px-3 py-2.5" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(Math.min(20, Math.max(1, p.stock)), q + 1))}><PlusIcon className="h-4 w-4" /></button>
          </div>
          {p.stock > 0 && p.stock <= 5 && <span className="ml-4 text-sm font-semibold text-sale">Only {p.stock} left!</span>}
        </div>
        {error && <p className="mt-3 text-sm text-sale">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button disabled={soldOut} onClick={() => addToCart(false)} className="btn-outline flex-1">{soldOut ? "Sold out" : "Add to cart"}</button>
          <button disabled={soldOut} onClick={() => addToCart(true)} className="btn-primary flex-1">Buy it now</button>
          <button onClick={toggleWish} aria-label={wish ? "Remove from wishlist" : "Add to wishlist"} className={`border px-3.5 ${wish ? "border-brand text-brand" : "border-neutral-300 hover:border-ink"}`}>
            <HeartIcon filled={wish} className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8">
          <p className="mb-2 font-semibold">Delivery Date</p>
          <div className="flex border border-neutral-300">
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && checkPin()} inputMode="numeric" placeholder="Enter pincode to check" className="flex-1 px-3 py-2.5 text-sm outline-none" aria-label="Pincode" />
            <button onClick={checkPin} className="border-l border-neutral-300 px-4 text-sm font-semibold">CHECK</button>
          </div>
          {pinMsg && (
            <p className={`mt-2 flex items-center gap-1 px-3 py-2 text-xs ${pinMsg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-sale"}`}>
              <PinIcon className="h-4 w-4" /> {pinMsg.text}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm">
          <span className="font-semibold">SHARE</span>
          {share.map(({ label, Icon, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Share on ${label}`} className="hover:text-brand"><Icon /></a>
          ))}
        </div>

        {offers.length > 0 && (
          <div className="mt-6 border border-neutral-300 p-5">
            <p className="mb-3 border-b pb-3 text-sm font-semibold uppercase text-sale">Best offers for you!</p>
            <ul className="space-y-3">
              {offers.map((o) => (
                <li key={o.code} className="text-sm">
                  <p className="font-semibold">{o.description}</p>
                  <p className="text-neutral-600">Use code: <span className="border border-dashed border-brand px-2 py-0.5 font-mono font-semibold text-brand">{o.code}</span></p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
