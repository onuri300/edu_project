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
      DATA = await loadMenu();
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

  const categoryTitle = category => category.name;
  const pageTitle = item => item.name;
  const siteRoot = new URL('./', document.baseURI);

  async function loadMenu() {
    const { data, error } = await window.eduNoticeClient.from('tbl_menu')
      .select('group_code,group_order,menu_order,page_path,group:tbl_comcode!tbl_menu_group_code_fk(name),menu:tbl_comcode!tbl_menu_menu_code_fk(name),subgroup:tbl_comcode!tbl_menu_subgroup_code_fk(name)')
      .order('group_order').order('menu_order');
    if (error || !data?.length) throw Error('DB menu unavailable');

    const groups = new Map();
    for (const row of data) {
      if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*[.]html$/.test(row.page_path)) {
        throw Error('Invalid menu path');
      }
      if (!row.group?.name || !row.menu?.name) throw Error('Missing menu code name');
      if (!groups.has(row.group_code)) groups.set(row.group_code, { name: row.group.name, items: [] });
      groups.get(row.group_code).items.push({ name: row.menu.name, url: row.page_path, subgroup: row.subgroup?.name });
    }
    const documents = groups.get('MG_DOCUMENT')?.items;
    if (documents) {
      const labels = new Map([
        ['do_docs/do_ai.html', 'AI Newsletter'],
        ['do_docs/do_making.html', 'Making Newsletter'],
        ['do_docs/do_equip.html', 'Equipment Manual'],
        ['do_docs/do_program.html', 'Program Manual'],
        ['do_docs/do_gpt.html', 'AI Manual'],
        ['do_docs/do_dev.html', 'Dev Manual'],
      ]);
      if (!documents.some(item => item.url === 'do_docs/do_equip.html')) {
        documents.push({ url: 'do_docs/do_equip.html' });
      }
      const equipmentIndex = documents.findIndex(item => item.url === 'do_docs/do_equip.html');
      if (equipmentIndex >= 0 && !documents.some(item => item.url === 'do_docs/do_program.html')) {
        documents.splice(equipmentIndex + 1, 0, { url: 'do_docs/do_program.html', subgroup: documents[equipmentIndex].subgroup });
      }
      const newsletters = [...labels.keys()].slice(0, 2);
      for (const item of documents) {
        if (labels.has(item.url)) item.name = labels.get(item.url);
        if (newsletters.includes(item.url)) delete item.subgroup;
      }
      const priority = item => newsletters.includes(item.url) ? newsletters.indexOf(item.url) : newsletters.length;
      documents.sort((left, right) => priority(left) - priority(right));
    }
    return { cats: [...groups.values()] };
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
      const subgroups = new Map();
      cat.items.forEach((item, ii) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = pageTitle(item);
        b.dataset.k = ci + "." + ii;   // 주소가 아닌 좌표만 DOM 에 남김
        b.addEventListener("click", () => open(ci, ii, b));
        if (!item.subgroup) {
          sub.append(b);
          return;
        }
        if (!subgroups.has(item.subgroup)) {
          const group = document.createElement('details');
          const summary = document.createElement('summary');
          group.className = 'menu-subgroup';
          summary.textContent = item.subgroup;
          group.append(summary);
          sub.append(group);
          subgroups.set(item.subgroup, group);
        }
        subgroups.get(item.subgroup).append(b);
      });

      wrap.append(head, sub);
      nav.append(wrap);
    });

    const overview = document.createElement('button'); overview.type = 'button'; overview.className = 'all-menu-link'; overview.textContent = 'Site Map'; overview.addEventListener('click', home); nav.append(overview);
    $('#logout').hidden = false; document.body.classList.add('portal-authenticated');
    const collection = $('#home-categories');
    collection.replaceChildren();
    const introductions = { 'Vibe Coding': '아이디어를 웹과 디지털 경험으로 만들어보세요.', 'Games': '즐겁게 도전하며 배우는 인터랙티브 콘텐츠.', 'Document': '매뉴얼과 뉴스레터를 읽어보세요.', 'onuriClass': '수업 운영과 작업실 자료를 확인하세요.' };
    DATA.cats.forEach((cat, ci) => {
      const card = document.createElement('article'); card.className = 'home-category-card';
      const number = document.createElement('span'); number.className = 'home-category-number'; number.textContent = String(ci + 1).padStart(2, '0');
      const title = document.createElement('h4'); title.textContent = categoryTitle(cat);
      const description = document.createElement('p'); description.textContent = introductions[cat.name] || '관심 있는 콘텐츠를 골라 살펴보세요.';
      const links = document.createElement('div'); links.className = 'home-category-links';
      cat.items.forEach((item, ii) => { const link = document.createElement('button'); link.type = 'button'; link.textContent = (item.subgroup ? item.subgroup + ' · ' : '') + pageTitle(item) + ' ↗'; link.addEventListener('click', () => { const navButton = document.querySelector('[data-k="' + ci + '.' + ii + '"]'); const subgroup = navButton.closest('.menu-subgroup'); if (subgroup) subgroup.open = true; navButton.closest('.cat').classList.add('open'); navButton.closest('.cat').querySelector('button').setAttribute('aria-expanded', 'true'); open(ci, ii, navButton); }); links.append(link); });
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
    if (pageUrl.pathname.endsWith('/on_class/on_quiz/on_cards.html') && !pageUrl.searchParams.has('v')) {
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
    if (event.data?.type === 'onuri:staff-login-tab' && current
      && new URL(current.url, siteRoot).href === new URL('on_class/on_people.html', siteRoot).href) {
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
    loadMenu().then(menu => {
      DATA = menu;
      window.eduAuth.setSession(DATA, restored.expiresAt);
      start();
    }).catch(() => {
      msg.textContent = 'DB 메뉴를 불러오지 못했습니다. 연결 상태를 확인하고 새로고침하세요.';
    }).finally(() => { btn.disabled = false; });
  }
})();
