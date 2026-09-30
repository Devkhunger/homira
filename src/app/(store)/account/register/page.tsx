import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { RegisterForm } from "@/components/account/LoginForms";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next, "");
  if (await getCurrentUser()) redirect(next || "/account");
  return (
    <div className="container-x max-w-md py-16">
      <h1 className="mb-2 text-center text-4xl">Create account</h1>
      <p className="mb-8 text-center text-sm text-neutral-600">Order faster, track deliveries and save your favourites.</p>
      <RegisterForm next={next} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
    </div>
  );
}
