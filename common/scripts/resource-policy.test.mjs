import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {}, URL };
vm.runInNewContext(readFileSync(new URL('../js/resource-policy.js', import.meta.url), 'utf8'), context);
test('PDF popups from the local library escape the sandbox on Pages and local file previews', () => {
  for (const base of ['https://example.org/repository/index.html', 'file:///D:/project/edu_project/index.html']) {
    const sandbox = context.window.eduResourcePolicy.sandboxFor('./page_classroom/livinglab-library.html', base);
    assert.ok(sandbox.split(' ').includes('allow-popups-to-escape-sandbox'));
    assert.ok(sandbox.split(' ').includes('allow-downloads'));
  }
});
test('external pages and other local pages retain the default popup sandbox', () => {
  for (const url of ['https://external.example/livinglab-library.html', './page_vibecoding/onuri-maker.html']) {
    assert.ok(!context.window.eduResourcePolicy.sandboxFor(url, 'https://example.org/repository/index.html').includes('allow-popups-to-escape-sandbox'));
  }
});
