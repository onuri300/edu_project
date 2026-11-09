(() => {
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

  function createPortfolioCard(work, { featured = false } = {}) {
    const card = document.createElement('a');
    card.className = 'work-card';
    card.href = 'onuri-work-detail.html?id=' + encodeURIComponent(work.id);

    const media = document.createElement('div');
    media.className = 'work-card-media';
    const image = document.createElement('img');
    image.src = work.thumb;
    image.alt = work.title;
    image.loading = 'lazy';
    media.append(image);

    const body = document.createElement('div');
    body.className = 'work-card-body';
    const title = document.createElement('h3');
    title.className = 'work-card-title';
    title.textContent = work.title;
    const meta = document.createElement('p');
    meta.className = 'work-card-meta';
    meta.textContent = work.genre + ' · ' + work.year;
    body.append(title, meta);

    if (featured) {
      const category = document.createElement('span');
      category.className = 'work-card-cat';
      category.textContent = work.categoryLabel;
      media.append(category);
      const description = document.createElement('p');
      description.className = 'work-card-desc';
      description.textContent = work.tagline;
      body.append(description);
    }
    card.append(media, body);
    return card;
  }

  function initPortfolioPreviews() {
    const recent = document.getElementById('home-recent');
    const process = document.getElementById('process-works');
    if (!recent && !process) return;

    const works = recent
      ? WORKS.slice().sort((a, b) => b.year - a.year).slice(0, 3)
      : WORKS.filter(work => work.process?.length);
    const container = recent || process;
    for (const work of works) {
      const card = createPortfolioCard(work, { featured: Boolean(recent) });
      card.classList.add('reveal');
      container.append(card);
    }
  }

  // This password gates the classroom UI locally.
  const password = '1234';

  function bindGameAdmin(onUnlock) {
    const dialog = document.getElementById('modal');
    const login = document.getElementById('login');
    const panel = document.getElementById('panel');
    const input = document.getElementById('password');
    const error = document.getElementById('error');

    function lock() {
      login.hidden = false;
      panel.hidden = true;
      input.value = '';
      error.hidden = true;
    }

    document.getElementById('adminBtn').addEventListener('click', () => {
      lock();
      dialog.showModal();
      input.focus();
    });
    document.getElementById('close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', lock);
    dialog.querySelector('[data-admin-lock]').addEventListener('click', () => {
      lock();
      input.focus();
    });
    input.addEventListener('input', () => { error.hidden = true; });
    login.addEventListener('submit', event => {
      event.preventDefault();
      if (input.value !== password) {
        error.hidden = false;
        input.focus();
        return;
      }
      input.value = '';
      login.hidden = true;
      panel.hidden = false;
      onUnlock();
      panel.querySelector('input, button, select')?.focus();
    });
  }

  function bindPortfolioOverlay(element, closeButton) {
    function setOpen(open) {
      element.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }

    const close = () => setOpen(false);
    closeButton.addEventListener("click", close);
    element.addEventListener("click", event => {
      if (event.target === element) close();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && element.classList.contains("is-open")) close();
    });
    return { open: () => setOpen(true), close };
  }

  window.eduUI = Object.freeze({
    bindMobileMenu,
    bindGameAdmin,
    bindPortfolioOverlay,
    copyText,
    createPortfolioCard,
    escapeHtml,
    roundedPercent,
    showToast,
  });

  function initPageControls() {
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
    if (document.body.dataset?.siteFamily !== 'portfolio1') return;
    initPortfolioPreviews();
    /* ---------- Scroll reveal (one quiet effect, IntersectionObserver) ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ---------- Back to top ---------- */
    const backToTop = document.querySelector("[data-back-to-top]");
    if (backToTop) {
      window.addEventListener("scroll", () => {
        backToTop.classList.toggle("is-visible", window.scrollY > 600);
      });
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* ---------- Active nav link (desktop + mobile) ---------- */
    const currentPage = document.body.dataset.page;
    if (currentPage) {
      document.querySelectorAll(`a[data-page="${currentPage}"]`).forEach((a) => {
        a.setAttribute("aria-current", "page");
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
      logo.src = new URL('images/onuri-logo.png', root).href;
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
