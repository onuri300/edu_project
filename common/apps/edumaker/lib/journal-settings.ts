import {z} from 'zod';
export const JournalFormatSchema=z.object({goals:z.number().int().min(1).max(8),topics:z.number().int().min(1).max(10),details:z.number().int().min(1).max(8)});
export const defaultJournalFormat={goals:2,topics:3,details:3};
export type JournalFormat=z.infer<typeof JournalFormatSchema>;
const date=z.string().refine(v=>!v||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))),'기간의 날짜를 확인해주세요.');
export const CategorySchema=z.object({id:z.string().uuid().optional(),title:z.string().trim().min(1).max(120),startDate:date,endDate:date,guidance:z.string().trim().max(2000),format:JournalFormatSchema}).refine(c=>!c.startDate||!c.endDate||c.startDate<=c.endDate,'시작일과 종료일을 확인해주세요.');
export type JournalCategory=Omit<z.infer<typeof CategorySchema>,'id'>&{id:string;updated:string};
export type JournalContext={categoryId?:string;categoryTitle:string;period:string;guidance:string;format:JournalFormat};
export const JournalContextSchema=z.object({categoryId:z.string().uuid().optional(),categoryTitle:z.string().max(120),period:z.string().max(50),guidance:z.string().max(2000),format:JournalFormatSchema});
export function journalContext(category:JournalCategory|undefined,format:JournalFormat):JournalContext{return {categoryId:category?.id,categoryTitle:category?.title||'',period:category?[category.startDate,category.endDate].filter(Boolean).join(' ~ '):'',guidance:category?.guidance||'',format:JournalFormatSchema.parse(format)};}
export function journalHeader(context?:JournalContext){return context?[context.categoryTitle&&`과정·기수: ${context.categoryTitle}`,context.period&&`과정 기간: ${context.period}`,context.guidance&&`과정 공통 기준: ${context.guidance}`].filter(Boolean):[];}
