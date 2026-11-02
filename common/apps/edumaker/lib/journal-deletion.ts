import type {Course} from './course';
export function changeJournalDeletion(course:Course,indices:number[],action:'delete'|'restore',now:string):Course{
  const chosen=new Set(indices);if(indices.some(i=>!Number.isInteger(i)||i<0||i>=course.sessions.length))throw Error('선택한 일지 회차를 확인해주세요.');
  return {...course,sessions:course.sessions.map((s,i)=>chosen.has(i)&&s.journal.trim()?{...s,journalDeletedAt:action==='delete'?(s.journalDeletedAt||now):undefined}:s)};
}
export function preserveJournalDeletion(course:Course,previous:Course|undefined):Course{return {...course,sessions:course.sessions.map((s,i)=>({...s,journalDeletedAt:previous?.sessions[i]?.journalDeletedAt}))};}
