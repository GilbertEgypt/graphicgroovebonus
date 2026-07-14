# GraphicGroove Scratch Card — Setup Guide

## What's in this folder
- `scratch-card-demo.html` — the card page. Deploy this as your site's homepage (or rename to `index.html`).
- `netlify/functions/check-code.js` — checks if a card code exists / has been used.
- `netlify/functions/use-code.js` — locks a code the moment it's revealed. This is what makes replay impossible.
- `netlify/functions/seed-batch.js` — generates a batch of unique codes with prizes already assigned.
- `package.json` — tells Netlify to install `@netlify/blobs` (the storage Netlify gives you for free, no external database needed).

## 1. Deploy to Netlify
Drop this whole folder into a new (or your existing) Netlify site — either via drag-and-drop deploy on netlify.com, or by pushing it to a GitHub repo connected to Netlify. Netlify will auto-detect the `netlify/functions` folder and deploy the three functions alongside your site.

Rename `scratch-card-demo.html` to `index.html` before deploying, so it loads at your root URL.

## 2. Set your secret
In Netlify: **Site settings → Environment variables** → add:

```
SEED_SECRET = (make up a long random password, e.g. gg-2026-x7f9k2m1)
```

This stops anyone else from generating codes on your live site. Keep it private — don't put it in the HTML or share it outside this setup.

## 3. Generate your first batch of codes
Once deployed, use a tool like Postman, or just your browser console / curl, to call:

```
POST https://YOUR-SITE.netlify.app/api/seed-batch
Content-Type: application/json

{ "count": 50, "secret": "gg-2026-x7f9k2m1" }
```

Example using curl:
```
curl -X POST https://YOUR-SITE.netlify.app/api/seed-batch \
  -H "Content-Type: application/json" \
  -d '{"count": 50, "secret": "gg-2026-x7f9k2m1"}'
```

This returns a list like:
```
{ "generated": 50, "codes": [
  { "code": "K7M2QX", "prize": "20% Off" },
  { "code": "P9RT4W", "prize": "No Reward" },
  ...
]}
```

Save that list — each `code` becomes a card link:
```
https://YOUR-SITE.netlify.app/?code=K7M2QX
```

## 4. Turn codes into QR codes
Once you know your final domain, I can generate the actual QR code images for a batch of links — just send me the live URL and how many cards you want, and I'll produce print-ready QR codes for each one.

## How the locking works
- Each code is checked against Netlify's storage before the card is shown as playable.
- The prize for every code is decided and locked in at generation time (step 3) — not by the browser — so nobody can inspect the page and force a win.
- The instant someone finishes scratching, the code is marked used server-side. Reopening the same link afterward shows "This card is done."
- A link with no code, or a code that doesn't exist, shows "Card not recognized" instead of a playable card.
