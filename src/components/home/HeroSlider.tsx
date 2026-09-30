"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

type Slide = { id: string; title: string; subtitle: string | null; image: string | null; bgColor: string | null; link: string | null; cta: string | null };

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;
  const s = slides[i];
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);

  const content = (
    <div
      key={s.id}
      className="textured relative flex h-[360px] w-full animate-fade-in items-center overflow-hidden sm:h-[460px] lg:h-[520px]"
      style={{ backgroundColor: s.bgColor || "rgb(var(--soft))" }}
    >
      {s.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className={`container-x relative z-10 ${s.image ? "" : ""}`}>
        <div className={`max-w-xl ${s.image ? "bg-white/85 p-8 backdrop-blur-sm" : ""}`}>
          <h2 className={`font-serif text-4xl font-bold leading-tight sm:text-6xl ${s.image ? "text-ink" : "text-white drop-shadow"}`}>{s.title}</h2>
          {s.subtitle && <p className={`mt-4 text-base sm:text-lg ${s.image ? "text-neutral-700" : "text-ink"}`}>{s.subtitle}</p>}
          {s.link && <span className="btn-dark mt-7">{s.cta || "Shop now"}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative">
      {s.link ? <Link href={s.link}>{content}</Link> : content}
      {slides.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white">
            <ChevronLeft />
          </button>
          <button onClick={() => go(1)} aria-label="Next slide" className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white">
            <ChevronRight />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((sl, n) => (
              <button key={sl.id} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-ink" : "w-2 bg-ink/40"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
