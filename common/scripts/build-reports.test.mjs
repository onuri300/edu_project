import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildReports } from './build-reports.mjs';
test('report discovery preserves Korean names, groups, dates and reflects replacement and deletion', async () => {
  const root=await mkdtemp(path.join(os.tmpdir(),'onuri-reports-'));
  try {
    await mkdir(path.join(root,'common/file/ne.file','교육 AI'),{recursive:true});
    const file=path.join(root,'common/file/ne.file','교육 AI','2026-11-02_오늘의 리포트.md');
    await writeFile(file,'# 뉴스\n리포트 본문');
    await writeFile(path.join(root,'common/file/ne.file','README.md'),'관리 문서');
    await writeFile(path.join(root,'common/file/ne.file','2026-11-01_이전.txt'),'이전');
    let items=await buildReports(root);
    assert.equal(items.length,2);assert.equal(items[0].title,'오늘의 리포트');assert.equal(items[0].group,'교육 AI');assert.equal(items[0].date,'2026-11-02');assert.ok(items[0].url.includes(encodeURIComponent('교육 AI')));
    await writeFile(file,'교체된 본문');items=await buildReports(root);assert.equal(items[0].text,'교체된 본문');
    await rm(file);items=await buildReports(root);assert.equal(items.length,1);
    await mkdir(path.join(root,'output','common','data'),{recursive:true});await buildReports(root,path.join(root,'output'));
    assert.match(await readFile(path.join(root,'output','common','data','newsletter-data.js'),'utf8'),/이전/);
    assert.equal(await readFile(path.join(root,'output','common/file/ne.file','2026-11-01_이전.txt'),'utf8'),'이전');
  } finally { await rm(root,{recursive:true,force:true}); }
});
