import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const gifting = b.giftingEndsAt ? new Date(b.giftingEndsAt) : null;
  const reveal = b.revealAt ? new Date(b.revealAt) : null;
  await sql`update campaign set gifting_ends_at = ${gifting}, reveal_at = ${reveal} where id = 1`;
  return NextResponse.json({ ok: true });
}
