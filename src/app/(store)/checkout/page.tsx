import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { razorpayEnabled } from "@/lib/razorpay";
import CheckoutClient from "@/components/cart/CheckoutClient";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const [addresses, s] = await Promise.all([
    db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    getSettings(),
  ]);
  return (
    <CheckoutClient
      addresses={addresses}
      user={{ name: user.name, email: user.email, phone: user.phone }}
      online={razorpayEnabled()}
      cod={s.codEnabled === "true"}
      codFee={Number(s.codFee) || 0}
      brandName={s.brandName}
    />
  );
}
