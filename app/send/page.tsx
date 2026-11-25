import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import SendForm from "@/components/SendForm";

export const dynamic = "force-dynamic";

export default async function Send() {
  const me = await currentUser();
  if (!me) return <main className="page wrap"><h1>Sign in first.</h1><Link href="/join" className="pill is-gold">Join</Link></main>;

  const a = sql
    ? await sql`select r.display_name as name, r.address from assignments a join participants r on r.id = a.receiver_id where a.giver_id = ${me.id} limit 1`
    : [];
  if (!a[0]) {
    return <main className="page wrap"><p className="eyebrow">No name yet</p><h1>Matching has not run.</h1><Link href="/me" className="pill is-ghost">Back</Link></main>;
  }

  return (
    <main className="page wrap">
      <p className="eyebrow">You are sending to</p>
      <h1>{a[0].name}</h1>
      <p className="muted" style={{ maxWidth: "46ch", lineHeight: 1.6 }}>
        This address belongs to them and no one else sees it. Pay it as a shielded
        payment. The note below goes in the memo.
      </p>
      <SendForm address={a[0].address} />
    </main>
  );
}
