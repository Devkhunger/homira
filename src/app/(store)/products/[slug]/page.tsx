import Link from "next/link";
import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { cardInclude } from "@/lib/catalog";
import { formatDate, splitList } from "@/lib/utils";
import ProductDetail from "@/components/product/ProductDetail";
import ProductCard from "@/components/product/ProductCard";
import ReviewForm from "@/components/product/ReviewForm";
import { StarIcon } from "@/components/ui/Icons";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { include: { parent: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: { images: p.images[0]?.url ? [p.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await load(slug);
  const user = await getCurrentUser();
  if (!p || (!p.isActive && user?.role !== "ADMIN")) notFound();

  const [settings, coupons, related, wish] = await Promise.all([
    getSettings(),
    db.coupon.findMany({ where: { active: true, showOnSite: true }, orderBy: { minOrder: "asc" }, take: 4 }),
    db.product.findMany({
      where: { isActive: true, id: { not: p.id }, categoryId: p.categoryId ?? undefined },
      include: cardInclude,
      take: 4,
      orderBy: { soldCount: "desc" },
    }),
    user ? db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: p.id } } }) : null,
  ]);

  const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;
  const myReview = user ? p.reviews.find((r) => r.userId === user.id) : undefined;
  const details = [
    ["Fabric", p.fabric],
    ["Design", p.weave],
    ["Made in", p.origin],
    ["Dimensions / Size", p.dimensions],
    ["Care", p.care],
    ["SKU", p.sku],
  ].filter(([, v]) => v) as [string, string][];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images.map((i) => i.url),
    description: p.description,
    sku: p.sku ?? p.id,
    brand: { "@type": "Brand", name: settings.brandName },
    offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    ...(p.reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: p.reviews.length } } : {}),
  };

  return (
    <div className="container-x py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {!p.isActive && <p className="mb-4 bg-yellow-100 p-3 text-sm">This product is hidden from customers (visible to you because you are an owner).</p>}

      <ProductDetail
        product={{
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          mrp: p.mrp,
          stock: p.stock,
          sizes: splitList(p.sizes),
          colors: splitList(p.colors),
          images: p.images.map((i) => i.url),
          badge: p.badge,
        }}
        breadcrumbs={[
          { label: "Home", href: "/" },
          ...(p.category?.parent ? [{ label: p.category.parent.name, href: `/collections/${p.category.parent.slug}` }] : []),
          ...(p.category ? [{ label: p.category.name, href: `/collections/${p.category.slug}` }] : []),
          { label: p.name, href: `/products/${p.slug}` },
        ]}
        delivery={{
          days: Number(settings.deliveryDays) || 5,
          expressDays: Number(settings.expressDays) || 2,
          expressPrefixes: splitList(settings.expressPincodes),
          freeAbove: Number(settings.freeShippingAbove) || 0,
          codEnabled: settings.codEnabled === "true",
        }}
        offers={coupons.map((c) => ({ code: c.code, description: c.description }))}
        wishlisted={Boolean(wish)}
        loggedIn={Boolean(user)}
        rating={{ avg, count: p.reviews.length }}
        siteUrl={siteUrl()}
      >
        <div className="mt-8 space-y-6 border-t pt-6 text-sm leading-relaxed">
          <details open className="group">
            <summary className="cursor-pointer list-none font-semibold uppercase tracking-wide">Description</summary>
            <p className="mt-3 whitespace-pre-line text-neutral-700">{p.description || "—"}</p>
          </details>
          {details.length > 0 && (
            <details open className="border-t pt-6">
              <summary className="cursor-pointer list-none font-semibold uppercase tracking-wide">Product details</summary>
              <dl className="mt-3 grid grid-cols-[140px_1fr] gap-y-2 text-neutral-700">
                {details.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-medium text-ink">{k}</dt>
                    <dd className="whitespace-pre-line">{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
          <p className="border-t pt-6 text-xs text-neutral-500">
            Colours may look slightly different on different screens. As every piece is handcrafted, small variations are natural.
          </p>
        </div>
      </ProductDetail>

      {/* Reviews */}
      <section id="reviews" className="mt-16 border-t pt-10">
        <h2 className="mb-6 text-3xl">Customer Reviews</h2>
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            {p.reviews.length === 0 && <p className="text-sm text-neutral-600">No reviews yet. Be the first to review this product.</p>}
            <ul className="divide-y">
              {p.reviews.map((r) => (
                <li key={r.id} className="py-5">
                  <div className="mb-1 flex items-center gap-1 text-brand-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < r.rating} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="text-sm">{r.comment}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {r.user.name} · {formatDate(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card h-fit">
            {user ? (
              <ReviewForm productId={p.id} existing={myReview ? { rating: myReview.rating, comment: myReview.comment } : null} />
            ) : (
              <p className="text-sm">
                <Link href={`/account/login?next=/products/${p.slug}%23reviews`} className="link-underline font-semibold">
                  Log in
                </Link>{" "}
                to write a review.
              </p>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
