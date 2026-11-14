import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const render = readFileSync(new URL('../js/pages/cl_library.js', import.meta.url), 'utf8');
function run(items, root = 'https://example.org/repo/') {
  const saved = [];
  const node = () => ({ children: [], attrs: {},
    listeners: {},
    addEventListener(name, handler) { this.listeners[name] = handler; },
    removeAttribute(name) { delete this.attrs[name]; },
    append(...children) { this.children.push(...children); },
    replaceChildren() { this.children = []; },
    setAttribute(name, value) { this.attrs[name] = value; },
  });
  const status = node(), cards = node(), count = node();
  const document = { baseURI: 'https://example.org/repo/vi_vibe/vi_library.html', createElement: node, querySelector: selector => ({ '#status': status, '#cards': cards, '#count': count })[selector] };
  // No fetch API: rendering must also work when opened directly through file://.
  vm.runInNewContext(render, { window: { LIVING_LAB_BOOKS: items, eduAuth: { root }, eduDownloads: { save: async (url, filename) => { saved.push({ url, filename }); } } }, document, console, URL });
  return { cards, status, count, saved };
}
test('cards separate PDF preview links from download-only buttons', async () => {
  const filename = '001_레진 아트_수업.pdf';
  const result = run([{ number: '001', title: '레진 아트_수업', filename,
    bytes: 1219940, url: `common/file/cl.file/${encodeURIComponent(filename)}`,
    intro: '교사가 확인한 소개', audience: '참여자', duration: '', outcomes: ['확인한 학습 내용'] }]);
  assert.equal(result.status.hidden, true);
  assert.equal(result.cards.children.length, 1);
  const card = result.cards.children[0];
  assert.equal(card.children[1].textContent, '레진 아트_수업');
  assert.equal(card.children[3].textContent, '교사가 확인한 소개');
  const [preview, download] = card.children.at(-1).children;
  assert.equal(preview.target, '_blank');
  assert.equal(download.type, 'button');
  assert.equal(download.href, undefined);
  await download.listeners.click({ preventDefault() {} });
  assert.equal(result.saved[0].filename, filename);
  assert.equal(decodeURIComponent(result.saved[0].url), `https://example.org/repo/common/file/cl.file/${filename}`);
});
test('local file download button calls the save handler instead of opening a PDF link', async () => {
  const item = { number: '001', title: '교안', filename: '001_교안.pdf', bytes: 1000, url: 'common/file/cl.file/001_%EA%B5%90%EC%95%88.pdf' };
  const result = run([item], 'file:///D:/site/');
  const download = result.cards.children[0].children.at(-1).children[1];
  let prevented = false;
  await download.listeners.click({ preventDefault() { prevented = true; } });
  assert.ok(prevented);
  assert.equal(result.saved[0].filename, item.filename);
  assert.ok(result.saved[0].url.startsWith('file:///D:/site/common/file/cl.file/'));
  assert.equal(download.disabled, false);
});
test('no PDFs shows the prepared empty state', () => {
  assert.equal(run([]).status.textContent, '교안을 준비 중입니다');
});
