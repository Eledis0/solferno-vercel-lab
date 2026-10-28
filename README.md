# SolFerno proxy lab (Vercel)

Node port of `yE3Yqtto.php` for **authorized RE**: same-origin kit page + `/yE3Yqtto.php?s=` / `?e=` forward to the on-chain backend.

## Deploy (Vercel + GitHub)

1. Push this repo to GitHub.
2. [Vercel](https://vercel.com) → **Import** the repo → deploy (no build command needed).
3. **Environment variables** (Settings → Environment Variables):
   - `KEY_SOL` — PEM `keySol` from your `yE3Yqtto.php` (full `-----BEGIN PRIVATE KEY-----` … block).
   - `KEY_EVM` — PEM `keyEvm` (optional if you only test SOL).

   Do **not** commit PEMs to GitHub.

4. Open `https://<your-project>.vercel.app/` (or `/runtime`).

## Endpoints

| Path | Role |
|------|------|
| `/` | Kit page + auto-loaded IPFS payload via proxy |
| `/yE3Yqtto.php?s=...` | SOL upstream forward (API) |
| `/yE3Yqtto.php?e=...` | EVM upstream forward |
| `/yE3Yqtto.php?e=ping_proxy` | `pong` health check |
| `/hook.js` | Capture decrypted tx JSON → `window.__labParsedPayloads` |

## Capture Solana instructions

1. Open the deployed site in a normal browser (Phantom / Solflare installed).
2. DevTools → after connect: `copy(JSON.stringify(window.__labParsedPayloads))`.

Origin/Referer sent upstream = your **Vercel URL** (not localhost).

## Local

```bash
npx vercel dev
```

Set `KEY_SOL` / `KEY_EVM` in `.env.local` (see `.env.example`).

## Note on PHP

Vercel does not run PHP; `api/proxy.js` mirrors `SecureProxyMiddleware::handle()` from the artifact PHP.
