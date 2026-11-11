/**
 * onuri-work-detail.js — 작품 상세 페이지: onuri-works-data.js의 데이터를 읽어 렌더링한다.
 * URL 예: vi_detail.html?id=work01
 */
(function () {
  "use strict";
  const root = document.querySelector("[data-detail-root]");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const work = getWorkById(params.get("id")) || WORKS[0];

  document.title = `${work.title} · makelab`;

  /* ---------- Hero ---------- */
  root.querySelector("[data-hero-image]").src = work.cover;
  root.querySelector("[data-hero-image]").alt = `${work.title} 대표 이미지`;
  root.querySelector("[data-hero-meta]").textContent = `${work.categoryLabel} · ${work.genre} · ${work.year}`;
  root.querySelector("[data-hero-title]").textContent = work.title;
  root.querySelector("[data-hero-tagline]").textContent = work.tagline;

  /* ---------- Side info ---------- */
  root.querySelector("[data-info-genre]").textContent = work.genre;
  root.querySelector("[data-info-year]").textContent = work.year;
  root.querySelector("[data-info-programs]").textContent = (work.programs || []).join(", ") || "—";
  root.querySelector("[data-info-tags]").textContent = (work.tags || []).join(" · ") || "—";

  /* ---------- Synopsis / worldview / intent / note ---------- */
  setTextOrHide("[data-synopsis]", work.synopsis);
  setTextOrHide("[data-worldview]", work.worldview);
  setTextOrHide("[data-intent]", work.intent);
  setTextOrHide("[data-artistnote]", work.artistNote);

  function setTextOrHide(sel, text) {
    const block = root.querySelector(sel);
    if (!block) return;
    const wrap = block.closest("[data-block]");
    if (!text) { if (wrap) wrap.style.display = "none"; return; }
    block.textContent = text;
  }

  /* ---------- Cast (movie-credit style: small thumbnail + name, up to 6) ---------- */
  const charBlock = root.querySelector('[data-block="characters"]');
  const charGrid = root.querySelector("[data-char-grid]");
  const cast = (work.characters || []).slice(0, 6);
  if (cast.length) {
    charGrid.className = "cast-grid";
    charGrid.innerHTML = cast
      .map(
        (c, i) => `
      <button type="button" class="cast-item" data-cast-index="${i}">
        <span class="cast-avatar"><img src="${c.image}" alt="${c.name}" loading="lazy" /></span>
        <span class="cast-name">${c.name}</span>
        <span class="cast-role">${c.role || ""}</span>
      </button>`
      )
      .join("");

    charGrid.querySelectorAll(".cast-item").forEach((item) => {
      item.addEventListener("click", () => {
        CastModal.open(cast[Number(item.dataset.castIndex)]);
      });
    });
  } else if (charBlock) {
    charBlock.style.display = "none";
  }

  /* ---------- Scenes (slider + lightbox) ---------- */
  const sceneBlock = root.querySelector('[data-block="scenes"]');
  const sceneSlider = root.querySelector("[data-scene-slider]");
  if (work.scenes && work.scenes.length) {
    sceneSlider.innerHTML = work.scenes
      .map(
        (s, i) => `
      <div class="scene-slide" data-index="${i}">
        <div class="scene-media"><img src="${s.image}" alt="${s.caption}" loading="lazy" /></div>
        <p class="scene-caption">${s.caption}</p>
      </div>`
      )
      .join("");
    sceneSlider.querySelectorAll(".scene-slide").forEach((slide) => {
      slide.addEventListener("click", () => {
        const lightboxItems = work.scenes.map((s) => ({ src: s.image, caption: s.caption }));
        Lightbox.open(lightboxItems, Number(slide.dataset.index));
      });
    });
  } else if (sceneBlock) {
    sceneBlock.style.display = "none";
  }

  /* ---------- Process timeline ---------- */
  const processBlock = root.querySelector('[data-block="process"]');
  const timeline = root.querySelector("[data-timeline]");
  if (work.process && work.process.length) {
    timeline.innerHTML = work.process
      .map(
        (p, i) => `
      <div class="timeline-step">
        <span class="timeline-num">${String(i + 1).padStart(2, "0")}</span>
        <div class="timeline-media"><img src="${p.image}" alt="${p.stage}" loading="lazy" /></div>
        <h3>${p.stage}</h3>
        <p>${p.note}</p>
      </div>`
      )
      .join("");
  } else if (processBlock) {
    processBlock.style.display = "none";
  }

  /* ---------- Before / after compare ---------- */
  const compareBlock = root.querySelector('[data-block="compare"]');
  const compareWrap = root.querySelector("[data-compare]");
  if (work.beforeAfter) {
    compareWrap.innerHTML = `
      <div class="compare" data-compare-slider>
        <img src="${work.beforeAfter.before}" alt="Before" />
        <img class="compare-after" src="${work.beforeAfter.after}" alt="After" />
        <span class="compare-label before">Before</span>
        <span class="compare-label after">After</span>
        <div class="compare-handle"></div>
      </div>
      <p class="scene-caption">${work.beforeAfter.note || ""}</p>
    `;
    initCompareSlider(compareWrap.querySelector("[data-compare-slider]"));
  } else if (compareBlock) {
    compareBlock.style.display = "none";
  }

  function initCompareSlider(el) {
    const after = el.querySelector(".compare-after");
    const handle = el.querySelector(".compare-handle");
    let dragging = false;

    function setPos(clientX) {
      const rect = el.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = `${pct}%`;
    }

    el.addEventListener("pointerdown", (e) => { dragging = true; setPos(e.clientX); });
    window.addEventListener("pointermove", (e) => { if (dragging) setPos(e.clientX); });
    window.addEventListener("pointerup", () => { dragging = false; });
    el.addEventListener("touchmove", (e) => { if (e.touches[0]) setPos(e.touches[0].clientX); }, { passive: true });
  }

  /* ---------- Related works ---------- */
  const relatedGrid = root.querySelector("[data-related-grid]");
  const relatedBlock = root.querySelector('[data-block="related"]');
  const related = (work.related || []).map(getWorkById).filter(Boolean);
  if (related.length) {
    relatedGrid.replaceChildren(...related.map(work => window.eduPortfolio.createPortfolioCard(work)));
  } else if (relatedBlock) {
    relatedBlock.style.display = "none";
  }
})();
