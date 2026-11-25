import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { sealNote } from "@/lib/note";

export async function POST(req: Request) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const b = await req.json().catch(() => ({}));
  const amount = Number(b.amount);
  const note = String(b.note ?? "").slice(0, 200);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10) {
    return NextResponse.json({ error: "Amount must be between 0 and 10 ZEC." }, { status: 400 });
  }
  if (!note.trim()) return NextResponse.json({ error: "Write a note first." }, { status: 400 });

  const a = await sql`select receiver_id from assignments where giver_id = ${me.id} limit 1`;
  if (!a[0]) return NextResponse.json({ error: "You have not been matched yet." }, { status: 409 });

  const id = crypto.randomUUID();
  const existing = await sql`select id from cards where receiver_id = ${a[0].receiver_id} limit 1`;
  if (existing[0]) {
    await sql`
      update cards set amount_zec = ${amount}, note_ciphertext = ${sealNote(existing[0].id, note)},
      state = 'sent', sent_at = now() where id = ${existing[0].id}
    `;
    await sql`update assignments set sent_at = now() where giver_id = ${me.id}`;
    return NextResponse.json({ ok: true, id: existing[0].id });
  }

  await sql`
    insert into cards (id, receiver_id, amount_zec, note_ciphertext, state, sent_at)
    values (${id}, ${a[0].receiver_id}, ${amount}, ${sealNote(id, note)}, 'sent', now())
  `;
  await sql`update assignments set sent_at = now() where giver_id = ${me.id}`;
  return NextResponse.json({ ok: true, id });
}
