import {getChatGPTUser,chatGPTSignInPath} from '@/app/chatgpt-auth';
export async function GET(req:Request){const user=await getChatGPTUser();return Response.json({authenticated:!!user,displayName:user?.displayName||'',local:['127.0.0.1','localhost','[::1]'].includes(new URL(req.url).hostname),signInPath:chatGPTSignInPath('/')},{headers:{'Cache-Control':'private, no-store'}});}
