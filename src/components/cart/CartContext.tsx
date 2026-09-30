"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  mrp: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (item: CartItem) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const KEY = "hl_cart_v1";
const Ctx = createContext<CartCtx | null>(null);

export const itemKey = (i: Pick<CartItem, "productId" | "size" | "color">) =>
  `${i.productId}|${i.size ?? ""}|${i.color ?? ""}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const k = itemKey(item);
      const found = prev.find((p) => itemKey(p) === k);
      if (found) return prev.map((p) => (itemKey(p) === k ? { ...p, quantity: Math.min(20, p.quantity + item.quantity) } : p));
      return [...prev, item];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => prev.map((p) => (itemKey(p) === key ? { ...p, quantity: Math.max(1, Math.min(20, qty)) } : p)));
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((p) => itemKey(p) !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.reduce((s, i) => s + i.quantity, 0), ready, add, setQty, remove, clear }),
    [items, ready, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
