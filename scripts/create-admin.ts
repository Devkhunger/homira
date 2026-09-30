/* Create or promote an owner account.
 * Usage: npm run create-admin -- owner@yourbrand.in "StrongPassword" "Owner Name" */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const [email, password, name = "Owner"] = process.argv.slice(2);
  if (!email) {
    console.error('Usage: npm run create-admin -- email@example.com "password" "Name"');
    process.exit(1);
  }
  const e = email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email: e } });
  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: { role: "ADMIN", ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
    });
    console.log(`✓ ${e} is now an owner${password ? " (password updated)" : ""}`);
  } else {
    if (!password || password.length < 8) {
      console.error("Password (min 8 characters) is required for a new account");
      process.exit(1);
    }
    await db.user.create({ data: { email: e, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`✓ Owner account created for ${e}`);
  }
}

main().finally(() => db.$disconnect());
