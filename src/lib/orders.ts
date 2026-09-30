import "server-only";
import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export function newOrderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `ORD-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export class StockError extends Error {}

/** Decrements stock atomically; throws StockError if any item ran out meanwhile. */
export async function reserveStock(tx: Prisma.TransactionClient, items: { productId: string | null; quantity: number; name: string }[]) {
  for (const i of items) {
    if (!i.productId) continue;
    const r = await tx.product.updateMany({
      where: { id: i.productId, stock: { gte: i.quantity } },
      data: { stock: { decrement: i.quantity }, soldCount: { increment: i.quantity } },
    });
    if (r.count === 0) throw new StockError(`"${i.name}" just went out of stock`);
  }
}

export async function restoreStock(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  for (const i of items) {
    if (!i.productId) continue;
    await db.product.updateMany({
      where: { id: i.productId },
      data: { stock: { increment: i.quantity }, soldCount: { decrement: i.quantity } },
    });
  }
}
