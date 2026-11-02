import type {Course} from './course';
export function stampJournalCreation(course:Course,previous:Course|undefined,now:string):Course{return {...course,sessions:course.sessions.map((s,i)=>{const old=previous?.sessions[i];const created=old?.journalCreatedAt||(!old?.journal.trim()&&s.journal.trim()?now:undefined);return {...s,journalCreatedAt:created};})};}
