import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const code = readFileSync(new URL('../js/common.js', import.meta.url), 'utf8');
function setup({ saved = null, dark = false, blocked = false } = {}) {
  const listeners = {};
  const buttons = ['light', 'dark'].map(theme => ({
    dataset: { setTheme: theme }, attrs: {},
    setAttribute(key, value) { this.attrs[key] = value; },
    addEventListener(event, callback) { this[event] = callback; },
  }));
  let toolbarInserted = false;
  const document = {
    documentElement: { dataset: {} },
    querySelector: () => toolbarInserted ? {} : null,
    createElement: () => ({ firstElementChild: {} }),
    body: { prepend: () => { toolbarInserted = true; } },
    querySelectorAll: () => buttons,
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const media = { matches: dark, addEventListener: (_, callback) => { listeners.system = callback; } };
  const context = {
    document,
    localStorage: {
      getItem() { if (blocked) throw new Error('Unavailable'); return saved; },
      setItem(_, value) { if (blocked) throw new Error('Unavailable'); saved = value; },
    },
    window: { matchMedia: () => media, addEventListener: (name, callback) => { listeners[name] = callback; } },
  };
  vm.runInNewContext(code, context);
  listeners.DOMContentLoaded();
  return { document, buttons, listeners, saved: () => saved, toolbarInserted: () => toolbarInserted };
}
test('system default, explicit sun/moon choice, saved preference and tab sync', () => {
  const app = setup({ dark: true });
  assert.equal(app.toolbarInserted(), true);
  assert.equal(app.document.documentElement.dataset.theme, 'dark');
  app.buttons[0].click();
  assert.equal(app.saved(), 'light');
  assert.equal(app.buttons[0].attrs['aria-pressed'], 'true');
  app.listeners.system({ matches: true });
  assert.equal(app.document.documentElement.dataset.theme, 'light');
  app.buttons[1].click();
  assert.equal(app.saved(), 'dark');
  assert.equal(app.buttons[0].attrs['aria-pressed'], 'false');
  app.listeners.storage({ key: 'edu-project-theme', newValue: 'light' });
  assert.equal(app.document.documentElement.dataset.theme, 'light');
  const restored = setup({ saved: app.saved(), dark: false });
  assert.equal(restored.document.documentElement.dataset.theme, 'dark');
});
test('blocked storage still allows theme selection', () => {
  const app = setup({ blocked: true });
  app.buttons[1].click();
  assert.equal(app.document.documentElement.dataset.theme, 'dark');
  assert.equal(app.buttons[1].attrs['aria-pressed'], 'true');
});
