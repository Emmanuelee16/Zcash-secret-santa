import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { token, sha, pinHash, COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const pin = String(b.pin ?? "").trim();
  const rows = await sql`select id from participants where lower(display_name) = lower(${name}) limit 1`;
  if (!rows[0]) return NextResponse.json({ error: "No one by that name." }, { status: 404 });
  const good = await sql`
    select id from participants where id = ${rows[0].id} and pin_hash = ${pinHash(pin, name)} limit 1
  `;
  if (!good[0]) return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });

  const t = token();
  await sql`update participants set token_hash = ${sha(t)} where id = ${rows[0].id}`;
  const store = await cookies();
  store.set(COOKIE, t, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 120,
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ ok: true });
}
