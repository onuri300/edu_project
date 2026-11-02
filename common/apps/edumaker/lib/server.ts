import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function owner(){const user=await getChatGPTUser();if(!user)throw Error('로그인 후 이용해주세요.');return user.userId;}
export function db(){const binding=(env as unknown as {DB?:D1Database}).DB;if(!binding)throw Error('저장 공간에 연결할 수 없습니다. 입력 내용은 화면에 유지됩니다.');return binding;}
export function secrets(){return env as unknown as {OPENAI_API_KEY?:string;OPENAI_MODEL?:string};}
export function failure(e:unknown){return Response.json({error:e instanceof Error?e.message:'요청을 처리하지 못했습니다.'},{status:400});}
