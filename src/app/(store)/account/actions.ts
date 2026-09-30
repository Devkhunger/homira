"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { addressSchema } from "@/lib/validation";

export type AddressResult = { ok: boolean; message?: string; errors?: Record<string, string>; address?: { id: string } };

export async function saveAddress(form: FormData): Promise<AddressResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again." };
  const parsed = addressSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
    return { ok: false, errors, message: "Please fix the highlighted fields." };
  }
  const { isDefault, line2, ...data } = parsed.data;
  const id = String(form.get("id") || "");
  const count = await db.address.count({ where: { userId: user.id } });
  const makeDefault = Boolean(isDefault) || count === 0;
  if (makeDefault) await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });

  let address;
  if (id) {
    const own = await db.address.findFirst({ where: { id, userId: user.id } });
    if (!own) return { ok: false, message: "Address not found." };
    address = await db.address.update({ where: { id }, data: { ...data, line2: line2 || null, isDefault: makeDefault || own.isDefault } });
  } else {
    address = await db.address.create({ data: { ...data, line2: line2 || null, isDefault: makeDefault, userId: user.id } });
  }
  revalidatePath("/account/addresses");
  return { ok: true, address: { id: address.id } };
}

export async function deleteAddress(form: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.address.deleteMany({ where: { id: String(form.get("id")), userId: user.id } });
  revalidatePath("/account/addresses");
}

export async function logout() {
  await endSession();
  redirect("/");
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
});

export async function updateProfile(_: unknown, form: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again." };
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "Please enter a valid name and email." };
  const email = parsed.data.email || null;
  if (email && email !== user.email) {
    const taken = await db.user.findUnique({ where: { email } });
    if (taken) return { ok: false, message: "That email is already used by another account." };
  }
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name, email } });
  revalidatePath("/account");
  return { ok: true, message: "Profile updated." };
}

export async function changePassword(_: unknown, form: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again." };
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  if (next.length < 8) return { ok: false, message: "New password must be at least 8 characters." };
  const full = await db.user.findUnique({ where: { id: user.id } });
  if (full?.passwordHash && !(await verifyPassword(current, full.passwordHash))) {
    return { ok: false, message: "Current password is incorrect." };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: true, message: "Password changed." };
}
