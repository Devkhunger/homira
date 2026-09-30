import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { applyFilters, findProducts, getCollectionWhere, getFacetOptions, parseFilters, SORTS, type SortKey } from "@/lib/catalog";
import CollectionBanner from "@/components/product/CollectionBanner";
import CollectionView from "@/components/product/CollectionView";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getCollectionWhere(slug);
  return { title: meta?.name ?? "Collection", description: meta?.description ?? undefined };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const { where, meta } = await getCollectionWhere(slug);
  if (!meta) notFound();

  const sortParam = String(sp.sort ?? "featured");
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : "featured";
  const saleOnly = slug === "sale";

  const [products, facets, all] = await Promise.all([
    findProducts(applyFilters(where, parseFilters(sp)), sort, saleOnly),
    getFacetOptions(where),
    findProducts(where, "price-asc", saleOnly),
  ]);
  const startingAt = all[0]?.price ?? null;

  return (
    <>
      <CollectionBanner
        title={meta.bannerTitle || meta.name}
        subtitle={meta.bannerSubtitle || meta.description}
        image={meta.bannerImage}
        color={meta.bannerColor}
        startingAt={startingAt}
      />
      <h2 className="py-6 text-center font-sans text-sm font-semibold uppercase tracking-[0.15em]">{meta.name}</h2>
      <Suspense>
        <CollectionView products={products} facets={facets} />
      </Suspense>
    </>
  );
}
