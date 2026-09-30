import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "@/components/account/LoginForms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERRORS: Record<string, string> = {
  google_failed: "Google sign-in failed. Please try again.",
  google_not_configured: "Google sign-in is not set up yet.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next, "");
  const user = await getCurrentUser();
  if (user) redirect(next || (user.role === "ADMIN" ? "/admin" : "/account"));
  return (
    <div className="container-x max-w-md py-16">
      <h1 className="mb-2 text-center text-4xl">Sign in</h1>
      <p className="mb-8 text-center text-sm text-neutral-600">Access your orders, wishlist and saved addresses.</p>
      <LoginForm next={next} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} initialError={sp.error ? ERRORS[sp.error] : undefined} />
    </div>
  );
}
