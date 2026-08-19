# antbit

Bitcoin-only desk for [antbit](https://x.com/antbit). Live price, supply, nodes (Core / Knots / RDTS), and difficulty.

## Run locally

```bash
npm install
npm run dev
```

## Put it on your own domain

1. Import this repo on [Vercel](https://vercel.com) (**Add New → Project**).
2. Deploy. You’ll get a `*.vercel.app` URL.
3. **Settings → Domains → Add** your domain.
4. At your registrar, create the DNS records Vercel shows.
5. Wait for HTTPS, then open `https://yourdomain.com`.

Framework: Vite + TanStack Start. Build command: `npm run build`.
