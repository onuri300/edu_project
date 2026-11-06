(() => {
  const count = document.getElementById('player-count');
  const inputs = document.getElementById('ladder-inputs');
  const generate = document.getElementById('generate-btn');
  const start = document.getElementById('start-btn');
  const board = document.getElementById('ladder-board');
  const diagram = document.getElementById('ladder-diagram');
  const svg = document.getElementById('ladder-svg');
  const summary = document.getElementById('result-summary');
  const status = document.getElementById('ladder-status');
  const colors = ['#2775d2', '#c0473b', '#16805a', '#8a51bf', '#b96512', '#188795', '#d03483', '#5c6e20', '#624ac4', '#a33d59'];
  const values = [];
  let routes = [];
  let animations = [];
  let revision = 0;

  function reset() {
    revision++;
    for (const animation of animations) animation.cancel();
    animations = [];
    routes = [];
    board.hidden = true;
    summary.hidden = true;
    status.textContent = '';
  }

  function renderInputs() {
    reset();
    const total = count.valueAsNumber;
    const valid = Number.isInteger(total) && total >= 2 && total <= 10;
    generate.disabled = !valid;
    if (!valid) {
      inputs.replaceChildren();
      status.textContent = '참가자 수를 2~10 사이의 정수로 입력해 주세요.';
      return;
    }
    inputs.replaceChildren();
    for (let i = 0; i < total; i++) {
      values[i] ??= { player: '', result: '' };
      const row = document.createElement('div');
      row.className = 'ladder-input-row';
      for (const [key, label] of [['player', '참가자'], ['result', '결과']]) {
        const field = document.createElement('label');
        field.textContent = `${label} ${i + 1}`;
        const input = document.createElement('input');
        input.placeholder = `${label} ${i + 1}`;
        input.value = values[i][key];
        input.maxLength = 60;
        input.addEventListener('input', () => {
          values[i][key] = input.value;
          reset();
        });
        field.append(input);
        row.append(field);
      }
      inputs.append(row);
    }
  }

  function draw(tag, attributes, className) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    element.setAttribute('class', className);
    svg.append(element);
    return element;
  }

  function renderLabels(id, labels) {
    const target = document.getElementById(id);
    target.replaceChildren(...labels.map(label => {
      const span = document.createElement('span');
      span.textContent = label;
      return span;
    }));
  }

  generate.addEventListener('click', () => {
    reset();
    const total = count.valueAsNumber;
    const names = values.slice(0, total).map((value, i) => value.player.trim() || `참가자 ${i + 1}`);
    const results = values.slice(0, total).map((value, i) => value.result.trim() || `결과 ${i + 1}`);
    const x = column => column * 100 + 50;
    const rowCount = total * 2 + 4;
    const rungs = Array.from({ length: rowCount }, (_, row) => ({
      left: Math.floor(Math.random() * (total - 1)),
      y: 12 + (row + 1) * 276 / (rowCount + 1)
    }));
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${total * 100} 300`);
    svg.setAttribute('preserveAspectRatio', 'none');
    diagram.style.setProperty('--players', total);
    diagram.style.minWidth = `${total * 72}px`;
    renderLabels('ladder-players', names);
    renderLabels('ladder-outcomes', results);
    for (let column = 0; column < total; column++) {
      draw('line', { x1: x(column), x2: x(column), y1: 12, y2: 288 }, 'ladder-rail');
    }
    for (const rung of rungs) {
      draw('line', { x1: x(rung.left), x2: x(rung.left + 1), y1: rung.y, y2: rung.y }, 'ladder-rail');
    }
    routes = names.map((name, index) => {
      let column = index;
      const points = [`${x(column)},12`];
      for (const { left, y } of rungs) {
        if (column !== left && column !== left + 1) continue;
        points.push(`${x(column)},${y}`);
        column = column === left ? left + 1 : left;
        points.push(`${x(column)},${y}`);
      }
      points.push(`${x(column)},288`);
      return { name, result: results[column], points: points.join(' '), color: colors[index] };
    });
    start.disabled = false;
    board.hidden = false;
    status.textContent = '사다리를 생성했습니다. 시작 버튼을 눌러 경로를 확인하세요.';
  });

  start.addEventListener('click', async () => {
    if (!routes.length) return;
    const run = revision;
    start.disabled = true;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    animations = routes.map((route, index) => {
      const line = draw('polyline', { points: route.points, stroke: route.color }, 'ladder-trace');
      if (reduceMotion) return null;
      const length = line.getTotalLength();
      return line.animate([
        { strokeDasharray: `0 ${length}` },
        { strokeDasharray: `${length} 0` }
      ], { duration: 800, delay: index * 160, fill: 'both' });
    }).filter(Boolean);
    await Promise.allSettled(animations.map(animation => animation.finished));
    if (run !== revision) return;
    const body = document.getElementById('summary-list');
    body.replaceChildren(...routes.map(route => {
      const row = document.createElement('tr');
      for (const value of [route.name, route.result]) {
        row.insertCell().textContent = value;
      }
      row.style.borderInlineStart = `4px solid ${route.color}`;
      return row;
    }));
    summary.hidden = false;
    document.getElementById('summary-title').focus();
  });

  count.addEventListener('input', renderInputs);
  renderInputs();
})();
