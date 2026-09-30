"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/orders", "Orders"],
  ["/admin/customers", "Customers"],
  ["/admin/banners", "Home Banners"],
  ["/admin/announcements", "Announcement Bar"],
  ["/admin/coupons", "Coupons & Offers"],
  ["/admin/settings", "Settings"],
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 text-sm lg:flex-col lg:pb-0">
      {LINKS.map(([href, label]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`whitespace-nowrap rounded px-3 py-2 ${active ? "bg-white/15 font-semibold" : "text-white/80 hover:bg-white/10"}`}>
            {label}
          </Link>
        );
      })}
      <Link href="/" className="whitespace-nowrap rounded px-3 py-2 text-white/80 hover:bg-white/10 lg:hidden">View store</Link>
    </nav>
  );
}
