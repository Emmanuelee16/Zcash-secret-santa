const LINKS = [
  {
    label: "X",
    href: "https://x.com/zcash",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/r/zcash/",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.6 8.4a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zm-7.2 0a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zm1.1 5.1c.8.7 1.9 1 3.1 1s2.3-.3 3.1-1a.5.5 0 0 1 .7.7c-1 1-2.4 1.5-3.8 1.5s-2.8-.5-3.8-1.5a.5.5 0 0 1 .7-.7zM13 4.6l.8 2.7-2.6.6-.2-.9 1.7-.4-.6-2h.9z",
  },
  {
    label: "GitHub",
    href: "https://github.com/zcash",
    path: "M9.4 20.5c-4.2 1.3-4.2-2.1-5.9-2.5m11.8 5v-3.5c0-1 .1-1.4-.5-2 2.3-.3 4.7-1.1 4.7-5.1a4 4 0 0 0-1.1-2.8 3.7 3.7 0 0 0-.1-2.8s-.9-.3-2.9 1.1a9.9 9.9 0 0 0-5.2 0C8.2 6.9 7.3 7.2 7.3 7.2a3.7 3.7 0 0 0-.1 2.8 4 4 0 0 0-1.1 2.8c0 3.9 2.4 4.8 4.7 5.1-.6.6-.6 1.2-.5 2v3.5",
  },
  {
    label: "Forum",
    href: "https://forum.zcashcommunity.com",
    path: "M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1zm4 5h8M8 13h5",
  },
  {
    label: "Website",
    href: "https://z.cash",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.4 0 2.7 2.6 3 6H9c.3-3.4 1.6-6 3-6zM8.9 6.2A12 12 0 0 0 8 12H4.1a8 8 0 0 1 4.8-5.8zM4 14h4c.1 2.1.4 4 .9 5.8A8 8 0 0 1 4 14zm8 8c-1.4 0-2.7-2.6-3-6h6c-.3 3.4-1.6 6-3 6zm3.1-2.2c.5-1.8.8-3.7.9-5.8h4a8 8 0 0 1-4.9 5.8zM15.1 12A12 12 0 0 0 15 6.2a8 8 0 0 1 4.9 5.8z",
  },
];

export default function Socials() {
  return (
    <div className="socials">
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={l.label}
          className="social"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              d={l.path}
              fill={l.label === "GitHub" || l.label === "Forum" ? "none" : "currentColor"}
              stroke="currentColor"
              strokeWidth={l.label === "GitHub" || l.label === "Forum" ? 1.7 : 0}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ))}
    </div>
  );
}
