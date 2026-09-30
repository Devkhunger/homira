import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function startSession(user: { id: string; role: string }) {
  const token = await signSession({ sub: user.id, role: user.role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Returns the logged-in user (fresh from DB) or null. */
export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
});

export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Only store owners (role ADMIN) pass. Use in every admin page AND admin server action. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/** Safe redirect target: only allow same-site relative paths. */
export function safeNext(next: string | null | undefined, fallback = "/account") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
