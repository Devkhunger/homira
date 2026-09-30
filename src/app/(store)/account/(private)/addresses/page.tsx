import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AddressBook from "@/components/account/AddressBook";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return (
    <>
      <h2 className="mb-6 text-2xl">Saved addresses</h2>
      <AddressBook addresses={addresses} />
    </>
  );
}
