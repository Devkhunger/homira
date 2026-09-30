import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Flower, LeafSprig, Paisley, WovenBorder } from "@/components/ui/Motifs";
import { FacebookIcon, InstagramIcon, PinterestIcon, YoutubeIcon } from "@/components/ui/Icons";

export default async function Footer() {
  const s = await getSettings();
  const wa = s.whatsapp.replace(/\D/g, "");
  const socials = [
    { href: s.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: s.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: s.youtube, Icon: YoutubeIcon, label: "YouTube" },
    { href: s.pinterest, Icon: PinterestIcon, label: "Pinterest" },
  ].filter((x) => x.href);

  const cols = [
    {
      title: "Need Help",
      links: [
        ["FAQs", "/pages/faqs"],
        ["Track Order", "/track-order"],
        ["Shipping & Returns", "/pages/shipping-returns"],
        ["My Account", "/account"],
      ],
    },
    {
      title: "About Us",
      links: [
        ["Our Story", "/pages/our-story"],
        ["Our Weavers", "/pages/our-story#weavers"],
        ["All Products", "/collections/all"],
        ["Bestsellers", "/collections/bestsellers"],
      ],
    },
    {
      title: "Company",
      links: [
        ["Privacy Policy", "/pages/privacy-policy"],
        ["Terms Of Use", "/pages/terms"],
        ["Contact Us", "/pages/contact"],
      ],
    },
  ];

  return (
    <footer className="textured relative mt-20 overflow-hidden bg-brand-soft text-ink">
      <WovenBorder />
      <div className="container-x relative z-10 grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h3 className="mb-4 font-sans text-xs font-bold uppercase tracking-wider">Get in touch</h3>
          <p className="mb-3 text-sm">
            Whatsapp:{" "}
            <a href={`https://wa.me/${wa}`} className="link-underline" target="_blank" rel="noreferrer">
              {s.whatsapp}
            </a>
          </p>
          <p className="mb-3 text-sm">{s.hours}</p>
          <p className="mb-5 text-sm">
            Email:{" "}
            <a href={`mailto:${s.email}`} className="link-underline">
              {s.email}
            </a>
          </p>
          <div className="flex gap-4">
            {socials.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="hover:text-brand">
                <Icon />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="mb-4 font-sans text-xs font-bold uppercase tracking-wider">{c.title}</h3>
            <ul className="space-y-3 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Decorative illustrated garden */}
      <div className="pointer-events-none relative h-48 sm:h-56" aria-hidden>
        <LeafSprig className="absolute -bottom-6 left-[2%] h-56 rotate-[-12deg] opacity-90" />
        <Flower className="absolute bottom-4 left-[16%] h-28 w-28" petals={14} />
        <Paisley className="absolute -bottom-4 left-[33%] h-36 rotate-12" />
        <Flower className="absolute bottom-10 left-[48%] h-20 w-20" petals={10} />
        <LeafSprig className="absolute -bottom-10 left-[58%] h-60 rotate-[18deg]" />
        <Flower className="absolute -bottom-6 right-[16%] h-40 w-40" petals={16} />
        <Paisley className="absolute bottom-2 right-[2%] h-32 -rotate-12" />
      </div>
      <p className="absolute bottom-3 left-0 right-0 z-10 text-center text-xs">
        © {new Date().getFullYear()} {s.brandName}{s.parentCompany && <> · A brand of {s.parentCompany}</>}. All rights reserved.
        {s.gstin && <span> · GSTIN: {s.gstin}</span>}
      </p>
    </footer>
  );
}
