import {z} from 'zod';
import type {Session} from './course';
import {JournalContextSchema,defaultJournalFormat,type JournalFormat} from './journal-settings';
export const JournalSummaryInput=z.object({topic:z.string().trim().min(2).max(300),sessionTitle:z.string().max(300),actual:z.object({date:z.string().max(30),attendance:z.string().max(100),activities:z.string().trim().min(1).max(20000),progress:z.string().max(6000),issues:z.string().max(6000),reflection:z.string().max(6000)}),context:JournalContextSchema.optional(),existing:z.object({goals:z.array(z.string().max(2000)).max(8),topics:z.array(z.object({title:z.string().max(1000),details:z.array(z.string().max(6000)).max(8)})).max(10)}).optional()});
export function summarySchema(format:JournalFormat){return z.object({goals:z.array(z.string().max(2000)).length(format.goals),topics:z.array(z.object({title:z.string().max(1000),details:z.array(z.string().max(3000)).length(format.details)})).length(format.topics)});}
export const journalSummaryFormat=(context?:z.infer<typeof JournalContextSchema>)=>context?.format||defaultJournalFormat;
export function applyJournalSummary(session:Session,summary:NonNullable<Session['journalEntries']>):Session{
  const entries=structuredClone(session.journalEntries||{goals:[],topics:[]}),generated=structuredClone(session.journalDetailGenerated||[]);
  summary.goals.forEach((g,i)=>{if(!entries.goals[i]?.trim())entries.goals[i]=g;});
  summary.topics.forEach((t,i)=>{entries.topics[i]||={title:t.title,details:[]};if(!entries.topics[i].title.trim())entries.topics[i].title=t.title;generated[i]||=[];t.details.forEach((d,j)=>{if(!entries.topics[i].details[j]?.trim()||generated[i][j]){entries.topics[i].details[j]=d;generated[i][j]=!!d;}});});
  return {...session,journalEntries:entries,journalDetailGenerated:generated,journalEditorDirty:true,journalSummarySource:'ai'};
}
