'use client';
import {useRef,type ReactNode} from 'react';
import {BookOpen,Layers,NotebookPen,ArrowUpRight} from 'lucide-react';
import {Input} from '@/components/ui/input';
import type {CourseInput,MaterialKind} from '@/lib/course';

export default function MaterialStart({input,onChange,onGenerate,busy,children}:{input:CourseInput;onChange:(input:CourseInput)=>void;onGenerate:(kind:MaterialKind)=>void;busy:boolean;children:ReactNode}){
  const form=useRef<HTMLFormElement>(null);
  const actions=[{kind:'plan' as const,title:'수업계획안',description:'학습목표·교육내용·시간 배분',icon:BookOpen},{kind:'slides' as const,title:'교안·뉴스',description:'슬라이드·강사용 노트·선택한 뉴스',icon:Layers},{kind:'journal' as const,title:'수업일지',description:'수업 전 초안 또는 입력한 실제 기록',icon:NotebookPen}];
  const generate=(kind:MaterialKind)=>{if(form.current?.reportValidity())onGenerate(kind);};
  return <section className="material-start" aria-label="자료별 생성"><div className="start-intro"><span className="eyebrow">수업 정보</span><h2>어떤 수업을 준비하시나요?</h2><p>주제와 대상을 입력하고 필요한 자료를 선택하세요.</p></div>
    <form ref={form} onSubmit={e=>{e.preventDefault();generate('plan');}}>
      <fieldset disabled={busy} className="input-fieldset"><div className="start-fields"><label>수업 주제<Input value={input.topic} onChange={e=>onChange({...input,topic:e.target.value})} required minLength={2} maxLength={300} placeholder="예: 나만의 브랜드와 로고 만들기"/></label><label>수업 대상<Input value={input.audience} onChange={e=>onChange({...input,audience:e.target.value})} required maxLength={100} placeholder="예: 성인 입문자, 초등 고학년"/></label></div>
        <div className="material-actions">{actions.map(({kind,title,description,icon:Icon},index)=><button type="button" className="material-action" key={kind} onClick={()=>generate(kind)} aria-label={`${title} 생성`}><span className="action-index">0{index+1}</span><Icon size={25}/><strong>{title}</strong><span className="action-description">{description}</span><span className="action-link">바로 생성<ArrowUpRight size={17}/></span></button>)}</div>
        <label className="news-choice"><input type="checkbox" checked={input.newsScrap} onChange={e=>onChange({...input,newsScrap:e.target.checked})}/>교안에 관련 뉴스 포함<small>교안·뉴스 생성에만 적용</small></label>
        <details className="start-details"><summary>상세 설정 <span>{input.minutes}분 × {input.sessions}회 · 필요할 때 수정</span></summary><div className="fields">{children}</div></details>
      </fieldset>
    </form>
    <p className="start-note">선택한 자료만 생성합니다. 수업일지는 실제 진행 결과를 구분한 초안으로 준비합니다.</p>
  </section>;
}
