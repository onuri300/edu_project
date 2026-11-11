import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { versionAssets } from '../../onuri.framework/scripts/version-assets.mjs';
test('deployed HTML uses content hashes and refreshes them when CSS/JS changes',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'onuri-cache-'));try{await mkdir(path.join(root,'pages'));await writeFile(path.join(root,'app.js'),'v1');await writeFile(path.join(root,'style.css'),'body{}');await writeFile(path.join(root,'pages/page.html'),'<link href="../style.css"><script src="../app.js?v=old"></script><script src="https://external.example/a.js"></script>');await versionAssets(root);const first=await readFile(path.join(root,'pages/page.html'),'utf8');assert.match(first,/\.\.\/app\.js\?v=[a-f0-9]{12}/);assert.match(first,/\.\.\/style\.css\?v=[a-f0-9]{12}/);assert.match(first,/src="https:\/\/external.example\/a.js"/);await writeFile(path.join(root,'app.js'),'v2');await versionAssets(root);const second=await readFile(path.join(root,'pages/page.html'),'utf8');assert.notEqual(first,second);assert.equal(first.match(/style\.css\?v=\w+/)[0],second.match(/style\.css\?v=\w+/)[0]);}finally{await rm(root,{recursive:true,force:true});}});
