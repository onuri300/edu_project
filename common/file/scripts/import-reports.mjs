import { readFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReport, reportFiles, buildReports } from '../../scripts/build-reports.mjs';
export async function importReports(packageRoot,root=fileURLToPath(new URL('../../../',import.meta.url))){
  const existing=new Map();for(const file of await reportFiles(path.join(root,'common/file/ne.file'))){if(!file.endsWith('.md'))continue;const {meta}=parseReport(await readFile(file,'utf8'));if(meta.id){if(existing.has(meta.id))throw Error(`기존 중복 id: ${meta.id}`);existing.set(meta.id,file);}}
  const incoming=[],ids=new Set();for(const file of await reportFiles(path.join(packageRoot,'content/reports'))){if(!file.endsWith('.md'))continue;const {meta}=parseReport(await readFile(file,'utf8'));if(!meta.id)throw Error('패키지 id 누락');if(ids.has(meta.id))throw Error(`패키지 중복 id: ${meta.id}`);ids.add(meta.id);const target=existing.get(meta.id)||path.join(root,'common/file/ne.file',meta.type==='weekly'?'making':'ai',meta.type,path.basename(file));if(!existing.has(meta.id)){try{await readFile(target);throw Error(`다른 자료와 파일명 충돌: ${target}`);}catch(e){if(e.code!=='ENOENT')throw e;}}incoming.push({file,target,update:existing.has(meta.id)});}
  if(!incoming.length)throw Error('가져올 Markdown 리포트가 없습니다.');
  for(const item of incoming){await mkdir(path.dirname(item.target),{recursive:true});await copyFile(item.file,item.target);}
  await buildReports(root);console.log(`리포트 ${incoming.filter(i=>!i.update).length}개 추가, ${incoming.filter(i=>i.update).length}개 갱신`);return incoming;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(!process.argv[2])throw Error('패키지 폴더 경로를 지정하세요.');await importReports(path.resolve(process.argv[2]));}
