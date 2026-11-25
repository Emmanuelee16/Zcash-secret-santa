import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { token, sha, pinHash, COOKIE } from "@/lib/auth";
import { addressKind } from "@/lib/zcash";

const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function POST(req: Request) {
  if (!sql) return err("Database not configured", 503);
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const handle = String(b.handle ?? "").trim() || null;
  const address = String(b.address ?? "").trim();
  const pin = String(b.pin ?? "").trim();

  if (name.length < 2 || name.length > 24) return err("Name must be 2 to 24 characters.");
  if (!/^\d{4,8}$/.test(pin)) return err("PIN must be 4 to 8 digits.");
  const kind = addressKind(address);
  if (!kind) return err("That does not look like a Zcash address.");
  if (kind === "transparent") return err("Use a shielded address, u1 or zs1. A t-address drops the memo.");

  const t = token();
  try {
    const count = await sql`select count(*)::int as n from participants`;
    const design = (count[0]?.n ?? 0) % 5;
    await sql`
      insert into participants (display_name, handle, address, address_kind, pin_hash, design, token_hash)
      values (${name}, ${handle}, ${address}, ${kind}, ${pinHash(pin, name)}, ${design}, ${sha(t)})
    `;
  } catch (e) {
    const m = String(e);
    if (m.includes("duplicate")) return err("That name is taken. Pick another.");
    return err("Could not save. Try again.", 500);
  }

  const store = await cookies();
  store.set(COOKIE, t, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 120,
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ ok: true });
}
