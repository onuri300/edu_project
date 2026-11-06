(() => {
  const search = document.getElementById('manual-search');
  const category = document.getElementById('manual-category');
  const list = document.getElementById('manual-list');
  const detail = document.getElementById('manual-detail');
  const status = document.getElementById('manual-status');
  const prompt = document.getElementById('manual-prompt');
  const copyStatus = document.getElementById('manual-copy-status');
  let entries = [];

  function show(entry, button) {
    for (const previous of list.querySelectorAll('[aria-current]')) {
      previous.removeAttribute('aria-current');
    }
    button.setAttribute('aria-current', 'true');
    detail.hidden = false;
    document.getElementById('manual-keyword').textContent = entry.keyword;
    document.getElementById('manual-title').textContent = entry.title;
    document.getElementById('manual-description').textContent = entry.description;
    prompt.textContent = entry.prompt;
    copyStatus.textContent = '';
    const notes = document.getElementById('manual-notes');
    notes.replaceChildren();
    for (const [label, field] of [
      ['이럴 때 사용', 'useCase'],
      ['기대 결과', 'expected'],
      ['확인 사항', 'tips'],
      ['추천 조합', 'combination']
    ]) {
      if (!entry[field]) continue;
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = entry[field];
      notes.append(term, description);
    }
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const matches = entries.filter(entry =>
      (!category.value || entry.category === category.value) &&
      [entry.keyword, entry.title, entry.description, entry.subcategory]
        .join(' ').toLowerCase().includes(query)
    );
    list.replaceChildren();
    detail.hidden = true;
    status.textContent = matches.length ? `프롬프트 ${matches.length}개` : '검색 결과가 없습니다.';
    for (const entry of matches) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = entry.title;
      button.addEventListener('click', () => {
        show(entry, button);
        if (matchMedia('(max-width: 720px)').matches) detail.scrollIntoView({ block: 'start' });
      });
      list.append(button);
      if (detail.hidden) show(entry, button);
    }
  }

  search.addEventListener('input', render);
  category.addEventListener('change', render);
  document.getElementById('manual-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent);
      copyStatus.textContent = '프롬프트를 복사했습니다.';
    } catch {
      copyStatus.textContent = '프롬프트를 선택하여 직접 복사해 주세요.';
    }
  });

  fetch(new URL('common/data/gpt-making-manual.json', window.eduAuth.root))
    .then(response => {
      if (!response.ok) throw new Error('Manual data unavailable');
      return response.json();
    })
    .then(data => {
      entries = data.entries;
      for (const item of data.categories) {
        category.add(new Option(item.name, item.id));
      }
      render();
    })
    .catch(() => { status.textContent = '매뉴얼을 불러오지 못했습니다. 새로고침해 주세요.'; });
})();
