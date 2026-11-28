(() => {
  "use strict";

  /* ---------- 유틸 ---------- */
  const $ = s => document.querySelector(s);
  const { decodeBase64, deriveKey } = window.eduMenuCrypto;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- 상태 ---------- */
  let DATA = null;
  let fails = 0, locked = 0;

  /* ---------- 로그인 ---------- */
  const gate = $("#gate"), msg = $("#gate-msg"), btn = $("#enter");

  async function unlock(event) {
    event.preventDefault();
    if (btn.disabled) return;
    const id = $("#uid").value, pw = $("#upw").value;
    const dbLogin = $("#gate-admin").checked;
    if (!id || !pw) { msg.textContent = "아이디와 비밀번호를 모두 입력하세요."; return; }
    if (Date.now() < locked) {
      msg.textContent = `잠시 후 다시 시도하세요. (${Math.ceil((locked - Date.now())/1000)}초)`;
      return;
    }
    if (!dbLogin && !window.__ENC__) { msg.textContent = "데이터 파일(common/data/data.enc.js)을 찾을 수 없습니다."; return; }
    if (!dbLogin && !crypto.subtle) { msg.textContent = "https 또는 로컬 파일에서 열어 주세요."; return; }

    btn.disabled = true; btn.textContent = "확인 중…"; msg.textContent = "";
    let authenticated = false;
    try {
      if (dbLogin) {
        const client = window.eduNoticeClient;
        const { error } = await client.auth.signInWithPassword({ email: id.trim(), password: pw });
        if (error) throw error;
        try {
          await window.eduDbAdmin();
        } catch (error) {
          await clearDbSession();
          throw error;
        }
      } else {
        const p = window.__ENC__;
        const key = await deriveKey(id, pw, decodeBase64(p.salt), p.it);
        await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: decodeBase64(p.iv) }, key, decodeBase64(p.ct)
        );
        await clearDbSession();
      }
      authenticated = true;
      $("#upw").value = "";
      DATA = await loadMenu(dbLogin);
      window.eduAuth.setSession(DATA);
      start();
    } catch (e) {
      if (authenticated) {
        msg.textContent = "로그인은 확인됐지만 DB 메뉴를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.";
        return;
      }
      fails++;
      await wait(400);
      if (fails >= 5) { locked = Date.now() + 30000; fails = 0; msg.textContent = "시도 횟수를 초과했습니다. 30초 후 다시 시도하세요."; }
      else msg.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    } finally {
      btn.disabled = false; btn.textContent = "시작하기";
    }
  }

  $("#gate-form").addEventListener("submit", unlock);

  async function clearDbSession() {
    try {
      await window.eduNoticeClient?.auth.signOut({ scope: 'local' });
    } finally {
      try { localStorage.removeItem('onuri-db-session-v1'); } catch {}
    }
  }

  /* ---------- 메뉴 렌더링 ---------- */
  let current = null;

  function menuLabel(item) {
    const label = document.createDocumentFragment();
    label.append(item.name);
    if (item.ko && item.name.trim().toLowerCase() !== item.ko.trim().toLowerCase()) {
      const secondary = document.createElement('small');
      secondary.className = 'menu-label-ko';
      secondary.lang = 'ko';
      secondary.textContent = item.ko;
      label.append(' ', secondary);
    }
    return label;
  }

  const siteRoot = new URL('./', document.baseURI);

  async function loadMenu(isAdmin) {
    const { data, error } = await window.eduNoticeClient.from('tbl_menu')
      .select('group_code,group_order,menu_order,page_path,group:tbl_comcode!tbl_menu_group_code_fk(name),menu:tbl_comcode!tbl_menu_menu_code_fk(name)')
      .order('group_order').order('menu_order');
    if (error || !data?.length) throw Error('DB menu unavailable');

    const groups = new Map();
    const books = { name: 'Books', ko: '읽을거리', url: 'do_docs/do_books.html' };
    const management = { name: 'Mng.', ko: '관리', items: [] };
    const board = { name: 'Board', ko: '게시판', siteMapName: 'Notice', siteMapKo: '공지사항', url: 'mn_manage/mn_notice.html', order: 1, boardPaths: [
      'mn_manage/mn_notice.html', 'mn_manage/mn_library.html',
    ] };
    const staff = { name: 'Agent Mng.', ko: '에이전트 관리', siteMapName: 'Agent Management', url: 'mn_manage/mn_staff.html', order: 2 };
    const managementPages = new Map([
      ...board.boardPaths.map(url => [url, board]),
      [staff.url, staff],
    ]);
    const managed = new Set();
    const manual = { name: 'Mng.', ko: '매뉴얼', items: [] };
    const manuals = [
      { name: 'Equipment', ko: '장비', legacy: 'do_equip', file: 'mn_equip' },
      { name: 'Programs', ko: '프로그램', legacy: 'do_program', file: 'mn_program' },
      { name: 'AI', ko: '인공지능', legacy: 'do_gpt', file: 'mn_ai' },
      { name: 'Dev', ko: '개발 명세', legacy: 'do_dev', file: 'mn_dev' },
    ];
    const manualOrder = new Map(manuals.flatMap((entry, order) => [
      ['do_docs/' + entry.legacy + '.html', order],
      ['mn_manual/' + entry.file + '.html', order],
    ]));
    const activeManuals = new Set();
    const activities = { name: "Class.", ko: "수업 활동", items: [] };
    const sequence = { url: "cl_class/cl_proc.html", name: "Procedural Thinking", ko: "절차적 사고" };
    const activityPages = new Map([
      { old: "ga_games/ga_idea.html", url: "cl_class/cl_idea.html", name: "Edumaker Idea Card", ko: "메이킹 아이디어 카드", order: 0 },
      { url: "cl_class/cl_cards.html", name: "IT Flashcards", ko: "IT 암기 카드", order: 1 },
      { url: "cl_class/cl_quiz.html", name: "Computer Quiz", ko: "컴퓨터 퀴즈", order: 2 },
      { old: "ga_games/ga_ladder.html", url: "cl_class/cl_ladder.html", name: "Ladder Game", ko: "사다리 타기", order: 3 },
      { old: "ga_games/ga_mbti-a.html", url: "cl_class/cl_mbti-a.html", name: "Adult MBTI Test", ko: "성인 MBTI", order: 4 },
      { old: "ga_games/ga_mbti-k.html", url: "cl_class/cl_mbti-k.html", name: "Kids’ MBTI Test", ko: "어린이 MBTI", order: 5 },
    ].flatMap(entry => [[entry.url, entry], ...(entry.old ? [[entry.old, entry]] : [])]));
    const groupLabels = {
      MG_VIBE: { name: 'Vibe Coding', ko: '바이브 코딩' },
      MG_GAMES: { name: 'Games', ko: '게임' },
      MG_DOCUMENT: { name: 'Doc.', ko: '문서' },
      MG_QUIZ: { name: 'Quiz', ko: '퀴즈' },
    };
    const pageLabels = {
      'vi_vibe/vi_onuri/vi_onuri.html': { name: 'Onuri Maker Lab', ko: '오누리 메이커랩' },
      'vi_vibe/vi_knu.html': { name: 'Kyungnam University Makerspace', ko: '경남대학교 메이커스페이스' },
      'vi_vibe/vi_onyou/vi_onyou.html': { name: 'Onyou Maker Card', ko: '온유 메이커 카드' },
      'vi_vibe/vi_library.html': { name: 'Living Lab Library', ko: '리빙랩 자료실' },
      'do_docs/do_ai.html': { name: 'AI Newsletter', ko: 'AI 뉴스레터' },
      'do_docs/do_making.html': { name: 'Making Newsletter', ko: '메이킹 뉴스레터' },
    };
    for (const row of data) {
      if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*[.]html$/.test(row.page_path)) {
        throw Error('Invalid menu path');
      }
      if (!row.group?.name || !row.menu?.name) throw Error('Missing menu code name');
      if (managementPages.has(row.page_path)) {
        const item = managementPages.get(row.page_path);
        if (!managed.has(item.url)) management.items.push(item);
        managed.add(item.url);
        continue;
      }
      if (row.group_code === 'MG_ONURI_CLASS' || row.group_code === 'MG_BOARD' || row.page_path === books.url) continue;
      if (row.page_path === sequence.url || row.page_path === 'ga_games/ga_sequence.html') continue;
      if (activityPages.has(row.page_path)) {
        activities.items.push(activityPages.get(row.page_path));
        continue;
      }
      if (row.group_code === 'cl_') {
        activities.items.push({ name: row.menu.name, url: row.page_path, order: row.menu_order });
        continue;
      }
      if (manualOrder.has(row.page_path)) {
        activeManuals.add(manualOrder.get(row.page_path));
        continue;
      }
      if (row.group_code === 'mn_manual') {
        manual.items.push({ name: row.menu.name, url: row.page_path });
        continue;
      }
      if (!groups.has(row.group_code)) groups.set(row.group_code, { name: row.group.name, ...groupLabels[row.group_code], items: [] });
      groups.get(row.group_code).items.push({ name: row.menu.name, ...pageLabels[row.page_path], url: row.page_path });
    }
    if (activeManuals.has(0)) activeManuals.add(1);
    manual.items.unshift(...manuals.flatMap((entry, index) => activeManuals.has(index)
      ? [{ name: entry.name, ko: entry.ko, url: 'mn_manual/' + entry.file + '.html' }] : []));
    const newsletters = groups.get('MG_DOCUMENT')?.items;
    newsletters?.sort((left, right) => Number(right.url === 'do_docs/do_ai.html') - Number(left.url === 'do_docs/do_ai.html'));
    if (!groups.has('MG_DOCUMENT')) groups.set('MG_DOCUMENT', { ...groupLabels.MG_DOCUMENT, items: [] });
    groups.get('MG_DOCUMENT').items.push(books);
    management.items.sort((left, right) => left.order - right.order);
    if (!isAdmin) groups.delete('MG_DOCUMENT');
    const cats = [...groups.values()];
    activities.items.sort((left, right) => left.order - right.order);
    activities.items.push(sequence);
    cats.unshift(activities);
    if (isAdmin && manual.items.length) cats.unshift(manual);
    if (isAdmin && management.items.length) cats.unshift(management);
    return { cats };
  }

  const returnPaths = new Set((window.eduSiteConfig.resumablePaths || [])
    .map(path => new URL(path, siteRoot).pathname));

  function sameSite(url) {
    return url.protocol === siteRoot.protocol && url.host === siteRoot.host;
  }

  function start() {
    document.title = 'Onuri | Learning Portal';




    const nav = $("#nav");
    nav.textContent = "";
    DATA.cats.forEach((cat, ci) => {
      const wrap = document.createElement("div");
      wrap.className = "cat";

      const head = document.createElement("button");
      head.type = "button";
      head.setAttribute("aria-expanded", "false");
      const categoryLabel = document.createElement('span');
      categoryLabel.append(menuLabel(cat));
      head.append(categoryLabel);
      const caret = document.createElement("span");
      caret.className = "caret"; caret.textContent = "⌄";
      head.append(caret);
      head.addEventListener("click", () => {
        const wasOpen = wrap.classList.contains("open");
        closeDropdowns();
        wrap.classList.toggle("open", !wasOpen);
        head.setAttribute("aria-expanded", String(!wasOpen));
      });

      const sub = document.createElement("div");
      sub.className = "sub";
      cat.items.forEach((item, ii) => {
        const b = document.createElement("button");
        b.type = "button";
        b.append(menuLabel(item));
        b.dataset.k = ci + "." + ii;   // 주소가 아닌 좌표만 DOM 에 남김
        b.addEventListener("click", () => open(ci, ii, b));
        sub.append(b);
      });

      wrap.append(head, sub);
      nav.append(wrap);
    });

    const makerPark = document.createElement('a');
    makerPark.className = 'all-menu-link maker-park-link';
    makerPark.href = new URL('makerpark/index.html#map', siteRoot).href;
    makerPark.append(menuLabel({ name: 'Onuri Maker Park', ko: '오누리 메이커파크' }));
    nav.append(makerPark);

    const overview = document.createElement('button'); overview.type = 'button'; overview.className = 'all-menu-link'; overview.append(menuLabel({ name: 'Site Map', ko: '전체 메뉴' })); overview.addEventListener('click', home); nav.append(overview);
    $('#logout').hidden = false; document.body.classList.add('portal-authenticated');
    const collection = $('#home-categories');
    collection.replaceChildren();
    const introductions = { '바이브 코딩': '아이디어를 웹과 디지털 경험으로 만들어보세요.', '수업 활동': '퀴즈와 카드, 게임으로 수업에 참여해 보세요.', '문서': 'AI·메이킹 뉴스레터와 책 이야기를 읽어보세요.', '관리': '게시판과 에이전트 정보를 관리하세요.', '매뉴얼': '장비, 프로그램, AI와 개발 매뉴얼을 읽어보세요.' };
    DATA.cats.forEach((cat, ci) => {
      const card = document.createElement('article'); card.className = 'home-category-card';
      const number = document.createElement('span'); number.className = 'home-category-number'; number.textContent = String(ci + 1).padStart(2, '0');
      const title = document.createElement('h4'); title.append(menuLabel(cat));
      const description = document.createElement('p'); description.textContent = introductions[cat.ko ?? cat.name] || '관심 있는 콘텐츠를 골라 살펴보세요.';
      const links = document.createElement('div'); links.className = 'home-category-links';
      cat.items.forEach((item, ii) => { const link = document.createElement('button'); link.type = 'button'; link.append(menuLabel({ name: item.siteMapName ?? item.name, ko: item.siteMapKo ?? item.ko }), ' ↗'); link.addEventListener('click', () => { const navButton = document.querySelector('[data-k="' + ci + '.' + ii + '"]'); navButton.closest('.cat').classList.add('open'); navButton.closest('.cat').querySelector('button').setAttribute('aria-expanded', 'true'); open(ci, ii, navButton); }); links.append(link); });
      card.append(number, title, description, links); collection.append(card);
    });
    gate.remove();
    $("#app").classList.add("on");
    const returnTo = new URL(location.href).searchParams.get("return");
    if (returnTo) {
      try {
        const target = new URL(returnTo, siteRoot);
        if (sameSite(target) && returnPaths.has(target.pathname)) {
          const ci = DATA.cats.findIndex(cat => cat.items.some(item => {
            const page = new URL(item.url, siteRoot);
            return sameSite(page) && page.pathname === target.pathname;
          }));
          if (ci >= 0) {
            const ii = DATA.cats[ci].items.findIndex(item => {
              const page = new URL(item.url, siteRoot);
              return sameSite(page) && page.pathname === target.pathname;
            });
            open(ci, ii, document.querySelector(`[data-k="${ci}.${ii}"]`), target);
          } else if (window.eduAuth.allowNavigation(target.href)) {
            location.replace(target.href);
            return;
          }
        }
      } catch {}
      history.replaceState(null, "", location.pathname);
    }
  }

  function open(ci, ii, el, destination) {
    const item = DATA.cats[ci].items[ii];
    document.querySelectorAll('.sub button[aria-current]').forEach(b => b.removeAttribute("aria-current"));
    el.setAttribute("aria-current", "true");
    const pageUrl = destination || new URL(item.url, document.baseURI);
    if (pageUrl.pathname.endsWith('/cl_class/cl_cards.html') && !pageUrl.searchParams.has('v')) {
      pageUrl.searchParams.set('v', 'study-clean');
    }
    current = { ...item, url: pageUrl.href };

    $("#crumbTitle").replaceChildren(menuLabel(item));
    $("#crumbSub").replaceChildren(menuLabel(DATA.cats[ci]));
    $("#openNew").hidden = false;
    $("#welcome").style.display = "none";

    const f = $("#frame");
    // Chrome's PDF viewer cannot run in a popup that inherits an iframe sandbox.
    // Only our local course library may open a user-clicked PDF outside that sandbox.
    f.setAttribute('sandbox', window.eduResourcePolicy.sandboxFor(item.url, document.baseURI));
    f.classList.add("on");
    f.src = current.url;
    closeDrawer();
  }

  $("#openNew").addEventListener("click", () => {
    if (current && !window.eduAuth.openPage(new URL(current.url, document.baseURI).href)) {
      $("#crumbSub").textContent = "새 탭을 열 수 없습니다. 브라우저의 팝업 허용 설정을 확인하세요.";
    }
  });

  function home() {
    if (!DATA) return;
    current = null;
    const frame = $('#frame');
    frame.classList.remove('on');
    frame.removeAttribute('src');
    $('#welcome').style.display = '';
    $('#crumbTitle').textContent = 'Home';
    $('#crumbSub').textContent = '상단 메뉴에서 콘텐츠를 선택하세요';
    $('#openNew').hidden = true;
    document.querySelectorAll('.sub button[aria-current]').forEach(button => button.removeAttribute('aria-current'));
    closeDrawer();
  }
  $('#footer-home').addEventListener('click', () => { home(); document.querySelector('.stage').scrollTo({top:0,behavior:'smooth'}); });
  $('#footer-top').addEventListener('click', () => { document.querySelector('.stage').scrollTo({top:0,behavior:'smooth'}); try { $('#frame').contentWindow.scrollTo({top:0,behavior:'smooth'}); } catch {} });
  window.addEventListener('onuri:home', home);
  window.addEventListener('message', event => {
    if (event.source !== $('#frame').contentWindow) return;
    if (event.origin === location.origin && event.data?.type === 'onuri:board-page' && current?.boardPaths) {
      const page = current.boardPaths.find(path => new URL(path, siteRoot).pathname === event.data.path);
      if (page) {
        current.url = new URL(page, siteRoot).href;
        $('#frame').setAttribute('sandbox', window.eduResourcePolicy.sandboxFor(page, document.baseURI));
      }
    }
    if (event.data?.type === 'onuri:staff-login-tab' && current
      && new URL(current.url, siteRoot).href === new URL('mn_manage/mn_staff.html', siteRoot).href) {
      $('#openNew').click();
    }
    if (event.data?.type === 'onuri:home') home();
    if (event.data?.type === 'onuri:session-request' && DATA) {
      const session = window.eduAuth.getSession();
      if (session) event.source.postMessage({ type: 'onuri:session-response', nonce: event.data.nonce, session }, '*');
    }
  });

  /* Header navigation shared by desktop and mobile. */
  function closeDropdowns() { document.querySelectorAll('#nav .cat.open').forEach(cat => { cat.classList.remove('open'); cat.querySelector('button').setAttribute('aria-expanded', 'false'); }); }
  function closeDrawer() { $('#nav').classList.remove('mobile-open'); $('#burger').setAttribute('aria-expanded', 'false'); closeDropdowns(); }
  $('#burger').addEventListener('click', () => { const expanded = $('#nav').classList.toggle('mobile-open'); $('#burger').setAttribute('aria-expanded', String(expanded)); });
  document.addEventListener('click', event => { if (!event.target.closest('#nav, #burger')) closeDrawer(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeDrawer(); $('#burger').focus(); } });
  window.matchMedia('(max-width:1000px)').addEventListener('change', closeDrawer);
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.onuri-header');
    if (header) { header.append($('#burger'), $('#nav')); document.querySelector('.theme-switch').append($('#logout')); }
  });

  /* ---------- 로그아웃 ---------- */
  $("#logout").addEventListener("click", async () => {
    const button = $("#logout");
    button.disabled = true;
    try {
      await clearDbSession();
    } finally {
      window.eduAuth.clearSession();
      DATA = null;
      location.reload();
    }
  });
  const restored = window.eduAuth.getSession();
  if (restored) {
    btn.disabled = true;
    window.eduDbAdmin().then(Boolean, () => false).then(loadMenu).then(menu => {
      DATA = menu;
      window.eduAuth.setSession(DATA, restored.expiresAt);
      start();
    }).catch(() => {
      msg.textContent = 'DB 메뉴를 불러오지 못했습니다. 연결 상태를 확인하고 새로고침하세요.';
    }).finally(() => { btn.disabled = false; });
  }
})();


