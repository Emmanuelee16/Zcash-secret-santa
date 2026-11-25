import Link from "next/link";
import { headers } from "next/headers";
import { currentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function Me() {
  const me = await currentUser();
  const h = await headers();
  const host = h.get("host") ?? "zcash-secret-santa.vercel.app";
  const link = `${host.includes("localhost") ? "http" : "https"}://${host}/me`;

  if (!me) {
    return (
      <main className="page wrap page-center">
        <section className="sheet sheet-narrow">
          <div className="sheet-head">
            <strong>Your ticket</strong>
            <span>2026</span>
          </div>
          <h1 className="sheet-title">You are not in the hat yet.</h1>
          <p className="sheet-text">
            Join the exchange, or come back with the display name and PIN you
            used the first time.
          </p>
          <div className="ticket-actions">
            <Link href="/join" className="pill is-ink">Join</Link>
            <Link href="/recover" className="pill is-ghost">Find my link</Link>
          </div>
        </section>
      </main>
    );
  }

  const assignment = sql
    ? await sql`select r.display_name as name, r.address, a.sent_at from assignments a join participants r on r.id = a.receiver_id where a.giver_id = ${me.id} limit 1`
    : [];
  const mine = sql ? await sql`select id, state from cards where receiver_id = ${me.id} limit 1` : [];

  const giving = assignment[0];
  const status = giving ? (giving.sent_at ? "Card sent" : "Card not sent yet") : "Waiting for a name";

  return (
    <main className="page wrap page-center">
      <section className="sheet ticket">
        <div className="ticket-main">
          <div className="sheet-head">
            <strong>Your ticket</strong>
            <span>2026</span>
          </div>

          <p className="ticket-label">Signed in as</p>
          <h1 className="ticket-name">{me.display_name}</h1>
          <div className="ticket-status">
            <span className={`badge ${giving?.sent_at ? "ok" : "wait"}`}>{status}</span>
          </div>

          {giving ? (
            <div className="ticket-block">
              <p className="ticket-label">You are sending to</p>
              <p className="ticket-name">{giving.name}</p>
              <p className="ticket-text">
                Only you can see this name and their shielded address. Write the
                card, then pay it from your wallet.
              </p>
              <div className="ticket-actions">
                <Link href="/send" className="pill is-ink">
                  {giving.sent_at ? "Send again" : "Write the card"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="ticket-block">
              <p className="ticket-label">Next</p>
              <p className="ticket-text">
                Your name is in the hat. When matching runs, one name appears
                here with a link to write their card.
              </p>
            </div>
          )}

          {mine[0] && (
            <div className="gift-arrived">
              <div className="seal">Z</div>
              <div>
                <p className="ticket-label">A gift arrived</p>
                <p className="ticket-text">Someone sent you a card.</p>
              </div>
              <Link href={`/card/${mine[0].id}`} className="pill is-ink">
                Open it
              </Link>
            </div>
          )}
        </div>

        <aside className="ticket-stub">
          <p className="ticket-label">Your page</p>
          <p className="mono">{link.replace(/^https?:\/\//, "")}</p>
          <CopyButton value={link} label="Copy link" />
          <p className="ticket-note">
            Bookmark it. The sign-in lives in this browser, so you will need your
            name and PIN on a new device.
          </p>
        </aside>
      </section>
    </main>
  );
}
