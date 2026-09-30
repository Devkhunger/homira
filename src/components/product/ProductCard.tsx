import Link from "next/link";
import type { CardProduct } from "@/lib/catalog";
import { discountPercent, formatINR, splitList } from "@/lib/utils";
import QuickAdd from "./QuickAdd";

export function Price({ price, mrp, size = "sm" }: { price: number; mrp: number; size?: "sm" | "lg" }) {
  const off = discountPercent(price, mrp);
  return (
    <p className={size === "lg" ? "text-lg" : "text-[13px]"}>
      <span className="font-semibold">MRP : </span>
      {off > 0 ? (
        <>
          <span className="text-sale">{formatINR(price)}</span>{" "}
          <span className="text-neutral-500 line-through">{formatINR(mrp)}</span>{" "}
          <span className="font-semibold text-sale">{off}% OFF</span>
        </>
      ) : (
        <span>{formatINR(price)}</span>
      )}
    </p>
  );
}

export default function ProductCard({ p, compact = false }: { p: CardProduct; compact?: boolean }) {
  const img = p.images[0]?.url;
  const hover = p.images[1]?.url;
  const needsOptions = splitList(p.sizes).length > 0 || splitList(p.colors).length > 1;
  const soldOut = p.stock <= 0;

  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden bg-brand-cream">
        <Link href={`/products/${p.slug}`} aria-label={p.name}>
          {img ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={p.name} loading="lazy" className={`h-full w-full object-cover transition duration-500 ${hover ? "group-hover:opacity-0" : "group-hover:scale-105"}`} />
              {hover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">No image</div>
          )}
        </Link>
        {p.badge && !soldOut && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{p.badge}</span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 bg-neutral-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Sold out</span>
        )}
        {!soldOut && (
          <QuickAdd
            needsOptions={needsOptions}
            item={{ productId: p.id, slug: p.slug, name: p.name, image: img ?? null, price: p.price, mrp: p.mrp, quantity: 1, color: splitList(p.colors)[0] ?? null }}
          />
        )}
      </div>
      <Link href={`/products/${p.slug}`} className="mt-3 block">
        <h3 className={`truncate font-sans ${compact ? "text-[12px]" : "text-[13px]"} text-ink group-hover:text-brand`}>{p.name}</h3>
      </Link>
      <div className="mt-1">
        <Price price={p.price} mrp={p.mrp} />
      </div>
    </div>
  );
}
