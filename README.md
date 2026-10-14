# EOT SERVER LIST / Discord Match Preview Worker — V42.5

Cloudflare Worker deployment: `eot-preview2`, configured by `wrangler.toml`.

Entry point: `src/worker.mjs`. Public endpoints:
- `GET /health` — service health text
- `GET /m/:id?region=EU` — OG metadata and redirect to EOT GitHub Pages
- `GET /image/:id.png?region=EU&v=45` — 1200x630 PNG

Data source: Starblast public simstatus. No fabricated player names, ship IDs, clan counts, or ECP counts. Partial rosters are marked as samples. If the public match feed is unavailable, the status is temporarily unavailable rather than falsely classified as ended. Duplicate match IDs are handled conservatively.

Self-contained fallback PNG, basic Cloudflare image caching, output escaping and tests are included.

To test locally: `npm test`.
To deploy manually: `npx wrangler deploy`.
Backup the existing GitHub repository first; deploy the files to `king-community/eot-preview2`. The main EOT `eot-server-list` GitHub Pages site requires no changes.

See `README-HY.md` for Armenian deployment instructions and limitations.
