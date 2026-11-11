import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../../onuri.framework/js/common.js', import.meta.url), 'utf8');
const sizing = source.slice(0, source.indexOf('  function bindMobileMenu')) + '})();';
function setup(frame) {
  const events = {};
  const changes = [];
  const frames = [];
  const sent = [];
  const body = { scrollHeight: 400, getBoundingClientRect: () => ({ height: body.scrollHeight, top: 0 }) };
  const document = { body, documentElement: { dataset: {} }, getElementById: () => frame,
    addEventListener: (type, fn) => { events['document:' + type] = fn; } };
  const window = { parent: { postMessage: value => sent.push(value) }, addEventListener: (type, fn) => { events[type] = fn; } };
  const context = { document, window, Number, Math,
    ResizeObserver: class { constructor(fn) { changes.push(fn); } observe() {} },
    MutationObserver: class { constructor(fn) { changes.push(fn); } observe() {} },
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; } };
  vm.runInNewContext(sizing, context);
  events['document:DOMContentLoaded']();
  return { events, changes, sent, body, document, flush: () => { while (frames.length) frames.shift()(); } };
}
test('embedded document reports content growth and shrink without parent DOM access', () => {
  const state = setup(null);
  state.flush();
  assert.equal(state.document.documentElement.dataset.portalAutoheight, 'true');
  assert.equal(state.sent.at(-1).height, 402);
  state.body.scrollHeight = 2400; state.changes[0](); state.flush();
  assert.equal(state.sent.at(-1).height, 2402);
  state.body.scrollHeight = 300; state.changes[1](); state.flush();
  assert.equal(state.sent.at(-1).height, 302);
});
test('portal accepts only active frame height, resets between pages and disables inner scrolling', () => {
  const callbacks = {};
  const attributes = {};
  const frame = { style: { removeProperty(key) { delete this[key]; } }, contentWindow: { postMessage() {} },
    addEventListener: (type, fn) => { callbacks[type] = fn; },
    setAttribute: (key, value) => { attributes[key] = value; }, removeAttribute: key => delete attributes[key] };
  const state = setup(frame);
  const send = (height, source = frame.contentWindow) => state.events.message({ source, data: { type: 'onuri:frame-height', height } });
  send(900); assert.equal(frame.style.height, undefined);
  callbacks.load(); send(900); assert.equal(frame.style.height, '900px');
  assert.equal(attributes.scrolling, 'no');
  send(200, {}); assert.equal(frame.style.height, '900px');
  send(NaN); assert.equal(frame.style.height, '900px');
  send(200); assert.equal(frame.style.height, '200px');
  state.changes[0](); assert.equal(frame.style.height, undefined);
  send(1500); assert.equal(frame.style.height, undefined);
});
