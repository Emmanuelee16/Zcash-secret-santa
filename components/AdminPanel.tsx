"use client";
import { useCallback, useEffect, useState } from "react";

type Data = {
  people: { id: string; display_name: string; handle: string | null; address: string; design: number }[];
  assignments: { giver: string; receiver: string; sent_at: string | null }[];
  campaign: { matched_at: string | null; gifting_ends_at: string | null; reveal_at: string | null };
  cards: number;
};

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setKey(localStorage.getItem("admin_key") ?? ""); }, []);

  const load = useCallback(async (k: string) => {
    setMsg("");
    const r = await fetch("/api/admin/data", { headers: { "x-admin-key": k } });
    if (!r.ok) { setMsg("Wrong key."); setData(null); return; }
    setData(await r.json());
    localStorage.setItem("admin_key", k);
  }, []);

  const act = async (path: string, body?: unknown) => {
    setBusy(true);
    const r = await fetch(path, {
      method: "POST",
      headers: { "x-admin-key": key, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json();
    setBusy(false);
    setMsg(r.ok ? "Done." : (j.error ?? "Failed."));
    if (r.ok) load(key);
  };

  return (
    <div style={{ display: "grid", gap: 22, marginTop: 24 }}>
      <div className="row">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin key"
          type="password"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", color: "var(--paper)", minWidth: 260 }}
        />
        <button className="pill" onClick={() => load(key)}>Load</button>
        <button className="pill is-gold" disabled={busy} onClick={() => act("/api/match")}>Run matching</button>
        {msg && <span className="muted">{msg}</span>}
      </div>

      {data && (
        <>
          <div className="row" style={{ gap: 12 }}>
            <span className="badge">{data.people.length} joined</span>
            <span className="badge">{data.assignments.length} pairs</span>
            <span className="badge ok">{data.assignments.filter(a => a.sent_at).length} sent</span>
            <span className="badge">{data.cards} cards</span>
            <span className="badge">{data.campaign.matched_at ? "matched" : "not matched"}</span>
          </div>

          <div className="panel">
            <h3 style={{ fontSize: 18, marginBottom: 14 }}>Dates</h3>
            <div className="row">
              <label className="field" style={{ flex: 1, minWidth: 220 }}>
                <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>Gifting ends</span>
                <input type="datetime-local" id="ge" defaultValue={data.campaign.gifting_ends_at?.slice(0, 16) ?? ""} />
              </label>
              <label className="field" style={{ flex: 1, minWidth: 220 }}>
                <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>Reveal night</span>
                <input type="datetime-local" id="rv" defaultValue={data.campaign.reveal_at?.slice(0, 16) ?? ""} />
              </label>
              <button
                className="pill"
                onClick={() => act("/api/admin/campaign", {
                  giftingEndsAt: (document.getElementById("ge") as HTMLInputElement).value || null,
                  revealAt: (document.getElementById("rv") as HTMLInputElement).value || null,
                })}
              >Save</button>
            </div>
          </div>

          <div className="panel" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  <th style={{ padding: "8px 10px" }}>Name</th>
                  <th style={{ padding: "8px 10px" }}>Handle</th>
                  <th style={{ padding: "8px 10px" }}>Address</th>
                  <th style={{ padding: "8px 10px" }}>Gives to</th>
                  <th style={{ padding: "8px 10px" }}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {data.people.map((p) => {
                  const a = data.assignments.find((x) => x.giver === p.display_name);
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px" }}>{p.display_name}</td>
                      <td style={{ padding: "10px", color: "var(--muted)" }}>{p.handle ?? "—"}</td>
                      <td style={{ padding: "10px" }} className="mono">{p.address.slice(0, 18)}…</td>
                      <td style={{ padding: "10px" }}>{a?.receiver ?? "—"}</td>
                      <td style={{ padding: "10px" }}>{a?.sent_at ? "yes" : "no"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
