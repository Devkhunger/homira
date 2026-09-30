import { db } from "@/lib/db";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const announcements = await db.announcement.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, text: true, link: true },
  });
  return (
    <>
      <AnnouncementBar items={announcements} />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
