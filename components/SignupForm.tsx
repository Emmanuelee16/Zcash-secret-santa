"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [state, setState] = useState<{ err?: string; busy?: boolean }>({});
  const router = useRouter();

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setState({ busy: true });
        const r = await fetch("/api/signup", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(f)),
          headers: { "content-type": "application/json" },
        });
        const j = await r.json();
        if (!r.ok) return setState({ err: j.error ?? "Something went wrong" });
        router.push("/me?new=1");
      }}
    >
      <div className="field">
        <label htmlFor="name">Display name</label>
        <input id="name" name="name" required minLength={2} maxLength={24} autoComplete="off" placeholder="Your name" />
        <div className="hint">Your santa sees this. It must be unique, because you use it to recover your link.</div>
      </div>
      <div className="field">
        <label htmlFor="handle">
          X handle <em>optional</em>
        </label>
        <input id="handle" name="handle" placeholder="@you" autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="address">Shielded Zcash address</label>
        <input id="address" name="address" required spellCheck={false} autoComplete="off" placeholder="u1…" />
        <div className="hint">Starts with u1 or zs1. A transparent address cannot carry the memo.</div>
      </div>
      <div className="field">
        <label htmlFor="pin">Recovery PIN</label>
        <input id="pin" name="pin" required inputMode="numeric" minLength={4} maxLength={8} placeholder="4 to 8 digits" />
        <div className="hint">Your name and this PIN restore your sign-in if you lose it. Write it down.</div>
      </div>
      {state.err && <p className="err">{state.err}</p>}
      <div className="sheet-foot">
        <button className="pill is-ink" type="submit" disabled={state.busy}>
          {state.busy ? "Joining…" : "Join the exchange"}
        </button>
        <p className="sheet-note">Only one other participant sees your address. The organiser can see every entry.</p>
      </div>
    </form>
  );
}
