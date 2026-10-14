# EOT V42 — Cloudflare Dynamic Match Preview Worker

Generates match-specific Discord Open Graph metadata and a 1200×630 PNG graphic using the public Starblast `simstatus.json` feed, with an OG image generation package (`workers-og`).

## Deploy

```sh
npm install
npm test
npx wrangler login
npm run deploy
```

Your Cloudflare account returns your `*.workers.dev` domain. Test `/m/6088?region=EU` or a current match ID. Discord metadata crawlers receive a real HTML page with server-rendered OG tags; normal browsers redirect to the existing GitHub Pages match URL.

No external custom server and no API key required for public feed. If the feed lacks a match or a detail, the image displays an unavailable state, not invented players/ECP/clans. Images may remain cached by Discord. You must paste the deployed origin into `EOT_V42_PREVIEW_ORIGIN` within your GitHub Pages `index.html` (blank by default).

`workers-og` provides the PNG renderer. Cloudflare runtime behavior has not been verified in a deployed account. Please check the PNG URL directly after deployment; fallback relies on the GitHub Pages preview PNG being publicly deployed.
