import {owner,failure} from '@/lib/server';
import {searchNews} from '@/lib/news-search';
export async function POST(req:Request){
  try{
    await owner();
    const {topic}=await req.json() as {topic:unknown};
    if(typeof topic!=='string'||topic.trim().length<2||topic.length>300)throw Error('수업 주제를 확인해주세요.');
    return Response.json(await searchNews(topic));
  }catch(e){return failure(e);}
}