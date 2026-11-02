import {z} from 'zod';
export const CanvaLinkSchema=z.object({categoryId:z.union([z.string().uuid(),z.literal('')]).default(''),title:z.string().trim().min(1).max(200),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v),url:z.string().trim().max(2000).url().refine(v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&(u.hostname==='canva.com'||u.hostname.endsWith('.canva.com'));}catch{return false;}},'https://www.canva.com/ 형식의 Canva 링크를 입력해주세요.')});
export type CanvaLink={id:string;title:string;date:string;url:string;created:string;categoryId?:string;categoryTitle?:string};
export type CanvaLinkCategory={id:string;title:string};
