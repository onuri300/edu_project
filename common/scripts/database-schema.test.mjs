import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Minimal DOM exercises the explorer's filters and SVG selection without network access.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.value = ''; this.style = {}; this.attributes = {}; this.events = {}; this.classList = { toggle() {} }; }
  append(...children) { this.children.push(...children); if (this.tag === 'select' && !this.value) this.value = this.children[0]?.value || ''; }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  addEventListener(type, callback) { this.events[type] = callback; }
  get options() { return this.children; }
  querySelectorAll() { return this.descendants().filter(element => element.attributes['data-table']); }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
}

test('schema explorer renders actual relations, all tables and columns, filters and empty states', async () => {
  const source = await readFile(new URL('../js/pages/mo_schema.js', import.meta.url), 'utf8');
  const bundle = await readFile(new URL('../data/coding-manual.js', import.meta.url), 'utf8');
  const window = {};
  vm.runInNewContext(bundle, { window });
  const data = window.ONURI_CODING_MANUAL.entries.find(entry => entry.database).database;
  assert.equal(data.tables.length, 61);
  assert.equal(data.columns.length, 555);
  const document = { createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag) };
  const Option = function(text, value) { const option = new Element('option'); option.textContent = text; option.value = value; return option; };
  vm.runInNewContext(source, { window, document, Option });
  const root = new Element('section');
  window.renderDatabaseSchema(root, data);
  const [scope, selection] = root.descendants().filter(element => element.tag === 'select');
  const search = root.descendants().find(element => element.type === 'search');
  assert.equal(selection.options.length, 16);
  assert.ok(root.descendants().some(element => element.attributes['data-table'] === 'auth.users'));
  assert.ok(root.descendants().some(element => element.attributes.class?.includes('schema-view-edge')));
  scope.value = 'all'; scope.events.change();
  assert.equal(selection.options.length, 61);
  for (const table of data.tables) {
    selection.value = table.schema + '.' + table.name; selection.events.change();
    const detail = root.children.at(-1);
    const rows = detail.descendants().find(element => element.tag === 'tbody').children;
    assert.equal(rows.length, data.columns.filter(column => column.schema === table.schema && column.table === table.name).length);
  }
  search.value = '관리자 계정'; search.events.input();
  assert.equal(selection.options.length, 1);
  assert.equal(selection.value, 'public.admin_users');
  search.value = 'no_matching_table'; search.events.input();
  assert.equal(selection.disabled, true);
  assert.match(root.children.at(-1).children[0].textContent, /없습니다/);
});
