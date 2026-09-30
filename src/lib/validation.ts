import { z } from "zod";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, ""))
  .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number");

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter full name").max(80),
  phone: phoneSchema,
  line1: z.string().trim().min(3, "Enter house / street").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter city").max(60),
  state: z.string().refine((s) => INDIAN_STATES.includes(s), "Choose a state"),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.union([z.literal("on"), z.literal("true"), z.boolean()]).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
