/**
 * lightbox.js — 이미지 확대 보기 (공용 모듈)
 * Lightbox.open(items, startIndex) 형태로 사용한다.
 * items: [{ src, caption }]
 */
const Lightbox = (function () {
  let items = [];
  let index = 0;
  let el, imgEl, capEl;

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

    el.querySelector(".lightbox-close").addEventListener("click", close);
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    el.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
    el.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
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
    el.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!el) return;
    el.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  return { open, close };
})();
