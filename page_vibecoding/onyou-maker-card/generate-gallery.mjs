import fs from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve('dist');const imageRoot=path.join(base,'images');
async function scan(dir){let out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await scan(p));else if(/\.(jpe?g|png|webp)$/i.test(e.name))out.push(p)}return out;}
const files=await scan(imageRoot).catch(e=>{if(e.code==='ENOENT')return[];throw e});
files.sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}));
const gallery=files.map(file=>{const rel=path.relative(base,file).split(path.sep).join('/');const parts=rel.split('/');return{path:rel,category:parts.length>2?parts[1]:'work',title:path.basename(file,path.extname(file)).replace(/^\d+[_ -]*/,'').replace(/[_-]/g,' ')}});
await fs.writeFile(path.join(base,'gallery.json'),JSON.stringify(gallery,null,2)+'\n');console.log(`갤러리 ${gallery.length}개 생성`);
