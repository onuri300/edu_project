import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLayoutPages, pageFolders } from './build-layout-pages.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('every HTML uses shared assets with valid local CSS and script paths', async () => {
  let count = 0;
  for (const folder of pageFolders) {
    for (const file of (await readdir(path.join(root, folder))).filter(file => file.endsWith('.html'))) {
      const page = path.join(root, folder, file);
      const html = await readFile(page, 'utf8');
      assert.match(html, /href="(?:\.\.\/)*common\/css\/common\.css"/, page);
      assert.match(html, /src="(?:\.\.\/)*common\/js\/common\.js"/, page);
      assert.match(html, /common\/js\/auth\.js/, page);
      assert.doesNotMatch(html, /<style\b/i, page);
      assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>\s*[^<\s]/i, page);
      assert.doesNotMatch(html, /id="(?:themeToggle|themeBtn)"|data-theme-toggle/, page);
      if (!["page_newsletter", "page_etc/gpt-making-manual"].includes(folder) && !folder.includes("/onyou-maker-card/")) {
        assert.match(html, /data-page-image/, page);
      }
      for (const [, url] of html.matchAll(/<img\b[^>]*\bsrc="([^":?#]+)"[^>]*>/g)) {
        await access(path.resolve(path.dirname(page), decodeURIComponent(url)));
      }
      for (const [, url] of html.matchAll(/(?:href|src)="([^"?#]+\.(?:css|js))"/g)) {
        if (/^https?:/.test(url)) continue;
        await access(path.resolve(path.dirname(page), url));
      }
      count++;
    }
  }
  assert.equal(count, 25);
  const names = await readdir(root);
  assert.ok(names.includes('index.html'), 'Login entry page stays at index.html');
  const entry = await readFile(path.join(root, 'index.html'), 'utf8');
  assert.match(entry, /id="upw"[^>]*type="password"|type="password"[^>]*id="upw"/);
  assert.doesNotMatch(entry, /data-redirect/);
  for (const obsolete of ['computer_quiz_100', 'game', 'knu', 'mbti', 'portfolio1']) {
    assert.ok(!names.includes(obsolete), `${obsolete} should be consolidated into common`);
  }
});

test('local previews contain the current layout fragments', async () => {
  await buildLayoutPages(root, { check: true });
});
