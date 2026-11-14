import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderResourceHero } from '../../onuri.framework/scripts/render-banner.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function buildNewsletterPages(source=root){
  let template;try{template=await readFile(path.join(source,'common/templates/newsletter.html'),'utf8');}catch(error){if(error.code==='ENOENT')return;throw error;}
  const pages=JSON.parse(await readFile(path.join(source,'common/data/newsletter-pages.json'),'utf8'));
  const heroTemplate=await readFile(path.join(source,'onuri.framework/templates/layout/resource-hero.html'),'utf8');
  await mkdir(path.join(source,'do_docs'),{recursive:true});
  for(const page of pages){
    if(!['ai','making'].includes(page.channel))throw Error('알 수 없는 뉴스레터 채널');
    const hero=renderResourceHero(heroTemplate.trimEnd(),page,'../');
    const html=template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{
      if(key==='hero')return ['<!-- layout:resource-hero -->',hero,'<!-- /layout:resource-hero -->'].join('\n');
      if(!(key in page))throw Error(`설정 누락: ${key}`);
      return escape(page[key]);
    });
    await writeFile(path.join(source,'do_docs','do_'+page.channel+'.html'),html);
  }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildNewsletterPages();
