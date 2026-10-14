import {cleanId,cleanRegion,cleanServerAddress,starblastJoinUrl,loadMatch,missingMatch,unavailableMatch,siteMatchUrl} from './data.mjs';
import {metadataHtml} from './markup.mjs';
import {fallbackPng} from './fallback.mjs';

const PAGE_CACHE='public, max-age=20, s-maxage=20';
const IMG_CACHE='public, max-age=20, s-maxage=20';
const baseHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
async function matchFor(id,region,fetchImpl,server){
 try{return await loadMatch(fetchImpl,id,region,undefined,server)}
 catch(error){
  console.warn('EOT public feed temporarily unavailable:',String(error));
  return unavailableMatch(id,region);
 }
}
function deny(status,body){return new Response(body,{status,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store',...baseHeaders}});}
export async function handleRequest(request,env={},deps={}){
 const url=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD',...baseHeaders}});
 const path=(()=>{try{return decodeURIComponent(url.pathname)}catch(_){return ''}})();
 const pageMatch=path.match(/^\/m\/(\d{1,9})(?:@([^/]+))?\/?$/);
 const imageMatch=path.match(/^\/image\/(\d{1,9})\.png$/);
 if(!pageMatch&&!imageMatch){
  if(url.pathname==='/'||url.pathname==='/health')
   return new Response('EOT SERVER LIST / Match Preview Service — Online',{status:200,headers:{'content-type':'text/plain; charset=utf-8',...baseHeaders}});
  return deny(404,'EOT Preview route not found');
 }
 const id=cleanId(pageMatch?.[1]||imageMatch?.[1]);
 if(!id)return deny(400,'Invalid match ID');
 const suppliedRegion=url.searchParams.get('region');
 const region=cleanRegion(suppliedRegion);
 if(suppliedRegion&&!region)return deny(400,'Invalid region');
 const rawServer=pageMatch?.[2]||url.searchParams.get('server')||'';
 const server=rawServer?cleanServerAddress(rawServer):'';
 if(rawServer&&!server)return deny(400,'Invalid game server address');
 const cache=deps.cache||(typeof caches!=='undefined'?caches.default:null);
 // Cache the PNG bytes at the Worker edge so repeated Discord requests need not re-render.
 if(imageMatch&&request.method==='GET'&&cache){
  try{const hit=await cache.match(request);if(hit)return hit;}catch(error){console.warn('PNG cache lookup:',String(error));}
 }
 const game=await matchFor(id,region,deps.fetchImpl||fetch,server);
 if(imageMatch){
  let png;
  if(request.method==='HEAD'){
   return new Response(null,{status:200,headers:{'content-type':'image/png','cache-control':IMG_CACHE,...baseHeaders}});
  }
  try{
   if(deps.renderImage){
    const result=await deps.renderImage(game);
    if(result instanceof Uint8Array&&result.length>1000)png=result;
    else if(result instanceof Response&&result.ok){const body=new Uint8Array(await result.arrayBuffer());if(body.length>1000)png=body;}
   }
  }catch(error){console.error('EOT PNG render error:',String(error));}
  // Self-contained static PNG fallback; never depend on a missing GitHub image.
  const fallback=!png;
  if(fallback)png=fallbackPng();
  const headers=new Headers({'content-type':'image/png','cache-control':fallback?'public, max-age=8, s-maxage=8':IMG_CACHE,...baseHeaders});
  if(fallback)headers.set('X-EOT-Image-Mode','fallback');
  const response=new Response(png,{status:200,headers});
  if(cache){
   try{
    const work=cache.put(request,response.clone()).catch(error=>console.warn('PNG cache write:',String(error)));
    if(deps.ctx&&typeof deps.ctx.waitUntil==='function')deps.ctx.waitUntil(work);
    else await work;
   }catch(error){console.warn('PNG cache update:',String(error));}
  }
  return response;
 }
 const imageUrl=new URL(`/image/${id}.png`,url.origin);
 if(region)imageUrl.searchParams.set('region',region);
 if(server)imageUrl.searchParams.set('server',server);
 imageUrl.searchParams.set('v','43');
 const landingUrl=siteMatchUrl(id,region,env);
 const content=metadataHtml(game,url.toString(),imageUrl.toString(),landingUrl,starblastJoinUrl(game));
 return new Response(request.method==='HEAD'?null:content,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':PAGE_CACHE,...baseHeaders}});
}
