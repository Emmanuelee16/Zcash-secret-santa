import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function Join() {
  return (
    <main className="page wrap">
      <div className="join">
        <div className="join-head">
          <p className="eyebrow">Join</p>
          <h1>Put your name in the hat.</h1>
          <p className="join-lede">
            One person to buy for, one message to write, and a shielded address
            to receive your gift.
          </p>
        </div>

        <div className="join-sheet">
          <section className="sheet">
            <div className="sheet-head">
              <strong>Entry card</strong>
              <span>2026</span>
            </div>
            <p className="sheet-lead">Fill this in and you are in the draw.</p>
            <SignupForm />
          </section>
        </div>

        <div className="join-rules">
          <ul className="rules">
            <li>
              <i>01</i>
              <div>
                <b>One name each</b>
                <span>You get one person to buy for. Whoever draws you sees only your name.</span>
              </div>
            </li>
            <li>
              <i>02</i>
              <div>
                <b>Shielded only</b>
                <span>A u1 or zs1 address, so the note travels inside the payment.</span>
              </div>
            </li>
            <li>
              <i>03</i>
              <div>
                <b>No account</b>
                <span>A display name and a PIN. No email, no password.</span>
              </div>
            </li>
          </ul>
          <p className="join-back">
            Already joined? <Link href="/recover">Find your link</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
