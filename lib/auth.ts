import crypto from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

export function token() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function pinHash(pin: string, name: string) {
  return crypto.createHash("sha256").update(`${pin.trim()}:${name.trim().toLowerCase()}`).digest("hex");
}

export const COOKIE = "ss_token";

export type Me = {
  id: string;
  display_name: string;
  handle: string | null;
  address: string;
  design: number;
};

export async function currentUser(): Promise<Me | null> {
  if (!sql) return null;
  const store = await cookies();
  const t = store.get(COOKIE)?.value;
  if (!t) return null;
  const rows = await sql`
    select id, display_name, handle, address, design
    from participants where token_hash = ${sha(t)} limit 1
  `;
  return (rows[0] as Me) ?? null;
}
