const activities = [
  { name: '양치하기', art: 'brushing', icon: '🪥', steps: [
    '칫솔을 준비해요', '칫솔에 치약을 짜요',
    '이를 골고루 닦아요', '물로 입을 헹궈요'
  ], reason: '칫솔에 치약을 묻힌 뒤 이를 닦고, 마지막에 입을 헹궈요.' },
  { name: '피자 만들기', art: 'pizza', icon: '🍕', steps: [
    '도우를 펼쳐요', '도우에 소스를 발라요',
    '치즈와 토핑을 올려요', '오븐에 구워요'
  ], reason: '도우 위에 소스와 토핑을 올린 다음 구워요.' },
  { name: '라면 끓이기', art: 'ramen', icon: '🍜', steps: [
    '냄비에 물을 담아요', '물이 끓을 때까지 기다려요',
    '면과 스프를 넣어요', '면이 익으면 불을 꺼요'
  ], reason: '물이 끓고 나서 면과 스프를 넣어요. 뜨거운 냄비는 어른과 함께 다뤄요.' }
];

const topics = document.querySelector('#topics');
const cards = document.querySelector('#cards');
const slots = document.querySelector('#slots');
const feedback = document.querySelector('#feedback');
const next = document.querySelector('#next');
const completed = new Set();
let activityIndex, deck, order, selected, dragged, checked;

function start(index) {
  activityIndex = index;
  const count = activities[index].steps.length;
  deck = Array.from({ length: count }, (_, step) => step);
  for (let end = count - 1; end > 0; end--) {
    const other = Math.floor(Math.random() * (end + 1));
    [deck[end], deck[other]] = [deck[other], deck[end]];
  }
  if (deck.every((step, position) => step === position)) deck.push(deck.shift());
  order = Array(count).fill(null);
  selected = dragged = null;
  document.querySelector('#title').textContent = activities[index].name;
  clearResult();
  render();
}

function clearResult() {
  checked = false;
  next.hidden = true;
  feedback.textContent = '';
}

function cardMarkup(step) {
  const { art, steps } = activities[activityIndex];
  const image = '../common/images/ga.image/sequence/' + art + '-' + (step + 1) + '.jpg';
  return '<img class="sequence-art" src="' + image + '" alt="" draggable="false"><span>' + steps[step] + '</span>';
}

function bindDrag(button, step) {
  button.draggable = true;
  button.ondragstart = event => {
    dragged = step;
    event.dataTransfer.setData('text/plain', String(step));
    event.dataTransfer.effectAllowed = 'move';
  };
  button.ondragend = () => {
    dragged = null;
    slots.querySelectorAll('.target').forEach(slot => slot.classList.remove('target'));
  };
}

function place(step, position) {
  const previous = order.indexOf(step);
  if (previous >= 0 && previous !== position) order[previous] = order[position];
  order[position] = step;
  selected = dragged = null;
  clearResult();
  render();
  const empty = order.indexOf(null);
  const focusTarget = empty === -1 ? document.querySelector('#check') : cards.querySelector('button');
  focusTarget?.focus();
  feedback.textContent = (position + 1) + '번 칸에 놓았어요.';
}

function select(step, source) {
  selected = selected === step ? null : step;
  render();
  document.querySelector('#' + source)?.focus();
  feedback.textContent = selected === null ? '선택을 취소했어요.' : '카드를 놓을 번호 칸을 눌러 보세요.';
}

function render() {
  topics.replaceChildren();
  activities.forEach((activity, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = activity.icon + ' ' + activity.name + (completed.has(index) ? ' ✓' : '');
    button.setAttribute('aria-pressed', String(index === activityIndex));
    if (completed.has(index)) button.setAttribute('aria-label', activity.name + ', 완료');
    button.onclick = () => { start(index); topics.children[index].focus(); };
    topics.append(button);
  });

  cards.replaceChildren();
  deck.filter(step => !order.includes(step)).forEach(step => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'card-' + step;
    button.className = 'card' + (selected === step ? ' selected' : '');
    button.setAttribute('aria-pressed', String(selected === step));
    button.innerHTML = cardMarkup(step);
    button.onclick = () => select(step, button.id);
    bindDrag(button, step);
    cards.append(button);
  });
  if (!cards.children.length) cards.textContent = '카드를 모두 놓았어요.';

  slots.replaceChildren();
  order.forEach((step, position) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'slot-' + position;
    const filled = step !== null;
    const result = checked ? (step === position ? ' 맞았어요' : ' 다시 확인') : '';
    button.className = 'slot' + (filled ? ' filled' : '') +
      (checked ? (step === position ? ' correct' : ' retry') : '') +
      (filled && selected === step ? ' selected' : '');
    button.innerHTML = '<span class="number">' + (position + 1) + '번' + result + '</span>' +
      (filled ? cardMarkup(step) : '<span>빈칸</span>');
    button.onclick = () => {
      if (selected !== null && selected !== step) place(selected, position);
      else if (filled) select(step, button.id);
      else feedback.textContent = '먼저 그림 카드를 골라 보세요.';
    };
    if (filled) bindDrag(button, step);
    button.ondragover = event => {
      if (dragged === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      button.classList.add('target');
    };
    button.ondragleave = () => button.classList.remove('target');
    button.ondrop = event => {
      if (dragged === null) return;
      event.preventDefault();
      place(dragged, position);
    };
    slots.append(button);
  });
}

document.querySelector('#check').onclick = () => {
  if (order.includes(null)) {
    feedback.textContent = '빈칸을 모두 채운 뒤 정답을 확인해 보세요.';
    return;
  }
  checked = true;
  if (order.every((step, position) => step === position)) {
    completed.add(activityIndex);
    const upcoming = activities.findIndex((_, index) => !completed.has(index));
    next.hidden = upcoming === -1;
    next.onclick = () => { start(upcoming); topics.children[upcoming].focus(); };
    feedback.textContent = (upcoming === -1 ? '세 활동을 모두 마쳤어요! ' : '정답이에요! ') +
      activities[activityIndex].reason;
  } else {
    next.hidden = true;
    feedback.textContent = '‘다시 확인’이라고 표시된 칸을 살펴보세요. 카드 두 장을 차례로 누르면 자리를 바꿀 수 있어요.';
  }
  render();
};
document.querySelector('#reset').onclick = () => start(activityIndex);
start(0);
