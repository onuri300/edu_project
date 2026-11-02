import {env} from 'cloudflare:workers';
import {db} from './server';
import {z} from 'zod';
import {InputSchema} from './course';

const TokenSchema=z.object({access_token:z.string().min(1),refresh_token:z.string().min(1),expires_in:z.number().positive()});
type StoredTokens={access:string;refresh:string;expires:number};
export function canvaConfig(){
  const settings=env as unknown as {CANVA_CLIENT_ID?:string;CANVA_CLIENT_SECRET?:string;CANVA_REDIRECT_URI?:string;CANVA_TOKEN_KEY?:string};
  return settings;
}
export function canvaConfigured(){const s=canvaConfig();return !!(s.CANVA_CLIENT_ID&&s.CANVA_CLIENT_SECRET&&s.CANVA_REDIRECT_URI&&s.CANVA_TOKEN_KEY);}
export function requireCanvaConfig(){
  const s=canvaConfig();
  if(!canvaConfigured())throw Error('웹앱용 Canva 인증 설정이 필요합니다. 연결 안내를 확인해주세요.');
  const url=new URL(s.CANVA_REDIRECT_URI!);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('Canva 콜백 주소를 확인해주세요.');
  return s as Required<typeof s>;
}
export function checkCanvaOrigin(req:Request){
  const expected=new URL(requireCanvaConfig().CANVA_REDIRECT_URI).origin;
  if(new URL(req.url).origin!==expected||req.headers.get('origin')!==expected)throw Error('현재 주소와 Canva 연결 주소가 다릅니다. 등록한 로컬 주소에서 다시 시도해주세요.');
}
export function base64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes));}
function fromBase64(s:string){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
export function randomValue(){return base64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
async function encryptionKey(){
  const bytes=fromBase64(requireCanvaConfig().CANVA_TOKEN_KEY);
  if(bytes.length!==32)throw Error('Canva 서버 암호화 키는 32바이트여야 합니다.');
  return crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt','decrypt']);
}
export async function encrypt(value:unknown,context:string){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(context)},await encryptionKey(),new TextEncoder().encode(JSON.stringify(value)));
  return `${base64(iv)}.${base64(new Uint8Array(ciphertext))}`;
}
export async function decrypt<T>(value:string,context:string):Promise<T>{
  const [iv,body]=value.split('.');
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(iv),additionalData:new TextEncoder().encode(context)},await encryptionKey(),fromBase64(body))));
}
export async function exchangeToken(body:URLSearchParams){
  const s=requireCanvaConfig();
  const response=await fetch('https://api.canva.com/rest/v1/oauth/token',{method:'POST',headers:{Authorization:`Basic ${base64(new TextEncoder().encode(`${s.CANVA_CLIENT_ID}:${s.CANVA_CLIENT_SECRET}`))}`,'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(15000)}).catch(()=>{throw Error('Canva 인증 서버에 연결할 수 없습니다.');});
  if(!response.ok)throw Error('Canva 인증이 만료되었거나 승인되지 않았습니다. 계정을 다시 연결해주세요.');
  const data=TokenSchema.parse(await response.json());
  return {access:data.access_token,refresh:data.refresh_token,expires:Date.now()+data.expires_in*1000};
}
export async function storeTokens(user:string,tokens:StoredTokens){
  await db().prepare('INSERT INTO canva_connections (owner,tokens,updated) VALUES (?,?,?) ON CONFLICT(owner) DO UPDATE SET tokens=excluded.tokens,updated=excluded.updated').bind(user,await encrypt(tokens,`canva-token:${user}`),new Date().toISOString()).run();
}
async function accessToken(user:string){
  requireCanvaConfig();
  const row=await db().prepare('SELECT tokens FROM canva_connections WHERE owner=?').bind(user).first<{tokens:string}>();
  if(!row)throw Error('먼저 Canva 계정을 연결해주세요.');
  let tokens=await decrypt<StoredTokens>(row.tokens,`canva-token:${user}`);
  if(tokens.expires<Date.now()+60000){
    tokens=await exchangeToken(new URLSearchParams({grant_type:'refresh_token',refresh_token:tokens.refresh}));
    await storeTokens(user,tokens);
  }
  return tokens.access;
}
export async function canvaRequest(user:string,path:string,body?:unknown){
  const token=await accessToken(user);
  const response=await fetch(`https://api.canva.com/rest/v1/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(25000)}).catch(()=>{throw Error('Canva 응답을 확인할 수 없습니다. Canva에서 생성 여부를 확인한 뒤 다시 시도해주세요.');});
  if(response.status===429)throw Error('Canva 요청 한도 또는 AI 크레딧 한도에 도달했습니다. 잠시 후 계정에서 확인해주세요.');
  if(response.status===401)throw Error('Canva 인증이 만료되었습니다. 계정을 다시 연결해주세요.');
  if(response.status===403)throw Error('Canva 디자인 생성 권한이 없습니다. 연동 앱의 권한과 계정의 AI 생성 사용 가능 여부를 확인해주세요.');
  if(!response.ok)throw Error('Canva가 요청을 처리하지 못했습니다. 계정 권한과 연결 설정을 확인해주세요.');
  return response.json() as Promise<unknown>;
}
const SourceSchema=z.object({title:z.string().max(1000),source:z.string().max(500),url:z.string().url().max(3000),published:z.string().max(100),retrieved:z.string().max(100)});
export const CanvaCourseSchema=z.object({id:z.string().min(1).max(100),input:InputSchema,slides:z.array(z.object({title:z.string().min(1).max(255),body:z.string().max(10000),notes:z.string().max(10000),kind:z.enum(['lesson','news']),sources:z.array(SourceSchema).max(12)})).min(1).max(100)});
export function canvaBrief(course:z.infer<typeof CanvaCourseSchema>){
  const sections=course.slides.map(slide=>{
    const description=[slide.body,`강사용 노트(제공된 내용): ${slide.notes}`,...slide.sources.map(a=>`출처: ${a.title} / ${a.source} / 게시 ${a.published} / 검색 ${a.retrieved} / ${a.url}`)].join('\n');
    if(description.length>2000)throw Error('일부 슬라이드의 본문·노트·출처가 Canva 전송 한도(2000자)를 넘습니다. 내용을 줄인 뒤 다시 시도해주세요.');
    return {title:slide.title,description};
  });
  return {brief:`한국어 16:9 강의용 교안. ${course.input.topic}, 대상 ${course.input.audience}, ${course.input.minutes}분 × ${course.input.sessions}회. 깊은 청록 #13595D, 크림 #F8F6EF, 차콜 #20373B, 사프란 #E8BA45 포인트. 여백과 그리드, 읽기 좋은 한글 산세리프. 제공한 ${sections.length}장 순서와 내용·출처를 유지. ${course.input.newsScrap?'뉴스는 마지막 5장.':'뉴스 슬라이드는 추가하지 말 것.'} 기사 사실이나 URL을 새로 만들지 말 것. 검색 발췌와 원문 미검증 표시는 유지. 장식용 사람 일러스트 최소화. 노트는 발표자 노트로 옮기고 결과는 강사가 검토할 초안으로 제작.`,design_type:{type:'preset',name:'presentation'},outline:{sections}};
}
export const JobSchema=z.object({job:z.object({id:z.string().regex(/^[A-Za-z0-9_-]{1,200}$/),status:z.enum(['in_progress','success','failed']),result:z.object({design:z.object({id:z.string(),urls:z.object({edit_url:z.string().url()})})}).optional()})});
