import {owner,db,failure} from '@/lib/server';
import {canvaRequest,JobSchema} from '@/lib/canva';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){try{
  const user=await owner();const {id}=await params;
  if(!/^[A-Za-z0-9_-]{1,200}$/.test(id)||!await db().prepare('SELECT id FROM canva_jobs WHERE id=? AND owner=?').bind(id,user).first())return Response.json({error:'Canva 생성 요청을 찾을 수 없습니다.'},{status:404});
  const result=JobSchema.parse(await canvaRequest(user,`generations/${encodeURIComponent(id)}`));
  const edit=result.job.result?.design.urls.edit_url;
  if(edit){const url=new URL(edit);if(url.protocol!=='https:'||!(url.hostname==='canva.com'||url.hostname.endsWith('.canva.com')))throw Error('Canva 편집 링크를 확인할 수 없습니다.');}
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
