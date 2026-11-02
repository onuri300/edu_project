import type {Article} from './course';
export function newsQueries(topic:string){
  const full=topic.trim().replace(/[\r\n]+/g,' ');
  const terms=full.split(/[\s,·/()+]+/).filter(t=>t.length>1&&!/^(수업|교육|만들기|제작|활용|체험|실습|기초|입문|강의|활동)$/.test(t));
  const broad=terms.slice(0,2).join(' ');
  return broad&&broad!==full?[full,broad]:[full];
}
export function text(value:string){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>{const code=Number(n);return code<=0x10ffff?String.fromCodePoint(code):'';}).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
export function parseNews(xml:string):Article[]{const tag=(item:string,name:string)=>item.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>'))?.[1]||'';const seen=new Set<string>();return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).flatMap(m=>{const item=m[1],title=text(tag(item,'title')),url=text(tag(item,'link'));if(!title||seen.has(title)||!url.startsWith('https://news.google.com/'))return [];seen.add(title);const date=new Date(text(tag(item,'pubDate')));return [{title,url,source:text(tag(item,'source')),published:Number.isNaN(date.getTime())?'미확인':date.toISOString(),retrieved:new Date().toISOString(),excerpt:text(tag(item,'description')).slice(0,1200)}];}).slice(0,12);}
