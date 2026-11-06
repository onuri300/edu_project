import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, unlink, rename, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { buildLibrary } from './build-library.mjs';

// A small, valid one-page PDF fixture, not a teaching handout.
function pdfFixture() {
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << >> /Contents 4 0 R >>', '<< /Length 0 >>\nstream\n\nendstream'];
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += 'xref\n0 5\n0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  return Buffer.from(pdf + `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
}

test('PDF discovery, names, bytes, URL encoding, additions, deletion, rename and empty state', async () => {
  const source = await mkdtemp(path.join(tmpdir(), 'livinglab-test-'));
  await mkdir(path.join(source, 'books'));
  for (const file of ['index.html', 'livinglab-library.html', 'common/data/data.enc.js', 'common/css/index.css', 'common/css/library.css', 'common/js/index.js', 'common/js/library.js', 'common/css/common.css', 'common/js/common.js']) {
    await mkdir(path.dirname(path.join(source, file)), { recursive: true });
    await writeFile(path.join(source, file), 'fixture');
  }
  await mkdir(path.join(source, 'page_etc'));
  await writeFile(path.join(source, 'page_etc', '사용매뉴얼_로그인정보.md'), 'private fixture');
  const put = (name, content = pdfFixture()) => writeFile(path.join(source, 'books', name), content);
  await put('007_한글_추가 밑줄 & #.pdf');
  await put('001_AI 음악 만들기.pdf');
  await put('002_우리말 클리커.pdf');
  await put('9_잘못된 번호.pdf');
  await put('003_가짜.pdf', 'not a PDF');
  await writeFile(path.join(source, 'common/data/course-descriptions.json'), JSON.stringify({
    '001_AI 음악 만들기.pdf': { intro: '교사가 확인한 수업 소개', audience: '참여 대상', outcomes: ['학습 내용'] },
  }));
  let run = 0;
  const build = () => buildLibrary(source, path.join(source, `output-${run++}`));
  let items = await build();
  await assert.rejects(access(path.join(source, 'output-0/page_etc/사용매뉴얼_로그인정보.md')), { code: 'ENOENT' });
  assert.deepEqual(JSON.parse(await readFile(path.join(source, 'output-0/common/data/library-data.json'), 'utf8')), items);
  assert.equal(await readFile(path.join(source, 'output-0/common/js/library.js'), 'utf8'), 'fixture');
  assert.match(await readFile(path.join(source, 'common/data/library-data.js'), 'utf8'), /window\.LIVING_LAB_BOOKS/);
  assert.equal(await readFile(path.join(source, 'common/data/library-data.js'), 'utf8'), await readFile(path.join(source, 'output-0/common/data/library-data.js'), 'utf8'));
  assert.deepEqual(items.map(x => x.number), ['001', '002', '007']);
  assert.equal(items[2].title, '한글_추가 밑줄 & #');
  assert.equal(items[0].bytes, pdfFixture().length);
  const localPayload = { window: {} };
  vm.runInNewContext(await readFile(path.join(source, 'common/data/local-downloads', items[0].filename + '.js'), 'utf8'), localPayload);
  assert.deepEqual(Buffer.from(localPayload.window.__ONURI_LOCAL_PDFS[items[0].filename], 'base64'), pdfFixture());
  assert.equal(items[0].intro, '교사가 확인한 수업 소개');
  assert.equal(items[1].intro, '');
  for (const item of items) {
    const url = new URL(item.url, 'https://example.org/repository/library.html');
    assert.ok(url.pathname.startsWith('/repository/books/'));
    assert.equal(decodeURIComponent(url.pathname.split('/').at(-1)), item.filename);
    assert.deepEqual(await readFile(path.join(source, 'output-0', 'books', item.filename)), pdfFixture());
  }
  await put('004_새 교안.pdf');
  assert.equal((await build()).length, 4);
  await unlink(path.join(source, 'books', '001_AI 음악 만들기.pdf'));
  await rename(path.join(source, 'books', '004_새 교안.pdf'), path.join(source, 'books', '008_이름 변경.pdf'));
  items = await build();
  assert.deepEqual(items.map(x => x.number), ['002', '007', '008']);
  for (const item of items) await unlink(path.join(source, 'books', item.filename));
  assert.deepEqual(await build(), []);
  const dataOnlyOutput = path.join(source, 'must-not-be-created');
  await buildLibrary(source, dataOnlyOutput, { dataOnly: true });
  await assert.rejects(access(dataOnlyOutput), { code: 'ENOENT' });
  assert.match(await readFile(path.join(source, 'common/data/library-data.js'), 'utf8'), /window\.LIVING_LAB_BOOKS/);
});
