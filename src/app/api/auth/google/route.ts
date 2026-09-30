import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  if (!clientId) return NextResponse.redirect(new URL("/account/login?error=google_not_configured", site));

  const state = randomBytes(16).toString("hex");
  const next = safeNext(new URL(req.url).searchParams.get("next"));
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${site}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(url);
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 };
  res.cookies.set("g_state", state, opts);
  res.cookies.set("g_next", next, opts);
  return res;
}
