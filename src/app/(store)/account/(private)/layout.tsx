import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "../actions";

const LINKS = [
  ["/account", "Overview"],
  ["/account/orders", "My Orders"],
  ["/account/wishlist", "Wishlist"],
  ["/account/addresses", "Addresses"],
  ["/account/profile", "Profile & Password"],
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="container-x py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-600">Namaste,</p>
          <h1 className="text-4xl">{user.name}</h1>
        </div>
        {user.role === "ADMIN" && <Link href="/admin" className="btn-primary">Owner Dashboard</Link>}
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto border-b pb-3 text-sm lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap px-3 py-2 hover:bg-brand-cream hover:text-brand">{label}</Link>
          ))}
          <form action={logout}>
            <button className="whitespace-nowrap px-3 py-2 text-left text-sale hover:bg-red-50">Log out</button>
          </form>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
