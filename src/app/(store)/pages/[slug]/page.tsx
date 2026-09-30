import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSettings, type Settings } from "@/lib/settings";
import RichText from "@/components/ui/RichText";
import { Flower, LeafSprig, Paisley } from "@/components/ui/Motifs";
import { MailIcon, PinIcon, WhatsappIcon } from "@/components/ui/Icons";

const PAGES: Record<string, { title: string; key?: keyof Settings }> = {
  "our-story": { title: "Our Story" },
  contact: { title: "Contact Us" },
  faqs: { title: "Frequently Asked Questions", key: "pageFaqs" },
  "shipping-returns": { title: "Shipping & Returns", key: "pageShipping" },
  "privacy-policy": { title: "Privacy Policy", key: "pagePrivacy" },
  terms: { title: "Terms of Use", key: "pageTerms" },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: PAGES[slug]?.title ?? "Page" };
}

function Arch({ src, alt, fallback }: { src: string; alt: string; fallback: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-t-full bg-brand-soft">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="aspect-[4/5] w-full object-cover" />
      ) : (
        <div className="textured flex aspect-[4/5] items-center justify-center">{fallback}</div>
      )}
    </div>
  );
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  const s = await getSettings();

  if (slug === "our-story") {
    return (
      <div className="textured bg-brand-cream">
        <section className="relative overflow-hidden">
          <Flower className="absolute -left-6 top-4 z-10 h-40 w-40 sm:h-52 sm:w-52" petals={16} />
          <LeafSprig className="absolute left-24 top-32 z-10 hidden h-40 -rotate-[70deg] sm:block" />
          <div className="container-x grid items-center gap-12 py-16 md:grid-cols-2">
            <Arch src={s.storyImage} alt={`${s.brandName} founders`} fallback={<Paisley className="h-1/2" />} />
            <div className="max-w-lg">
              <h1 className="font-sans text-4xl font-normal">{s.storyTitle}</h1>
              <p className="mt-6 whitespace-pre-line text-[15px] font-medium leading-relaxed text-ink">{s.storyText}</p>
            </div>
          </div>
        </section>
        <section id="weavers" className="relative overflow-hidden">
          <Paisley className="absolute -right-4 top-10 h-40 rotate-12" />
          <div className="container-x grid items-center gap-12 py-16 md:grid-cols-2">
            <div className="order-2 max-w-lg md:order-1 md:justify-self-end">
              <h2 className="font-sans text-4xl font-normal">{s.story2Title}</h2>
              <p className="mt-6 whitespace-pre-line text-[15px] font-medium leading-relaxed">{s.story2Text}</p>
            </div>
            <div className="order-1 md:order-2">
              <Arch src={s.story2Image} alt="Our weavers" fallback={<Flower className="h-1/2" />} />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (slug === "contact") {
    const wa = s.whatsapp.replace(/\D/g, "");
    return (
      <div className="container-x max-w-3xl py-16">
        <h1 className="mb-8 text-center text-5xl">{page.title}</h1>
        <div className="grid gap-5 sm:grid-cols-3">
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="card text-center hover:border-brand">
            <WhatsappIcon className="mx-auto mb-3 h-7 w-7 text-green-600" />
            <p className="font-semibold">WhatsApp</p>
            <p className="text-sm text-neutral-600">{s.whatsapp}</p>
          </a>
          <a href={`mailto:${s.email}`} className="card text-center hover:border-brand">
            <MailIcon className="mx-auto mb-3 h-7 w-7 text-brand" />
            <p className="font-semibold">Email</p>
            <p className="break-all text-sm text-neutral-600">{s.email}</p>
          </a>
          <div className="card text-center">
            <PinIcon className="mx-auto mb-3 h-7 w-7 text-brand" />
            <p className="font-semibold">Visit us</p>
            <p className="text-sm text-neutral-600">{s.address}</p>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-neutral-600">
          Phone: {s.phone} · {s.hours}
        </p>
      </div>
    );
  }

  return (
    <div className="container-x max-w-3xl py-16">
      <h1 className="mb-8 text-center text-5xl">{page.title}</h1>
      <RichText text={String(s[page.key!])} />
    </div>
  );
}
