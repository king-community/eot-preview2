import {cleanId,cleanRegion,loadMatch,findMatch,missingMatch,siteMatchUrl} from './data.mjs';
import {metadataHtml,imageHtml} from './markup.mjs';

const PREVIEW_FALLBACK='https://king-community.github.io/eot-server-list/eot-preview-v417.png';
const CACHE_CONTROL='public, max-age=30, s-maxage=30';
const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'X-Frame-Options':'DENY',
};
async function matchFor(id, region, fetchImpl){
  try{
    const live=await loadMatch(fetchImpl,id,region);
    return live??missingMatch(id,region);
  }catch(_){
    return missingMatch(id,region);
  }
}
export async function handleRequest(request, env={}, deps={}){
  const fetchImpl=deps.fetchImpl||fetch;
  const renderImage=deps.renderImage;
  const url=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  const pageMatch=url.pathname.match(/^\/m\/(\d{1,9})\/?$/);
  const imageMatch=url.pathname.match(/^\/image\/(\d{1,9})\.png$/);
  if(!pageMatch&&!imageMatch){
    return new Response('EOT SERVER LIST / Match Preview Service — Visit https://king-community.github.io/eot-server-list/',{status:200,headers:{'content-type':'text/plain; charset=utf-8',...securityHeaders}});
  }
  const id=cleanId(pageMatch?.[1]||imageMatch?.[1]);
  if(!id)return new Response('Invalid match ID',{status:400});
  const suppliedRegion=url.searchParams.get('region');
  const region=cleanRegion(suppliedRegion);
  if(suppliedRegion && !region)return new Response('Invalid region',{status:400});
  const game=await matchFor(id,region,fetchImpl);
  if(imageMatch){
    let response=null;
    if(renderImage){
      try{response=await renderImage(imageHtml(game));}
      catch(_){}
    }
    if(!response){
      try{response=await fetchImpl(PREVIEW_FALLBACK);}catch(_){}
    }
    if(!response || !response.ok) return new Response('Preview temporarily unavailable',{status:503,headers:{'cache-control':'no-store',...securityHeaders}});
    const headers=new Headers(response.headers);
    headers.set('Content-Type','image/png');headers.set('Cache-Control',CACHE_CONTROL);
    for(const [k,v] of Object.entries(securityHeaders))headers.set(k,v);
    return new Response(request.method==='HEAD'?null:response.body,{status:200,headers});
  }
  const pageUrl=new URL(url);
  const imageUrl=new URL('/image/'+id+'.png',url.origin);
  if(region)imageUrl.searchParams.set('region',region);
  const landingUrl=siteMatchUrl(id,region,env);
  const content=metadataHtml(game,pageUrl.toString(),imageUrl.toString(),landingUrl);
  return new Response(request.method==='HEAD'?null:content,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':CACHE_CONTROL,...securityHeaders}});
}
