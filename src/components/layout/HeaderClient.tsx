"use client";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { BagIcon, ChevronDown, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/Icons";
import type { NavItem } from "./Header";

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <>
      <form onSubmit={submit} className="hidden items-center border border-ink md:flex" role="search">
        <button type="submit" aria-label="Search" className="px-2.5">
          <SearchIcon className="h-4 w-4" />
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sarees, dupattas…"
          className="w-40 py-2 pr-3 text-sm outline-none xl:w-56"
          aria-label="Search products"
        />
      </form>
      <button className="md:hidden" aria-label="Open search" onClick={() => setOpen((o) => !o)}>
        <SearchIcon className="h-6 w-6" />
      </button>
      {open && (
        <form onSubmit={submit} className="absolute inset-x-0 top-full flex border-b border-neutral-200 bg-white p-3 md:hidden">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="input" />
          <button className="btn-dark ml-2 px-4">Go</button>
        </form>
      )}
    </>
  );
}

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative hover:text-brand">
      <BagIcon className="h-6 w-6" />
      {ready && count > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function MobileMenu({ nav, brandName, isAdmin }: { nav: NavItem[]; brandName: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
        <MenuIcon className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-white shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-serif text-xl font-semibold uppercase tracking-widest">{brandName}</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <ul className="divide-y">
              {nav.map((n) => (
                <li key={n.href}>
                  <div className="flex items-center justify-between">
                    <Link href={n.href} className={`block flex-1 px-5 py-4 ${n.highlight ? "text-sale" : ""}`}>
                      {n.label}
                    </Link>
                    {n.children && n.children.length > 0 && (
                      <button className="px-5 py-4" aria-label={`Expand ${n.label}`} onClick={() => setExpanded(expanded === n.href ? null : n.href)}>
                        <ChevronDown className={`h-4 w-4 transition ${expanded === n.href ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  {expanded === n.href &&
                    n.children?.map((c) => (
                      <Link key={c.href} href={c.href} className="block bg-brand-cream px-8 py-3 text-sm">
                        {c.label}
                      </Link>
                    ))}
                </li>
              ))}
              <li><Link href="/account" className="block px-5 py-4">My Account</Link></li>
              <li><Link href="/track-order" className="block px-5 py-4">Track Order</Link></li>
              {isAdmin && <li><Link href="/admin" className="block px-5 py-4 font-semibold text-brand">Owner Dashboard</Link></li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
