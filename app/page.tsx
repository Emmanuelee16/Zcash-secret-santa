import Link from "next/link";
import HeadScene from "@/components/HeadScene";
import CopyButton from "@/components/CopyButton";
import Socials from "@/components/Socials";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function load() {
  if (!sql) return { reveal: null as string | null };
  try {
    const c = await sql`select reveal_at from campaign where id = 1`;
    return { reveal: (c[0]?.reveal_at as string) ?? null };
  } catch {
    return { reveal: null };
  }
}

function revealLabel(d: string | null) {
  if (!d) return "To be announced";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

export default async function Home() {
  const s = await load();
  return (
    <main>
      <section className="hero" id="hero">
        <div className="hero-stage">
          <div className="hero-copy">
            <h1 className="hero-title">
              {"Zecret Zanta".split("").map((ch, i) => (
                <span key={i} className="lt">
                  <span className="ltb">{ch === " " ? "\u00A0" : ch}</span>
                </span>
              ))}
            </h1>
          </div>
          <HeadScene />
          <div className="hero-foot">
            <div className="hero-foot-left">
              <div className="sticker">
                <small>Reveal night</small>
                {revealLabel(s.reveal)}
              </div>
              <p className="hero-note">
                One name. One gift. Shielded ZEC with a message. Nobody knows who
                sent what.
              </p>
            </div>
            <Socials />
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k}>
              Your Santa has a secret gift for you &nbsp;✦&nbsp; Your Santa has a secret gift for you &nbsp;✦&nbsp; Your Santa has a secret gift for you &nbsp;✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="stack">
        <section className="stack-panel panel-pine" id="how" data-stack>
          <div className="stack-inner">
            <div className="how">
              <div className="how-head" data-reveal>
                <p className="eyebrow">How it works</p>
                <h2>Three steps, one secret.</h2>
                <p className="how-lede">
                  No accounts, no email, no passwords. A name, a shielded address
                  and a PIN to find your way back.
                </p>
              </div>
              <ol className="how-list">
                <li data-reveal>
                  <span className="how-num">01</span>
                  <div>
                    <h3>Join with a shielded address</h3>
                    <p>Paste a u1 or zs1 address from any wallet that can receive shielded ZEC.</p>
                  </div>
                </li>
                <li data-reveal>
                  <span className="how-num">02</span>
                  <div>
                    <h3>Get one name</h3>
                    <p>When matching runs, everyone is paired at random. No one gets themselves, and every pair is a single loop, so nobody is left out.</p>
                  </div>
                </li>
                <li data-reveal>
                  <span className="how-num">03</span>
                  <div>
                    <h3>Send ZEC with a note</h3>
                    <p>Scan one code, pay from your wallet, write the message. The note rides inside the shielded memo and opens on reveal night.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="stack-panel panel-night" id="card" data-stack>
          <div className="stack-inner">
            <div className="card-showcase">
              <div data-tilt>
                <div className="giftcard design-2">
                  <div className="gc-shape" />
                  <div className="gc-shape b" />
                  <div className="gc-top">
                    <span>Zcash Secret Santa</span>
                    <span>2026</span>
                  </div>
                  <div className="gc-msg">
                    To whoever got me, I hope this year was kinder to you than the last one. Spend it on something small and silly.
                  </div>
                  <div className="gc-bot">
                    <div>
                      <div className="gc-amt">0.0100 ZEC</div>
                      <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>
                        claimable
                      </div>
                    </div>
                    <div className="seal">Z</div>
                  </div>
                </div>
              </div>
              <div data-reveal>
                <p className="eyebrow">The card</p>
                <h2 style={{ fontSize: "clamp(2rem,4.4vw,3.6rem)", margin: "18px 0 16px", lineHeight: 0.98 }}>
                  A gift that travels encrypted.
                </h2>
                <p className="muted" style={{ fontSize: 15, lineHeight: 1.65, maxWidth: "44ch" }}>
                  A shielded Zcash payment. Your message lives in the memo field
                  that only the recipient can read. The chain shows that a payment
                  happened. It never shows who sent it, how much, or what was said.
                </p>
                <div className="row" style={{ marginTop: 26 }}>
                  <Link href="/join" className="pill is-gold">Join the exchange</Link>
                  <CopyButton value="https://zcash-secret-santa.vercel.app" label="Copy link" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stack-panel panel-pine is-last" data-stack>
          <div className="stack-inner">
            <div className="closing">
              <p className="eyebrow">Merry Christmas</p>
              <h2>Your name goes in the hat.</h2>
              <p className="muted">
                Sign-up closes when matching runs. After that, you can still join
                the next round.
              </p>
              <Link href="/join" className="pill is-gold">Join the exchange</Link>
            </div>
            <footer className="footer">
              <span>Built for the Zcash community, December 2026.</span>
              <span style={{ display: "flex", gap: 18 }}>
                <Link href="/recover">Find my link</Link>
                <Link href="/admin">Organiser</Link>
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
