// Books(읽을거리): 왼쪽 분류별 목록(검색·분류), 오른쪽 본문(블로그 HTML 을 iframe 으로).
// 데이터는 common/data/books-data.js 의 window.ONURI_BOOKS. 주소 #book=<id> 로 바로 연다.
(() => {
  const $ = id => document.getElementById(id);
  const books = Array.isArray(window.ONURI_BOOKS) ? [...window.ONURI_BOOKS].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'ko')) : [];
  if (!Array.isArray(window.ONURI_BOOKS)) $('book-status').textContent = '읽을거리 목록을 불러오지 못했습니다. 새로고침하거나 데이터 파일을 확인해 주세요.';
  const requested = () => new URLSearchParams(location.hash.slice(1)).get('book');
  const root = () => (window.eduAuth?.root ? new URL(window.eduAuth.root) : new URL('../', location.href));
  let selected = null;

  for (const category of [...new Set(books.map(book => book.category).filter(Boolean))]) {
    const option = document.createElement('option'); option.value = category; option.textContent = category; $('book-category').append(option);
  }

  const frame = $('book-frame');
  window.addEventListener('message', event => {
    const size = event.data;
    if (event.source !== frame.contentWindow || size?.type !== 'onuri:book-height') return;
    if (!Number.isFinite(size.height) || size.height <= 0) return;
    frame.style.height = Math.ceil(size.height) + 'px';
    frame.setAttribute('scrolling', 'no');
  });

  function read(book, updateHash = true) {
    selected = book.id;
    if (updateHash && requested() !== book.id) history.replaceState(null, '', '#book=' + encodeURIComponent(book.id));
    const url = new URL(book.file, root()).href;
    $('book-placeholder').hidden = true; $('book-content').hidden = false;
    $('reader-meta').textContent = [book.category, book.author, [book.publisher, book.year].filter(Boolean).join(' · '), '발행 ' + book.date].filter(Boolean).join(' · ');
    $('reader-title').textContent = book.title;
    $('reader-summary').textContent = book.summary || '';
    $('book-tags').replaceChildren(...(book.tags || []).map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
    $('book-open').href = url;
    if (frame.dataset.src !== url) {
      frame.removeAttribute('scrolling');
      frame.dataset.src = url;
      frame.style.height = '';
      frame.src = url;
    }
    $('book-list').querySelectorAll('[data-id]').forEach(button => button.setAttribute('aria-current', String(button.dataset.id === book.id)));
  }

  function render() {
    const query = $('book-search').value.trim().toLocaleLowerCase();
    const category = $('book-category').value;
    const items = books.filter(book => (!category || book.category === category)
      && `${book.title} ${book.author} ${book.publisher} ${book.summary} ${(book.tags || []).join(' ')}`.toLocaleLowerCase().includes(query));
    $('book-list').replaceChildren();
    $('report-count').textContent = `${items.length}권`;
    $('book-empty').hidden = items.length > 0;
    $('book-empty').textContent = books.length ? '검색 결과가 없습니다.' : '아직 발행된 읽을거리가 없습니다.';
    const groups = new Map();
    for (const book of items) {
      const key = book.category || '기타';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(book);
    }
    const current = requested() || selected || items[0]?.id;
    for (const [name, list] of groups) {
      const branch = document.createElement('details');
      branch.className = 'document-tree-branch';
      branch.open = Boolean(query || category) || list.some(book => book.id === current) || groups.size === 1;
      const summary = document.createElement('summary'); summary.textContent = `${name} (${list.length})`;
      const box = document.createElement('div'); box.className = 'document-tree-items';
      for (const book of list) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'report-item'; button.dataset.id = book.id;
        const title = document.createElement('strong'); title.textContent = book.title;
        const meta = document.createElement('small'); meta.textContent = `${book.author.split(' · ')[0]} · ${book.date.slice(5).replace('-', '.')}`;
        button.append(title, meta);
        button.onclick = () => read(book);
        box.append(button);
      }
      branch.append(summary, box);
      $('book-list').append(branch);
    }
    const wanted = requested();
    if (wanted && !books.some(book => book.id === wanted)) {
      $('book-content').hidden = true; $('book-placeholder').hidden = false;
      $('book-placeholder').textContent = '해당 읽을거리를 찾을 수 없습니다. 왼쪽 목록에서 다른 글을 선택하세요.';
      return;
    }
    const book = items.find(item => item.id === (wanted || selected)) || items[0];
    if (book) read(book, false);
    else { $('book-content').hidden = true; $('book-placeholder').hidden = false; }
  }

  $('book-search').oninput = render;
  $('book-category').onchange = render;
  window.addEventListener('hashchange', render);
  render();
})();
