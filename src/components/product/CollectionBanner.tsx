import { formatINR } from "@/lib/utils";

/** Full-width collection hero, e.g. "COTTON SAREES | starting at ₹999". */
export default function CollectionBanner({
  title,
  subtitle,
  image,
  color,
  startingAt,
}: {
  title: string;
  subtitle?: string | null;
  image?: string | null;
  color?: string | null;
  startingAt?: number | null;
}) {
  if (image) {
    return (
      <section className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-[220px] w-full object-cover sm:h-[300px] lg:h-[340px]" />
      </section>
    );
  }
  return (
    <section
      className="textured flex h-[220px] w-full items-center justify-center sm:h-[300px] lg:h-[300px]"
      style={{ backgroundColor: color || "rgb(var(--soft))" }}
    >
      <div className="flex items-center gap-6 px-4 sm:gap-12">
        <h1 className="max-w-[260px] text-right font-serif text-4xl font-bold uppercase leading-[0.95] text-white drop-shadow-sm sm:text-6xl">
          {title}
        </h1>
        <div className="h-28 w-px bg-ink/60 sm:h-36" />
        <div className="max-w-sm text-ink">
          <p className="font-sans text-lg font-semibold uppercase tracking-[0.12em] sm:text-2xl">{subtitle || "Handwoven collection"}</p>
          {startingAt ? (
            <>
              <p className="mt-1 font-sans text-lg font-semibold uppercase tracking-[0.12em] sm:text-2xl">Starting at</p>
              <p className="font-sans text-5xl font-extrabold sm:text-7xl">
                {formatINR(startingAt).replace(" ", "")}
                <sup className="text-2xl">*</sup>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
