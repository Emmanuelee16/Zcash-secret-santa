# Zcash Secret Santa

Season one: matched secret santa for the Zcash community. Cards are shielded
ZEC payments carrying a memo, delivered straight to the recipient's wallet.

## Stack

- Next.js 16 (App Router), React 19
- Neon Postgres over the HTTP driver
- Three.js for the hero head, GSAP + ScrollTrigger, Lenis
- Deployed on Vercel

## Local

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL
npm run dev
```

## Schema

Five tables: `participants`, `assignments`, `cards`, `guesses`, `campaign`.

## Deploy

Push to `main`. Vercel deploys automatically once the repo is connected.
Set `DATABASE_URL` in Vercel project settings, pooled host.
