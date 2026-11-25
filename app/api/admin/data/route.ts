import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }
  const people = await sql`
    select id, display_name, handle, address, design, created_at from participants order by created_at
  `;
  const assignments = await sql`
    select g.display_name as giver, r.display_name as receiver, a.sent_at
    from assignments a
    join participants g on g.id = a.giver_id
    join participants r on r.id = a.receiver_id
    order by g.display_name
  `;
  const campaign = await sql`select matched_at, gifting_ends_at, reveal_at from campaign where id = 1`;
  const cards = await sql`select count(*)::int as n from cards where state <> 'sealed'`;
  return NextResponse.json({ people, assignments, campaign: campaign[0], cards: cards[0]?.n ?? 0 });
}
