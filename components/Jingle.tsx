"use client";
import { useEffect, useState } from "react";
import { getAudio } from "@/lib/audio";

const LEVEL = 0.38;

export default function Jingle() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(localStorage.getItem("jingle") !== "off");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const a = getAudio();
    if (!a) return;

    a.volume = LEVEL;
    a.muted = !on;
    localStorage.setItem("jingle", on ? "on" : "off");

    if (!on) {
      a.pause();
      return;
    }

    let last = 0;
    const start = () => {
      if (!a.paused) return;
      const now = performance.now();
      if (now - last < 400) return;
      last = now;
      a.play().catch(() => {});
    };

    start();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((ev) => window.addEventListener(ev, start, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, start));
    };
  }, [on, ready]);

  return (
    <button
      className={`sound ${on ? "is-on" : ""}`}
      onClick={() => setOn((v) => !v)}
      aria-label={on ? "Mute music" : "Play music"}
      aria-pressed={on}
      type="button"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        {on ? (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="M17 9l5 6M22 9l-5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      <span>{on ? "Music on" : "Music off"}</span>
    </button>
  );
}
