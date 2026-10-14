// EOT V42 — use only publicly reported match information. No guessed rosters/ECP.
export const FEED_URL = 'https://starblast.io/simstatus.json';
export const SITE_URL = 'https://king-community.github.io/eot-server-list/';

export function cleanId(raw) {
  const v = String(raw ?? '').trim();
  return /^\d{1,9}$/.test(v) ? v : null;
}
export function cleanRegion(raw) {
  const v = String(raw ?? '').trim().toUpperCase();
  if (['EU', 'EUROPE'].includes(v)) return 'EU';
  if (['US', 'AMERICA', 'NA', 'NORTH AMERICA'].includes(v)) return 'US';
  if (['ASIA', 'AS'].includes(v)) return 'ASIA';
  return '';
}
export function cleanText(value, max = 72) {
  const v = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return [...v].slice(0, max).join('');
}
export const regionName = region => ({EU: 'EUROPE', US: 'AMERICA', ASIA: 'ASIA'})[region] || 'UNKNOWN';
export function gameMode(mode) {
  const v = String(mode ?? '').trim().toLowerCase();
  return ({survival:'SURVIVAL',team:'TEAM',deathmatch:'PDM',pdm:'PDM',modding:'MODDED',modded:'MODDED',invasion:'INVASION',custom:'CUSTOM'})[v] || 'OTHER';
}

// Based on nickname patterns only, never verification of actual clan membership.
function tagOf(name) {
  const n = cleanText(name, 80);
  if (/^[\[({]\s*[A-Za-z0-9]{2,6}\s*[\]})]/u.test(n)) return n.slice(1).match(/^\s*([A-Za-z0-9]{2,6})/u)?.[1].toUpperCase() || null;
  if (/^(?:WVO|ѠVØ|ωVØ|♆VØ|♆VØ|♆Vø|✥VØ|✥Vø|[⛤✥]VØ)(?=$|[^\p{L}\p{N}])/iu.test(n)) return 'WVO';
  if (/^UV[AΛ](?=$|[^\p{L}\p{N}])/iu.test(n)) return 'UVA';
  const m = n.match(/^(FX|SK|PTP|NVR|EOT|S2F|MOON)(?=$|[^\p{L}\p{N}])/iu);
  return m ? m[1].toUpperCase() : null;
}
function possibleNames(sys) {
  const list = sys.players_list;
  if (!Array.isArray(list) || list.length === 0) return null;
  return list.slice(0, 160).map(p=> typeof p === 'string' ? p : (p && typeof p === 'object' ? p.name : '')).filter(x=> typeof x==='string' && x.length>0);
}
export function summaryFromSystem(sys, region) {
  const id = cleanId(sys.id);
  if (!id) return null;
  const playersNum = Number(sys.players ?? sys.players_count ?? sys.playerCount);
  const players = Number.isFinite(playersNum) ? Math.max(0, Math.min(200,Math.floor(playersNum))) : null;
  const seconds = Number(sys.time);
  const minutes = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds / 60) : null;
  const names = possibleNames(sys);
  const clans = names ? [...new Set(names.map(tagOf).filter(Boolean))].slice(0,4) : null;
  // Only an explicit ECP field is counted, and only when a roster is present.
  const ecpList = Array.isArray(sys.players_list) ? sys.players_list.filter(p=>p && typeof p==='object' && p.ecp===true).length : null;
  const hasEcpFields = Array.isArray(sys.players_list) && sys.players_list.some(p=>p && typeof p==='object' && typeof p.ecp === 'boolean');
  return {
    id, region, name:cleanText(sys.name || `MATCH ${id}`, 54),
    mode:gameMode(sys.mode), players, minutes,
    open: typeof sys.open === 'boolean' ? sys.open : null,
    clans, ecp: hasEcpFields ? ecpList : null,
    demo:false,
  };
}
export function findMatch(feed, id, region = '') {
  if (!cleanId(id) || !Array.isArray(feed)) return null;
  const candidates=[];
  for (const loc of feed) {
    if (!loc || !Array.isArray(loc.systems)) continue;
    const where=cleanRegion(loc.location || loc.region);
    if (region && where !== region) continue;
    for (const sys of loc.systems) {
      if (cleanId(sys?.id) !== id) continue;
      const record=summaryFromSystem(sys, where);
      if (record) candidates.push(record);
    }
  }
  if (candidates.length !== 1) return null; // Never guess when IDs collide.
  return candidates[0];
}
export function missingMatch(id, region = '') {
  return {
    id, region, name:`MATCH ${id}`, mode:'UNAVAILABLE',players:null,minutes:null,
    open:null,clans:null,ecp:null,demo:false,missing:true,
  };
}
export function demoMatch() {
  return {
    id:'6088', region:'EU', name:'182 TYGONOR',mode:'SURVIVAL',players:21,
    minutes:11,open:true,clans:['FX','SK'],ecp:null,demo:true,
  };
}
export async function loadMatch(fetchImpl, id, region='', url=FEED_URL) {
  const response=await fetchImpl(url, {
    headers:{Accept:'application/json'},
    signal:AbortSignal.timeout(6500),
    cf:{cacheEverything:true, cacheTtl:25}
  });
  if (!response.ok) throw new Error('Public match feed unavailable');
  const data=await response.json();
  return findMatch(data,id,region);
}
export function siteMatchUrl(id,region,env={}) {
  const base=env?.SITE_URL || SITE_URL;
  // The target host is fixed by deployment config, never supplied via request args.
  const url=new URL(base);
  if (url.protocol !== 'https:') throw new Error('SITE_URL must be HTTPS');
  url.searchParams.set('match',id);
  if(region) url.searchParams.set('region',region);
  return url.toString();
}
