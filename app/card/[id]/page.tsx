import Link from "next/link";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { openNote } from "@/lib/note";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sql) return <main className="page wrap"><h1>Card unavailable.</h1></main>;
  const rows = await sql`
    select c.id, c.amount_zec, c.note_ciphertext, c.state, c.receiver_id, p.display_name, p.design
    from cards c join participants p on p.id = c.receiver_id where c.id = ${id} limit 1
  `;
  const card = rows[0];
  if (!card) return <main className="page wrap"><h1>No such card.</h1></main>;

  const me = await currentUser();
  const mine = me?.id === card.receiver_id;
  const note = mine ? openNote(card.id, card.note_ciphertext) : "";

  return (
    <main className="page wrap">
      <p className="eyebrow">{mine ? "For you" : "Sealed"}</p>
      <h1 style={{ marginBottom: 30 }}>{mine ? "Someone chose you." : "A card is waiting."}</h1>

      <div style={{ maxWidth: "520ch" }}>
        <div className={`giftcard design-${(card.design ?? 0) % 5}`} style={{ transform: "rotate(0deg)" }}>
          <div className="gc-shape" />
          <div className="gc-top"><span>Zcash Secret Santa</span><span>2026</span></div>
          <div className="gc-msg">
            {mine ? note : "This card opens for the person it was sent to. Whoever they are, someone thought of them."}
          </div>
          <div className="gc-bot">
            <div>
              <div className="gc-amt">{mine ? `${Number(card.amount_zec).toFixed(4)} ZEC` : "Sealed"}</div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>
                {mine ? "paid to your address" : "not yours to open"}
              </div>
            </div>
            <div className="seal">Z</div>
          </div>
        </div>
      </div>

      {mine ? (
        <p className="muted" style={{ marginTop: 26, maxWidth: "52ch", lineHeight: 1.6 }}>
          The ZEC is already in the wallet behind the address you gave us. Open it,
          and the memo is in there too. The sender stays anonymous unless they
          choose to tell you.
        </p>
      ) : (
        <p className="muted" style={{ marginTop: 26 }}>
          <Link href="/me" style={{ color: "var(--zec-gold)" }}>Sign in</Link> if this is yours.
        </p>
      )}
    </main>
  );
}
