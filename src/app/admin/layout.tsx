import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { logout } from "@/app/(store)/account/actions";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Owner Dashboard", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([requireAdmin(), getSettings()]);
  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      <aside className="border-b bg-ink text-white lg:fixed lg:inset-y-0 lg:w-60 lg:border-b-0">
        <div className="flex items-center justify-between p-5 lg:block">
          <Link href="/admin" className="block">
            <p className="font-serif text-xl font-semibold uppercase tracking-widest">{s.brandName}</p>
            <p className="text-xs text-white/60">Owner Dashboard</p>
          </Link>
        </div>
        <AdminNav />
        <div className="hidden border-t border-white/10 p-5 text-xs text-white/70 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="truncate">Signed in as {user.email ?? user.name}</p>
          <div className="mt-2 flex gap-4">
            <Link href="/" className="underline">View store</Link>
            <form action={logout}><button className="underline">Log out</button></form>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8 lg:ml-60">{children}</main>
    </div>
  );
}
