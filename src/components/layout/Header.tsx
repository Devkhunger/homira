import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { HomiraMark } from "@/components/ui/HomiraLogo";
import { UserIcon } from "@/components/ui/Icons";
import { CartButton, MobileMenu, SearchBox } from "./HeaderClient";

export type NavItem = { label: string; href: string; highlight?: boolean; children?: { label: string; href: string }[] };

export default async function Header() {
  const [s, user, cats] = await Promise.all([
    getSettings(),
    getCurrentUser(),
    db.category.findMany({
      where: { showInMenu: true, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { children: { where: { showInMenu: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
    }),
  ]);

  const nav: NavItem[] = [
    { label: "Sale", href: "/collections/sale", highlight: true },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    ...cats.map((c) => ({
      label: c.name,
      href: `/collections/${c.slug}`,
      children: c.children.map((ch) => ({ label: ch.name, href: `/collections/${ch.slug}` })),
    })),
    { label: "Our Story", href: "/pages/our-story" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="container-x flex h-[72px] items-center gap-4">
        <MobileMenu nav={nav} brandName={s.brandName} isAdmin={user?.role === "ADMIN"} />

        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${s.brandName} home`}>
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt={s.brandName} className="h-10 w-auto" />
          ) : (
            <span className="flex items-center gap-2 text-brand">
              <HomiraMark className="h-10 w-auto" />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[28px] font-semibold">{s.brandName}</span>
                <span className="hidden text-[10.5px] italic tracking-wide 2xl:block">{s.tagline}</span>
              </span>
            </span>
          )}
        </Link>

        <nav className="hidden flex-1 justify-center lg:flex" aria-label="Main">
          <ul className="flex items-center gap-4 whitespace-nowrap text-[13.5px] 2xl:gap-6">
            {nav.map((n) => (
              <li key={n.href} className={`group relative ${n.href === "/pages/our-story" ? "hidden 2xl:block" : ""}`}>
                <Link
                  href={n.href}
                  className={`py-6 transition hover:text-brand ${n.highlight ? "font-serif text-[17px] text-sale" : "text-ink"}`}
                >
                  {n.label}
                </Link>
                {n.children && n.children.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-50 min-w-[200px] -translate-x-1/2 border border-neutral-200 bg-white py-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    {n.children.map((c) => (
                      <Link key={c.href} href={c.href} className="block px-5 py-2 text-sm hover:bg-brand-cream hover:text-brand">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
          <CartButton />
          <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/account/login"} aria-label="Account" className="relative hover:text-brand">
            <UserIcon className="h-6 w-6" />
            {user && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-600" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
