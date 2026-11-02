import {owner} from '@/lib/server';
import {decrypt,exchangeToken,storeTokens,requireCanvaConfig} from '@/lib/canva';
export async function GET(req:Request){
  const url=new URL(req.url);let message='Canva 계정을 연결했습니다. 열려 있는 수업 화면으로 돌아가 연결 상태를 새로 확인해주세요.';
  let status=200;
  try{
    const s=requireCanvaConfig();if(url.origin!==new URL(s.CANVA_REDIRECT_URI).origin)throw Error('Canva 콜백 주소가 일치하지 않습니다.');
    const user=await owner();
    if(url.searchParams.has('error'))throw Error('Canva 연결 승인이 취소되었습니다.');
    const raw=req.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('studio_canva_oauth='))?.split('=').slice(1).join('=');
    if(!raw)throw Error('Canva 연결 요청이 만료되었습니다. 다시 연결해주세요.');
    const pending=await decrypt<{state:string;verifier:string;expires:number}>(decodeURIComponent(raw),`canva-oauth:${user}`);
    if(pending.expires<Date.now()||pending.state!==url.searchParams.get('state'))throw Error('Canva 연결 요청이 일치하지 않거나 만료되었습니다.');
    const code=url.searchParams.get('code');if(!code)throw Error('Canva 인증 코드가 없습니다.');
    await storeTokens(user,await exchangeToken(new URLSearchParams({grant_type:'authorization_code',code,code_verifier:pending.verifier,redirect_uri:s.CANVA_REDIRECT_URI})));
  }catch{message='Canva 연결을 완료하지 못했습니다. 승인 여부와 서버 인증 설정을 확인한 뒤 다시 연결해주세요.';status=400;}
  return new Response(`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Canva 연결</title><body style="font-family:system-ui;padding:48px;line-height:1.8;background:#f8f6ef;color:#20373b"><h1>Canva 연결</h1><p>${message}</p><a href="/">수업 스튜디오 열기</a></body></html>`,{status,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Set-Cookie':'studio_canva_oauth=; Path=/api/canva; HttpOnly; SameSite=Lax; Max-Age=0','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
}
