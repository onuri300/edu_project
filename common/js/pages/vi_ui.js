(() => {
  function createPortfolioCard(work, { featured = false } = {}) {
    const card = document.createElement('a');
    card.className = 'work-card';
    card.href = 'vi_detail.html?id=' + encodeURIComponent(work.id);

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

  window.eduPortfolio = Object.freeze({ createPortfolioCard, bindPortfolioOverlay });
  document.addEventListener('DOMContentLoaded', () => {
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
  });
})();
