// EOT V42.5: public metadata only. Unknown player/clan/ECP data must not be invented.
import {clanGroups} from './clans.mjs';
export const FEED_URL='https://starblast.io/simstatus.json';
export const SITE_URL='https://king-community.github.io/eot-server-list/';

export function cleanId(raw){const v=String(raw??'').trim();return /^\d{1,9}$/.test(v)?v:null;}
export function cleanRegion(raw){
 const v=String(raw??'').trim().toUpperCase();
 if(['EU','EUROPE'].includes(v))return 'EU';
 if(['US','AMERICA','NA','NORTH AMERICA'].includes(v))return 'US';
 if(['ASIA','AS'].includes(v))return 'ASIA';
 return '';
}
export function cleanText(value,max=72){
 return [...String(value??'').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim()].slice(0,max).join('');
}
export const regionName=region=>({EU:'EUROPE',US:'AMERICA',ASIA:'ASIA'})[region]||'REGION N/A';
export function gameMode(mode){
 const v=String(mode??'').trim().toLowerCase();
 return ({survival:'SURVIVAL',team:'TEAM',deathmatch:'PDM',pdm:'PDM',modding:'MODDED',modded:'MODDED',invasion:'INVASION',custom:'CUSTOM'})[v]||'OTHER';
}
const numberIfValid=(input,max)=>{
 if(input===null||input===undefined||input==='')return null;
 const n=Number(input);
 return Number.isFinite(n)&&n>=0?Math.min(Math.floor(n),max):null;
};
// Use only the list for THIS system. Partial samples are never represented as full rosters.
function optionalRoster(sys,players){
 const list=sys.players_list;
 if(!Array.isArray(list)||!list.length)return {clans:null,ecp:null,rosterCoverage:'none'};
 const entries=list.slice(0,200).map(x=>{
  if(typeof x==='string')return {name:cleanText(x,85),ecp:null};
  if(x&&typeof x==='object')return {name:cleanText(x.name,85),ecp:typeof x.ecp==='boolean'?x.ecp:null};
  return {name:'',ecp:null};
 }).filter(x=>x.name);
 if(!entries.length)return {clans:null,ecp:null,rosterCoverage:'none'};
 // Inconsistent or incomplete roster is a sample, not a full match census.
 const complete=players!==null&&list.length===players&&entries.length===list.length&&list.length<=200;
 const counts=clanGroups(entries.map(e=>e.name)).slice(0,5);
 const allEcpKnown=entries.every(e=>e.ecp!==null);
 return {
  clans:counts,
  ecp:allEcpKnown?entries.filter(e=>e.ecp).length:null,
  rosterCoverage:complete?'complete':'partial',
  ecpCoverage:allEcpKnown?(complete?'complete':'partial'):'none'
 };
}
export function summaryFromSystem(sys,region){
 if(!sys||typeof sys!=='object')return null;
 const id=cleanId(sys.id);if(!id)return null;
 const players=numberIfValid(sys.players??sys.players_count??sys.playerCount,200);
 const sec=numberIfValid(sys.time,3600000);
 const roster=optionalRoster(sys,players);
 return {
  id,region,name:cleanText(sys.name||`MATCH ${id}`,60)||`MATCH ${id}`,
  mode:gameMode(sys.mode),players,minutes:sec===null?null:Math.floor(sec/60),
  open:typeof sys.open==='boolean'?sys.open:null,
  clans:roster.clans,ecp:roster.ecp,
  rosterCoverage:roster.rosterCoverage,ecpCoverage:roster.ecpCoverage||'none',
  missing:false,unavailable:false,ambiguous:false
 };
}
export function matchCandidates(feed,id,region=''){
 if(!cleanId(id)||!Array.isArray(feed))return [];
 const candidates=[];
 for(const loc of feed){
  if(!loc||!Array.isArray(loc.systems))continue;
  const where=cleanRegion(loc.location||loc.region);
  if(region&&where!==region)continue;
  for(const sys of loc.systems){
   if(cleanId(sys?.id)!==id)continue;
   const record=summaryFromSystem(sys,where);
   if(record)candidates.push(record);
  }
 }
 return candidates;
}
export function findMatch(feed,id,region=''){
 const results=matchCandidates(feed,id,region);
 return results.length===1?results[0]:null;
}
function placeholder(id,region,state){
 return {id,region,name:`MATCH ${id}`,mode:'UNAVAILABLE',players:null,minutes:null,
  open:null,clans:null,ecp:null,rosterCoverage:'none',ecpCoverage:'none',
  missing:state==='missing',unavailable:state==='unavailable',ambiguous:state==='ambiguous'};
}
export const missingMatch=(id,region='')=>placeholder(id,region,'missing');
export const unavailableMatch=(id,region='')=>placeholder(id,region,'unavailable');
export const ambiguousMatch=(id,region='')=>placeholder(id,region,'ambiguous');
export async function loadMatch(fetchImpl,id,region='',url=FEED_URL){
 const response=await fetchImpl(url,{
  headers:{Accept:'application/json'},
  signal:AbortSignal.timeout(6500),
  cf:{cacheEverything:true,cacheTtl:20}
 });
 if(!response.ok)throw new Error('Public match feed unavailable');
 const data=await response.json();
 if(!Array.isArray(data))throw new Error('Malformed match feed');
 const candidates=matchCandidates(data,id,region);
 if(candidates.length>1)return ambiguousMatch(id,region);
 return candidates[0]||missingMatch(id,region);
}
export function siteMatchUrl(id,region,env={}){
 // SITE_URL is a deployment-controlled value, never a user URL argument.
 const base=env?.SITE_URL||SITE_URL;
 const url=new URL(base);
 if(url.protocol!=='https:'||url.username||url.password)throw new Error('SITE_URL must be HTTPS');
 url.searchParams.set('match',id);
 if(region)url.searchParams.set('region',region);
 return url.toString();
}
