import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function buildNewsletterPages(source=root){
  let template;try{template=await readFile(path.join(source,'common/templates/newsletter.html'),'utf8');}catch(error){if(error.code==='ENOENT')return;throw error;}
  const pages=JSON.parse(await readFile(path.join(source,'common/data/newsletter-pages.json'),'utf8'));
  await mkdir(path.join(source,'page_newsletter'),{recursive:true});
  for(const page of pages){
    if(!['ai','making'].includes(page.channel))throw Error('알 수 없는 뉴스레터 채널');
    const values={...page,lead:page.lead.split('\n').map(escape).join('<br>'),description:page.description.split('\n').map(escape).join('<br>'),topics:page.topics.map(t=>`<span>${escape(t)}</span>`).join('')};
    const html=template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in values))throw Error(`설정 누락: ${key}`);return ['lead','description','topics'].includes(key)?values[key]:escape(values[key]);});
    await writeFile(path.join(source,'page_newsletter',page.channel+'.html'),html);
  }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildNewsletterPages();
