import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
// Content-based asset URLs prevent old JS/CSS being combined with a newer HTML page.
export async function versionAssets(output){
 const hashes=new Map();
 async function scan(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory()){await scan(file);continue;}if(!entry.name.endsWith('.html'))continue;
 const html=await readFile(file,'utf8');const matches=[...html.matchAll(/\b(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^"#]*)?)"/g)];let updated=html;
 for(const [attribute,url] of matches){if(/^(?:[a-z]+:|\/\/|\/)/i.test(url))continue;const [relative,query='']=url.split('?');const asset=path.resolve(path.dirname(file),decodeURIComponent(relative));if(!asset.startsWith(path.resolve(output)+path.sep))throw Error('Asset is outside deployment folder');
 if(!hashes.has(asset))hashes.set(asset,createHash('sha256').update(await readFile(asset)).digest('hex').slice(0,12));const params=new URLSearchParams(query);params.set('v',hashes.get(asset));updated=updated.replace(attribute,attribute.replace(url,relative+'?'+params.toString()));}
 await writeFile(file,updated);
 }}await scan(output);
}
