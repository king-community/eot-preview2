/* EOT V42.4: PNG encoder optimized for Workers Free's 10ms CPU budget.
   Indexed PNG (8-bit palette) replaces 4-byte RGBA alpha blending.
   Public match data only. No third-party image services. */
import {GLYPHS} from './glyphs.mjs';
import {cleanText,regionName} from './data.mjs';
import {clanSummary,ecpSummary} from './markup.mjs';

const W=1200,H=630, STRIDE=W+1;
const PALETTE=[
  '#030a14', '#06101e', '#09182a', '#0b1e32', '#0d263b',
  '#0f3048', '#14425b', '#1e5571', '#31829c', '#70e4f7',
  '#f0f7ff', '#c7e8fa', '#93b4cf', '#5f839e', '#183049',
  '#103244', '#6ceacb', '#ffd09c', '#1d2947', '#123550',
  '#15172e', '#252443', '#213d60', '#365a79', '#93c3e2',
  '#07121e', '#121f35', '#285169', '#4b9ec6', '#465f80',
  '#f9fdff', '#344b64'
];
const colorBytes=new Uint8Array(PALETTE.length*3);
for(let i=0;i<PALETTE.length;i++){
 const hex=PALETTE[i].slice(1);
 colorBytes[3*i]=parseInt(hex.slice(0,2),16);
 colorBytes[3*i+1]=parseInt(hex.slice(2,4),16);
 colorBytes[3*i+2]=parseInt(hex.slice(4,6),16);
}
const glyphCache=new Map();
function glyph(ch){
 if(glyphCache.has(ch))return glyphCache.get(ch);
 const arr=GLYPHS[ch]||GLYPHS['?'];
 const binary=atob(arr[5]);
 const packed=Uint8Array.from(binary,c=>c.charCodeAt(0));
 const mask=new Uint8Array(arr[0]*arr[1]);
 for(let i=0;i<mask.length;i++)mask[i]=((i&1)?packed[i>>1]&15:packed[i>>1]>>4)>7?1:0;
 const entry={w:arr[0],h:arr[1],l:arr[2],t:arr[3],advance:arr[4],mask};
 glyphCache.set(ch,entry);return entry;
}
// A small stable background is constructed once per isolate and copied per image.
function baseCanvas(){
 const b=new Uint8Array(W*H);
 for(let y=0;y<H;y++){
  const t=y/H;
  const shade=t<.24?1:t<.54?2:t<.76?3:1;
  b.fill(shade,y*W,(y+1)*W);
 }
 return b;
}
const BASE=baseCanvas();
function rect(b,x,y,w,h,c){
 const x0=Math.max(0,x|0),x1=Math.min(W,(x+w)|0),y0=Math.max(0,y|0),y1=Math.min(H,(y+h)|0);
 for(let i=y0;i<y1;i++)b.fill(c,i*W+x0,i*W+x1);
}
function textWidth(s,size){
 const scale=size/72;let advance=0;
 for(const ch of s)advance+=(glyph(ch).advance+.5)*scale;
 return advance;
}
function drawText(b,str,x,y,size,c,maxWidth){
 str=String(str||'');if(!str)return;
 let scale=size/72;
 if(maxWidth){const width=textWidth(str,size);if(width>maxWidth)scale*=maxWidth/width;}
 let cx=x;
 for(const ch of str){
  const g=glyph(ch);
  if(ch!==' '){
   const gx=Math.round(cx+g.l*scale),gy=Math.round(y+size*.88+g.t*scale);
   const sw=Math.max(1,Math.round(g.w*scale));
   const sh=Math.max(1,Math.round(g.h*scale));
   for(let yy=0;yy<sh;yy++){
    const py=gy+yy;if(py<0||py>=H)continue;
    const row=Math.min(g.h-1,Math.floor(yy/scale))*g.w;
    const target=py*W;
    for(let xx=0;xx<sw;xx++){
      const px=gx+xx;if(px<0||px>=W)continue;
      const sx=Math.min(g.w-1,Math.floor(xx/scale));
      if(g.mask[row+sx])b[target+px]=c;
    }
   }
  }
  cx+=(g.advance+.5)*scale;
 }
}
function chip(b,label,x,y,w,c=11){
 rect(b,x,y,w,52,6);
 rect(b,x+2,y+2,w-4,48,5);
 rect(b,x+2,y+2,3,48,8);
 drawText(b,label,x+13,y+10,23,c,w-24);
}
function makeCanvas(game){
 const b=BASE.slice();
 // Deep obsidian / cyber-command panels.
 rect(b,0,0,W,6,8);
 rect(b,0,H-6,W,6,19);
 rect(b,38,25,1124,100,1);
 rect(b,38,125,1124,3,7);
 rect(b,38,128,248,4,9);
 rect(b,38,140,1124,378,2);
 rect(b,42,144,1116,370,1);
 rect(b,38,531,1124,2,7);
 rect(b,38,535,1124,60,1);
 rect(b,58,49,70,60,5);rect(b,61,52,64,54,1);
 drawText(b,'EOT',68,67,34,10,52);
 drawText(b,'EOT SERVER LIST',153,45,45,10,660);
 drawText(b,'GALACTIC MATCH INTELLIGENCE',154,92,18,9,650);
 chip(b,game.unavailable?'FEED OFFLINE':game.ambiguous?'MULTIPLE MATCHES':game.missing?'NOT LISTED':'PUBLIC MATCH DATA',907,50,238,16);
 drawText(b,`MATCH #${game.id}  /  ${regionName(game.region)}`,55,155,23,12,1090);
 drawText(b,cleanText(game.name||'MATCH',70).normalize('NFKC'),54,196,78,30,1090);
 const mode=game.mode==='OTHER'?'MATCH':game.mode;
 const duration=game.minutes==null?'TIME N/A':`${game.minutes} MIN`;
 const count=game.players==null?'PLAYERS N/A':`${game.players} PLAYERS`;
 chip(b,mode,55,334,230,9);
 chip(b,regionName(game.region),297,334,185,11);
 chip(b,duration,495,334,178,11);
 chip(b,count,686,334,260,11);
 const clans=clanSummary(game);
 drawText(b,clans,57,417,24,12,1080);
 drawText(b,ecpSummary(game),57,458,21,12,1060);
 drawText(b,'STARBLAST COMMUNITY MATCH DIRECTORY',55,552,17,13,800);
 const status=game.unavailable?'UNAVAILABLE':game.ambiguous?'AMBIGUOUS':game.missing?'NOT LISTED':game.open===true?'OPEN':game.open===false?'CLOSED':'STATUS N/A';
 drawText(b,status,980,545,23,game.open===true?16:game.open===false?17:12,160);
 return b;
}
const PNG_SIG=new Uint8Array([137,80,78,71,13,10,26,10]);
const CRC_TABLE=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;CRC_TABLE[n]=c>>>0;}
function uint32(n){return new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]);}
function crc32(data){let c=0xffffffff;for(const n of data)c=CRC_TABLE[(c^n)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function concat(parts){const n=parts.reduce((s,p)=>s+p.length,0);const b=new Uint8Array(n);let i=0;for(const p of parts){b.set(p,i);i+=p.length;}return b;}
function chunk(type,payload){const ascii=new TextEncoder().encode(type),data=concat([ascii,payload]);return concat([uint32(payload.length),data,uint32(crc32(data))]);}
export async function renderPng(game){
 const pixels=makeCanvas(game);
 const raw=new Uint8Array(STRIDE*H);
 for(let y=0;y<H;y++)raw.set(pixels.subarray(y*W,(y+1)*W),y*STRIDE+1);
 const compressed=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
 const header=new Uint8Array(13);header.set(uint32(W),0);header.set(uint32(H),4);header[8]=8;header[9]=3;
 return concat([PNG_SIG,chunk('IHDR',header),chunk('PLTE',colorBytes),chunk('IDAT',compressed),chunk('IEND',new Uint8Array(0))]);
}
