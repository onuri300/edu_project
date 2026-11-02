'use client';
import {useEffect,useState,useRef} from 'react';
export type ImageDraft={slot:1|2;file:File|null;caption:string};
export const emptyImageDrafts=():ImageDraft[]=>[{slot:1,file:null,caption:''},{slot:2,file:null,caption:''}];
function Draft({value,onChange,disabled}:{value:ImageDraft;onChange:(draft:ImageDraft)=>void;disabled:boolean}){
  const [preview,setPreview]=useState(''),[error,setError]=useState('');
  const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(!value.file){setPreview('');if(input.current)input.current.value='';return;}const url=URL.createObjectURL(value.file);setPreview(url);return()=>URL.revokeObjectURL(url);},[value.file]);
  return <figure className="reference-image-slot"><figcaption>새 카테고리 참고 이미지 {value.slot}</figcaption>{preview?<img src={preview} alt={`새 참고 이미지 ${value.slot} 미리보기`}/>:<div className="reference-image-empty">새 이미지 선택</div>}<label>이미지 {value.slot} 파일<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e=>{const file=e.target.files?.[0]||null;if(file&&(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)){setError('15MB 이하 JPG·PNG·WebP 파일을 선택해주세요.');e.target.value='';return;}setError('');onChange({...value,file});}}/></label><label>이미지 {value.slot} 설명<textarea disabled={disabled} rows={2} maxLength={500} value={value.caption} onChange={e=>onChange({...value,caption:e.target.value})}/></label>{value.file&&<button type="button" disabled={disabled} onClick={()=>onChange({...value,file:null,caption:''})}>선택 취소</button>}{error&&<p className="error" role="alert">{error}</p>}</figure>;
}
export default function CategoryImageDrafts({value,onChange,disabled}:{value:ImageDraft[];onChange:(drafts:ImageDraft[])=>void;disabled:boolean}){return <section className="category-image-drafts"><h3>수업 내용 참고 이미지</h3><p className="muted">새 카테고리에 사용할 이미지 2장을 선택하세요. 카테고리 저장 시 함께 등록됩니다.</p><div className="reference-image-grid">{value.map(d=><Draft key={d.slot} value={d} disabled={disabled} onChange={next=>onChange(value.map(v=>v.slot===next.slot?next:v))}/>)}</div></section>;}
