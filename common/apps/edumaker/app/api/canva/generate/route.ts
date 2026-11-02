import {owner,db,failure} from '@/lib/server';
import {CanvaCourseSchema,canvaBrief,canvaRequest,checkCanvaOrigin,JobSchema} from '@/lib/canva';
export async function POST(req:Request){try{
  const user=await owner();checkCanvaOrigin(req);
  const course=CanvaCourseSchema.parse(await req.json());
  const newsCount=course.input.newsScrap?5:0;
  if(course.slides.filter(s=>s.kind==='news').length!==newsCount||(newsCount&&course.slides.slice(-5).some(s=>s.kind!=='news')))throw Error('뉴스 스크랩 선택과 교안 구성이 일치하지 않습니다.');
  const body=canvaBrief(course);
  const result=JobSchema.parse(await canvaRequest(user,'generations',body));
  await db().prepare('INSERT INTO canva_jobs (id,owner,course_id,created) VALUES (?,?,?,?)').bind(result.job.id,user,course.id,new Date().toISOString()).run();
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
