(() => {
  const count = document.getElementById('player-count');
  const players = document.getElementById('ladder-players');
  const outcomes = document.getElementById('ladder-outcomes');
  const generate = document.getElementById('generate-btn');
  const start = document.getElementById('start-btn');
  const board = document.getElementById('ladder-board');
  const diagram = document.getElementById('ladder-diagram');
  const svg = document.getElementById('ladder-svg');
  const resultTable = document.querySelector('.ladder-results');
  const placeholder = document.getElementById('summary-placeholder');
  const status = document.getElementById('ladder-status');
  const colors = ['#007bff', '#ff3d60', '#00a96e', '#a13bff', '#ff7900', '#00a4bc', '#ee2597', '#80aa00', '#584bff', '#eb4723'];
  const values = [];
  let routes = [];
  let animations = [];
  let revision = 0;

  function reset() {
    revision++;
    for (const animation of animations) animation.cancel();
    animations = [];
    routes = [];
    board.classList.remove('is-generated');
    start.disabled = true;
    resultTable.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent = '경로 재생이 끝나면 참가자별 결과가 여기에 표시됩니다.';
    status.textContent = '';
  }

  function renderInputs() {
    reset();
    const total = count.valueAsNumber;
    const valid = Number.isInteger(total) && total >= 2 && total <= 10;
    generate.disabled = !valid;
    board.hidden = !valid;
    players.replaceChildren();
    outcomes.replaceChildren();
    if (!valid) {
      status.textContent = '참가자 수를 2~10 사이의 정수로 입력해 주세요.';
      return;
    }
    for (let i = 0; i < total; i++) {
      values[i] ??= { player: '', result: '' };
      for (const [key, label, container] of [
        ['player', '참가자', players],
        ['result', '결과', outcomes]
      ]) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `${label} ${i + 1}`;
        input.setAttribute('aria-label', input.placeholder);
        input.required = true;
        input.value = values[i][key];
        input.maxLength = 60;
        input.addEventListener('input', () => {
          values[i][key] = input.value;
          input.removeAttribute('aria-invalid');
          reset();
          drawPreview();
        });
        container.append(input);
      }
    }
    drawPreview();
  }

  function draw(tag, attributes, className) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    element.setAttribute('class', className);
    svg.append(element);
    return element;
  }

  function drawPreview() {
    const total = count.valueAsNumber;
    const x = column => column * 100 + 50;
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${total * 100} 300`);
    svg.setAttribute('preserveAspectRatio', 'none');
    diagram.style.setProperty('--players', total);
    diagram.style.minWidth = `${total * 72}px`;
    for (let column = 0; column < total; column++) {
      draw('line', { x1: x(column), x2: x(column), y1: 12, y2: 288, stroke: colors[column] }, 'ladder-vertical');
    }
    return x;
  }

  generate.addEventListener('click', () => {
    reset();
    const fields = [...players.children, ...outcomes.children];
    const blank = fields.find(input => !input.value.trim());
    if (blank) {
      status.textContent = '모든 참가자 이름과 결과를 입력해 주세요.';
      blank.setAttribute('aria-invalid', 'true');
      blank.focus();
      return;
    }
    const total = count.valueAsNumber;
    const names = Array.from(players.children, input => input.value.trim());
    const results = Array.from(outcomes.children, input => input.value.trim());
    const x = drawPreview();
    board.classList.add('is-generated');
    const rowCount = total * 2 + 4;
    const rungs = Array.from({ length: rowCount }, (_, row) => ({
      left: Math.floor(Math.random() * (total - 1)),
      y: 12 + (row + 1) * 276 / (rowCount + 1)
    }));
    for (const rung of rungs) {
      draw('line', { x1: x(rung.left), x2: x(rung.left + 1), y1: rung.y, y2: rung.y }, 'ladder-rung');
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
    status.textContent = '사다리를 생성했습니다. 결과 보기를 눌러 경로를 확인하세요.';
  });

  start.addEventListener('click', async () => {
    if (!routes.length) return;
    const run = revision;
    start.disabled = true;
    placeholder.textContent = '참가자들의 경로를 재생 중입니다…';
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    animations = routes.map((route, index) => {
      const line = draw('polyline', { points: route.points, stroke: route.color }, 'ladder-trace');
      if (reduceMotion) return null;
      const length = line.getTotalLength();
      return line.animate([
        { strokeDasharray: `0 ${length}` },
        { strokeDasharray: `${length} 0` }
      ], { duration: 1900, delay: index * 360, fill: 'both' });
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
    placeholder.hidden = true;
    resultTable.hidden = false;
  });

  count.addEventListener('input', renderInputs);
  renderInputs();
})();
