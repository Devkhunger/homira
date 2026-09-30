"use server";
import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { hashPassword, safeNext, startSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { sendOtpSms } from "@/lib/sms";
import { phoneSchema } from "@/lib/validation";

export type AuthState = { error?: string; info?: string; step?: "otp"; phone?: string };

const nextFor = (role: string, next: FormDataEntryValue | null) =>
  safeNext(typeof next === "string" ? next : null, role === "ADMIN" ? "/admin" : "/account");

export async function loginWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  if (!(await rateLimit("login", 10, 15 * 60_000))) return { error: "Too many attempts. Please wait 15 minutes." };
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  await startSession(user);
  redirect(nextFor(user.role, form.get("next")));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: phoneSchema.optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  if (!(await rateLimit("register", 10, 60 * 60_000))) return { error: "Too many sign-ups from your network. Try later." };
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, phone, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists. Please log in." };
  if (phone && (await db.user.findUnique({ where: { phone } }))) return { error: "This mobile number is already registered." };
  // Customers can never make themselves ADMIN; role is always CUSTOMER here.
  const user = await db.user.create({ data: { name, email, phone: phone || null, passwordHash: await hashPassword(password), role: "CUSTOMER" } });
  await startSession(user);
  redirect(nextFor(user.role, form.get("next")));
}

export async function requestOtp(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = phoneSchema.safeParse(String(form.get("phone") || ""));
  if (!parsed.success) return { error: "Enter a valid 10-digit mobile number" };
  const phone = parsed.data;
  if (!(await rateLimit(`otp:${phone}`, 5, 60 * 60_000))) return { error: "Too many OTP requests. Please try after some time." };

  const code = String(randomInt(100000, 1000000));
  await db.otpCode.deleteMany({ where: { phone } });
  await db.otpCode.create({ data: { phone, codeHash: await bcrypt.hash(code, 8), expiresAt: new Date(Date.now() + 10 * 60_000) } });
  try {
    await sendOtpSms(phone, code);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not send OTP" };
  }
  return {
    step: "otp",
    phone,
    info: process.env.MSG91_AUTH_KEY ? `OTP sent to +91 ${phone}` : `Development mode: the OTP is printed in the server console.`,
  };
}

export async function verifyOtp(_: AuthState, form: FormData): Promise<AuthState> {
  const phone = String(form.get("phone") || "");
  const code = String(form.get("code") || "").trim();
  const name = String(form.get("name") || "").trim();
  const rec = await db.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (!rec || rec.expiresAt < new Date()) return { step: "otp", phone, error: "OTP expired. Please request a new one." };
  if (rec.attempts >= 5) return { step: "otp", phone, error: "Too many wrong attempts. Request a new OTP." };
  if (!(await bcrypt.compare(code, rec.codeHash))) {
    await db.otpCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    return { step: "otp", phone, error: "Incorrect OTP." };
  }
  await db.otpCode.deleteMany({ where: { phone } });
  let user = await db.user.findUnique({ where: { phone } });
  if (!user) user = await db.user.create({ data: { phone, name: name || "Customer", role: "CUSTOMER" } });
  await startSession(user);
  redirect(nextFor(user.role, form.get("next")));
}
