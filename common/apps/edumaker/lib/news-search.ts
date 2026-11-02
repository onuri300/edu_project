import {parseNews,newsQueries} from './news';
import type {Article} from './course';

export async function searchNews(topic:string){
  const queries=newsQueries(topic);
  const articles:Article[]=[];
  const seen=new Set<string>();
  let days=30,coveredDays=0,usedQuery=queries[0],reachable=false;
  outer:for(const [index,query] of queries.entries()){
    for(const range of index===0?[30,90,180]:[30,180]){
      days=range;usedQuery=query;
      const url=new URL('https://news.google.com/rss/search');
      url.search=new URLSearchParams({q:`${query} when:${range}d`,hl:'ko',gl:'KR',ceid:'KR:ko'}).toString();
      try{
        const result=await fetch(url,{signal:AbortSignal.timeout(8000)});
        if(!result.ok)continue;
        const xml=await result.text();
        if(!xml.includes('<rss'))continue;
        reachable=true;
        for(const article of parseNews(xml)){
          const terms=query.toLowerCase().split(/\s+/).filter(t=>t.length>1);
          const articleText=`${article.title} ${article.excerpt}`.toLowerCase();
          const matches=terms.filter(t=>articleText.includes(t)||(t==='ai'&&articleText.includes('인공지능'))).length;
          if(terms.length&&matches<Math.min(2,terms.length))continue;
          if(seen.has(article.title)||seen.has(article.url))continue;
          seen.add(article.title);seen.add(article.url);articles.push(article);coveredDays=Math.max(coveredDays,range);
        }
        if(articles.length>=5)break outer;
      }catch{ /* 실패를 기사로 대체하지 않습니다. */ }
    }
  }
  if(!reachable)throw Error('Google 뉴스 검색에 연결할 수 없습니다. 작성 중인 자료는 유지됩니다. 잠시 후 다시 시도해주세요.');
  days=coveredDays||days;
  articles.sort((a,b)=>(Date.parse(b.published)||0)-(Date.parse(a.published)||0));
  return {articles:articles.slice(0,12),days,query:usedQuery,status:articles.length?`최근 ${days}일 범위 · ${Math.min(articles.length,12)}건 검색${usedQuery!==queries[0]?' · 핵심 키워드로 검색 확대':''} · 기사 원문 검토 필요`:'관련 기사 없음 · 검색어를 넓혀주세요.'};
}
