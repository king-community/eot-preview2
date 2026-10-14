import {handleRequest} from './router.mjs';
import {renderPng} from './png.mjs';
export default {
 async fetch(request,env,ctx){
  return handleRequest(request,env,{fetchImpl:fetch,renderImage:renderPng,ctx});
 }
};
