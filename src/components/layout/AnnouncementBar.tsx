"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

type A = { id: string; text: string; link: string | null };

export default function AnnouncementBar({ items }: { items: A[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  const a = items[i];
  const go = (d: number) => setI((x) => (x + d + items.length) % items.length);

  return (
    <div className="textured bg-brand-soft text-white">
      <div className="container-x flex h-10 items-center justify-between text-[13px]">
        <button aria-label="Previous offer" onClick={() => go(-1)} className="p-1 opacity-80 hover:opacity-100" disabled={items.length < 2}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div key={a.id} className="animate-fade-in truncate px-2 text-center">
          {a.link ? (
            <Link href={a.link} className="underline underline-offset-2">
              {a.text}
            </Link>
          ) : (
            a.text
          )}
        </div>
        <button aria-label="Next offer" onClick={() => go(1)} className="p-1 opacity-80 hover:opacity-100" disabled={items.length < 2}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
