"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function b64url(s: string) {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function SendForm({ address }: { address: string }) {
  const [amount, setAmount] = useState("0.01");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const uri = useMemo(() => {
    const a = Number(amount);
    if (!note.trim() || !Number.isFinite(a) || a <= 0) return "";
    return `zcash:${address}?amount=${a.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")}&memo=${b64url(note.slice(0, 200))}`;
  }, [address, amount, note]);

  return (
    <div style={{ display: "grid", gap: 26, marginTop: 26 }}>
      <div className="field">
        <label htmlFor="note">Your message</label>
        <textarea id="note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Something true and small. They will read this on reveal night." />
        <div className="hint">{note.length}/200. It travels inside the memo, encrypted.</div>
      </div>
      <div className="field" style={{ maxWidth: 220 }}>
        <label htmlFor="amount">Amount in ZEC</label>
        <input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="hint">Suggested 0.01. The network fee is about 0.0001.</div>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="qr" style={{ opacity: uri ? 1 : 0.35 }}>
          {uri ? <img src={`/api/qr?u=${encodeURIComponent(uri)}`} alt="Payment code" width={182} height={182} /> : <div style={{ width: 182, height: 182, background: "#e9e4d8", borderRadius: 6 }} />}
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Write the note and the amount, then scan this with your wallet. If
            your wallet cannot read the memo from the code, copy the address and
            send it as a shielded payment with the memo pasted in.
          </p>
          <p className="mono" style={{ marginTop: 14 }}>{address}</p>
        </div>
      </div>

      {err && <p className="err">{err}</p>}
      <div className="row">
        <button
          className="pill is-gold"
          disabled={busy || !uri}
          onClick={async () => {
            setBusy(true);
            const r = await fetch("/api/send", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ amount: Number(amount), note }),
            });
            const j = await r.json();
            setBusy(false);
            if (!r.ok) return setErr(j.error ?? "Could not save.");
            router.push("/me?sent=1");
          }}
        >
          {busy ? "Saving…" : "I have sent it"}
        </button>
        <span className="muted" style={{ fontSize: 13 }}>Only you can see your target. This marks you as done.</span>
      </div>
    </div>
  );
}
