import {cleanText,regionName} from './data.mjs';
export function htmlEscape(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
const safe=(v,max=100)=>htmlEscape(cleanText(v,max));
export function displayStatus(game){
 return game.unavailable?'DATA TEMPORARILY UNAVAILABLE':game.ambiguous?'MULTIPLE MATCHES':game.missing?'NOT CURRENTLY LISTED':game.open===true?'OPEN':game.open===false?'CLOSED':'STATUS UNAVAILABLE';
}
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
export function metadataHtml(game,requestedUrl,imageUrl,landingUrl){
 const title=matchTitle(game),desc=description(game);
 const ogTitle=`EOT SERVER LIST | ${title}`;
 const redirect=JSON.stringify(landingUrl).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
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
</head><body style="margin:0;background:#050b13;color:#e8f8ff;font:16px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center">
<main style="max-width:560px;padding:32px;border:1px solid #24445c;border-radius:16px;background:#0a1624">
<p style="color:#83dfff;letter-spacing:3px;font-size:12px">EOT SERVER LIST / MATCH PREVIEW</p>
<h1>${safe(title,120)}</h1><p>${safe(desc,260)}</p>
<p>Opening EOT SERVER LIST…</p>
<a style="color:#8ee9ff" rel="noopener noreferrer" href="${htmlEscape(landingUrl)}">Open EOT match directory →</a>
</main><script>location.replace(${redirect});</script></body></html>`;
}
