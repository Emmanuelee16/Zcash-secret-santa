"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Jingle from "./Jingle";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#card", label: "The card" },
  { href: "/recover", label: "Find my link" },
];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden focusable="false">
      <path
        d="M9 15.2 H23 L9 25.2 H23"
        fill="none"
        stroke="#f4b728"
        strokeWidth="3.2"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <path d="M10 9.4 C11.2 5.2 15.4 2.6 19.6 3 C22.4 3.3 24.4 4.9 25 6.6 L22.6 9.4 Z" fill="#c2273a" />
      <rect x="9.2" y="9.2" width="14.2" height="2.9" rx="1.45" fill="#f7f2e8" />
      <circle cx="25.6" cy="5.4" r="1.9" fill="#f7f2e8" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    let observer: MutationObserver | undefined;

    const schedule = () => {
      timer = window.setTimeout(() => setCompact(true), 1800);
    };

    const arm = () => {
      if (root.classList.contains("is-loading")) {
        observer = new MutationObserver(() => {
          if (root.classList.contains("is-loading")) return;
          observer?.disconnect();
          schedule();
        });
        observer.observe(root, { attributes: true, attributeFilter: ["class"] });
      } else {
        schedule();
      }
    };

    const frame = requestAnimationFrame(arm);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <header className={`nav ${open ? "is-open" : ""}`}>
      <Link
        href="/"
        className={`nav-mark ${compact ? "is-compact" : ""}`}
        onClick={() => setOpen(false)}
      >
        <span className="nav-logo">
          <Mark />
        </span>
        <span className="nav-word">Zcash Secret Santa</span>
      </Link>

      <div className="nav-right">
        <nav className="nav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link href="/join" className="pill">
            Join
          </Link>
        </nav>

        <Jingle />

        <button
          className="nav-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="nav-sheet" id="nav-sheet" onClick={() => setOpen(false)}>
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/join" className="pill">
          Join the exchange
        </Link>
      </div>
    </header>
  );
}
