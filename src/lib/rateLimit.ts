import "server-only";
import { headers } from "next/headers";

// Simple in-memory limiter (per server instance). Good enough for a single server;
// use Redis/Upstash if you run multiple instances.
const hits = new Map<string, { count: number; reset: number }>();

export async function rateLimit(bucket: string, limit: number, windowMs: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
