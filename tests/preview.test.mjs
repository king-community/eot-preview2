import test from 'node:test';
import assert from 'node:assert/strict';
import {findMatch,loadMatch,siteMatchUrl,cleanRegion} from '../src/data.mjs';
import {handleRequest} from '../src/router.mjs';
import {metadataHtml,displayStatus,clanSummary,ecpSummary,matchTitle} from '../src/markup.mjs';
import {renderPng} from '../src/png.mjs';
import {detectClan,clanGroups} from '../src/clans.mjs';

const baseMatch={id:6088,name:'182 Tygonor',mode:'survival',players:22,time:810,open:true};
const feed=[{location:'Europe',address:'51.255.91.80:3017',systems:[baseMatch,{id:1111,mode:'team',name:'<img onerror=alert(1)> "evil"',players:3,time:30,open:false}]}];
const serve=(payload=feed)=>async()=>Response.json(payload);
const req=(path,opts={})=>new Request('https://demo.workers.dev'+path,opts);

test('public feed with no roster is never invented',()=>{
 const game=findMatch(feed,'6088','EU');
 assert.equal(game.name,'182 Tygonor');assert.equal(game.players,22);assert.equal(game.minutes,13);
 assert.equal(game.clans,null);assert.equal(game.ecp,null);assert.equal(game.rosterCoverage,'none');
 assert.equal(clanSummary(game),'CLAN TAGS: NOT IN PUBLIC FEED');
 assert.equal(ecpSummary(game),'ECP: NOT IN PUBLIC FEED');
});
test('supported country and mode labels are normalized',()=>{
 assert.equal(cleanRegion('Europe'),'EU');assert.equal(cleanRegion('NA'),'US');assert.equal(cleanRegion('AS'),'ASIA');assert.equal(cleanRegion('nonsense'),'');
});
test('selected clan tags normalize to one group without false positives',()=>{
 for(const n of ['♆VØ Sebastian','ѠVØ FEIN','ωVø MAKSİ RU','[WVO] Name','✥VØ LORD_TITAN'])assert.equal(detectClan(n),'WVO',n);
 for(const n of ['UVA➤ nobel','UVΛ➤nobel','UVΛ nobel'])assert.equal(detectClan(n),'UVA',n);
 for(const n of ['Sk↝ MEMBER','Sᴋ↝ MEMBER','SK~ ABDIELIM'])assert.equal(detectClan(n),'SK',n);
 for(const n of ['SKATER','WVOX','NVRival','UVARIOUS','some WVO player'])assert.equal(detectClan(n),null,n);
 assert.deepEqual(clanGroups(['SK~ A','Sᴋ↝ B','UVΛ➤ C','SK~ D']),[['SK',3],['UVA',1]]);
});
test('complete players_list provides counts and ECP while partial is clearly labeled',()=>{
 const full=[{name:'SK~ A',ecp:true},{name:'Sᴋ↝ B',ecp:false},{name:'UVΛ➤ C',ecp:true},{name:'Ordinary',ecp:false}];
 const game=findMatch([{location:'Europe',systems:[{...baseMatch,players:4,players_list:full}]}],'6088','EU');
 assert.deepEqual(game.clans,[['SK',2],['UVA',1]]);assert.equal(game.ecp,2);
 assert.equal(clanSummary(game),'CLAN TAGS: SK x2  /  UVA x1');
 assert.equal(ecpSummary(game),'ECP: 2 REPORTED');
 const partial=findMatch([{location:'Europe',systems:[{...baseMatch,players:30,players_list:full}]}],'6088','EU');
 assert.equal(partial.rosterCoverage,'partial');assert.match(clanSummary(partial),/^CLAN SAMPLE:/);
 assert.equal(partial.ecp,2);assert.match(ecpSummary(partial),/^ECP SAMPLE:/);
});
test('incomplete ECP boolean fields must not imply zero or full counts',()=>{
 const g=findMatch([{location:'Europe',systems:[{...baseMatch,players:2,players_list:[{name:'SK~ A',ecp:false},{name:'Bob'}]}]}],'6088','EU');
 assert.equal(g.ecp,null);assert.equal(ecpSummary(g),'ECP: NOT IN PUBLIC FEED');
});
test('duplicate match IDs in same region are ambiguous, not incorrectly attributed',async()=>{
 const dup=[{location:'Europe',systems:[baseMatch]},{location:'Europe',systems:[{...baseMatch,name:'Other match'}]}];
 assert.equal(findMatch(dup,'6088','EU'),null);
 const match=await loadMatch(serve(dup),'6088','EU');assert.equal(match.ambiguous,true);
 assert.equal(displayStatus(match),'MULTIPLE MATCHES');
});
test('malformed and unavailable upstream becomes temporarily unavailable, not Not Listed',async()=>{
 for(const fetchImpl of [async()=>new Response('x',{status:502}),async()=>Response.json({oops:true}),async()=>{throw new Error('timeout');}]){
  const res=await handleRequest(req('/m/6088?region=EU'),{}, {fetchImpl});
  const html=await res.text();assert.match(html,/Feed Unavailable/);assert.doesNotMatch(html,/Not Currently Listed/);
 }
});
test('missing match remains distinct from feed failure',async()=>{
 const html=await (await handleRequest(req('/m/999?region=EU'),{}, {fetchImpl:serve()})).text();
 assert.match(html,/Not Currently Listed/);assert.doesNotMatch(html,/22 players/);
});
test('OG title is branded and all match URLs are absolute and encoded',async()=>{
 const html=await (await handleRequest(req('/m/6088?region=EU'),{}, {fetchImpl:serve()})).text();
 assert.match(html,/<meta property="og:title" content="EOT SERVER LIST">/);
 assert.match(html,/<meta property="og:site_name" content="EOT SERVER LIST">/);
 assert.match(html,/<meta name="twitter:title" content="EOT SERVER LIST">/);
 assert.doesNotMatch(html, /<meta property="og:title" content="[^"]*Tygonor/);
 assert.match(html,/SURVIVAL Mode · EUROPE · 22 players · 13 min · OPEN/);
 assert.match(html,/og:image:secure_url/);assert.match(html,/\/image\/6088\.png\?region=EU&amp;v=45/);
 assert.match(html,/location.replace\("https:\/\/king-community.github.io\/eot-server-list\/\?match=6088&region=EU"\)/);
});
test('names and HTML are escaped, no injection into markup',async()=>{
 const html=await (await handleRequest(req('/m/1111?region=EU'),{}, {fetchImpl:serve()})).text();
 assert.doesNotMatch(html,/<img onerror/);assert.match(html,/&lt;img onerror/);
});
test('direct redirect always uses the configured HTTPS site',()=>{
 assert.equal(siteMatchUrl('6088','EU'), 'https://king-community.github.io/eot-server-list/?match=6088&region=EU');
 assert.throws(()=>siteMatchUrl('6088','EU',{SITE_URL:'http://insecure.test/'}));
});
test('path, method and query input rejected cleanly',async()=>{
 const fetchImpl=serve();
 assert.equal((await handleRequest(req('/image/not-a-number.png'),{}, {fetchImpl})).status,404);
 assert.equal((await handleRequest(req('/missing'),{}, {fetchImpl})).status,404);
 assert.equal((await handleRequest(req('/m/6088?region=bogus'),{}, {fetchImpl})).status,400);
 assert.equal((await handleRequest(req('/m/6088',{method:'POST'}),{}, {fetchImpl})).status,405);
 assert.equal((await handleRequest(req('/health'),{}, {fetchImpl})).status,200);
});
test('dynamic image endpoint is a decodable 1200x630 PNG and supports HEAD',async()=>{
 const fetchImpl=serve();
 const r=await handleRequest(req('/image/6088.png?region=EU'),{}, {fetchImpl,renderImage:renderPng});
 assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');
 const data=new Uint8Array(await r.arrayBuffer());
 assert.deepEqual([...data.slice(0,8)],[137,80,78,71,13,10,26,10]);
 assert.ok(data.length>3000);assert.deepEqual([...data.slice(16,24)],[0,0,4,176,0,0,2,118]);
 const head=await handleRequest(req('/image/6088.png?region=EU',{method:'HEAD'}),{}, {fetchImpl,renderImage:renderPng});
 assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
});
test('failed renderer serves an embedded, valid PNG instead of broken image',async()=>{
 const r=await handleRequest(req('/image/6088.png?region=EU'),{}, {fetchImpl:serve(),renderImage:()=>{throw new Error('renderer failed');}});
 assert.equal(r.status,200);assert.equal(r.headers.get('x-eot-image-mode'),'fallback');
 const b=new Uint8Array(await r.arrayBuffer());assert.deepEqual([...b.slice(0,8)],[137,80,78,71,13,10,26,10]);
});
test('edge PNG cache returns existing response and avoids additional work',async()=>{
 let draws=0,fetches=0;
 const mem=new Map();
 const cache={match:async req=>mem.get(req.url)?.clone(),put:async(req,res)=>{mem.set(req.url,res.clone());}};
 const deps={fetchImpl:async()=>{fetches++;return Response.json(feed)},renderImage:async g=>{draws++;return renderPng(g)},cache};
 const a=await handleRequest(req('/image/6088.png?region=EU'),{},deps);await a.arrayBuffer();
 const b=await handleRequest(req('/image/6088.png?region=EU'),{},deps);await b.arrayBuffer();
 assert.equal(draws,1);assert.equal(fetches,1);
});
