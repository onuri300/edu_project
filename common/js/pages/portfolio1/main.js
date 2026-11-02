/**
 * main.js — 모든 페이지에서 공통으로 쓰는 동작
 * (다크 모드, 모바일 전체화면 메뉴, 스크롤 리빌, 맨 위로 가기)
 */
(function () {
  "use strict";

  // Shared theme is managed by common/js/common.js.

  /* ---------- Mobile menu (full-screen overlay, markup already in HTML) ---------- */
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const menuClose = document.querySelector("[data-menu-close]");

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    mobileMenu.removeAttribute("aria-hidden");
    document.documentElement.classList.add("no-scroll");
    menuToggle?.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("no-scroll");
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu?.classList.contains("is-open")) closeMenu();
  });
  // Safety: if the viewport is resized back to desktop width while the menu
  // is open (e.g. rotating a tablet), close it so it can't get stuck.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
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
