import {z} from 'zod';
import {owner,db,failure} from '@/lib/server';
import {changeJournalDeletion} from '@/lib/journal-deletion';
import type {Course} from '@/lib/course';
const schema=z.object({action:z.enum(['delete','restore']),targets:z.array(z.object({courseId:z.string().min(1).max(100),index:z.number().int().min(0).max(29)})).min(1).max(200)});
export async function POST(req:Request){try{
  const user=await owner(),parsed=schema.safeParse(await req.json());if(!parsed.success)throw Error('삭제·복구할 일지를 1~200개 선택해주세요.');
  const groups=new Map<string,number[]>();for(const t of parsed.data.targets){const indices=groups.get(t.courseId)||[];if(!indices.includes(t.index))indices.push(t.index);groups.set(t.courseId,indices);}
  const records: {id:string;old:string;course:Course;indices:number[]}[]=[];
  for(const [id,indices] of groups){const row=await db().prepare('SELECT payload FROM courses WHERE id=? AND owner=?').bind(id,user).first<{payload:string}>();if(!row)return Response.json({error:'접근할 수 없는 일지가 포함되어 있습니다.'},{status:404});const course=JSON.parse(row.payload) as Course;const updated=changeJournalDeletion(course,indices,parsed.data.action,new Date().toISOString());records.push({id,old:row.payload,course:updated,indices});}
  const now=new Date().toISOString();const results=await db().batch(records.map(r=>db().prepare('UPDATE courses SET payload=?,updated=? WHERE id=? AND owner=? AND payload=?').bind(JSON.stringify(r.course),now,r.id,user,r.old)));
  const courses=records.filter((_,i)=>!!results[i].meta.changes).map(r=>r.course),conflicts=records.length-courses.length;
  return Response.json({courses,changed:records.reduce((n,r,i)=>n+(results[i].meta.changes?r.indices.filter(index=>r.course.sessions[index].journal.trim()).length:0),0),conflicts},{headers:{'Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
