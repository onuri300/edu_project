'use client';

import {useEffect, useRef, useState} from 'react';
import {Check, ChevronDown, Palette} from 'lucide-react';

export const studioThemes = [
  {id:'mocha', name:'딥 틸 · 사프란', mood:'깊은 청록 × 크림 × 사프란', chips:['#13595d','#f8f6ef','#e8ba45']},
  {id:'peach', name:'테라코타 · 허니', mood:'테라코타 × 크림 × 허니', chips:['#a13c22','#faf5ed','#e8b64b']},
  {id:'peri', name:'바이올렛 · 앰버', mood:'바이올렛 × 아이보리 × 앰버', chips:['#5b4383','#f8f5ef','#dcb955']},
  {id:'sage', name:'포레스트 · 골드', mood:'포레스트 × 크림 × 골드', chips:['#456045','#f8f6ed','#dbac53']},
  {id:'blue', name:'예일 블루 · 머스터드', mood:'딥 블루 × 크림 × 머스터드', chips:['#0f5276','#f7f5ee','#dfb23d']},
  {id:'rose', name:'버건디 · 오커', mood:'버건디 × 크림 × 오커', chips:['#984351','#faf5ef','#ddb14b']},
] as const;
const storageKey = 'making-studio-theme';

export default function ThemePicker(){
  const [theme,setTheme]=useState('mocha');
  const menu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    let selected='mocha';
    try {const saved=localStorage.getItem(storageKey);if(studioThemes.some(t=>t.id===saved))selected=saved!;} catch {}
    setTheme(selected);
    document.documentElement.dataset.studioTheme=selected;
  },[]);
  useEffect(()=>{
    const close=(event:PointerEvent)=>{if(menu.current&&!menu.current.contains(event.target as Node))menu.current.open=false;};
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[]);
  const active=studioThemes.find(t=>t.id===theme)??studioThemes[0];
  function choose(id:string){
    setTheme(id);
    document.documentElement.dataset.studioTheme=id;
    try {localStorage.setItem(storageKey,id);} catch {}
    if(menu.current){menu.current.open=false;menu.current.querySelector('summary')?.focus();}
  }
  return <details className="theme-picker" ref={menu} onKeyDown={event=>{if(event.key==='Escape'&&menu.current){menu.current.open=false;menu.current.querySelector('summary')?.focus();}}}>
    <summary className="theme-toggle"><Palette size={17}/><span>테마 <strong>{active.name}</strong></span><span className="theme-mini" aria-hidden="true">{active.chips.map(c=><i key={c} style={{background:c}}/>)}</span><ChevronDown size={14}/></summary>
    <div className="theme-menu"><div className="theme-menu-heading"><strong>컬러 테마</strong><span>깊은 색과 따뜻한 보색 포인트 · 6가지 조합</span></div>
      <div className="theme-options">{studioThemes.map(t=><button type="button" key={t.id} className="theme-option" aria-pressed={theme===t.id} onClick={()=>choose(t.id)}><span className="theme-chips" aria-hidden="true">{t.chips.map(c=><i key={c} style={{background:c}}/>)}</span><span className="theme-option-title">{t.name}{theme===t.id&&<Check size={15}/>}</span><small>{t.mood}</small></button>)}</div>
    </div>
  </details>;
}
