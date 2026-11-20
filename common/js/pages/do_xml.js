(() => {
  const child = (node, name) => [...node.children].find(item => item.localName === name);
  const children = (node, name) => [...(node?.children ?? [])].filter(item => item.localName === name);
  const element = (tag, text = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  };

  function inline(tag, source) {
    const node = element(tag);
    for (const part of source.childNodes) {
      if (part.nodeType === Node.ELEMENT_NODE && ['b', 'kbd', 'code'].includes(part.localName)) {
        node.append(inline(part.localName, part));
      } else if ([Node.TEXT_NODE, Node.CDATA_SECTION_NODE, Node.ELEMENT_NODE].includes(part.nodeType)) {
        node.append(document.createTextNode(part.textContent));
      }
    }
    return node;
  }

  function appendText(target, source, name, tag) {
    const value = child(source, name);
    if (value) target.append(inline(tag, value));
  }

  function appendList(target, source, itemTag, listTag, title) {
    const items = children(source, itemTag);
    if (!items.length) return;
    if (title) target.append(element('h5', title));
    const list = element(listTag);
    list.append(...items.map(item => inline('li', item)));
    target.append(list);
  }

  function asset(path, base) {
    if (!path || /^(?:[a-z][a-z\d+.-]*:|[\\/])/i.test(path)) throw Error('Invalid manual asset path');
    const url = new URL(path, base);
    if (!url.href.startsWith(new URL('images/', base).href)) throw Error('Invalid manual asset path');
    return url.href;
  }

  function figure(source, base) {
    const frame = element('figure');
    const image = element('img');
    image.src = asset(source.getAttribute('src'), base);
    image.alt = source.getAttribute('alt') ?? '';
    image.loading = 'lazy';
    image.decoding = 'async';
    const full = source.getAttribute('fullSrc');
    if (full) {
      const link = element('a');
      link.href = asset(full, base);
      link.append(image);
      frame.append(link);
    } else {
      frame.append(image);
    }
    appendText(frame, source, 'caption', 'figcaption');
    return frame;
  }

  const tree = document.querySelector('#equip-tree');
  const pane = document.querySelector('#equip-detail');
  const equipment = document.body.dataset.manual === 'equipment';
  const ai = document.body.dataset.manual === 'ai';
  const page = equipment ? 'do_equip.html' : ai ? 'do_gpt.html' : 'do_program.html';
  const catalogUrl = new URL(equipment ? 'shared-manuals/equipment/index.xml' : ai ? 'shared-manuals/ai/index.xml' : 'shared-manuals/index.xml', document.baseURI);
  const oldEquipmentIds = { f2: 'xtool-f2', p3: 'xtool-p3', omni: 'xtool-o1-omni', x2d: 'bambu-x2d', x1c: 'bambu-x1c', h2s: 'bambu-h2s' };
  const entries = new Map();
  const logos = {
    chatgpt: 'gpt.png', claude: 'claude.png', gemini: 'gemini.png', notebooklm: 'notebooklm.png',
    'xtool-studio': 'xtool.png', 'bambu-studio': 'bambu.png', inkscape: 'inkscape.svg',
    illustrator: 'illustrator.svg', canva: 'canva.png', gdrive: 'googledrive.png',
    gslides: 'googleslide.png', gsheets: 'googlesheet.png', notion: 'notion.png',
    vscode: 'vscode.png', github: 'github.png',
  };
  const idFor = (program, doc) => ai ? 'ai-' + program + '-intro' : (equipment ? 'eq-' : 'pg-') + program + (doc ? '-' + doc : '');
  function hrefFor(id) {
    const query = new URLSearchParams(location.search);
    query.set('id', id);
    return '?' + query.toString();
  }
  const plain = (source, tag) => child(source, tag)?.textContent.trim() ?? '';
  const createLink = (id, label) => {
    const anchor = element('a', label);
    anchor.href = hrefFor(id);
    anchor.dataset.manualEntry = id;
    return anchor;
  };

  async function loadXml(url, rootName) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw Error('Manual request failed');
    const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
    if (xml.documentElement.localName !== rootName || xml.documentElement.getAttribute('schemaVersion') !== '2' || xml.querySelector('parsererror')) {
      throw Error('Invalid manual XML');
    }
    return xml.documentElement;
  }

  function officialLinks(target, source) {
    const list = element('ul');
    for (const link of children(child(source, 'links'), 'link')) {
      const href = link.getAttribute('href');
      if (!href || !/^https:\/\//i.test(href)) continue;
      const anchor = inline('a', link);
      anchor.href = href;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      const item = element('li');
      item.append(anchor);
      list.append(item);
    }
    if (list.childElementCount) target.append(element('h3', '공식 자료'), list);
  }

  function heading(source, fields) {
    const title = inline('h2', child(source, 'title'));
    title.id = 'equip-title';
    pane.replaceChildren(title);
    for (const field of fields) appendText(pane, source, field, 'p');
  }

  function equipmentPhoto(program, className, decorative = false) {
    const photo = child(program.manual, 'photo');
    if (!photo) return null;
    const remote = photo.getAttribute('remote');
    const local = photo.getAttribute('src');
    const fallback = /^https:\/\//i.test(remote ?? '') ? remote : '';
    if (!local && !fallback) return null;
    const image = element('img');
    image.className = className;
    image.alt = decorative ? '' : photo.getAttribute('alt') || '';
    image.loading = 'lazy';
    if (local && fallback) image.addEventListener('error', () => { image.src = fallback; }, { once: true });
    image.src = local ? asset(local, program.url) : fallback;
    return image;
  }

  function renderSummary(program) {
    const source = program.manual;
    heading(source, ['maker', 'keyword', 'description', 'summary']);
    const photo = equipmentPhoto(program, 'equip-photo');
    if (photo) pane.append(photo);
    const specs = children(child(source, 'specs'), 'spec');
    if (specs.length) {
      const list = element('dl');
      list.className = 'equip-spec';
      for (const spec of specs) {
        const row = element('div');
        row.append(element('dt', spec.getAttribute('name')), inline('dd', spec));
        list.append(row);
      }
      pane.append(element('h3', '주요 사양'), list);
    }
    for (const [tag, title] of [['usage', '기본 사용 순서'], ['pros', '장점'], ['cons', '유의할 점'], ['uses', '활용']]) {
      appendList(pane, child(source, tag), 'item', tag === 'usage' ? 'ol' : 'ul', title);
    }
    appendList(pane, child(source, 'tips'), 'tip', 'ul', '사용 팁');
    officialLinks(pane, source);
  }

  function renderDocument(program, doc) {
    const figures = children(child(doc, 'figures'), 'figure');
    const note = child(doc, 'note');
    const details = children(doc, 'detail');
    const flow = child(doc, 'flow');
    const samples = child(doc, 'samples');
    const practice = Boolean(figures.length || note || details.length);
    heading(doc, practice || flow ? ['keyword', 'description', 'summary', 'intro'] : []);
    const card = element('section');
    card.className = 'equip-workflow-step';
    const instructions = element('div');
    instructions.className = 'equip-workflow-instructions';
    appendList(instructions, child(doc, 'when'), 'item', 'ul', '이럴 때 씁니다');
    const actions = child(doc, 'actions');
    if (actions) appendList(instructions, actions, 'action', 'ol', actions.getAttribute('title') || '작업 순서');
    if (note) {
      const box = element('div');
      box.className = 'equip-workflow-note';
      appendList(box, note, 'item', 'ul', note.getAttribute('title'));
      instructions.append(box);
    }
    for (const detail of details) {
      if (detail.hasAttribute('title')) instructions.append(element('h3', detail.getAttribute('title')));
      instructions.append(...children(detail, 'p').map(p => inline('p', p)));
    }
    appendList(instructions, child(doc, 'tips'), 'tip', 'ul', '사용 팁');
    officialLinks(instructions, doc);
    if (figures.length) {
      const pair = element('div');
      pair.className = 'document-media-pair shared-manual-pair';
      const images = element('div');
      images.className = 'shared-manual-images';
      for (const entry of figures) {
        const frame = element('div');
        frame.className = 'document-media-frame';
        frame.append(figure(entry, program.url));
        images.append(frame);
      }
      pair.append(images, instructions);
      card.append(pair);
    } else {
      card.append(instructions);
    }
    if (instructions.childElementCount || figures.length) pane.append(card);

    if (flow) {
      const list = element('ol');
      for (const reference of children(flow, 'ref')) {
        const id = idFor(reference.getAttribute('program') || program.id, reference.getAttribute('doc'));
        const target = entries.get(id);
        if (!target?.doc) continue;
        const label = reference.textContent.trim() || plain(target.doc, 'description') || plain(target.doc, 'title');
        const item = element('li');
        item.append(createLink(id, label));
        list.append(item);
      }
      pane.append(element('h3', flow.getAttribute('title') || '작업 흐름'), list);
    }
    if (samples) {
      const gallery = element('div');
      gallery.className = 'equip-manual-samples';
      gallery.append(...children(samples, 'figure').map(item => figure(item, program.url)));
      pane.append(element('h3', samples.getAttribute('title') || '예시 파일'), gallery);
    }
  }

  function renderOverview(source, groups, filtered) {
    heading(source, filtered ? [] : ['keyword', 'description', 'summary']);
    const chart = child(source, 'chart');
    if (chart) {
      const layout = element('div');
      layout.className = 'staff-org-teams equip-chart';
      const root = element('div');
      root.className = 'staff-org-root';
      const label = element('strong', chart.getAttribute('root'));
      label.className = 'equip-root-label';
      root.append(label);
      const branches = element('ul');
      branches.className = 'equip-branches staff-org-branches';
      const visible = new Map(groups.flatMap(group => group.programs.map(program => [program.id, program])));
      const configured = children(chart, 'group');
      const chartGroups = configured.length ? configured.map(group => ({
        title: group.getAttribute('title'),
        programs: children(group, 'item').flatMap(item => {
          const program = visible.get(item.getAttribute('ref'));
          return program ? [{ ...program, blurb: item.textContent.trim() || program.blurb }] : [];
        }),
      })).filter(group => group.programs.length) : groups;
      for (const group of chartGroups) {
        const branch = element('li');
        branch.className = 'staff-org-branch';
        const list = element('ul');
        list.className = 'staff-org-members staff-org-level';
        for (const program of group.programs) {
          const item = element('li');
          const link = createLink(idFor(program.id), '');
          link.className = 'staff-org-person equip-device';
          const badge = element('span');
          const photo = equipmentPhoto(program, '', true);
          badge.className = photo ? 'staff-org-face' : 'equip-program-logo';
          badge.setAttribute('aria-hidden', 'true');
          const title = plain(program.manual, 'title');
          if (photo) badge.append(photo);
          else if (logos[program.id]) {
            const icon = element('img');
            icon.src = '../common/images/do.image/' + logos[program.id];
            icon.alt = '';
            badge.append(icon);
          } else badge.textContent = title.slice(0, 2);
          const info = element('span');
          info.className = 'staff-org-info';
          info.append(element('strong', title), element('span', program.blurb));
          link.append(badge, info);
          item.append(link);
          list.append(item);
        }
        branch.append(element('h3', group.title), list);
        branches.append(branch);
      }
      layout.append(root, branches);
      pane.append(layout);
    }

    const sourceTable = child(source, 'table');
    if (sourceTable) {
      const table = element('table');
      table.className = 'shared-manual-table';
      table.setAttribute('aria-labelledby', 'equip-title');
      const head = element('thead');
      const header = element('tr');
      for (const cell of children(child(sourceTable, 'head'), 'cell')) {
        const th = inline('th', cell);
        th.scope = 'col';
        header.append(th);
      }
      head.append(header);
      const body = element('tbody');
      const names = new Set(groups.flatMap(group => group.programs.map(program => plain(program.manual, 'title'))));
      for (const row of children(sourceTable, 'row')) {
        if (filtered && !names.has(plain(row, 'cell'))) continue;
        const tr = element('tr');
        tr.append(...children(row, 'cell').map(cell => inline('td', cell)));
        body.append(tr);
      }
      table.append(head, body);
      pane.append(table);
    }
    appendList(pane, child(source, 'tips'), 'tip', 'ul', '사용 팁');
  }

  function branch(label, open) {
    const details = element('details');
    details.className = 'document-tree-branch';
    details.open = open;
    const list = element('ul');
    details.append(element('summary', label), list);
    return { details, list };
  }

  function registerAi(program) {
    program.sections = children(program.manual, 'section').map(section => ({
      source: section,
      sets: children(section, 'set').map(source => ({ source, prompts: children(source, 'prompt') })),
    }));
    for (const section of program.sections) for (const set of section.sets) {
      for (const prompt of set.prompts) entries.set(prompt.getAttribute('id'), { program, section, set, prompt });
    }
  }

  function aiBranch(program, active, matches) {
    const selected = active?.program === program;
    const top = branch(plain(program.manual, 'title'), selected || Boolean(matches));
    const entry = element('li');
    const intro = createLink(idFor(program.id), '소개');
    if (selected && !active.prompt) intro.setAttribute('aria-current', 'page');
    entry.append(intro);
    if (!matches) top.list.append(entry);
    for (const section of program.sections) {
      const row = element('li');
      const nested = branch(section.source.getAttribute('title'), active?.section === section || Boolean(matches));
      for (const set of section.sets) {
        const picks = matches ? set.prompts.filter(prompt => matches.has(prompt)) : set.prompts.slice(0, 1);
        for (const prompt of picks) {
          const item = element('li');
          const link = createLink(prompt.getAttribute('id'), matches ? plain(prompt, 'title') : set.source.getAttribute('title'));
          if (matches ? active?.prompt === prompt : active?.set === set) link.setAttribute('aria-current', 'page');
          item.append(link);
          nested.list.append(item);
        }
      }
      if (!nested.list.childElementCount) continue;
      row.append(nested.details);
      top.list.append(row);
    }
    const holder = element('li');
    holder.append(top.details);
    return holder;
  }

  function renderAiIntro(program) {
    renderSummary(program);
    const cover = child(program.manual, 'cover');
    if (cover) {
      const panel = element('section');
      panel.className = 'equip-workflow-step';
      panel.append(element('h3', cover.getAttribute('title')));
      appendText(panel, cover, 'tagline', 'p');
      appendList(panel, child(cover, 'chips'), 'item', 'ul');
      const site = child(cover, 'site');
      const url = site?.getAttribute('href');
      if (/^https:\/\//i.test(url ?? '')) {
        const link = inline('a', site);
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        panel.append(link);
      }
      pane.querySelector('h2').after(panel);
    }
    for (const [tag, title] of [['highlights', '핵심 특장점'], ['ouruse', '오누리 활용']]) {
      const items = children(child(program.manual, tag), 'item');
      if (!items.length) continue;
      const list = element('dl');
      list.className = 'equip-spec';
      for (const item of items) {
        const row = element('div');
        const description = inline('dd', item);
        if (item.hasAttribute('scene')) description.append(element('p', item.getAttribute('scene')));
        row.append(element('dt', item.getAttribute('title')), description);
        list.append(row);
      }
      pane.append(element('h3', title), list);
    }
  }

  function renderPromptSet({ section, set, prompt: selected }, scrollToPrompt) {
    const title = element('h2', set.source.getAttribute('title'));
    title.id = 'equip-title';
    pane.replaceChildren(title);
    if (section.source.hasAttribute('description')) pane.append(element('p', section.source.getAttribute('description')));
    for (const prompt of set.prompts) {
      const card = element('section');
      card.className = 'equip-workflow-step';
      card.id = prompt.getAttribute('id');
      appendText(card, prompt, 'title', 'h3');
      for (const field of ['keyword', 'description', 'useCase']) appendText(card, prompt, field, 'p');
      const value = child(prompt, 'text').textContent;
      const copy = element('button', '프롬프트 복사');
      copy.className = 'onuri-button';
      copy.type = 'button';
      const status = element('p');
      status.setAttribute('role', 'status');
      copy.addEventListener('click', async () => {
        status.textContent = await window.eduUI.copyText(value) ? '복사했습니다.' : '본문을 선택해 복사해 주세요.';
      });
      card.append(copy, element('pre', value), status);
      for (const [tag, label] of [['expected', '예상 결과'], ['tips', '팁'], ['combination', '함께 쓰기']]) {
        const field = child(prompt, tag);
        if (field) card.append(element('h4', label), element('pre', field.textContent));
      }
      pane.append(card);
    }
    if (scrollToPrompt && selected !== set.prompts[0]) requestAnimationFrame(() => document.getElementById(selected.getAttribute('id'))?.scrollIntoView());
  }

  function populateTree(groups, active, matches) {
    tree.replaceChildren();
    const count = document.querySelector('[data-tree-count]');
    if (matches && count) count.textContent = '프롬프트 ' + matches.size + '개';
    else if (count) {
      const total = groups.reduce((sum, group) => sum + group.programs.length, 0);
      count.textContent = (equipment ? '장비 ' : ai ? 'AI 도구 ' : '프로그램 ') + total + '개';
    }
    if (matches && !matches.size) {
      tree.append(element('p', '검색 결과가 없습니다.'));
      return;
    }
    for (const group of groups) {
      const category = branch(group.title, true);
      const makers = new Map();
      for (const program of group.programs) {
        const item = element('li');
        let parent = category.list;
        if (program.group) {
          if (!makers.has(program.group)) {
            const maker = branch(program.group, group.programs.some(item => item.group === program.group && item === active?.program));
            const holder = element('li');
            holder.append(maker.details);
            makers.set(program.group, maker.list);
            category.list.append(holder);
          }
          parent = makers.get(program.group);
        }
        if (ai) { parent.append(aiBranch(program, active, matches)); continue; }
        if (!program.docs.length) {
          const link = createLink(idFor(program.id), plain(program.manual, 'title'));
          if (program === active?.program) link.setAttribute('aria-current', 'page');
          item.append(link);
          parent.append(item);
          continue;
        }
        const part = branch(plain(program.manual, 'title'), active?.program === program);
        const documents = [[idFor(program.id), '요약'], ...program.docs.map(doc =>
          [idFor(program.id, doc.getAttribute('id')), doc.getAttribute('nav') || plain(doc, 'title')])];
        for (const [id, label] of documents) {
          const li = element('li');
          const link = createLink(id, label);
          if (entries.get(id) === active) link.setAttribute('aria-current', 'page');
          li.append(link);
          part.list.append(li);
        }
        item.append(part.details);
        parent.append(item);
      }
      if (ai) tree.append(...[...category.list.children].map(item => item.firstElementChild));
      else tree.append(category.details);
    }
  }

  async function initialize() {
    try {
      const catalog = await loadXml(catalogUrl, 'catalog');
      const groups = await Promise.all((ai ? [catalog] : children(catalog, 'category')).map(async category => ({
        id: category.getAttribute('id'),
        title: ai ? plain(catalog, 'title') : category.getAttribute('title'),
        programs: await Promise.all([...category.children].flatMap(item => {
          if (item.localName === 'program') return [{ source: item, group: '' }];
          return item.localName === 'group' ? children(item, 'program').map(source => ({ source, group: item.getAttribute('title') })) : [];
        }).map(async ({ source, group }) => {
          const id = source.getAttribute('id');
          const src = source.getAttribute('src');
          if (!/^[a-z0-9-]+\/manual\.xml$/.test(src ?? '') || src !== id + '/manual.xml') throw Error('Invalid program path');
          const url = new URL(src, catalogUrl);
          const manual = await loadXml(url, 'manual');
          if (manual.getAttribute('id') !== id) throw Error('Invalid program ID');
          return { id, url, manual, group, docs: children(child(manual, 'docs'), 'doc'), blurb: source.getAttribute('blurb') };
        })),
      })));
      for (const group of groups) {
        for (const program of group.programs) {
          if (ai) registerAi(program);
          entries.set(idFor(program.id), { program });
          for (const doc of program.docs) entries.set(idFor(program.id, doc.getAttribute('id')), { program, doc });
        }
      }
      const overview = child(catalog, 'overview') || catalog;
      const overviewLink = document.querySelector('[data-catalog-overview]');
      overviewLink.textContent = overview.getAttribute('nav') || plain(catalog, 'title');
      const filters = element('div');
      filters.className = 'manual-filters program-filters';
      const makeFilter = label => {
        const field = element('label', label);
        const select = element('select');
        field.append(select);
        filters.append(field);
        return select;
      };
      const category = makeFilter('카테고리');
      const itemLabel = equipment ? '장비' : '프로그램';
      const program = makeFilter(itemLabel);
      category.append(new Option('전체 카테고리', ''), ...groups.map(group => new Option(group.title, group.id)));
      const search = element('input');
      if (ai) {
        const field = element('label', '프롬프트 검색');
        search.type = 'search';
        search.placeholder = '예: 교안, 요약, 슬라이드';
        field.append(search);
        filters.replaceChildren(field);
        search.value = new URLSearchParams(location.search).get('q') || '';
        search.addEventListener('input', () => {
          const url = new URL(location.href);
          if (search.value.trim()) url.searchParams.set('q', search.value.trim());
          else url.searchParams.delete('q');
          history.replaceState(null, '', url);
          render();
        });
      }
      overviewLink.before(filters);
      overviewLink.addEventListener('click', () => {
        category.value = '';
        program.value = '';
        search.value = '';
        updateSelection();
      });

      function updateSelection() {
        const url = new URL(location.href);
        url.hash = '';
        if (ai && !search.value) url.searchParams.delete('q');
        for (const [key, value] of [['category', category.value], ['program', program.value]]) {
          if (value) url.searchParams.set(key, value);
          else url.searchParams.delete(key);
        }
        url.searchParams.set('id', program.value ? idFor(program.value) : overviewLink.dataset.catalogOverview);
        history.replaceState(null, '', url);
        render();
      }
      category.addEventListener('change', () => {
        program.value = '';
        updateSelection();
      });
      program.addEventListener('change', updateSelection);

      let previousTreeKey;
      let previousCategory;
      function selectTreeLink(active, requested) {
        const links = [...tree.querySelectorAll('[data-manual-entry]')];
        const exact = links.find(link => link.dataset.manualEntry === requested);
        const fallback = active?.set?.prompts[0]?.getAttribute('id');
        const selected = exact || links.find(link => link.dataset.manualEntry === fallback);
        for (const link of links) {
          if (link === selected) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        }
        for (let branch = selected?.closest('details'); branch; branch = branch.parentElement.closest('details')) {
          branch.open = true;
        }
      }

      function render(preserveViewport = false) {
        const params = new URLSearchParams(location.search);
        const hash = location.hash.slice(1);
        const requested = params.get('id') || (/^(pg|eq)-/.test(hash) ? hash : idFor(equipment ? oldEquipmentIds[hash] || hash : hash));
        if (equipment && (requested.startsWith('pg-') || ['inkscape', 'rdworks', 'bambu-studio', 'xtool-studio', 'vscode', 'github', 'lesson-guide'].includes(hash))) {
          const redirect = new URL('do_program.html', location.href);
          if (requested.startsWith('pg-')) redirect.searchParams.set('id', requested);
          else redirect.hash = hash;
          location.replace(redirect);
          return;
        }
        const active = hash === 'lesson-guide' ? undefined : entries.get(requested);
        let categoryId = params.get('category') || '';
        let programId = params.get('program') || '';
        if (active) {
          if (categoryId && !groups.some(group => group.id === categoryId && group.programs.includes(active.program))) {
            categoryId = groups.find(group => group.programs.includes(active.program)).id;
          }
          if (programId) programId = active.program.id;
        }
        category.value = categoryId;
        const categoryGroups = category.value ? groups.filter(group => group.id === category.value) : groups;
        if (previousCategory !== category.value) {
          program.replaceChildren(new Option('전체 ' + itemLabel, ''), ...categoryGroups.flatMap(group =>
            group.programs.map(item => new Option(plain(item.manual, 'title'), item.id))));
          previousCategory = category.value;
        }
        program.value = programId;
        const visibleGroups = program.value ? categoryGroups
          .map(group => ({ ...group, programs: group.programs.filter(item => item.id === program.value) }))
          .filter(group => group.programs.length) : categoryGroups;
        const terms = ai ? search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) : [];
        const matches = terms.length ? new Set([...entries.values()].filter(entry => entry.prompt && terms.every(term =>
          (plain(entry.program.manual, 'title') + ' ' + entry.set.source.getAttribute('title') + ' ' + entry.prompt.textContent).toLocaleLowerCase().includes(term)
        )).map(entry => entry.prompt)) : null;
        const treeGroups = matches ? visibleGroups.map(group => ({ ...group, programs: group.programs.filter(item =>
          item.sections.some(section => section.sets.some(set => set.prompts.some(prompt => matches.has(prompt))))
        ) })) : visibleGroups;
        const treeKey = JSON.stringify([category.value, program.value, terms]);
        if (previousTreeKey !== treeKey) {
          populateTree(treeGroups, active, matches);
          previousTreeKey = treeKey;
        }
        selectTreeLink(active, requested);
        overviewLink.removeAttribute('aria-current');
        if (hash === 'lesson-guide') {
          const title = element('h2', '교안 제작 지침과 피드백');
          title.id = 'equip-title';
          pane.replaceChildren(title, document.querySelector('#equip-manual-lesson-guide').content.cloneNode(true));
        } else if (active?.prompt) renderPromptSet(active, !preserveViewport);
        else if (active && ai) renderAiIntro(active.program);
        else if (active?.doc) renderDocument(active.program, active.doc);
        else if (active) renderSummary(active.program);
        else {
          overviewLink.setAttribute('aria-current', 'page');
          renderOverview(overview, visibleGroups, Boolean(category.value || program.value));
        }
      };
      function openEntry(event) {
        const link = event.target.closest('a[data-manual-entry], a[href="#lesson-guide"]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const destination = new URL(link.href);
        if (destination.href !== location.href) history.pushState(null, '', destination);
        render(true);
      }
      tree.closest('nav').addEventListener('click', openEntry);
      pane.addEventListener('click', openEntry);
      window.addEventListener('hashchange', () => render(true));
      window.addEventListener('popstate', () => {
        search.value = new URLSearchParams(location.search).get('q') || '';
        render(true);
      });
      render();
    } catch {
      const error = element('p', '공통 매뉴얼을 불러오지 못했습니다 — 원본을 다시 가져온 뒤 새로고침하세요');
      error.id = 'equip-title';
      error.setAttribute('role', 'status');
      pane.replaceChildren(error);
    }
  }
  if (location.protocol === 'file:') {
    const preview = new URL('/do_docs/' + page, 'http://127.0.0.1:4173');
    preview.search = location.search;
    preview.hash = location.hash;
    location.replace(preview);
  } else {
    initialize();
  }
})();
