(() => {
  "use strict";

  /* ---------- 유틸 ---------- */
  const $ = s => document.querySelector(s);
  const { decodeBase64, deriveKey } = window.eduMenuCrypto;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- 상태 ---------- */
  let DATA = null;          // 복호화된 메뉴 (메모리에만 존재)
  let fails = 0, locked = 0;

  /* ---------- 로그인 ---------- */
  const gate = $("#gate"), msg = $("#gate-msg"), btn = $("#enter");

  async function unlock() {
    const id = $("#uid").value, pw = $("#upw").value;
    if (!id || !pw) { msg.textContent = "아이디와 비밀번호를 모두 입력하세요."; return; }
    if (Date.now() < locked) {
      msg.textContent = `잠시 후 다시 시도하세요. (${Math.ceil((locked - Date.now())/1000)}초)`;
      return;
    }
    if (!window.__ENC__) { msg.textContent = "데이터 파일(common/data/data.enc.js)을 찾을 수 없습니다."; return; }
    if (!crypto.subtle) { msg.textContent = "https 또는 로컬 파일에서 열어 주세요."; return; }

    btn.disabled = true; btn.textContent = "확인 중…"; msg.textContent = "";
    let authenticated = false;
    try {
      const p = window.__ENC__;
      const key = await deriveKey(id, pw, decodeBase64(p.salt), p.it);
      const buf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: decodeBase64(p.iv) }, key, decodeBase64(p.ct)
      );
      DATA = JSON.parse(new TextDecoder().decode(buf));
      authenticated = true;
      window.eduAuth.setSession(DATA);
      start();
    } catch (e) {
      if (authenticated) {
        msg.textContent = "로그인은 확인됐지만 화면을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.";
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

  btn.addEventListener("click", unlock);
  ["#uid", "#upw"].forEach(s => $(s).addEventListener("keydown", e => { if (e.key === "Enter") unlock(); }));

  /* ---------- 메뉴 렌더링 ---------- */
  let current = null;

  const categoryTitles = {
    '바이브코딩': 'Vibe Coding',
    '게임': 'Games',
    '수업 자료실': 'Class Resources',
    '기타': 'More',
    '뉴스레터': 'Newsletters'
  };

  const pageTitles = {
    'vi_onuri.html': 'OnuriMakerLab',
    'ga_ladder.html': 'Ladder Game',
    'ga_cards.html': 'IT Flashcards',
    'ga_quiz.html': 'Computer Quiz',
    'cl_library.html': 'Living Lab Library',
    'cl_edumkr.html': 'edumaker',
    'cl_idea.html': 'edumaker idea card',
    'vi_knu.html': 'Kyungnam University Makerspace',
    'ga_mbti-a.html': 'Adult MBTI Test',
    'ga_mbti-k.html': 'Kids’ MBTI Test',
    'ne_making.html': 'Making Newsletter',
    'ne_ai.html': 'AI Newsletter'
  };

  function categoryTitle(category) {
    return categoryTitles[category.name] || category.name;
  }

  function pageTitle(item) {
    const pathname = new URL(item.url, document.baseURI).pathname;
    return pageTitles[pathname.split('/').pop()] || item.name;
  }

  const siteRoot = new URL('./', document.baseURI);
  const returnPaths = new Set(Object.values(window.eduPageAliases || {})
    .filter(path => /^(?:vi_vibe|ga_games|cl_class|mo_tools|ne_news)\//.test(path))
    .map(path => new URL(path, siteRoot).pathname));

  function sameSite(url) {
    return url.protocol === siteRoot.protocol && url.host === siteRoot.host;
  }

  function moveMenuItem(cats, route, destination) {
    const target = new URL(route, siteRoot);
    const matches = item => {
      const url = new URL(item.url, document.baseURI);
      return sameSite(url) && url.pathname === target.pathname;
    };

    const more = cats.find(category => category.name === '기타');
    const item = more?.items.find(matches);
    if (!item) return;

    let group = cats.find(category => category.name === destination);
    if (!group) {
      group = { name: destination, items: [] };
      cats.unshift(group);
    }
    more.items = more.items.filter(item => !matches(item));
    if (!group.items.some(matches)) {
      group.items.push(item);
    }
  }

  function start() {
    for (const category of DATA.cats) {
      for (const item of category.items) item.url = window.eduAuth.canonicalMenuUrl(item.url);
    }
    moveMenuItem(DATA.cats, 'vi_vibe/vi_knu.html', '바이브코딩');
    moveMenuItem(DATA.cats, 'ga_games/ga_mbti-a.html', '게임');
    moveMenuItem(DATA.cats, 'ga_games/ga_mbti-k.html', '게임');
    for (const category of DATA.cats) {
      const additions = {
        '바이브코딩': [{ name: 'Onyou Maker Card', url: 'vi_vibe/vi_onyou/vi_onyou.html' }],
        '수업 자료실': [{ name: 'edumaker idea card', url: 'cl_class/cl_idea.html' }],
      };
      for (const addition of additions[category.name] || []) {
        const target = new URL(addition.url, siteRoot);
        if (!category.items.some(item => {
          const url = new URL(item.url, siteRoot);
          return sameSite(url) && url.pathname === target.pathname;
        })) category.items.push(addition);
      }
      if (category.name === '기타') {
        const find = route => category.items.findIndex(item => {
          const url = new URL(item.url, siteRoot);
          return sameSite(url) && url.pathname === new URL(route, siteRoot).pathname;
        });
        const notice = { name: 'Announcements', url: 'mo_tools/mo_notice.html' };
        const noticeIndex = find(notice.url);
        category.items.unshift(noticeIndex < 0 ? notice : category.items.splice(noticeIndex, 1)[0]);
        const gpt = { name: 'GPT Making Manual', url: 'mo_tools/mo_manual.html' };
        if (find(gpt.url) < 0) category.items.push(gpt);
        const coding = { name: 'Coding Manual', url: 'mo_tools/mo_coding.html' };
        const codingIndex = find(coding.url);
        const entry = codingIndex < 0 ? coding : category.items.splice(codingIndex, 1)[0];
        category.items.splice(find(gpt.url) + 1, 0, entry);
      }
    }
    document.title = 'Onuri | Learning Portal';




    const nav = $("#nav");
    nav.textContent = "";
    DATA.cats.forEach((cat, ci) => {
      const wrap = document.createElement("div");
      wrap.className = "cat";

      const head = document.createElement("button");
      head.type = "button";
      head.setAttribute("aria-expanded", "false");
      head.append(document.createTextNode(categoryTitle(cat)));
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
        b.textContent = pageTitle(item);
        b.dataset.k = ci + "." + ii;   // 주소가 아닌 좌표만 DOM 에 남김
        b.addEventListener("click", () => open(ci, ii, b));
        sub.append(b);
      });

      wrap.append(head, sub);
      nav.append(wrap);
    });

    const overview = document.createElement('button'); overview.type = 'button'; overview.className = 'all-menu-link'; overview.textContent = 'Site Map'; overview.addEventListener('click', home); nav.append(overview);
    $('#logout').hidden = false; document.body.classList.add('portal-authenticated');
    const collection = $('#home-categories');
    collection.replaceChildren();
    const introductions = { '바이브코딩': '아이디어를 웹과 디지털 경험으로 만들어보세요.', '게임': '즐겁게 도전하며 배우는 인터랙티브 콘텐츠.', '수업 자료실': '수업을 준비하고 함께 활용하는 교육 자료.', '기타': '만들기의 공간과 나를 알아가는 이야기.', '뉴스레터': 'AI와 메이킹의 변화를 읽는 새로운 시선.' };
    DATA.cats.forEach((cat, ci) => {
      const card = document.createElement('article'); card.className = 'home-category-card';
      const number = document.createElement('span'); number.className = 'home-category-number'; number.textContent = String(ci + 1).padStart(2, '0');
      const title = document.createElement('h4'); title.textContent = categoryTitle(cat);
      const description = document.createElement('p'); description.textContent = introductions[cat.name] || '관심 있는 콘텐츠를 골라 살펴보세요.';
      const links = document.createElement('div'); links.className = 'home-category-links';
      cat.items.forEach((item, ii) => { const link = document.createElement('button'); link.type = 'button'; link.textContent = pageTitle(item) + ' ↗'; link.addEventListener('click', () => { const navButton = document.querySelector('[data-k="' + ci + '.' + ii + '"]'); navButton.closest('.cat').classList.add('open'); navButton.closest('.cat').querySelector('button').setAttribute('aria-expanded', 'true'); open(ci, ii, navButton); }); links.append(link); });
      card.append(number, title, description, links); collection.append(card);
    });
    gate.remove();
    $("#app").classList.add("on");
    const returnTo = new URL(location.href).searchParams.get("return");
    if (returnTo) {
      try {
        const target = new URL(window.eduAuth.canonicalMenuUrl(returnTo), siteRoot);
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
    if (pageUrl.pathname.endsWith('/ga_games/ga_cards.html') && !pageUrl.searchParams.has('v')) {
      pageUrl.searchParams.set('v', 'study-clean');
    }
    current = { ...item, url: pageUrl.href };

    $("#crumbTitle").textContent = pageTitle(item);
    $("#crumbSub").textContent = categoryTitle(DATA.cats[ci]);
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
  $("#logout").addEventListener("click", () => { window.eduAuth.clearSession(); DATA = null; location.reload(); });
  const restored = window.eduAuth.getSession();
  if (restored) { DATA = restored.menu; start(); }
})();
