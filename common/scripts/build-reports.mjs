import { buildNewsletterPages } from './build-newsletter-pages.mjs';
import { readdir, readFile, mkdir, writeFile, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
export function parseReport(raw) {
  const text=raw.replace(/^\uFEFF/,'').replaceAll('\r\n','\n');
  if(!text.startsWith('---\n')) return {meta:{},body:raw};
  const end=text.indexOf('\n---\n',4);if(end<0)throw Error('닫히지 않은 리포트 메타데이터');
  const meta={};for(const line of text.slice(4,end).split('\n')){if(!line.trim())continue;const colon=line.indexOf(':');if(colon<1)throw Error('메타데이터 형식 오류');meta[line.slice(0,colon).trim()]=JSON.parse(line.slice(colon+1).trim());}
  for(const key of ['id','title','type','published_at','period_start','period_end','summary'])if(typeof meta[key]!=='string'||!meta[key].trim())throw Error(`필수 메타데이터 누락: ${key}`);
  if(!['daily','weekly'].includes(meta.type))throw Error('type은 daily 또는 weekly여야 합니다.');
  for(const key of ['published_at','period_start','period_end']){if(!/^\d{4}-\d{2}-\d{2}$/.test(meta[key])||!Number.isFinite(Date.parse(meta[key]))||new Date(meta[key]).toISOString().slice(0,10)!==meta[key])throw Error(`날짜 오류: ${key}`);}
  if(meta.period_start>meta.period_end)throw Error('조사 기간 오류');
  return {meta,body:text.slice(end+5).trim()};
}
export async function reportFiles(folder){const files=[];async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true}).catch(err=>{if(err.code==='ENOENT')return [];throw err;})){if(e.name.startsWith('.')||e.name==='README.md')continue;const file=path.join(dir,e.name);if(e.isDirectory())await scan(file);else if(/\.(md|txt|html|pdf)$/i.test(e.name))files.push(file);}}await scan(folder);return files;}
export async function buildReports(source = root, output) {
  await buildNewsletterPages(source);
  const folder=path.join(source,'common/file/ne.file');await mkdir(folder,{recursive:true});const items=[],ids=new Set(),published=[];
  for(const file of await reportFiles(folder)){
    const relative=path.relative(folder,file).split(path.sep).join('/'),filename=path.basename(file),type=path.extname(file).slice(1).toLowerCase();
    const raw=type==='pdf'?'':await readFile(file,'utf8');const {meta,body}=type==='md'?parseReport(raw):{meta:{},body:raw};
    if(meta.status&&meta.status!=='published')continue;
    const id=meta.id||relative;if(ids.has(id))throw Error(`중복 리포트 id: ${id}`);ids.add(id);
    const date=meta.published_at||/^(\d{4}-\d{2}-\d{2})/.exec(filename)?.[1]||'';
    const group=path.dirname(relative)==='.'?'일반':path.dirname(relative);
    const channel=/^(ai|AI)(\/|$)/.test(group)?'ai':/^(making|메이킹)(\/|$)/.test(group)?'making':meta.type==='weekly'?'making':'ai';
    items.push({...meta,id,filename,title:meta.title||filename.replace(/\.[^.]+$/,'').replace(/^\d{4}-\d{2}-\d{2}[_ -]?/,''),group,channel,date,bytes:(await stat(file)).size,type,text:body,summary:meta.summary||'',tags:Array.isArray(meta.tags)?meta.tags.filter(t=>typeof t==='string'):[],frequency:meta.type||'',reading_minutes_estimate:Math.max(1,Math.round(body.length/500)),url:'common/file/ne.file/'+relative.split('/').map(encodeURIComponent).join('/')});
    published.push({ file, relative });
  }
  items.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id,'ko'));
  await mkdir(path.join(source,'common/data'),{recursive:true});
  await writeFile(path.join(source,'common/data/newsletter-data.js'),'window.ONURI_REPORTS = '+JSON.stringify(items).replaceAll('<','\\u003c')+';\n');
  if(output){
    await mkdir(path.join(output,'common/data'),{recursive:true});
    await copyFile(path.join(source,'common/data/newsletter-data.js'),path.join(output,'common/data/newsletter-data.js'));
    for (const { file, relative } of published) {
      for (const directory of ['common/file/ne.file', 'reports']) {
        const target = path.join(output, directory, relative);
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(file, target);
      }
    }
  }
  console.log(`[뉴스레터] ${items.length}개 리포트 반영`);return items;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildReports();
