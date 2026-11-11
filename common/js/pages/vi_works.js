/**
 * onuri-works.js — Works 갤러리: 렌더링 / 카테고리 필터 / 검색 / 정렬 / 이미지 확대 / 페이징(스와이프)
 * PC: 3x2 = 한 페이지 6개, Mobile(~768px 이하): 2x2 = 한 페이지 4개
 */
(function () {
  "use strict";
  const viewport = document.querySelector("[data-gallery-viewport]");
  const track = document.querySelector("[data-gallery-track]");
  if (!viewport || !track) return;

  const chipsWrap = document.querySelector("[data-filter-chips]");
  const searchInput = document.querySelector("[data-search-input]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const countEl = document.querySelector("[data-result-count]");
  const paginationEl = document.querySelector("[data-gallery-pagination]");

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  let state = { category: "all", query: "", sort: "recent" };
  let currentPage = 0;

  function itemsPerPage() {
    return mobileQuery.matches ? 4 : 6;
  }

  function buildChips() {
    chipsWrap.innerHTML = CATEGORIES.map(
      (c, i) => `<button class="filter-chip" data-cat="${c.key}" aria-pressed="${i === 0}">${c.label}</button>`
    ).join("");
    chipsWrap.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.cat;
        chipsWrap.querySelectorAll(".filter-chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        currentPage = 0;
        render();
      });
    });
  }

  function getFiltered() {
    let list = WORKS.slice();
    if (state.category !== "all") {
      list = list.filter((w) => w.category === state.category);
    }
    if (state.query.trim()) {
      const q = state.query.trim().toLowerCase();
      list = list.filter((w) =>
        [w.title, w.tagline, w.categoryLabel, ...(w.tags || [])].join(" ").toLowerCase().includes(q)
      );
    }
    if (state.sort === "recent") {
      list.sort((a, b) => b.year - a.year);
    } else if (state.sort === "name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }

  function cardTemplate(work) {
    return `
      <article class="work-card reveal">
        <div class="work-card-media" data-zoom data-src="${work.cover}" data-caption="${work.title}">
          <img src="${work.thumb}" alt="${work.title} 대표 이미지" loading="lazy" />
          <span class="work-card-cat">${work.categoryLabel}</span>
        </div>
        <a class="work-card-body" href="vi_detail.html?id=${work.id}">
          <h3 class="work-card-title">${work.title}</h3>
          <p class="work-card-meta">${work.genre} · ${work.year}</p>
          <p class="work-card-desc">${work.tagline}</p>
          <div class="work-card-tags">${(work.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        </a>
      </article>
    `;
  }

  function chunk(list, size) {
    const pages = [];
    for (let i = 0; i < list.length; i += size) pages.push(list.slice(i, i + size));
    return pages.length ? pages : [[]];
  }

  function render() {
    const list = getFiltered();
    countEl.textContent = `${list.length}개의 작품`;

    if (!list.length) {
      track.innerHTML = `<div class="gallery-page"><div class="empty-state"><strong>표시할 작품이 없습니다</strong>다른 카테고리나 검색어로 다시 시도해 보세요.</div></div>`;
      track.style.transform = "translateX(0)";
      paginationEl.hidden = true;
      return;
    }

    const pages = chunk(list, itemsPerPage());
    currentPage = Math.min(currentPage, pages.length - 1);

    track.innerHTML = pages
      .map((pageItems) => `<div class="gallery-page"><div class="gallery-grid">${pageItems.map(cardTemplate).join("")}</div></div>`)
      .join("");

    track.querySelectorAll(".reveal").forEach((el) => {
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
    track.querySelectorAll("[data-zoom]").forEach((media) => {
      media.style.cursor = "zoom-in";
      media.addEventListener("click", (e) => {
        e.preventDefault();
        Lightbox.open([{ src: media.dataset.src, caption: media.dataset.caption }], 0);
      });
    });

    renderPagination(pages.length);
    goToPage(currentPage, false);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      paginationEl.hidden = true;
      paginationEl.innerHTML = "";
      return;
    }
    paginationEl.hidden = false;
    const dots = Array.from({ length: totalPages }, (_, i) =>
      `<button type="button" class="page-dot" data-page="${i}" aria-current="${i === currentPage}" aria-label="${i + 1}번째 페이지"></button>`
    ).join("");
    paginationEl.innerHTML = `
      <button type="button" class="page-arrow" data-page-prev aria-label="이전 페이지">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <div class="page-dots">${dots}</div>
      <button type="button" class="page-arrow" data-page-next aria-label="다음 페이지">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    `;
    paginationEl.querySelector("[data-page-prev]").addEventListener("click", () => goToPage(currentPage - 1));
    paginationEl.querySelector("[data-page-next]").addEventListener("click", () => goToPage(currentPage + 1));
    paginationEl.querySelectorAll(".page-dot").forEach((dot) => {
      dot.addEventListener("click", () => goToPage(Number(dot.dataset.page)));
    });
    updatePaginationState(totalPages);
  }

  function updatePaginationState(totalPages) {
    const prev = paginationEl.querySelector("[data-page-prev]");
    const next = paginationEl.querySelector("[data-page-next]");
    if (prev) prev.disabled = currentPage === 0;
    if (next) next.disabled = currentPage === totalPages - 1;
    paginationEl.querySelectorAll(".page-dot").forEach((dot) => {
      dot.setAttribute("aria-current", String(Number(dot.dataset.page) === currentPage));
    });
  }

  function goToPage(page, animate = true) {
    const totalPages = track.children.length;
    currentPage = Math.max(0, Math.min(page, totalPages - 1));
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(-${currentPage * 100}%)`;
    if (!animate) requestAnimationFrame(() => { track.style.transition = ""; });
    updatePaginationState(totalPages);
  }

  /* ---------- Horizontal swipe (touch) ---------- */
  let touchStartX = null;
  viewport.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const SWIPE_THRESHOLD = 50;
    if (deltaX <= -SWIPE_THRESHOLD) goToPage(currentPage + 1);
    else if (deltaX >= SWIPE_THRESHOLD) goToPage(currentPage - 1);
    touchStartX = null;
  });

  /* ---------- Re-paginate when crossing the mobile/desktop breakpoint ---------- */
  const handleBreakpointChange = () => { currentPage = 0; render(); };
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", handleBreakpointChange);
  else mobileQuery.addListener(handleBreakpointChange); // Safari <14 fallback

  buildChips();
  render();

  searchInput?.addEventListener("input", (e) => {
    state.query = e.target.value;
    currentPage = 0;
    render();
  });
  sortSelect?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    currentPage = 0;
    render();
  });

  // Support ?category= deep link from Home "카테고리 보기" cards
  const params = new URLSearchParams(location.search);
  const cat = params.get("category");
  if (cat) {
    const btn = chipsWrap?.querySelector(`[data-cat="${cat}"]`);
    if (btn) btn.click();
  }
})();
