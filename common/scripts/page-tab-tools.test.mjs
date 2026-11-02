import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
const script = readFileSync(new URL('../js/common.js', import.meta.url), 'utf8');
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
    querySelector: selector => selector === '.page-tab-tools' ? nodes.find(node => node.className === 'page-tab-tools') : {},
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
test('every category/admin page gets one common current-page button, including embedded pages', () => {
  for (const folder of ['page_vibecoding', 'page_game', 'page_classroom', 'page_etc', 'page_admin']) {
    for (const file of readdirSync(new URL(`../../${folder}/`, import.meta.url)).filter(file => file.endsWith('.html'))) {
      const app = render(`${folder}/${file}`, { embedded: true });
      assert.equal(app.nodes.length, 1);
      app.ready(); assert.equal(app.nodes.length, 1);
      app.nodes[0].children[1].listeners.click();
      assert.equal(app.opened[0], root + folder + '/' + file);
    }
  }
});
test('index and the root entry have no extra current-page new-tab button', () => {
  assert.equal(render('index.html').nodes.length, 0);
  assert.equal(render('').nodes.length, 0);
});
test('new-tab action preserves detail query parameters and the anchor', () => {
  const page = 'page_vibecoding/onuri-work-detail.html?id=work01#gallery';
  const app = render(page);
  app.nodes[0].children[1].listeners.click();
  assert.equal(app.opened[0], root + page);
});
test('a blocked popup gives visible feedback', () => {
  const app = render('page_game/ladder-game.html', { canOpen: false });
  const [status, button] = app.nodes[0].children;
  button.listeners.click();
  assert.equal(status.hidden, false);
  assert.match(status.textContent, /팝업/);
});

test('standalone category pages hide the masthead while the login portal keeps it', () => {
  for (const page of ['page_newsletter/ai.html#report=one', 'page_newsletter/making.html', 'page_classroom/livinglab-library.html', 'page_game/typing-game.html']) {
    assert.equal(render(page).document.documentElement.dataset.standalone, 'true');
    assert.equal(render(page, { embedded: true }).document.documentElement.dataset.standalone, 'false');
  }
  for (const page of ['index.html', './']) assert.equal(render(page).document.documentElement.dataset.standalone, 'false');
});
