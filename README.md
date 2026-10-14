# EOT SERVER LIST — Cloudflare Preview Worker V42.4

## What changed
The V42.3 PNG drawing was too CPU-intensive for the Workers Free plan. This release draws an indexed-color PNG (8 bits/pixel, 1200 × 630), reducing render time significantly. The Discord image cache version changed from `v=43` to `v=44`.

All other API behavior and links remain intact. Worker name is still `eot-preview2`; the main `eot-server-list` repository does not need updating.

## Recommended GitHub update
1. Download a backup of `king-community/eot-preview2` (Code > Download ZIP).
2. Extract the ZIP provided with this release. In GitHub repo `king-community/eot-preview2`, replace `src/png.mjs` and `src/router.mjs`. Do not put the ZIP itself in the repository; preserve the `src/` folder structure.
3. Commit the changes to `main`. If auto-deploy doesn't run, open Cloudflare > Workers & Pages > eot-preview2 > Deployments and trigger a deployment.
4. Wait until the Cloudflare Deployment status is successful.
5. In a new browser tab, open `https://eot-preview2.aarayik729.workers.dev/image/9900.png?region=EU&v=44`. You should see an EOT match PNG, even if the game has ended. For current data use an active match ID instead.
6. Share a NEW Worker match link in Discord (Discord caches preview images).

## Diagnosing a blank/white page
A white page does **not** prove the new PNG has deployed. In Chrome DevTools press F12 > Network > reload the image URL and inspect Status/Content-Type. `200 image/png` means the image endpoint returned a PNG. `503` is a renderer failure; `1102` or `500` can mean a Cloudflare CPU/runtime error. If blank still, open Cloudflare > eot-preview2 > Observability/Logs to inspect CPU/error details.

## Verification
- `node --test tests/preview.test.mjs`
- Test image output decodes as a 1200x630 PNG.
- A successful local test is **not** a guarantee for actual Workers Free production CPU performance.
