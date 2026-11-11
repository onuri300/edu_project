import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const script = readFileSync(new URL('../../onuri.framework/js/common.js', import.meta.url), 'utf8');
const root = 'https://example.org/repo/';
function render(page, { embedded = false, canOpen = true } = {}) {
  const nodes = [], opened = [], callbacks = {};
  const makeNode = () => ({ children: [], attrs: {}, listeners: {},
    append(...items) { this.children.push(...items); },
    setAttribute(key, value) { this.attrs[key] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
  });
  const document = {
    documentElement: { dataset: {} },
    querySelector: selector => ['.onuri-header', '.theme-switch'].includes(selector) ? {} : null,
    querySelectorAll: () => [], createElement: makeNode,
    body: { append: node => nodes.push(node), prepend: node => nodes.unshift(node) },
    addEventListener: (name, callback) => { callbacks[name] = callback; },
  };
  const window = {
    eduAuth: { root, openPage: url => { opened.push(url); return canOpen; } },
    matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {},
  };
  window.self = window; window.top = embedded ? {} : window;
  vm.runInNewContext(script, { window, document, location: new URL(page, root), URL, localStorage: { getItem: () => null } });
  callbacks.DOMContentLoaded();
  return { nodes, opened, document, ready: callbacks.DOMContentLoaded };
}
test('standalone category pages hide the masthead while the login portal keeps it', () => {
  for (const page of ['ne_news/ne_ai.html#report=one', 'ne_news/ne_making.html', 'cl_class/cl_library.html', 'ga_games/typing-game.html']) {
    assert.equal(render(page).document.documentElement.dataset.standalone, 'true');
    assert.equal(render(page, { embedded: true }).document.documentElement.dataset.standalone, 'false');
  }
  for (const page of ['index.html', './']) assert.equal(render(page).document.documentElement.dataset.standalone, 'false');
});
