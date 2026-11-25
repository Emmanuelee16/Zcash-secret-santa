"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecoverForm() {
  const [err, setErr] = useState("");
  const router = useRouter();
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const r = await fetch("/api/recover", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(f)),
          headers: { "content-type": "application/json" },
        });
        const j = await r.json();
        if (!r.ok) return setErr(j.error ?? "Not found");
        router.push("/me");
      }}
    >
      <div className="field">
        <label htmlFor="name">Display name</label>
        <input id="name" name="name" required autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="pin">PIN</label>
        <input id="pin" name="pin" required inputMode="numeric" autoComplete="off" />
      </div>
      {err && <p className="err">{err}</p>}
      <button className="pill is-gold" type="submit">Find my link</button>
    </form>
  );
}
