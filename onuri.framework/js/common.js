(() => {
  // Let children measure themselves, including isolated file:// previews.
  document.addEventListener('DOMContentLoaded', () => {
    const frame = document.getElementById('frame');
    const channel = 'onuri:frame-height';
    if (frame) {
      let active = false;
      const request = () => frame.contentWindow?.postMessage({ type: channel, request: true }, '*');
      frame.addEventListener('load', () => { active = true; request(); });
      new MutationObserver(() => {
        active = false;
        frame.style.removeProperty('height');
        frame.removeAttribute('scrolling');
      }).observe(frame, { attributes: true, attributeFilter: ['src'] });
      window.addEventListener('message', event => {
        if (!active || event.source !== frame.contentWindow || event.data?.type !== channel || event.data.request) return;
        const height = event.data.height;
        if (!Number.isFinite(height) || height <= 0) return;
        frame.style.height = Math.ceil(height) + 'px';
        frame.setAttribute('scrolling', 'no');
      });
      window.addEventListener('resize', request);
      return;
    }
    if (window.parent === window) return;
    document.documentElement.dataset.portalAutoheight = 'true';
    let pending = 0;
    let previous = 0;
    const measure = () => {
      pending = 0;
      const body = document.body;
      const bounds = body.getBoundingClientRect();
      const height = Math.ceil(Math.max(body.scrollHeight, bounds.height + Math.max(0, bounds.top)) + 2);
      if (height !== previous) {
        previous = height;
        window.parent.postMessage({ type: channel, height }, '*');
      }
    };
    const schedule = () => { if (!pending) pending = requestAnimationFrame(measure); };
    new ResizeObserver(schedule).observe(document.body);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    document.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('message', event => {
      if (event.source === window.parent && event.data?.type === channel && event.data.request) { previous = 0; schedule(); }
    });
    document.fonts?.ready.then(schedule);
      schedule();
  });

  function bindMobileMenu({ button, menu, closeButton, breakpoint, overlay = false }) {
    if (!button || !menu) return;
    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (overlay) {
        if (open) menu.removeAttribute('aria-hidden');
        else menu.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.toggle('no-scroll', open);
      }
    }
    const close = () => setOpen(false);
    button.addEventListener('click', () => setOpen(overlay || !menu.classList.contains('is-open')));
    closeButton?.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > breakpoint) close();
    });
  }

  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  }


  function roundedPercent(value, total, empty = 0) {
    return total ? Math.round(value / total * 100) : empty;
  }

  async function copyText(text, { fallback = false } = {}) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      if (!fallback) return false;
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    try {
      area.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }

  function showToast(element, message, activeClass, duration) {
    element.textContent = message;
    element.classList.add(activeClass);
    setTimeout(() => element.classList.remove(activeClass), duration);
  }

  window.eduUI = Object.freeze({
    bindMobileMenu,
    copyText,
    escapeHtml,
    roundedPercent,
    showToast,
  });

  function bindHashTabs(tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"][data-tab-hash]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    if (!tabs.length || panels.some(panel => !panel)) return;

    function select(index) {
      tabs.forEach((tab, position) => {
        const active = position === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[position].hidden = !active;
      });
    }

    function activate(index) {
      select(index);
      const hash = '#' + tabs[index].dataset.tabHash;
      if (location.hash !== hash) history.replaceState(null, '', hash);
    }

    tabs.forEach((tab, index) => {
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', event => {
        const moves = {
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        if (!Object.hasOwn(moves, event.key)) return;
        event.preventDefault();
        activate(moves[event.key]);
        tabs[moves[event.key]].focus();
      });
    });
    const selectHash = () => select(Math.max(0, tabs.findIndex(tab => '#' + tab.dataset.tabHash === location.hash)));
    selectHash();
    tablist.hidden = false;
    window.addEventListener('hashchange', selectHash);
  }

  function initPrintViews() {
    if (window.self !== window.top) return;
    const buttons = document.querySelectorAll('[data-print-view]');
    if (!buttons.length) return;
    const root = document.documentElement;
    buttons.forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        root.dataset.printView = button.dataset.printView;
        window.print();
      });
    });
    window.addEventListener('afterprint', () => delete root.dataset.printView);
  }

  function initPageControls() {
    document.querySelectorAll('[data-hash-tabs]').forEach(bindHashTabs);
    initPrintViews();
    const button = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (button && menu) {
      bindMobileMenu({
        button,
        menu,
        closeButton: menu.querySelector('[data-menu-close]'),
        breakpoint: Number(button.dataset.menuBreakpoint || 768),
        overlay: menu.dataset.mobileMenu === 'overlay',
      });
    }

  }

  document.documentElement.dataset.embedded = String(window.self !== window.top);
  const siteRoot = window.eduAuth?.root;
  const isEntry = siteRoot && [new URL(siteRoot).pathname, new URL('index.html', siteRoot).pathname].includes(location.pathname);
  document.documentElement.dataset.standalone = String(Boolean(siteRoot && window.self === window.top && !isEntry));
  const key = 'edu-project-theme';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let explicit = saved === 'light' || saved === 'dark';
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-set-theme]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme));
    });
  }
  apply(explicit ? saved : system.matches ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', () => {
    initPageControls();
    const root = window.eduAuth?.root;
    if (root && !document.querySelector('.onuri-header')) {
      const header = document.createElement('header');
      header.className = 'onuri-header';
      const link = document.createElement('a');
      link.className = 'onuri-home';
      link.href = new URL('index.html', root).href;
      link.setAttribute('aria-label', 'Onuri. 시작하기로 이동');
      const logo = document.createElement('img');
      logo.src = new URL('onuri.framework/images/onuri-logo.png', root).href;
      logo.alt = ''; logo.width = 40; logo.height = 40;
      const name = document.createElement('span'); name.className = 'onuri-brand-text'; name.textContent = 'Onuri.';
      const tagline = document.createElement('small'); tagline.textContent = 'LEARN · CREATE · SHARE'; name.append(tagline);
      link.append(logo, name); header.append(link); document.body.prepend(header);
      link.addEventListener('click', event => {
        if (window.self !== window.top) {
          event.preventDefault(); window.parent.postMessage({ type: 'onuri:home' }, '*');
        } else if (location.pathname === new URL('index.html', root).pathname) {
          event.preventDefault(); window.dispatchEvent(new Event('onuri:home'));
        } else {
          window.eduAuth.allowNavigation(link.href);
        }
      });
    }
    document.querySelectorAll('[data-page-image]').forEach(image => {
      const hideMissingImage = () => { image.hidden = true; };
      image.addEventListener('error', hideMissingImage);
      if (image.complete && image.naturalWidth === 0) hideMissingImage();
    });
    if (!document.querySelector('.theme-switch')) {
      const container = document.createElement('div');
      container.innerHTML = "<div class=\"theme-switch\" role=\"group\" aria-label=\"화면 테마 선택\">\n  <button type=\"button\" data-set-theme=\"light\" aria-label=\"밝은 테마\" title=\"밝은 테마\" aria-pressed=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5\"/></svg></button>\n  <button type=\"button\" data-set-theme=\"dark\" aria-label=\"어두운 테마\" title=\"어두운 테마\" aria-pressed=\"false\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" aria-hidden=\"true\"><path d=\"M20.7 13.2A8.8 8.8 0 0 1 10.8 3.3a8.8 8.8 0 1 0 9.9 9.9Z\"/></svg></button>\n</div>";
      document.body.prepend(container.firstElementChild);
    }
    apply(document.documentElement.dataset.theme);
    document.querySelectorAll('[data-set-theme]').forEach(button => {
      button.addEventListener('click', () => {
        explicit = true;
        const theme = button.dataset.setTheme;
        apply(theme);
        try { localStorage.setItem(key, theme); } catch {}
      });
    });
  });
  system.addEventListener('change', event => {
    if (!explicit) apply(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    explicit = event.newValue === 'light' || event.newValue === 'dark';
    apply(explicit ? event.newValue : system.matches ? 'dark' : 'light');
  });
})();
