import test from 'node:test';
import assert from 'node:assert/strict';
import {findMatch,siteMatchUrl} from '../src/data.mjs';
import {handleRequest} from '../src/router.mjs';
import {metadataHtml,imageHtml} from '../src/markup.mjs';
import {renderPng} from '../src/png.mjs';
const feed=[{location:'Europe',address:'51.255.91.80:3017',systems:[
 {id:6088,mode:'survival',name:'182 Tygonor',players:22,time:810,open:true},
 {id:1234,mode:'team',name:'&lt; unsafe "title"',players:6,time:60,open:false},
]}];
const fetchImpl=async (url)=>{
 if(String(url).includes('simstatus.json'))return Response.json(feed);
 return new Response(new Uint8Array([137,80,78,71]),{headers:{'content-type':'image/png'}});
};
test('live match summary respects public data',()=>{
 const game=findMatch(feed,'6088','EU');assert.equal(game.name,'182 Tygonor');assert.equal(game.mode,'SURVIVAL');assert.equal(game.players,22);assert.equal(game.minutes,13);assert.equal(game.clans,null);
});
test('safe fixed-site redirect',()=>{
 assert.equal(siteMatchUrl('6088','EU'),'https://king-community.github.io/eot-server-list/?match=6088&region=EU');
});
test('HTML Open Graph tags are per match, with absolute image and redirect', async()=>{
 const response=await handleRequest(new Request('https://demo.workers.dev/m/6088?region=EU'),{}, {fetchImpl});
 const page=await response.text();
 assert.match(page,/<meta property="og:title" content="182 Tygonor — SURVIVAL Mode">/);
 assert.match(page, /<meta property="og:image" content="https:\/\/demo.workers.dev\/image\/6088.png\?region=EU&amp;v=44">/);
 assert.match(page, /location.replace\("https:\/\/king-community.github.io\/eot-server-list\/\?match=6088&region=EU"\)/u); // see markup output - escaped? 
});
test('PNG endpoint yields an image without guessing details',async()=>{
 const response=await handleRequest(new Request('https://demo.workers.dev/image/6088.png?region=EU'), {}, {
   fetchImpl,renderImage:async game=> {assert.equal(game.name,'182 Tygonor'); return renderPng(game)}
 });
 assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/png');
 const bytes=new Uint8Array(await response.arrayBuffer());
 assert.deepEqual(Array.from(bytes.subarray(0,8)),[137,80,78,71,13,10,26,10]);
 assert.ok(bytes.length>5000);
});
test('not-listed match is honest, not a fabricated game',async()=>{
 const response=await handleRequest(new Request('https://demo.workers.dev/m/999999?region=EU'), {}, {fetchImpl});
 const html=await response.text();assert.match(html,/Not Currently Listed/);assert.doesNotMatch(html,/22 players/);
});
test('malicious title must be escaped in HTML',()=>{
 const game=findMatch(feed,'1234','EU');const html=metadataHtml(game,'https://example.com/m/1234','https://example.com/image/1234.png','https://site.com');
 assert.doesNotMatch(html,/<script>alert/);
 assert.match(html,/&amp;lt;/);
});
