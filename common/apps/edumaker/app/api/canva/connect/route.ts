import {owner,failure} from '@/lib/server';
import {checkCanvaOrigin,requireCanvaConfig,randomValue,base64,encrypt} from '@/lib/canva';
export async function POST(req:Request){try{
  const user=await owner();checkCanvaOrigin(req);const s=requireCanvaConfig();
  const state=randomValue(),verifier=randomValue();
  const challenge=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const url=new URL('https://www.canva.com/api/oauth/authorize');
  url.search=new URLSearchParams({client_id:s.CANVA_CLIENT_ID,response_type:'code',redirect_uri:s.CANVA_REDIRECT_URI,scope:'design:content:write design:meta:read',state,code_challenge:challenge,code_challenge_method:'S256'}).toString();
  const secure=new URL(s.CANVA_REDIRECT_URI).protocol==='https:'?'; Secure':'';
  return Response.json({url:url.href},{headers:{'Cache-Control':'no-store','Set-Cookie':`studio_canva_oauth=${encodeURIComponent(await encrypt({state,verifier,expires:Date.now()+600000},`canva-oauth:${user}`))}; Path=/api/canva; HttpOnly; SameSite=Lax; Max-Age=600${secure}`}});
}catch(e){return failure(e);}}
