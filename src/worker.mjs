import {ImageResponse} from 'workers-og';
import {handleRequest} from './router.mjs';
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, {fetchImpl:fetch, renderImage:async (html)=>new ImageResponse(html,{width:1200,height:630})});
  }
};
