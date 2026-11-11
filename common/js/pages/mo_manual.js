(() => {
  const search = document.getElementById('manual-search');
  const category = document.getElementById('manual-category');
  const list = document.getElementById('manual-list');
  const detail = document.getElementById('manual-detail');
  const status = document.getElementById('manual-status');
  const prompt = document.getElementById('manual-prompt');
  const copyStatus = document.getElementById('manual-copy-status');
  const sample = document.getElementById('manual-sample');
  const schema = document.getElementById('manual-schema');
  const coding = document.body.dataset.manual === 'coding';
  const copyObject = coding ? '본문을' : '프롬프트를';
  let entries = [];
  let selectedText = '';
  let categories = [];
  const treeState = new Map();
  const workspace = document.querySelector('.manual-workspace');
  const sidebarToggle = document.getElementById('manual-sidebar-toggle');
  const sidebar = document.getElementById('manual-sidebar');
  let allExpanded;
  function setAllExpanded(open) {
    allExpanded = open;
    list.querySelectorAll('details').forEach(branch => { branch.open = open; });
    for (const key of treeState.keys()) treeState.set(key, open);
  }
  document.getElementById('manual-expand-all').addEventListener('click', () => setAllExpanded(true));
  document.getElementById('manual-collapse-all').addEventListener('click', () => setAllExpanded(false));
  sidebarToggle.addEventListener('click', () => {
    const collapsed = workspace.classList.toggle('manual-sidebar-collapsed');
    sidebar.hidden = collapsed;
    sidebarToggle.textContent = collapsed ? '→' : '←';
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    sidebarToggle.setAttribute('aria-label', collapsed ? '문서 목록 펼치기' : '문서 목록 접기');
  });

  function show(entry, button) {
    for (const previous of list.querySelectorAll('[aria-current]')) {
      previous.removeAttribute('aria-current');
    }
    button.setAttribute('aria-current', 'true');
    detail.hidden = false;
    document.getElementById('manual-keyword').textContent = entry.keyword;
    document.getElementById('manual-title').textContent = entry.title;
    document.getElementById('manual-description').textContent = entry.description || '';
    selectedText = entry.prompt;
    if (schema) {
      schema.hidden = !entry.database;
      if (entry.database) window.renderDatabaseSchema(schema, entry.database);
    }
    const hasSample = Boolean(sample && entry.areas);
    if (sample) {
      sample.hidden = !hasSample;
      prompt.closest('.manual-prompt').hidden = hasSample;
    }
    if (hasSample) {
      window.renderCodingSample(sample, entry);
    } else if (coding && window.onuriMarkdown) {
      prompt.innerHTML = window.onuriMarkdown.render(selectedText).html;
      const firstHeading = prompt.firstElementChild;
      if (firstHeading?.tagName === 'H1' && firstHeading.textContent.trim() === entry.title.trim()) {
        firstHeading.remove();
      }
      for (const link of prompt.querySelectorAll('a[href]')) {
        const href = link.getAttribute('href');
        if (/^https?:|^#/i.test(href)) continue;
        const index = entries.findIndex(document => document.file === href);
        if (index < 0) {
          link.replaceWith(...link.childNodes);
          continue;
        }
        link.href = '#manual-detail';
        link.addEventListener('click', event => {
          event.preventDefault();
          search.value = category.value = '';
          render(entries[index]);
          detail.scrollIntoView({ block: 'start' });
        });
      }
    } else prompt.textContent = selectedText;
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

  function render(preferred) {
    const query = search.value.trim().toLowerCase();
    const matches = entries.filter(entry =>
      (!category.value || entry.category === category.value) &&
      [entry.keyword, entry.title, entry.description, entry.subcategory, coding ? entry.prompt : '']
        .join(' ').toLowerCase().includes(query)
    );
    list.replaceChildren();
    detail.hidden = true;
    status.textContent = matches.length ? `${coding ? '문서' : '프롬프트'} ${matches.length}개` : '검색 결과가 없습니다.';
    const parents = new Set(matches.map(entry => entry.parent).filter(Boolean));
    const visible = entries.filter(entry => matches.includes(entry) || parents.has(entry.file));
    const childLists = new Map();
    const buttons = new Map();
    const branches = new Map();
    function branch(label, key, destination) {
      const group = document.createElement('details');
      group.className = 'manual-tree-branch';
      group.open = query || category.value ? true : (treeState.get(key) ?? allExpanded ?? true);
      const summary = document.createElement('summary');
      summary.textContent = label;
      group.append(summary);
      const children = document.createElement('div');
      children.className = 'manual-subpages';
      group.append(children);
      group.addEventListener('toggle', () => treeState.set(key, group.open));
      destination.append(group);
      return { group, children };
    }
    for (const item of categories) {
      if (!visible.some(entry => entry.category === item.id)) continue;
      branches.set(item.id, branch(item.name, 'category:' + item.id, list));
    }
    for (const entry of visible) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = entry.title;
      button.addEventListener('click', () => {
        show(entry, button);
        if (entry.areas) history.replaceState(null, '', '#template-' + entry.id);
        else if (coding && location.hash.startsWith('#template-')) history.replaceState(null, '', location.pathname + location.search);
        if (matchMedia('(max-width: 720px)').matches) detail.scrollIntoView({ block: 'start' });
      });
      const destination = entry.parent ? childLists.get(entry.parent) : branches.get(entry.category)?.children || list;
      destination.append(button);
      buttons.set(entry, button);
      if (parents.has(entry.file)) {
        const children = branch('하위 문서', 'document:' + entry.file, destination);
        childLists.set(entry.file, children.children);
      }
    }
    const selected = matches.includes(preferred) ? preferred : matches[0];
    if (selected) {
      const button = buttons.get(selected);
      // Reveal the selected document after search or an internal document link.
      if (query || preferred?.file || preferred?.id) {
        let parent = button.parentElement;
        while (parent && parent !== list) {
          if (parent.tagName === 'DETAILS') parent.open = true;
          parent = parent.parentElement;
        }
      }
      show(selected, button);
    }
  }

  search.addEventListener('input', render);
  category.addEventListener('change', render);
  document.getElementById('manual-copy').addEventListener('click', async () => {
    const copied = await window.eduUI.copyText(selectedText);
    copyStatus.textContent = copied
      ? `${copyObject} 복사했습니다.`
      : `${copyObject} 선택하여 직접 복사해 주세요.`;
  });

  const dataRequest = Promise.resolve(coding ? window.ONURI_CODING_MANUAL : window.ONURI_GPT_MANUAL);
  dataRequest.then(data => {
      entries = data.entries;
      categories = data.categories;
      for (const item of data.categories) {
        category.add(new Option(item.name, item.id));
      }
      const initial = coding && entries.find(entry => entry.areas && location.hash === '#template-' + entry.id);
      render(initial);
    })
    .catch(() => { status.textContent = '매뉴얼을 불러오지 못했습니다. 새로고침해 주세요.'; });
})();
