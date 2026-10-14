import {cleanText,regionName} from './data.mjs';
export function htmlEscape(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
const safe=(v,max=100)=>htmlEscape(cleanText(v,max));
// Distinguish a match's listing/activity from whether it accepts new joins.
// A match can remain active while its entry is closed to new players.
export function matchStatus(game){
 if(game.unavailable)return {phase:'FEED UNAVAILABLE',join:'UNKNOWN',summary:'MATCH DATA TEMPORARILY UNAVAILABLE',tone:'muted'};
 if(game.ambiguous)return {phase:'MULTIPLE MATCHES',join:'UNKNOWN',summary:'MULTIPLE MATCHES · SELECT SERVER',tone:'muted'};
 if(game.missing)return {phase:'NOT CURRENTLY LISTED',join:'UNKNOWN',summary:'NOT CURRENTLY LISTED',tone:'muted'};
 if(game.open===true)return {phase:'IN PROGRESS',join:'JOIN OPEN',summary:'IN PROGRESS · JOIN OPEN',tone:'positive'};
 if(game.open===false)return {phase:'IN PROGRESS',join:'JOIN CLOSED',summary:'IN PROGRESS · JOIN CLOSED',tone:'warning'};
 return {phase:'IN PROGRESS',join:'JOIN UNKNOWN',summary:'IN PROGRESS · JOIN STATUS UNKNOWN',tone:'muted'};
}
export function displayStatus(game){return matchStatus(game).summary;}
export function matchTitle(game){
 if(game.unavailable)return `Match #${game.id} — Feed Unavailable`;
 if(game.ambiguous)return `Match #${game.id} — Multiple Servers`;
 if(game.missing)return `Match #${game.id} — Not Currently Listed`;
 return `${game.name} — ${game.mode} Mode`;
}
export function description(game){
 if(game.unavailable)return `Unable to check Match #${game.id} right now. Please try again shortly or explore EOT.`;
 if(game.ambiguous)return `Match #${game.id} is listed on multiple servers; choose the game on EOT.`;
 if(game.missing)return `Match #${game.id} is not currently listed in the public Starblast feed. Browse EOT for current matches.`;
 return [game.mode+' Mode',regionName(game.region),game.players==null?'Players unavailable':`${game.players} players`,game.minutes==null?'Time unavailable':`${game.minutes} min`,displayStatus(game)].join(' · ');
}
export function clanSummary(game){
 if(game.clans===null)return 'CLAN TAGS: NOT IN PUBLIC FEED';
 const label=game.rosterCoverage==='complete'?'CLAN TAGS':'CLAN SAMPLE';
 return game.clans.length?`${label}: ${game.clans.map(([clan,count])=>`${clan} x${count}`).join('  /  ')}`:`${label}: NONE DETECTED`;
}
export function ecpSummary(game){
 if(game.ecp===null)return 'ECP: NOT IN PUBLIC FEED';
 return game.ecpCoverage==='complete'?`ECP: ${game.ecp} REPORTED`:`ECP SAMPLE: ${game.ecp} REPORTED`;
}
// Rich metadata for Discord crawlers; human browsers go straight to the *verified*
// game server, without an extra GitHub Pages lookup. Unknown games never auto-join.
export function metadataHtml(game,requestedUrl,imageUrl,landingUrl,directUrl=null){
 const title=matchTitle(game),desc=description(game);
 const ogTitle='EOT SERVER LIST';
 const canJoin=Boolean(directUrl&&!game.unavailable&&!game.ambiguous&&!game.missing&&game.open===true);
 const canOffer=Boolean(directUrl&&!game.unavailable&&!game.ambiguous&&!game.missing);
 const safeRedirect=JSON.stringify(canJoin?directUrl:'').replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
 const safeBrowse=htmlEscape(landingUrl);
 const message=game.unavailable?'Feed temporarily unavailable — try again shortly.':game.ambiguous?'Multiple servers have this match ID — select the correct one on EOT.':game.missing?'This match is no longer listed in the public Starblast feed.':game.open===false?'Match still listed, but joining is currently closed.':game.open===null?'Join availability is not confirmed.':`Connecting to ${game.name} on Starblast…`;
 const optionalJoin=canOffer?`<a class="button" rel="noopener noreferrer" href="${htmlEscape(directUrl)}">OPEN IN STARBLAST ↗</a>`:'';
 return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safe(ogTitle,150)}</title>
<meta name="description" content="${safe(desc,260)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="EOT SERVER LIST">
<meta property="og:title" content="${safe(ogTitle,150)}">
<meta property="og:description" content="${safe(desc,260)}">
<meta property="og:image" content="${htmlEscape(imageUrl)}"><meta property="og:image:secure_url" content="${htmlEscape(imageUrl)}">
<meta property="og:image:alt" content="EOT SERVER LIST match preview">
<meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${htmlEscape(requestedUrl)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safe(ogTitle,150)}">
<meta name="twitter:description" content="${safe(desc,260)}"><meta name="twitter:image" content="${htmlEscape(imageUrl)}">
<meta name="theme-color" content="#061b27"><meta name="robots" content="noindex,nofollow">
<style>body{margin:0;background:radial-gradient(circle at 80% 0%,#10283e,#050c16 65%);color:#e8f8ff;font:16px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}main{width:min(90vw,600px);padding:clamp(20px,4vw,40px);border:1px solid #24445c;border-radius:18px;background:#0a1624;box-shadow:0 20px 65px #0009}h1{font-size:clamp(25px,5vw,38px);margin:10px 0}.brand{color:#83dfff;letter-spacing:3px;font-size:12px}.muted{color:#aec4d1;line-height:1.6}.buttons{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.button{background:#0f3048;padding:12px 17px;border:1px solid #386782;border-radius:12px;color:#a8efff;text-decoration:none;font-weight:700}.button:hover{background:#164663}</style>
</head><body><main><p class="brand">EOT SERVER LIST / MATCH LINK</p><h1>${safe(title,120)}</h1><p class="muted">${safe(desc,260)}</p><p>${safe(message,180)}</p><div class="buttons">${optionalJoin}<a class="button" rel="noopener noreferrer" href="${safeBrowse}">BROWSE EOT MATCHES ↗</a><a class="button" href="${htmlEscape(requestedUrl)}">RETRY ↻</a></div></main>
${canJoin?`<script>location.replace(${safeRedirect});</script>`:''}</body></html>`;
}
