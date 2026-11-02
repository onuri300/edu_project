'use client';
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Course} from '@/lib/course';

type Connection={configured:boolean;connected:boolean};
type Job={job:{id:string;status:'success'|'failed'|'in_progress';result?:{design:{urls:{edit_url:string}}}}};
async function request<T>(path:string,body?:unknown):Promise<T>{
  const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  const data=await response.json() as T&{error?:string};if(!response.ok)throw Error(data.error||'Canva 연결을 확인하지 못했습니다.');return data;
}
export default function CanvaPanel({course}:{course:Course}){
  const [connection,setConnection]=useState<{configured:boolean;connected:boolean}|null>(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[job,setJob]=useState(''),[editUrl,setEditUrl]=useState('');
  const [authUrl,setAuthUrl]=useState('');
  useEffect(()=>{let alive=true;request<Connection>('/api/canva/status').then(s=>{if(alive)setConnection(s);}).catch(e=>{if(alive)setMessage(e.message);});return()=>{alive=false;};},[]);
  useEffect(()=>{setJob(course.canva?.jobId||'');setEditUrl(course.canva?.editUrl||'');setMessage('');try{const saved=sessionStorage.getItem(`canva-job:${course.id}`);if(saved&&!course.canva?.jobId)setJob(saved);}catch{}},[course.id,course.canva?.jobId,course.canva?.editUrl]);
  async function action(fn:()=>Promise<void>){setBusy(true);setMessage('');try{await fn();}catch(e){setMessage(e instanceof Error?e.message:'Canva 요청을 확인하지 못했습니다.');}finally{setBusy(false);}}
  async function inspect(){await action(async()=>{
    const data=await request<Job>(`/api/canva/jobs/${encodeURIComponent(job)}`);
    if(data.job.status==='success'){
      const url=data.job.result?.design.urls.edit_url;
      if(!url)throw Error('Canva 결과에 편집 링크가 없습니다. 계정에서 디자인을 확인해주세요.');
      setEditUrl(url);setMessage('Canva 디자인이 생성되었습니다. 내용·장수·출처·발표자 노트를 확인해주세요.');
    }else setMessage(data.job.status==='failed'?'Canva 디자인 생성에 실패했습니다. 계정에서 한도와 생성 내역을 확인해주세요.':'Canva에서 디자인을 만드는 중입니다. 잠시 후 결과 확인을 눌러주세요.');
  });}
  return <section className="panel canva"><h2>Canva에서 교안 디자인</h2>
    <p>{connection?.connected?'Canva 계정 인증이 저장되어 있습니다. 현재 교안의 본문·기사 출처·강사용 노트를 디자인 요청에 포함합니다.':connection?.configured?'이 웹앱에서 사용할 Canva 계정을 연결해주세요.':'웹앱용 Canva 인증 설정이 필요합니다. Codex의 Canva 연결과 별도로 설정합니다.'}</p>
    {!connection?.configured&&<p><a href="/canva-setup" target="_blank" rel="noopener noreferrer">Canva 연결 설정 안내 ↗</a></p>}
    <div className="actions">
      <Button variant="outline" disabled={busy||!connection?.configured} onClick={()=>action(async()=>{const data=await request<{url:string}>('/api/canva/connect',{});setAuthUrl(data.url);setMessage('Canva 승인 화면 열기를 눌러 새 탭에서 연결해주세요. 현재 수업은 유지됩니다.');})}>{connection?.connected?'Canva 계정 다시 연결':'Canva 계정 연결'}</Button>
      {authUrl&&<a href={authUrl} target="_blank" rel="noopener noreferrer">Canva 승인 화면 열기 ↗</a>}
      <Button variant="outline" disabled={busy} onClick={()=>action(async()=>{setConnection(await request<Connection>('/api/canva/status'));setMessage('Canva 연결 상태를 확인했습니다.');})}>연결 상태 확인</Button>
      <Button disabled={busy||!connection?.connected} onClick={()=>action(async()=>{
        const result=await request<Job>('/api/canva/generate',course);setJob(result.job.id);setEditUrl('');
        try{sessionStorage.setItem(`canva-job:${course.id}`,result.job.id);}catch{}
        setMessage('Canva 디자인 생성을 요청했습니다. 잠시 후 생성 결과 확인을 눌러주세요.');
      })}>Canva 디자인 생성</Button>
      {job&&<Button variant="outline" disabled={busy} onClick={inspect}>생성 결과 확인</Button>}
      {editUrl&&<a href={editUrl} target="_blank" rel="noopener noreferrer">Canva에서 편집 ↗</a>}
    </div>
    <p className="muted">디자인 생성 시 Canva AI 크레딧이 사용됩니다. 생성 API는 미리보기 기능이며, 생성된 내용과 발표자 노트는 검토가 필요합니다. 생성 후 이곳에서 수정한 교안은 기존 Canva 디자인에 자동 반영되지 않습니다.</p>
    <p role="status" aria-live="polite">{busy?'Canva 요청 확인 중…':message}</p>
  </section>;
}
