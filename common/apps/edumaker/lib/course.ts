import {z} from 'zod';
import type {JournalContext} from './journal-settings';
export const InputSchema=z.object({topic:z.string().trim().min(2).max(300),audience:z.string().max(100),minutes:z.number().int().min(15).max(480),sessions:z.number().int().min(1).max(30),tools:z.string().max(600),conditions:z.string().max(2000),newsScrap:z.boolean().default(true),autoCanva:z.boolean().default(true),goals:z.string().max(1500).default(''),outcome:z.string().max(800).default(''),experience:z.string().max(500).default(''),headcount:z.number().int().min(0).max(1000).default(0),location:z.string().max(300).default(''),materials:z.string().max(1000).default(''),safety:z.string().max(1000).default(''),plannedDate:z.string().max(20).default('')});
export type CourseInput=z.infer<typeof InputSchema>;
export type Article={title:string;url:string;source:string;published:string;retrieved:string;excerpt:string};
export type Slide={title:string;body:string;notes:string;sources:Article[];kind:'lesson'|'news';session:number};
export type Session={title:string;goals:string[];content:{title:string;details:string[]}[];flow:{activity:string;minutes:number}[];materials:string;actual:{date:string;attendance:string;activities:string;progress:string;issues:string;reflection:string};journal:string;journalEntries?:{goals:string[];topics:{title:string;details:string[]}[]};journalDetailGenerated?:boolean[][];journalEditorDirty?:boolean;journalCreatedAt?:string;journalDeletedAt?:string;journalSummarySource?:'ai'};
export type MaterialKind='plan'|'slides'|'journal';
export type Course={id:string;input:CourseInput;sessions:Session[];slides:Slide[];news:Article[];newsStatus:string;generatedBy:string;updated:string;revision:number;journalContext?:JournalContext;prepared?:Record<MaterialKind,boolean>;canva?:{jobId:string;status:'in_progress'|'success'|'failed';editUrl?:string}};
export function materialReady(course:Course,kind:MaterialKind){return course.prepared?.[kind]??true;}
export function materialBase(input:CourseInput,existing:Course|null):Course{
  const core=(value:CourseInput)=>{const {newsScrap,autoCanva,...fields}=value;return JSON.stringify(fields);};
  if(existing&&core(InputSchema.parse(existing.input))===core(input))return existing;
  const draft=createDraft(input);
  return {...draft,slides:[],sessions:draft.sessions.map(s=>({...s,journal:''})),prepared:{plan:false,slides:false,journal:false}};
}
export function synchronizePlan(course:Course,sessions:Session[]):Course{
  const slides=course.slides.map(slide=>{
    if(slide.kind!=='lesson'||!slide.session)return slide;
    const previous=course.sessions[slide.session-1],next=sessions[slide.session-1];if(!previous||!next)return slide;
    if(slide.title.includes('학습목표'))return {...slide,body:next.goals.join('\n')};
    const index=previous.content.findIndex(c=>c.title===slide.title);
    return index<0?slide:{...slide,title:next.content[index].title,body:next.content[index].details.join('\n')};
  });
  const updated={...course,sessions,slides};
  return materialReady(course,'journal')?prepareJournals(updated):updated;
}
export function prepareMaterial(course:Course,kind:MaterialKind):Course{
  let next=course;
  if(kind==='slides'&&!materialReady(course,'slides')){
    const template=createDraft(course.input);
    next={...course,slides:synchronizePlan(template,course.sessions).slides};
  }
  if(kind==='slides'){
    if(!newsEnabled(course.input))next={...next,news:[],newsStatus:'뉴스 스크랩 사용 안 함',slides:next.slides.filter(s=>s.kind!=='news')};
    else if(next.slides.filter(s=>s.kind==='news').length!==5)next={...next,slides:[...next.slides.filter(s=>s.kind!=='news'),...createDraft(course.input).slides.filter(s=>s.kind==='news')]};
  }
  if(kind==='journal')next=prepareJournals(next);
  return {...next,prepared:{plan:materialReady(course,'plan'),slides:materialReady(course,'slides'),journal:materialReady(course,'journal'),[kind]:true},revision:course.revision+1};
}
export function newsEnabled(input:Pick<CourseInput,'newsScrap'>){return input.newsScrap!==false;}
function contextHeader(c?:JournalContext){return c?[c.categoryTitle&&`과정·기수: ${c.categoryTitle}`,c.period&&`과정 기간: ${c.period}`,c.guidance&&`과정 공통 기준: ${c.guidance}`].filter(Boolean):[];}
export function journalStructure(s:Session,context?:JournalContext,draft=false){const f=context?.format||{goals:2,topics:3,details:3};return {goals:Array.from({length:f.goals},(_,i)=>s.journalEntries?.goals[i]??s.goals[i]??''),topics:Array.from({length:f.topics},(_,i)=>({title:s.journalEntries?.topics[i]?.title??s.content[i]?.title??`교육내용 ${i+1}`,details:Array.from({length:f.details},(_,j)=>s.journalEntries?.topics[i]?.details[j]??(draft?s.content[i]?.details[j]:'')??'')}))};}
export function populateJournalDetails(s:Session,context?:JournalContext):Session{
  if(!s.actual.activities.trim())throw Error('실제로 진행한 교육내용을 먼저 입력해주세요.');
  const visible=journalStructure(s,context),entries=structuredClone(s.journalEntries||{goals:visible.goals,topics:visible.topics}),generated=structuredClone(s.journalDetailGenerated||[]);
  const slots:{i:number;j:number}[]=[];
  visible.topics.forEach((topic,i)=>{if(!entries.topics[i])entries.topics[i]={title:topic.title,details:[]};if(!generated[i])generated[i]=[];topic.details.forEach((_,j)=>{if(!entries.topics[i].details[j]?.trim()||generated[i][j]){entries.topics[i].details[j]='';generated[i][j]=false;slots.push({i,j});}});});
  if(!slots.length)throw Error('상세기록이 모두 직접 작성된 상태입니다. 수정할 칸을 비우면 진행 기록을 채울 수 있습니다.');
  const parts=s.actual.activities.trim().split(/\r?\n+|(?<=[.!?。])\s+/u).map(t=>t.trim()).filter(Boolean);
  slots.forEach(({i,j},index)=>{const text=index===slots.length-1?parts.slice(index).join('\n'):parts[index]||'';entries.topics[i].details[j]=text;generated[i][j]=!!text;});
  return {...s,journalEntries:entries,journalDetailGenerated:generated,journalEditorDirty:true};
}
export function rebuildEditedJournals(course:Course):Course{return {...course,sessions:course.sessions.map(s=>!s.journalEditorDirty?s:{...s,journal:s.actual.activities.trim()?journalFor(s,course.input.topic,course.journalContext):(!s.journal||s.journal.startsWith('수업일지 초안 · ')?journalDraft(s,course.input,course.journalContext):s.journal),journalEditorDirty:false})};}
function outlineText(s:Session,context:JournalContext|undefined,draft:boolean){const outline=journalStructure(s,context,draft);return ['학습목표',...outline.goals.map((g,i)=>`${i+1}. ${g||'추가 작성 필요'}`),'교육내용',...outline.topics.flatMap((t,i)=>[`${i+1}. ${t.title}`,...t.details.map((d,j)=>`  ${i+1}-${j+1}. ${d||(draft?'수업 전 보완 필요':'실제 내용 미기록')}`)])];}
export function journalDraft(s:Session,input:CourseInput,context?:JournalContext){return [`수업일지 초안 · ${input.topic}`,'수업 전 준비 문서 · 실제 진행 결과 미기록',...contextHeader(context),`회차: ${s.title}`,`예정일: ${input.plannedDate||'미정'} / 예정 인원: ${input.headcount||'미정'} / 장소: ${input.location||'미정'}`,'아래 학습목표·교육내용은 계획 기준입니다.',...outlineText(s,context,true),'실제로 진행한 교육내용: 수업 후 입력','진행·목표 달성 현황: 수업 후 입력','특이사항: 수업 후 입력','강사 평가·다음 개선점: 수업 후 입력'].join('\n\n');}
export function prepareJournals(course:Course):Course{return {...course,sessions:course.sessions.map(s=>({...s,journal:s.journal&&!s.journal.startsWith('수업일지 초안 · ')?s.journal:s.actual.activities.trim()?journalFor(s,course.input.topic,course.journalContext):journalDraft(s,course.input,course.journalContext)}))};}
export function createDraft(input:CourseInput):Course{
const tools=input.tools.split(/[,，]/).map(s=>s.trim()).filter(Boolean);
const sessions=Array.from({length:input.sessions},(_,i)=>{const allocations=[Math.floor(input.minutes*.15),Math.floor(input.minutes*.2),Math.floor(input.minutes*.5)];allocations.push(input.minutes-allocations.reduce((a,b)=>a+b,0));return {title:input.sessions===1?input.topic:`${input.topic} · ${i+1}회차`,goals:[`${input.topic}의 핵심 개념과 작업 과정을 설명한다.`,`${tools.join('·')||'수업 도구'}로 결과물을 제작하고 개선점을 기록한다.`],content:[{title:'개념 이해와 준비',details:['목표와 결과물 기준 이해','관련 사례와 제작 원리 살펴보기','준비물·안전 수칙 확인']},{title:'설계와 제작',details:['아이디어와 작업 순서 정리',`${tools.join('·')||'수업 도구'} 사용 방법 익히기`,'설계·제작 및 중간 점검']},{title:'평가와 정리',details:['작품 결과와 과정 공유','문제점·개선 방향 정리','배운 내용과 다음 활동 기록']}],flow:['목표 안내·안전 확인','핵심 개념·도구 시연','설계·제작 실습','공유·평가·정리'].map((activity,j)=>({activity,minutes:allocations[j]})),materials:`노트북, ${tools.join('·')||'수업 도구'}, 주제에 맞는 재료·안전 장비 (강사 확인)`,actual:{date:'',attendance:'',activities:'',progress:'',issues:'',reflection:''},journal:''};});
sessions.forEach(s=>{const goals=input.goals.split(/\n|[。]/).map(v=>v.trim()).filter(Boolean);if(goals.length)s.goals=[goals[0],goals[1]||s.goals[1]];if(input.materials)s.materials=input.materials;if(input.outcome)s.content[2].details[0]=input.outcome+' 결과와 과정 공유';if(input.safety)s.content[0].details[2]=input.safety;});
const slides:Slide[]=[{title:input.topic,body:`${input.audience} · ${input.minutes}분 × ${input.sessions}회`,notes:'수업 목표와 최종 결과물을 소개합니다.',sources:[],kind:'lesson',session:0}];
sessions.forEach((s,i)=>{slides.push({title:`${i+1}회차 · 학습목표`,body:s.goals.join('\n'),notes:'활동 후 확인할 목표를 검토합니다.',sources:[],kind:'lesson',session:i+1});s.content.forEach(c=>slides.push({title:c.title,body:c.details.join('\n'),notes:'수업 주제에 맞는 사례와 작업 방법을 보완해주세요.',sources:[],kind:'lesson',session:i+1}));tools.forEach(t=>slides.push({title:`${t} 실습`,body:'작업 목적\n핵심 기능·작업 단계\n완료 확인과 문제 해결',notes:'현재 도구 화면을 확인해 실습 방법을 작성합니다.',sources:[],kind:'lesson',session:i+1}));slides.push({title:`${i+1}회차 · 결과 공유`,body:'내 결과물 소개\n제작 중 해결한 문제\n다음 개선점',notes:'결과와 제작 과정을 함께 평가합니다.',sources:[],kind:'lesson',session:i+1});});
if(newsEnabled(input))['최신 동향','최근 주요 이슈','실제 활용 사례','뉴스 비교·토론','실습 적용과 정리'].forEach(title=>slides.push({title,body:'관련 뉴스 검색 후 내용을 구성합니다.',notes:'원문 확인 후 배경·핵심 해설·수업 연결·토론 질문을 보완합니다.',sources:[],kind:'news',session:0}));
return prepareJournals({id:crypto.randomUUID(),input,sessions,slides,news:[],newsStatus:newsEnabled(input)?'미검색':'뉴스 스크랩 사용 안 함',generatedBy:'구조 기반 초안 · 내용 검토 필요',updated:new Date().toISOString(),revision:1});}
export function journalFor(s:Session,topic:string,context?:JournalContext){if(!s.actual.activities.trim())throw Error('실제로 진행한 활동을 입력해주세요.');return [`수업일지 · ${topic}`,...contextHeader(context),`회차: ${s.title}`,`수업일: ${s.actual.date||'미입력'} / 참여 인원: ${s.actual.attendance||'미입력'}`,'실제 교육내용',s.actual.activities,...(context?outlineText(s,context,false):[]),`진행·달성 현황: ${s.actual.progress||'미입력'}`,`특이사항: ${s.actual.issues||'미입력'}`,`강사 평가·다음 개선점: ${s.actual.reflection||'미입력'}`].join('\n\n');}
