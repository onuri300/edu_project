/**
 * main.js — 모든 페이지에서 공통으로 쓰는 동작
 * (다크 모드, 모바일 전체화면 메뉴, 스크롤 리빌, 맨 위로 가기)
 */
(function () {
  "use strict";

  // Shared theme is managed by common/js/common.js.

  window.eduUI.bindMobileMenu({
    button: document.querySelector("[data-menu-toggle]"),
    menu: document.querySelector("[data-mobile-menu]"),
    closeButton: document.querySelector("[data-menu-close]"),
    breakpoint: 768,
    overlay: true,
  });

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
})();
