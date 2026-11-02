'use client';
import type {CanvaLink,CanvaLinkCategory} from '@/lib/canva-links';
import {canvaEmbedUrl} from '@/lib/canva-embed';
export default function CanvaLinkCard({entry,checked,disabled,onCheck,categories,onAssign}:{entry:CanvaLink;checked:boolean;disabled:boolean;onCheck:()=>void;categories:CanvaLinkCategory[];onAssign:(id:string)=>void}){
  const embed=canvaEmbedUrl(entry.url);
  return <article className="canva-design-card">
    <div className="canva-design-preview">
      {embed?<iframe src={embed} title={entry.title+' 첫 페이지 미리보기'} loading="lazy" referrerPolicy="no-referrer" tabIndex={-1}/>:<p>이 링크는 미리보기를 지원하지 않습니다.</p>}
      <a className="canva-design-preview-link" href={entry.url} target="_blank" rel="noopener noreferrer" aria-label={entry.title+' Canva에서 열기(새 탭)'}/>
      <label className="canva-design-check"><input type="checkbox" checked={checked} disabled={disabled} onChange={onCheck} aria-label={entry.title+' 선택'}/></label>
    </div>
    <div className="canva-design-caption"><h3><a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.title}</a></h3><p><span>{entry.categoryTitle||'미분류'}</span><time dateTime={entry.date}>{entry.date}</time></p><label className="canva-card-category">카테고리<select disabled={disabled} value={entry.categoryId||''} onChange={e=>onAssign(e.target.value)}><option value="">미분류</option>{categories.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><a className="canva-design-open" href={entry.url} target="_blank" rel="noopener noreferrer">Canva에서 열기 ↗</a></div>
  </article>;
}
