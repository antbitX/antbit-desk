# antbit

Bitcoin-only desk for [antbit](https://x.com/antbit). Live price, supply, nodes (Core / Knots / RDTS), and difficulty.

**Repo:** https://github.com/antbitX/antbit-desk

## Run locally

```bash
npm install
npm run dev
```

App: http://localhost:8080

## Put it on your own domain (Vercel)

1. Open [vercel.com/new](https://vercel.com/new) and import `antbitX/antbit-desk`.
2. Framework: Vite. Build command: `npm run build`. Output: leave default (Nitro / Vercel preset).
3. Environment variables (recommended for a public desk):
   - `VITE_AUTH_ENABLED` = `false`  (skip Google/X login until you wire your own OAuth)
   - `BETTER_AUTH_SECRET` = any long random string
4. Deploy. You get a `*.vercel.app` URL.
5. **Settings → Domains → Add** your domain.
6. At your registrar, create the DNS records Vercel shows (usually an A record or CNAME).
7. Wait for HTTPS, then open `https://yourdomain.com`.

## Optional photos

The live Grok preview uses `public/banner.jpg`, `public/avatar.jpg`, and `public/og.jpg` (Antoninus Pius gold denarius). Those JPEGs are too large for the GitHub API push used here, so the repo ships SVG stand-ins.

To restore the photo background: add those three files under `public/` in this repo (GitHub web UI → Add file → Upload), then redeploy.

## Stack

Vite 8 + TanStack Start + React 19 + Tailwind v4. Live figures from Coinbase, Kraken, blockchain.info, Blockstream, and btcnodes.io.
