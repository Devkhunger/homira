import { cookies } from "next/headers";
import { siteUrl } from "@/lib/site";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeNext, startSession } from "@/lib/auth";

export async function GET(req: Request) {
  const site = siteUrl();
  const params = new URL(req.url).searchParams;
  const jar = await cookies();
  const fail = () => NextResponse.redirect(new URL("/account/login?error=google_failed", site));

  const state = jar.get("g_state")?.value;
  if (!state || state !== params.get("state") || !params.get("code")) return fail();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: params.get("code")!,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${site}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail();
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return fail();

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
  if (!infoRes.ok) return fail();
  const info = (await infoRes.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string };
  if (!info.sub || !info.email || !info.email_verified) return fail();

  const email = info.email.toLowerCase();
  let user = await db.user.findUnique({ where: { googleId: info.sub } });
  if (!user) {
    const byEmail = await db.user.findUnique({ where: { email } });
    user = byEmail
      ? await db.user.update({ where: { id: byEmail.id }, data: { googleId: info.sub } })
      : await db.user.create({ data: { googleId: info.sub, email, name: info.name || email.split("@")[0], role: "CUSTOMER" } });
  }

  await startSession(user);
  const next = safeNext(jar.get("g_next")?.value, user.role === "ADMIN" ? "/admin" : "/account");
  jar.delete("g_state");
  jar.delete("g_next");
  return NextResponse.redirect(new URL(next, site));
}
