import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { pair } from "@/lib/match";

export async function POST(req: Request) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }
  const people = await sql`select id, display_name from participants order by created_at`;
  if (people.length < 2) return NextResponse.json({ error: "Need at least two people." }, { status: 400 });

  const pairs = pair(people);
  await sql`delete from assignments`;
  for (const p of pairs) {
    await sql`insert into assignments (giver_id, receiver_id) values (${p.a.id}, ${p.b.id})`;
  }
  await sql`update campaign set matched_at = now() where id = 1`;
  return NextResponse.json({ ok: true, count: pairs.length });
}
