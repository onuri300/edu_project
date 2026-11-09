/**
 * 이미지 확대 보기
 * Lightbox.open(items, startIndex) 형태로 사용한다.
 * items: [{ src, caption }]
 */
const Lightbox = (function () {
  let items = [];
  let index = 0;
  let el, imgEl, capEl, overlay;

  function build() {
    el = document.createElement("div");
    el.className = "lightbox";
    el.innerHTML = `
      <button class="lightbox-close" aria-label="닫기">✕</button>
      <button class="lightbox-nav lightbox-prev" aria-label="이전 이미지">‹</button>
      <div class="lightbox-inner">
        <img alt="" />
        <p class="lightbox-caption"></p>
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="다음 이미지">›</button>
    `;
    document.body.appendChild(el);
    imgEl = el.querySelector("img");
    capEl = el.querySelector(".lightbox-caption");

    overlay = window.eduUI.bindPortfolioOverlay(el, el.querySelector(".lightbox-close"));
    el.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
    el.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("is-open")) return;
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  function show(i) {
    index = (i + items.length) % items.length;
    const item = items[index];
    imgEl.src = item.src;
    imgEl.alt = item.caption || "";
    capEl.textContent = item.caption || "";
  }

  function open(newItems, startIndex) {
    if (!el) build();
    items = newItems;
    show(startIndex || 0);
    overlay.open();
  }

  function close() {
    overlay?.close();
  }

  return { open, close };
})();

/**
 * 등장인물 썸네일에서 열리는 소개 팝업
 * CastModal.open(character) 형태로 사용한다.
 * character: { name, role, personality, traits, description, image }
 */
const CastModal = (function () {
  let el, overlay;

  function build() {
    el = document.createElement("div");
    el.className = "cast-modal";
    el.innerHTML = `
      <div class="cast-modal-card" role="dialog" aria-modal="true">
        <div class="cast-modal-media"><img alt="" /></div>
        <div class="cast-modal-body">
          <button type="button" class="cast-modal-close" aria-label="닫기">✕</button>
          <p class="cast-modal-role"></p>
          <h3 class="cast-modal-name"></h3>
          <strong>성격</strong><p data-field="personality"></p>
          <strong>특징</strong><p data-field="traits"></p>
          <strong>설명</strong><p data-field="description"></p>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    overlay = window.eduUI.bindPortfolioOverlay(el, el.querySelector(".cast-modal-close"));
  }

  function open(character) {
    if (!el) build();
    el.querySelector(".cast-modal-media img").src = character.image;
    el.querySelector(".cast-modal-media img").alt = character.name;
    el.querySelector(".cast-modal-role").textContent = character.role || "";
    el.querySelector(".cast-modal-name").textContent = character.name || "";
    el.querySelector('[data-field="personality"]').textContent = character.personality || "—";
    el.querySelector('[data-field="traits"]').textContent = character.traits || "—";
    el.querySelector('[data-field="description"]').textContent = character.description || "—";
    overlay.open();
  }

  function close() {
    overlay?.close();
  }

  return { open, close };
})();
