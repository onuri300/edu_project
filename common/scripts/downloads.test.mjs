import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';

const script = readFileSync(new URL('../../common/file/browser/cl_pdf.js', import.meta.url), 'utf8');
test('download saves the actual public PDF bytes under its Korean filename and releases its blob URL', async () => {
  const books = new URL('../../common/file/cl.file/', import.meta.url);
  const actualPdf = readdirSync(books).find(name => /^\d{3}_.+\.pdf$/.test(name));
  const pdfBytes = actualPdf ? readFileSync(new URL(encodeURIComponent(actualPdf), books)) : Buffer.from('%PDF-1.4\n% download fixture\n%%EOF');
  let received, savedBlob, clicked = false, removed = false, revoked;
  const timers = [];
  const link = { click: () => { clicked = true; }, remove: () => { removed = true; } };
  const context = {
    Blob,
    window: {},
    document: { createElement: () => link, body: { append: node => assert.equal(node, link) } },
    fetch: async url => { received = url; return { ok: true, blob: async () => new Blob([pdfBytes], { type: 'application/pdf' }) }; },
    URL: { createObjectURL: blob => { savedBlob = blob; return 'blob:test-pdf'; }, revokeObjectURL: url => { revoked = url; } },
    setTimeout: callback => { timers.push(callback); },
  };
  vm.runInNewContext(script, context);
  const url = 'https://example.org/repository/common/file/cl.file/001_%EB%A0%88%EC%A7%84%EC%95%84%ED%8A%B8.pdf';
  await context.window.eduDownloads.save(url, '001_레진아트.pdf');
  assert.equal(received, url);
  assert.deepEqual(Buffer.from(await savedBlob.arrayBuffer()), pdfBytes);
  assert.equal(link.download, '001_레진아트.pdf');
  assert.equal(link.target, undefined);
  assert.equal(savedBlob.type, 'application/octet-stream');
  assert.ok(clicked && removed);
  timers[0](); assert.equal(revoked, 'blob:test-pdf');
});
test('an HTTP error does not save an invalid file', async () => {
  const context = { window: {}, document: {}, fetch: async () => ({ ok: false, status: 404 }) };
  vm.runInNewContext(script, context);
  await assert.rejects(context.window.eduDownloads.save('https://example.org/missing.pdf', 'missing.pdf'), /404/);
});
test('file URLs use a generated local payload and download a binary Blob without navigating or fetching', async () => {
  const filename = '001_레진 아트.pdf';
  const bytes = Buffer.from('%PDF-1.4\nactual local bytes\n%%EOF');
  let savedBlob, scriptUrl, clicked = false;
  const link = { click: () => { clicked = true; }, remove() {} };
  const context = {
    window: {}, Blob, Uint8Array, atob,
    document: {
      currentScript: { src: 'file:///D:/site/common/file/browser/cl_pdf.js' },
      createElement: tag => tag === 'script' ? { remove() {} } : link,
      head: { append: script => {
        scriptUrl = script.src;
        context.window.__ONURI_LOCAL_PDFS = { [filename]: bytes.toString('base64') };
        script.onload();
      } },
      body: { append() {} },
    },
    URL: class extends URL {
      static createObjectURL(blob) { savedBlob = blob; return 'blob:local-pdf'; }
      static revokeObjectURL() {}
    },
    setTimeout() {},
  };
  vm.runInNewContext(script, context);
  await context.window.eduDownloads.save('file:///D:/site/common/file/cl.file/' + encodeURIComponent(filename), filename);
  assert.equal(decodeURIComponent(scriptUrl), 'file:///D:/site/common/file/local-downloads/' + filename + '.js');
  assert.deepEqual(Buffer.from(await savedBlob.arrayBuffer()), bytes);
  assert.equal(savedBlob.type, 'application/octet-stream');
  assert.equal(link.download, filename);
  assert.equal(link.target, undefined);
  assert.ok(clicked);
});
