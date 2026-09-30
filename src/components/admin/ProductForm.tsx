"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { saveProduct, type FormState } from "@/app/admin/actions";
import { useFormAction } from "@/components/ui/useFormAction";
import { discountPercent } from "@/lib/utils";

type Cat = { id: string; name: string; parentId: string | null };
type P = {
  id: string; name: string; slug: string; description: string; price: number; mrp: number; stock: number; sku: string | null;
  fabric: string | null; weave: string | null; origin: string | null; care: string | null; dimensions: string | null;
  sizes: string; colors: string; badge: string | null; featured: boolean; isActive: boolean; categoryId: string | null; images: string[];
};

const BADGES = ["", "New Arrival", "Fast Moving", "Bestseller", "Limited Edition", "Handpicked"];
const FABRICS = ["Cotton", "Jacquard", "Velvet", "Chenille", "Linen", "Canvas", "Polycotton", "Jute", "Silk", "Microfibre"];

export default function ProductForm({ categories, product }: { categories: Cat[]; product?: P }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(saveProduct, {});
  const [existing, setExisting] = useState<string[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<{ file: File; url: string }[]>([]);
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [mrp, setMrp] = useState(String(product?.mrp ?? ""));
  const fileInput = useRef<HTMLInputElement>(null);
  const hiddenFiles = useRef<HTMLInputElement>(null);

  // Keep the real <input type=file> in sync with our preview list so the server gets exactly these files.
  useEffect(() => {
    if (!hiddenFiles.current) return;
    const dt = new DataTransfer();
    newFiles.forEach((f) => dt.items.add(f.file));
    hiddenFiles.current.files = dt.files;
  }, [newFiles]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setNewFiles((prev) => [...prev, ...imgs.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const move = (i: number, d: number) =>
    setExisting((arr) => {
      const j = i + d;
      if (j < 0 || j >= arr.length) return arr;
      const copy = [...arr];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const off = discountPercent(Number(price) || 0, Number(mrp) || 0);
  const parentName = (c: Cat) => categories.find((x) => x.id === c.parentId)?.name;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="keepImages" value={JSON.stringify(existing)} />
      <input ref={hiddenFiles} type="file" name="newImages" multiple className="hidden" tabIndex={-1} aria-hidden />

      <div className="space-y-6">
        <section className="card space-y-4">
          <h2 className="font-sans font-semibold">Basic details</h2>
          <div><label className="label">Product name *</label><input name="name" required defaultValue={product?.name} className="input" placeholder="e.g. Jacquard Cushion Cover 16x16 – Teal (Set of 5)" /></div>
          <div><label className="label">Description</label><textarea name="description" rows={6} defaultValue={product?.description} className="input" placeholder="Describe the product: fabric, design, fit, what is included, how to use it…" /></div>
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sans font-semibold">Photos *</h2>
            <p className="text-xs text-neutral-500">First photo is the cover. JPG/PNG/WEBP, up to 8 MB each.</p>
          </div>
          <div
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          >
            {existing.map((url, i) => (
              <div key={url} className="group relative aspect-[4/5] overflow-hidden rounded border bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">Cover</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Move left">◀</button>
                  <button type="button" onClick={() => setExisting((a) => a.filter((u) => u !== url))} aria-label="Remove">✕</button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Move right">▶</button>
                </div>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={f.url} className="group relative aspect-[4/5] overflow-hidden rounded border-2 border-dashed border-brand bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" className="h-full w-full object-cover" />
                {existing.length === 0 && i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">Cover</span>}
                <span className="absolute right-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] text-white">New</span>
                <button type="button" onClick={() => setNewFiles((a) => a.filter((x) => x.url !== f.url))} className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-xs text-white opacity-0 group-hover:opacity-100">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => fileInput.current?.click()} className="flex aspect-[4/5] flex-col items-center justify-center rounded border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-brand hover:text-brand">
              <span className="text-3xl">+</span>Add photos
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </section>

        <section className="card grid gap-4 sm:grid-cols-2">
          <h2 className="font-sans font-semibold sm:col-span-2">Product details</h2>
          <div>
            <label className="label">Fabric</label>
            <input name="fabric" list="fabrics" defaultValue={product?.fabric ?? ""} className="input" placeholder="Cotton, Silk…" />
            <datalist id="fabrics">{FABRICS.map((f) => <option key={f} value={f} />)}</datalist>
          </div>
          <div><label className="label">Design / style</label><input name="weave" defaultValue={product?.weave ?? ""} className="input" placeholder="Jacquard, Printed, Embroidered, Solid…" /></div>
          <div><label className="label">Made in</label><input name="origin" defaultValue={product?.origin ?? ""} className="input" placeholder="Panipat, Haryana" /></div>
          <div><label className="label">Dimensions</label><input name="dimensions" defaultValue={product?.dimensions ?? ""} className="input" placeholder="16 x 16 inches, set of 5" /></div>
          <div className="sm:col-span-2"><label className="label">Wash care</label><input name="care" defaultValue={product?.care ?? ""} className="input" placeholder="Hand wash cold, dry in shade" /></div>
          <div><label className="label">Colours (comma separated)</label><input name="colors" defaultValue={product?.colors} className="input" placeholder="Teal, Beige" /></div>
          <div><label className="label">Sizes (comma separated, if any)</label><input name="sizes" defaultValue={product?.sizes} className="input" placeholder="12x12, 16x16, 18x18 or 3 Seater, 5 Seater" /></div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="card space-y-4">
          <h2 className="font-sans font-semibold">Pricing & stock</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Selling price ₹ *</label><input name="price" type="number" min={1} required value={price} onChange={(e) => setPrice(e.target.value)} className="input" /></div>
            <div><label className="label">MRP ₹</label><input name="mrp" type="number" min={0} value={mrp} onChange={(e) => setMrp(e.target.value)} className="input" /></div>
          </div>
          {off > 0 && <p className="text-sm font-semibold text-sale">Customers see: {off}% OFF</p>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Stock quantity</label><input name="stock" type="number" min={0} defaultValue={product?.stock ?? 1} className="input" /></div>
            <div><label className="label">SKU (optional)</label><input name="sku" defaultValue={product?.sku ?? ""} className="input" /></div>
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="font-sans font-semibold">Organise</h2>
          <div>
            <label className="label">Category</label>
            <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="input">
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{parentName(c) ? `${parentName(c)} › ` : ""}{c.name}</option>)}
            </select>
            <Link href="/admin/categories/new" className="mt-1 inline-block text-xs text-brand hover:underline">+ New category</Link>
          </div>
          <div>
            <label className="label">Badge on photo</label>
            <select name="badge" defaultValue={product?.badge ?? ""} className="input">
              {BADGES.map((b) => <option key={b} value={b}>{b || "— None —"}</option>)}
            </select>
          </div>
          <div><label className="label">URL name (optional)</label><input name="slug" defaultValue={product?.slug} className="input" placeholder="auto from product name" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Visible on website</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured (shown first)</label>
        </section>

        {state.error && <p className="rounded bg-red-50 p-3 text-sm text-sale">{state.error}</p>}
        <div className="flex gap-3">
          <button disabled={pending} className="btn-primary flex-1">{pending ? "Saving…" : product ? "Save changes" : "Publish product"}</button>
          <Link href="/admin/products" className="btn-outline">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
