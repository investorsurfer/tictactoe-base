# Tic Tac Toe on Base

A Farcaster Mini App + web app where users pay **0.0001 ETH** to play Tic Tac Toe against an unbeatable AI. Win or lose — no refunds. Payments go directly to the treasury wallet on Base.

## Stack

- **Next.js 15** (App Router)
- **Coinbase Wallet SDK** — wallet connection
- **viem** — transaction signing
- **@farcaster/frame-sdk** — Farcaster Mini App support
- **Vercel** — deployment
- **Base** — L2 chain (mainnet)

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your app URL
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. `https://your-app.vercel.app`) |

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_APP_URL` env var = your Vercel URL
4. Deploy

## Farcaster Mini App

Once deployed, cast your app URL. Farcaster clients will detect the `fc:frame` meta tag and render it as a Mini App with a **"Play for 0.0001 ETH"** button.

To test locally with Farcaster: use the [Warpcast Frame Playground](https://warpcast.com/~/developers/frames).

## Game

- You are **X**, AI is **O**
- AI uses minimax (unbeatable)
- Each game costs 0.0001 ETH sent to: `0x66911f0d4C73A9189Ed29ecAFC1514236F51dD45`
- Payments are on Base mainnet
