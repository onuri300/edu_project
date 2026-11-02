import assert from 'node:assert/strict';
import {test} from 'node:test';
import {InputSchema,materialBase,materialReady,prepareMaterial,synchronizePlan,createDraft} from '../lib/course.ts';
const input=InputSchema.parse({topic:'브랜드와 로고',audience:'성인 입문자',minutes:90,sessions:2,tools:'',conditions:''});
test('자료별 최초 생성은 선택한 자료만 준비한다',()=>{
  for(const kind of ['plan','slides','journal']){
    const base=materialBase(input,null),course=prepareMaterial(base,kind);
    for(const other of ['plan','slides','journal'])assert.equal(materialReady(course,other),other===kind);
    if(kind!=='slides')assert.equal(course.slides.length,0);
    if(kind!=='journal')assert.ok(course.sessions.every(s=>!s.journal));
    else assert.ok(course.sessions.every(s=>s.journal.includes('실제 진행 결과 미기록')&&!s.actual.activities));
  }
});
test('이어서 생성할 때 수업·편집한 계획·실제 기록을 보존한다',()=>{
  const plan=prepareMaterial(materialBase(input,null),'plan');plan.sessions[0].goals[0]='내가 정한 목표';
  plan.sessions[0].actual.activities='실제 수업 활동';plan.sessions[0].journal='직접 작성한 기록';
  const slides=prepareMaterial(materialBase(input,plan),'slides');
  assert.equal(slides.id,plan.id);assert.equal(slides.sessions[0].journal,'직접 작성한 기록');
  assert.equal(slides.slides.find(s=>s.session===1&&s.title.includes('학습목표')).body.split('\n')[0],'내가 정한 목표');
});
test('뉴스 옵션만 바꾸면 같은 수업을 사용하고 뉴스 장수만 변경한다',()=>{
  const c=prepareMaterial(materialBase(input,null),'slides');const changed={...input,newsScrap:false};
  const base=materialBase(changed,c);assert.equal(base.id,c.id);
  const next=prepareMaterial({...base,input:changed},'slides');assert.equal(next.slides.filter(s=>s.kind==='news').length,0);assert.equal(next.news.length,0);
  const restored=prepareMaterial({...next,input},'slides');assert.equal(restored.slides.filter(s=>s.kind==='news').length,5);
});
test('계획 수정은 연결된 목표를 갱신하며 실제 일지는 보존한다',()=>{
  const c=createDraft(input);c.sessions[0].journal='완료 기록';const sessions=structuredClone(c.sessions);sessions[0].goals[0]='변경한 목표';
  const next=synchronizePlan(c,sessions);assert.equal(next.sessions[0].journal,'완료 기록');assert.ok(next.slides.some(s=>s.body.startsWith('변경한 목표')));
  assert.equal(materialReady(c,'plan'),true);assert.notEqual(materialBase({...input,topic:'다른 수업'},c).id,c.id);
});
