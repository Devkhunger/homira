import { NextResponse } from "next/server";
import { buildQuote, type CartInput } from "@/lib/pricing";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { items?: CartInput[]; coupon?: string };
  const quote = await buildQuote(Array.isArray(body.items) ? body.items : [], body.coupon);
  return NextResponse.json(quote);
}
