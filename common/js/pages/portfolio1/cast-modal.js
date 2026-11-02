/**
 * cast-modal.js — 캐스트(등장인물) 작은 썸네일을 클릭했을 때 뜨는 인물 소개 팝업
 * CastModal.open(character) 형태로 사용한다.
 * character: { name, role, personality, traits, description, image }
 */
const CastModal = (function () {
  let el, closeBtn;

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
    closeBtn = el.querySelector(".cast-modal-close");
    closeBtn.addEventListener("click", close);
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.classList.contains("is-open")) close();
    });
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
