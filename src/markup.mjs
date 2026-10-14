import {cleanText,regionName} from './data.mjs';

export function htmlEscape(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function short(v,max=75){return htmlEscape(cleanText(v,max))}
export function displayStatus(game) {return game.missing ? 'NOT CURRENTLY LISTED' : game.open===true ? 'OPEN' : game.open===false ? 'CLOSED' : 'STATUS UNAVAILABLE';}
export function describe(game) {
  if(game.missing) return `Match #${game.id} is not currently listed in the public Starblast feed. Open EOT for updated matches.`;
  return [
    `${game.mode} Mode`,
    regionName(game.region),
    game.players==null?'Players unavailable':`${game.players} players`,
    game.minutes==null?'Duration unavailable':`${game.minutes} min`,
    displayStatus(game),
  ].join(' · ');
}
export function metadataHtml(game, requestedUrl, imageUrl, landingUrl) {
  const title= game.missing ? `MATCH #${game.id} — Not Currently Listed` : `${game.name} — ${game.mode} Mode`;
  const description=describe(game);
  // Encode the redirect as a JS string literal, then prevent '</script' injection.
  const safeRedirect=JSON.stringify(landingUrl).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${short(title,120)} | EOT SERVER LIST</title>
<meta property="og:type" content="website"><meta property="og:site_name" content="EOT SERVER LIST">
<meta property="og:title" content="${short(title,120)}">
<meta property="og:description" content="${short(description,260)}">
<meta property="og:image" content="${htmlEscape(imageUrl)}">
<meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${htmlEscape(requestedUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#061b27">
<meta name="robots" content="noindex,nofollow">
</head><body style="margin:0;background:#050b13;color:#e8f8ff;font:16px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center">
<main style="max-width:560px;padding:32px;border:1px solid #24445c;border-radius:16px;background:#0a1624">
<p style="color:#83dfff;letter-spacing:3px;font-size:12px">EOT / GALACTIC MATCH DIRECTORY</p>
<h1>${short(title,120)}</h1><p>${short(description,260)}</p>
<p>${game.demo?'PREVIEW DEMO — NOT LIVE DATA':'Redirecting to EOT SERVER LIST…'}</p>
<a style="color:#8ee9ff" rel="noopener noreferrer" href="${htmlEscape(landingUrl)}">Open match on EOT →</a>
</main><script>location.replace(${safeRedirect});</script>
</body></html>`;
}

// Inline flexbox layout is compatible with cf-workers-og's Satori renderer.
export function imageHtml(game) {
  const title=short(game.name,54);
  const status=displayStatus(game);
  const region=short(regionName(game.region),18);
  const info=[game.mode==='OTHER'?'MATCH':game.mode, region, game.minutes==null?'TIME N/A':`${game.minutes} MIN`, game.players==null?'PLAYERS N/A':`${game.players} PLAYERS`];
  const tags=game.clans===null?'CLANS: UNAVAILABLE':game.clans.length?'CLAN TAGS: '+game.clans.join(' · '):'CLAN TAGS: NONE REPORTED';
  const ecp=game.ecp===null?'ECP: UNAVAILABLE':`ECP: ${game.ecp} REPORTED`;
  const badge=(val)=>`<div style="display:flex;color:#c2edff;background:#0e2737;border:1px solid #28526a;border-radius:12px;padding:12px 21px;font-size:21px;font-weight:700;letter-spacing:1px;margin-right:12px;">${short(val,50)}</div>`;
  return `<div style="display:flex;width:1200px;height:630px;flex-direction:column;background:linear-gradient(125deg,#020811,#091928 58%,#100d28);color:#f2fbff;padding:49px 57px;font-family:Roboto,Arial,sans-serif;">
    <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
      <div style="display:flex;align-items:center;">
        <div style="display:flex;background:#0b3242;border:2px solid #65dfff;color:#ebffff;border-radius:16px;width:67px;height:67px;align-items:center;justify-content:center;font-size:23px;font-weight:900;margin-right:22px;">EOT</div>
        <div style="display:flex;flex-direction:column;"><div style="font-size:35px;font-weight:900;letter-spacing:2px">EOT SERVER LIST</div><div style="font-size:15px;color:#70d5e9;letter-spacing:4px;margin-top:6px;">GALACTIC MATCH INTELLIGENCE</div></div>
      </div>
      <div style="display:flex;background:#0e2c39;border:1px solid #287a89;padding:12px 20px;border-radius:13px;color:#8df0ed;font-size:19px;font-weight:700;">${game.demo?'DEMO':game.missing?'NOT LISTED':'PUBLIC MATCH'}</div>
    </div>
    <div style="display:flex;width:100%;height:2px;background:linear-gradient(90deg,#54dfff,#5e7ef1,#3a154b);margin-top:34px;"></div>
    <div style="display:flex;flex-direction:column;flex:1;justify-content:center;padding-top:16px;">
      <div style="display:flex;color:#9abdd6;font-size:20px;letter-spacing:3px;margin-bottom:10px">MATCH #${short(game.id,10)} / ${region}</div>
      <div style="display:flex;font-size:${[...game.name].length>22?54:72}px;font-weight:900;letter-spacing:-1.5px;line-height:1.1;margin-bottom:30px;color:#ffffff;">${title}</div>
      <div style="display:flex;flex-direction:row;margin-bottom:24px;">${info.map(badge).join('')}</div>
      <div style="display:flex;color:#9ec8db;font-size:19px;">${short(tags,96)}</div>
      <div style="display:flex;color:#9ec8db;font-size:18px;margin-top:6px;">${short(ecp,80)}</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;height:56px;border-top:1px solid #1d475d;padding-top:12px;">
      <div style="display:flex;color:#6f98a9;font-size:16px;">Independent Starblast community directory · Public data</div>
      <div style="display:flex;color:${game.open===true?'#59ffd1':game.open===false?'#ffc18c':'#b1bbcc'};font-size:19px;font-weight:900;">${short(status,35)}</div>
    </div>
  </div>`;
}
