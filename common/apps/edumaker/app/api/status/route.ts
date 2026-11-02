import {owner,secrets,failure} from '@/lib/server';
export async function GET(){try{await owner();return Response.json({ai:!!secrets().OPENAI_API_KEY,news:true,canva:false});}catch(e){return failure(e);}}
