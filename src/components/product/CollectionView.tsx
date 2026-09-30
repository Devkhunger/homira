"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { CardProduct } from "@/lib/catalog";
import ProductCard from "./ProductCard";
import { ChevronDown, CloseIcon, Grid2Icon, Grid3Icon, ListIcon } from "@/components/ui/Icons";

type Facets = { fabrics: string[]; colors: string[]; maxPrice: number };

const SORT_OPTIONS: [string, string][] = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["bestselling", "Best Selling"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
];

export default function CollectionView({ products, facets }: { products: CardProduct[]; facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [cols, setCols] = useState(4);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem("hl_grid"));
    if ([2, 3, 4].includes(saved)) setCols(saved);
  }, []);
  const chooseCols = (n: number) => {
    setCols(n);
    localStorage.setItem("hl_grid", String(n));
  };

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) (v ? next.set(k, v) : next.delete(k));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const sort = params.get("sort") ?? "featured";
  const activeFilters = ["min", "max", "fabric", "color", "stock"].filter((k) => params.get(k)).length;

  const gridClass = { 2: "grid-cols-2 lg:grid-cols-2", 3: "grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }[cols];

  return (
    <>
      <div className="border-y border-neutral-200">
        <div className="container-x flex h-14 items-center justify-between text-[13px]">
          <div className="flex items-center gap-4 border-r border-neutral-200 pr-6">
            {[
              [2, Grid2Icon, "Large grid"],
              [3, Grid3Icon, "Medium grid"],
              [4, ListIcon, "Compact grid"],
            ].map(([n, Icon, label]) => {
              const I = Icon as typeof Grid2Icon;
              return (
                <button key={n as number} onClick={() => chooseCols(n as number)} aria-label={label as string} aria-pressed={cols === n} className={cols === n ? "text-ink" : "text-neutral-400 hover:text-ink"}>
                  <I className="h-[18px] w-[18px]" />
                </button>
              );
            })}
          </div>
          <span className="text-neutral-600">{products.length} products</span>
          <div className="flex h-full items-center">
            <div className="relative h-full border-l border-neutral-200">
              <button onClick={() => setSortOpen((o) => !o)} className="flex h-full items-center gap-1 px-6 text-neutral-600 hover:text-ink">
                Sort by <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-30 w-52 border border-neutral-200 bg-white py-2 shadow-lg">
                  {SORT_OPTIONS.map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => {
                        update({ sort: k === "featured" ? null : k });
                        setSortOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left hover:bg-brand-cream ${sort === k ? "font-semibold text-brand" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setFilterOpen(true)} className="h-full border-l border-neutral-200 pl-6 text-neutral-600 hover:text-ink">
              Filter{activeFilters > 0 && ` (${activeFilters})`}
            </button>
          </div>
        </div>
      </div>

      <div className="container-x py-8">
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-4 text-neutral-600">No products found.</p>
            {activeFilters > 0 && (
              <button className="btn-outline" onClick={() => router.push(pathname)}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-x-5 gap-y-10 ${gridClass}`}>
            {products.map((p) => (
              <ProductCard key={p.id} p={p} compact={cols === 4} />
            ))}
          </div>
        )}
      </div>

      {filterOpen && <FilterDrawer facets={facets} onClose={() => setFilterOpen(false)} onApply={update} params={params} />}
    </>
  );
}

function FilterDrawer({
  facets,
  onClose,
  onApply,
  params,
}: {
  facets: Facets;
  onClose: () => void;
  onApply: (c: Record<string, string | null>) => void;
  params: URLSearchParams | ReturnType<typeof useSearchParams>;
}) {
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [fabric, setFabric] = useState<string[]>(params.get("fabric")?.split(",").filter(Boolean) ?? []);
  const [color, setColor] = useState<string[]>(params.get("color")?.split(",").filter(Boolean) ?? []);
  const [stock, setStock] = useState(params.get("stock") === "1");
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const apply = () => {
    onApply({ min: min || null, max: max || null, fabric: fabric.join(",") || null, color: color.join(",") || null, stock: stock ? "1" : null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl animate-fade-in">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-2xl">Filter</h2>
          <button onClick={onClose} aria-label="Close filters"><CloseIcon className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto p-5 text-sm">
          <section>
            <h3 className="label">Price (₹)</h3>
            <div className="flex items-center gap-2">
              <input className="input" inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} />
              <span>–</span>
              <input className="input" inputMode="numeric" placeholder={`Max ${facets.maxPrice || ""}`} value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} />
            </div>
          </section>
          {facets.fabrics.length > 0 && (
            <section>
              <h3 className="label">Fabric</h3>
              <div className="space-y-2">
                {facets.fabrics.map((f) => (
                  <label key={f} className="flex items-center gap-2">
                    <input type="checkbox" checked={fabric.includes(f)} onChange={() => toggle(fabric, setFabric, f)} className="accent-[rgb(var(--brand))]" /> {f}
                  </label>
                ))}
              </div>
            </section>
          )}
          {facets.colors.length > 0 && (
            <section>
              <h3 className="label">Colour</h3>
              <div className="flex flex-wrap gap-2">
                {facets.colors.map((c) => (
                  <button key={c} onClick={() => toggle(color, setColor, c)} className={`border px-3 py-1.5 ${color.includes(c) ? "border-brand bg-brand text-white" : "border-neutral-300"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </section>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} className="accent-[rgb(var(--brand))]" /> In stock only
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t p-5">
          <button
            className="btn-outline"
            onClick={() => {
              onApply({ min: null, max: null, fabric: null, color: null, stock: null });
              onClose();
            }}
          >
            Clear
          </button>
          <button className="btn-dark" onClick={apply}>Apply</button>
        </div>
      </aside>
    </div>
  );
}
