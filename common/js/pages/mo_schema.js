(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const tableId = table => table.schema + '.' + table.name;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function svgNode(tag, attributes, text) {
    const element = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function labelled(text, control) {
    const label = node('label', undefined, 'schema-filter');
    label.append(node('span', text), control);
    return label;
  }
  function grid(headers, rows) {
    const wrapper = node('div', undefined, 'schema-table-scroll');
    const table = node('table', undefined, 'schema-table');
    const head = node('thead');
    const header = node('tr');
    for (const text of headers) {
      const cell = node('th', text);
      cell.scope = 'col';
      header.append(cell);
    }
    head.append(header);
    const body = node('tbody');
    for (const values of rows) {
      const row = node('tr');
      values.forEach(value => row.append(node('td', value ?? '—')));
      body.append(row);
    }
    table.append(head, body);
    wrapper.append(table);
    return wrapper;
  }

  window.renderDatabaseSchema = (container, data) => {
    container.replaceChildren();
    const tables = new Map(data.tables.map(table => [tableId(table), table]));
    const relations = data.constraints.filter(item => item.kind === 'f').map(item => ({
      from: item.schema + '.' + item.table,
      to: item.target_schema + '.' + item.target_table,
      label: item.name + ': ' + item.columns.join(', ') + ' → ' + item.target_columns.join(', '),
      kind: 'foreign',
    }));
    for (const view of data.views || []) {
      for (const target of tables.keys()) {
        if (view.definition.includes('FROM ' + target) || view.definition.includes('from ' + target)) {
          relations.push({ from: view.schema + '.' + view.name, to: target, label: '뷰 원본 참조', kind: 'view' });
        }
      }
    }

    container.append(node('h3', '운영 스키마와 ERD'));
    const date = new Date(data.captured_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    container.append(node('p', date + ' KST 조회 · ' + data.schemas.length + '개 스키마 · ' +
      tables.size + '개 테이블·뷰 · ' + data.columns.length + '개 컬럼'));
    container.append(node('p', '한글명은 문서용 설명입니다. 화살표는 외래 키의 참조 방향이며, 점선은 뷰 원본 참조를 표시합니다. 테이블을 누르면 전체 컬럼과 제약조건이 표시됩니다.'));

    const inventory = node('details', undefined, 'schema-inventory');
    inventory.append(node('summary', '전체 스키마 목록'));
    inventory.append(grid(['스키마', '테이블·뷰 수'], data.schemas.map(schema => [
      schema.name, data.tables.filter(table => table.schema === schema.name).length,
    ])));
    container.append(inventory);

    const controls = node('div', undefined, 'schema-filters');
    const scope = node('select');
    scope.append(new Option('애플리케이션 · public / edumaker', 'application'), new Option('전체 스키마', 'all'));
    data.schemas.forEach(schema => scope.append(new Option(schema.name, schema.name)));
    const search = node('input');
    search.type = 'search';
    search.placeholder = '테이블명·한글명·컬럼명';
    const select = node('select');
    controls.append(labelled('스키마', scope), labelled('검색', search), labelled('테이블·뷰', select));
    container.append(controls);

    const diagramTools = node('div', undefined, 'schema-diagram-tools');
    const zoom = node('input');
    zoom.type = 'range';
    zoom.min = '35';
    zoom.max = '140';
    zoom.value = '65';
    const zoomText = node('output', '65%');
    diagramTools.append(labelled('ERD 확대', zoom), zoomText);
    container.append(diagramTools);
    const graph = node('div', undefined, 'schema-graph');
    graph.tabIndex = 0;
    graph.setAttribute('aria-label', '테이블 관계도. 가로와 세로로 스크롤할 수 있습니다.');
    container.append(graph);
    const detail = node('section', undefined, 'schema-detail');
    detail.setAttribute('aria-label', '선택한 테이블 상세');
    container.append(detail);

    function showTable(id) {
      const table = tables.get(id);
      if (!table) return;
      detail.replaceChildren();
      detail.append(node('h4', id + ' · ' + table.korean));
      const isView = ['v', 'm'].includes(table.kind);
      detail.append(node('p', (isView ? '뷰' : '테이블') + ' · ' +
        (isView ? '원본 테이블의 권한과 뷰 보안 옵션 적용' : 'RLS ' + (table.rls ? '사용' : '미사용'))));
      if (table.comment) detail.append(node('p', 'DB 코멘트 · ' + table.comment));
      const constraints = data.constraints.filter(item => item.schema === table.schema && item.table === table.name);
      const columns = data.columns.filter(item => item.schema === table.schema && item.table === table.name);
      detail.append(grid(['영문 컬럼명', '한글 설명', '자료형', 'NULL', '기본값·자동 생성', '키'],
        columns.map(column => [
          column.name, column.korean || column.comment, column.type, column.nullable ? '허용' : '불가',
          column.identity ? 'IDENTITY' : column.default,
          constraints.filter(key => key.columns?.includes(column.name))
            .map(key => ({ p: 'PK', f: 'FK', u: 'UNIQUE' }[key.kind])).filter(Boolean).join(', '),
        ])));
      const references = relations.filter(relation => relation.from === id || relation.to === id);
      if (references.length) {
        detail.append(node('h5', '연결된 테이블'));
        detail.append(grid(['출발', '참조 대상', '관계'], references.map(relation => [relation.from, relation.to, relation.label])));
      }
      for (const [label, records] of [
        ['제약조건', constraints],
        ['인덱스', data.indexes.filter(item => item.schema === table.schema && item.table === table.name)],
        ['뷰 정의', (data.views || []).filter(item => item.schema === table.schema && item.name === table.name)],
        ['트리거', (data.triggers || []).filter(item => item.schema === table.schema && item.table === table.name)],
      ]) {
        if (!records.length) continue;
        const section = node('details');
        section.append(node('summary', label + ' ' + records.length + '개'));
        records.forEach(record => {
          section.append(node('h5', record.name), node('pre', record.definition));
        });
        detail.append(section);
      }
      const policies = (data.policies || []).filter(item => item.schema === table.schema && item.table === table.name);
      if (policies.length) {
        const section = node('details');
        section.append(node('summary', 'RLS 정책 ' + policies.length + '개'));
        section.append(grid(['정책', '역할', '동작', 'USING', 'WITH CHECK'],
          policies.map(policy => [policy.name, policy.roles.join(', '), policy.command, policy.using, policy.check])));
        detail.append(section);
      }
      graph.querySelectorAll('[data-table]').forEach(group => {
        group.classList.toggle('schema-node-selected', group.getAttribute('data-table') === id);
      });
    }

    function draw(filtered) {
      graph.replaceChildren();
      const included = new Set(filtered.map(tableId));
      for (const relation of relations) if (included.has(relation.from)) included.add(relation.to);
      const visible = data.tables.filter(table => included.has(tableId(table)));
      const edges = relations.filter(relation => included.has(relation.from) && included.has(relation.to));
      const levels = new Map();
      function level(id, visiting = new Set()) {
        if (levels.has(id)) return levels.get(id);
        if (visiting.has(id)) return 0;
        const next = new Set(visiting).add(id);
        const parents = edges.filter(edge => edge.from === id && edge.to !== id);
        const rank = Math.min(4, parents.length ? 1 + Math.max(...parents.map(edge => level(edge.to, next))) : 0);
        levels.set(id, rank);
        return rank;
      }
      const rows = new Map();
      const positions = new Map();
      for (const table of visible) {
        const id = tableId(table), column = level(id), row = rows.get(column) || 0;
        positions.set(id, { x: 20 + column * 320, y: 20 + row * 174 });
        rows.set(column, row + 1);
      }
      const width = Math.max(320, rows.size ? (Math.max(...rows.keys()) + 1) * 320 : 320);
      const height = Math.max(190, (Math.max(0, ...rows.values())) * 174 + 20);
      const svg = svgNode('svg', { viewBox: '0 0 ' + width + ' ' + height, role: 'group', 'aria-label': '스키마 관계도' });
      const definitions = svgNode('defs', {});
      const marker = svgNode('marker', { id: 'schema-arrow', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
      marker.append(svgNode('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'schema-arrow' }));
      definitions.append(marker);
      svg.append(definitions);
      for (const edge of edges) {
        const from = positions.get(edge.from), to = positions.get(edge.to);
        const x1 = from.x, x2 = to.x + 280, y1 = from.y + 58, y2 = to.y + 58;
        const middle = (x1 + x2) / 2;
        const line = svgNode('path', {
          d: 'M' + x1 + ',' + y1 + ' C' + middle + ',' + y1 + ' ' + middle + ',' + y2 + ' ' + x2 + ',' + y2,
          class: 'schema-edge ' + (edge.kind === 'view' ? 'schema-view-edge' : ''),
          'marker-end': 'url(#schema-arrow)',
        });
        line.append(svgNode('title', {}, edge.label));
        svg.append(line);
      }
      for (const table of visible) {
        const id = tableId(table), position = positions.get(id);
        const group = svgNode('g', { transform: 'translate(' + position.x + ',' + position.y + ')',
          class: 'schema-node', 'data-table': id, role: 'button', tabindex: 0, 'aria-label': id + ' ' + table.korean });
        group.append(svgNode('rect', { width: 280, height: 152, rx: 8 }),
          svgNode('title', {}, id + ' · ' + table.korean),
          svgNode('text', { x: 12, y: 23, class: 'schema-node-name' }, id),
          svgNode('text', { x: 12, y: 43 }, table.korean));
        const keys = data.constraints.filter(item => item.schema === table.schema && item.table === table.name && ['p', 'f'].includes(item.kind));
        const columns = data.columns.filter(item => item.schema === table.schema && item.table === table.name);
        const prioritized = [...columns].sort((a, b) =>
          Number(keys.some(key => key.columns?.includes(b.name))) - Number(keys.some(key => key.columns?.includes(a.name))));
        prioritized.slice(0, 4).forEach((column, index) => {
          const marks = keys.filter(key => key.columns?.includes(column.name)).map(key => key.kind === 'p' ? 'PK' : 'FK').join('/');
          group.append(svgNode('text', { x: 12, y: 65 + index * 19 }, (marks ? marks + ' ' : '') + column.name));
        });
        group.append(svgNode('text', { x: 12, y: 144, class: 'schema-node-count' }, '컬럼 ' + columns.length + '개 · 선택하여 전체 보기'));
        const activate = () => {
          if (![...select.options].some(option => option.value === id)) {
            scope.value = 'all';
            search.value = '';
            refresh(id);
          } else {
            select.value = id;
            showTable(id);
          }
        };
        group.addEventListener('click', activate);
        group.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
        });
        svg.append(group);
      }
      graph.append(svg);
      function scale() {
        const ratio = Number(zoom.value) / 100;
        svg.style.width = width * ratio + 'px';
        svg.style.height = height * ratio + 'px';
        zoomText.textContent = zoom.value + '%';
      }
      zoom.oninput = scale;
      scale();
    }

    function refresh(preferred) {
      const query = search.value.trim().toLowerCase();
      const filtered = data.tables.filter(table => {
        const inScope = scope.value === 'all' || (scope.value === 'application'
          ? ['public', 'edumaker'].includes(table.schema) : table.schema === scope.value);
        const columns = data.columns.filter(column => column.schema === table.schema && column.table === table.name);
        return inScope && [tableId(table), table.korean, ...columns.flatMap(column => [column.name, column.korean])]
          .join(' ').toLowerCase().includes(query);
      });
      const previous = typeof preferred === 'string' ? preferred : select.value;
      select.replaceChildren();
      filtered.forEach(table => select.append(new Option(tableId(table) + ' · ' + table.korean, tableId(table))));
      select.value = filtered.some(table => tableId(table) === previous) ? previous : tableId(filtered[0] || { schema: '', name: '' });
      select.disabled = !filtered.length;
      draw(filtered);
      if (filtered.length) showTable(select.value);
      else detail.replaceChildren(node('p', '조건에 맞는 테이블·뷰가 없습니다.'));
    }
    scope.addEventListener('change', refresh);
    search.addEventListener('input', refresh);
    select.addEventListener('change', () => showTable(select.value));
    refresh();
  };
})();
