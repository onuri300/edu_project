import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const script = readFileSync(new URL('../js/auth.js', import.meta.url), 'utf8');
const menu = { title: '자료실', cats: [{ name: '게임', items: [] }] };
const root = 'https://example.org/repository/';
function load(base, page, { storage = new Map(), embedded = false, opener = null, windowObject = {}, navigation = 'navigate', menuSignature } = {}) {
  const listeners = {}, docListeners = {}, posted = [], opened = [], timers = [];
  let redirected;
  const url = new URL(page, base);
  const location = { href: url.href, pathname: url.pathname, replace: value => { redirected = value; } };
  const document = { currentScript: { src: new URL('common/js/auth.js', base).href }, documentElement: { dataset: {} }, addEventListener: (name, fn) => { docListeners[name] = fn; } };
  const parent = { postMessage: message => posted.push(message) };
  const window = Object.assign(windowObject, {
    ...(menuSignature ? { __ENC__: { ct: menuSignature } } : {}),
    addEventListener: (name, fn) => { (listeners[name] ||= []).push(fn); },
    removeEventListener: (name, fn) => { listeners[name] = listeners[name].filter(item => item !== fn); },
    postMessage: message => posted.push(message), opener,
    performance: { getEntriesByType: () => [{ type: navigation }] },
    open: () => { const tab = { location: { replace: value => { tab.url = value; } } }; opened.push(tab); return tab; },
  });
  window.self = window; window.top = embedded ? parent : window; window.parent = parent;
  vm.runInNewContext(script, {
    window, document, location, URL, Date, Math, Map,
    sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout: () => {},
  });
  return { window, document, parent, posted, opened, timers, storage, redirected: () => redirected,
    emit: (name, event) => [...(listeners[name] || [])].forEach(fn => fn(event)),
    click: href => docListeners.click({ target: { closest: () => ({ href, target: '' }) }, isTrusted: true, defaultPrevented: false }) };
}
test('changed menu data invalidates cached login menus so newly added links are visible after login', () => {
  const entry = load(root, 'index.html', { menuSignature: 'old-menu' });
  entry.window.eduAuth.setSession(menu);
  assert.ok(load(root, 'index.html', { storage: entry.storage, menuSignature: 'old-menu' }).window.eduAuth.getSession());
  assert.equal(load(root, 'index.html', { storage: entry.storage, menuSignature: 'new-menu' }).window.eduAuth.getSession(), null);
});
test('living-lab handouts and legacy library URLs are public without a session on HTTPS and local files', () => {
  for (const base of [root, 'file:///D:/project/edu_project/']) {
    for (const page of ['page_classroom/livinglab-library.html', 'livinglab-library.html', 'library.html']) {
      const result = load(base, page);
      assert.equal(result.redirected(), undefined);
      assert.equal(result.document.documentElement.dataset.auth, 'public');
      assert.equal(result.timers.length, 0);
    }
  }
});
test('direct HTML URLs require credentials on HTTPS and file previews', () => {
  for (const base of [root, 'file:///D:/project/edu_project/']) {
    assert.equal(load(base, 'page_game/ladder-game.html').redirected(), new URL('index.html?login=required', base).href);
  }
});
test('login session alone cannot authorize a manually entered path', () => {
  const entry = load(root, 'index.html'); entry.window.eduAuth.setSession(menu);
  assert.equal(load(root, 'page_game/ladder-game.html', { storage: entry.storage }).redirected(), root + 'index.html?login=required');
  assert.equal(entry.storage.has('onuri-session-v1'), false);
});
test('a clicked internal route is permitted once and manual path editing forces reauthentication', () => {
  const entry = load(root, 'index.html'); entry.window.eduAuth.setSession(menu);
  entry.window.eduAuth.allowNavigation(root + 'page_game/ladder-game.html');
  const child = load(root, 'page_game/ladder-game.html', { storage: entry.storage });
  assert.equal(child.document.documentElement.dataset.auth, 'ready');
  const reload = load(root, 'page_game/ladder-game.html', { storage: entry.storage, navigation: 'reload' });
  assert.equal(reload.document.documentElement.dataset.auth, 'ready');
  assert.equal(load(root, 'page_etc/mbti-adult.html', { storage: entry.storage }).redirected(), root + 'index.html?login=required');
});
test('normal internal links and logo home links preserve the authenticated session', () => {
  const entry = load(root, 'index.html'); entry.window.eduAuth.setSession(menu);
  entry.window.eduAuth.allowNavigation(root + 'page_vibecoding/onuri-maker.html');
  const page = load(root, 'page_vibecoding/onuri-maker.html', { storage: entry.storage });
  page.click(root + 'page_vibecoding/onuri-about.html');
  const next = load(root, 'page_vibecoding/onuri-about.html', { storage: entry.storage });
  assert.equal(next.document.documentElement.dataset.auth, 'ready');
  next.window.eduAuth.allowNavigation(root + 'index.html');
  assert.ok(load(root, 'index.html', { storage: entry.storage }).window.eduAuth.getSession());
});
test('new-tab approval is tied to the exact tab and target and cannot be reused after editing the path', () => {
  const entry = load(root, 'index.html'); entry.window.eduAuth.setSession(menu);
  const target = root + 'page_etc/knu-makerspace.html';
  assert.equal(entry.window.eduAuth.openPage(target), true);
  const tab = entry.opened[0]; assert.equal(tab.url, target);
  const child = load(root, target, { opener: entry.window, windowObject: tab });
  const request = entry.posted[0];
  entry.emit('message', { source: {}, data: request });
  assert.equal(child.posted.length, 0);
  entry.emit('message', { source: child.window, data: request });
  child.emit('message', { source: entry.window, data: child.posted[0] });
  assert.equal(child.document.documentElement.dataset.auth, 'ready');
  assert.equal(child.window.opener, null);
  assert.equal(load(root, 'page_game/ladder-game.html', { storage: child.storage }).redirected(), root + 'index.html?login=required');
  const before = child.posted.length;
  entry.emit('message', { source: child.window, data: request });
  assert.equal(child.posted.length, before);
});
test('expired sessions and index login-required parameter clear the saved session', () => {
  const entry = load(root, 'index.html'); entry.window.eduAuth.setSession(menu);
  assert.equal(load(root, 'index.html?login=required', { storage: entry.storage }).window.eduAuth.getSession(), null);
  const invalid = new Map([['onuri-session-v1', JSON.stringify({ expiresAt: Date.now() - 1, menu })]]);
  assert.equal(load(root, 'page_etc/mbti-adult.html', { storage: invalid }).redirected(), root + 'index.html?login=required');
});
test('isolated file iframe only accepts a valid parent response with matching nonce', () => {
  const result = load('file:///D:/project/edu_project/', 'page_game/ladder-game.html', { embedded: true });
  const data = { type: 'onuri:session-response', nonce: result.posted[0].nonce, session: { expiresAt: Date.now() + 10000, menu } };
  result.emit('message', { source: {}, data }); assert.equal(result.document.documentElement.dataset.auth, 'pending');
  result.emit('message', { source: result.parent, data }); assert.equal(result.document.documentElement.dataset.auth, 'ready');
});
