import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { cardInclude } from "@/lib/catalog";
import HeroSlider from "@/components/home/HeroSlider";
import ProductCard from "@/components/product/ProductCard";
import { Flower, LeafSprig, Paisley, WovenBorder } from "@/components/ui/Motifs";

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      {href && (
        <Link href={href} className="text-sm link-underline">
          View all
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [s, banners, categories, newest, best] = await Promise.all([
    getSettings(),
    db.banner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.category.findMany({ where: { parentId: null, showInMenu: true }, orderBy: { sortOrder: "asc" } }),
    db.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 8, include: cardInclude }),
    db.product.findMany({ where: { isActive: true }, orderBy: [{ soldCount: "desc" }, { featured: "desc" }], take: 4, include: cardInclude }),
  ]);

  const usps = [
    ["100% Handwoven", "Every piece is woven on a traditional handloom"],
    ["Direct from Weavers", "Fair prices that reach the artisan"],
    ["Secure Payments", "UPI, cards, netbanking & Cash on Delivery"],
    ["Pan-India Delivery", `Free shipping above ₹${s.freeShippingAbove}`],
  ];

  return (
    <>
      <HeroSlider slides={banners} />

      <section className="border-b bg-brand-cream">
        <div className="container-x grid grid-cols-2 gap-6 py-8 text-center lg:grid-cols-4">
          {usps.map(([t, d]) => (
            <div key={t}>
              <p className="font-serif text-xl font-semibold text-brand">{t}</p>
              <p className="mt-1 text-xs text-neutral-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-x py-16">
          <SectionTitle title="Shop by Category" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-brand-soft">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="textured flex h-full items-center justify-center">
                    <Flower className="h-2/5 opacity-80" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                  <p className="font-serif text-2xl font-semibold text-white">{c.name}</p>
                  <p className="text-xs uppercase tracking-widest text-white/80">Shop now →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="container-x py-8">
          <SectionTitle title="New Arrivals" href="/collections/new-arrivals" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Story teaser */}
      <section className="relative mt-16 overflow-hidden bg-brand-cream">
        <WovenBorder />
        <Flower className="absolute -left-10 -top-6 hidden h-44 w-44 opacity-90 md:block" petals={14} />
        <LeafSprig className="absolute -right-4 bottom-0 hidden h-64 rotate-12 md:block" />
        <div className="container-x grid items-center gap-10 py-20 md:grid-cols-2">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-t-full border-8 border-white bg-brand-soft shadow-lg">
            {s.storyImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.storyImage} alt="Our story" className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="textured flex aspect-[4/5] items-center justify-center">
                <Paisley className="h-1/2" />
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Our Story</p>
            <h2 className="text-4xl sm:text-5xl">{s.storyTitle}</h2>
            <p className="mt-5 line-clamp-6 whitespace-pre-line leading-relaxed text-neutral-700">{s.storyText}</p>
            <Link href="/pages/our-story" className="btn-primary mt-8">
              Read our story
            </Link>
          </div>
        </div>
      </section>

      {best.length > 0 && (
        <section className="container-x py-16">
          <SectionTitle title="Bestsellers" href="/collections/bestsellers" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {best.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
