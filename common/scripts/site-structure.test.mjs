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
      const alias = html.match(/<a data-route-alias href="([^"]+)"/);
      if (alias) {
        await access(path.resolve(path.dirname(page), alias[1]));
        assert.match(html, /route-redirect[.]js/);
        continue;
      }
      assert.match(html, /href="(?:\.\.\/)*onuri\.framework\/css\/common\.css"/, page);
      assert.match(html, /src="(?:\.\.\/)*onuri\.framework\/js\/common\.js"/, page);
      assert.match(html, /common\/data\/site-config\.js[\s\S]*onuri\.framework\/js\/auth\.js/, page);
      assert.doesNotMatch(html, /<style\b/i, page);
      assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>\s*[^<\s]/i, page);
      assert.doesNotMatch(html, /id="(?:themeToggle|themeBtn)"|data-theme-toggle/, page);
      if (folder !== "ne_news" && folder !== "vi_vibe/vi_onyou") {
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
  assert.equal(count, 28);
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

test('grouped pages and assets follow the naming convention', async () => {
  const group = /^(?:vi|ga|cl|mo|ne|mk|ma|do|on|mn|bd)_[a-z][a-z0-9-]{0,6}$/;
  for (const folder of pageFolders.filter(folder => group.test(folder.split('/')[0]))) {
    assert.ok(folder.split('/').every(part => group.test(part)), folder);
    for (const name of (await readdir(path.join(root, folder))).filter(name => name.endsWith('.html'))) {
      assert.match(path.parse(name).name, group, folder + '/' + name);
      assert.equal(name.slice(0, 2), folder.slice(0, 2));
    }
  }
  for (const folder of ['common/css/pages', 'common/js/pages']) {
    const exempt = new Set(['builder', 'index', 'resource-policy']);
    for (const entry of await readdir(path.join(root, folder), { withFileTypes: true })) {
      assert.ok(entry.isFile(), entry.name);
      const name = path.parse(entry.name).name;
      if (!exempt.has(name)) assert.match(name, group);
    }
  }


});

