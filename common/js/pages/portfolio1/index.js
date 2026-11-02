
  // 최근 작품 3개 미리보기
  const recentWrap = document.getElementById("home-recent");
  WORKS.slice().sort((a,b)=>b.year-a.year).slice(0,3).forEach((w) => {
    const a = document.createElement("a");
    a.className = "work-card reveal";
    a.href = `onuri-work-detail.html?id=${w.id}`;
    a.innerHTML = `
      <div class="work-card-media"><img src="${w.thumb}" alt="${w.title}" loading="lazy" /><span class="work-card-cat">${w.categoryLabel}</span></div>
      <div class="work-card-body">
        <h3 class="work-card-title">${w.title}</h3>
        <p class="work-card-meta">${w.genre} · ${w.year}</p>
        <p class="work-card-desc">${w.tagline}</p>
      </div>`;
    recentWrap.appendChild(a);
  });

  // 카테고리 칩 -> onuri-works.html 로 딥링크
  const catWrap = document.getElementById("home-categories");
  CATEGORIES.filter(c => c.key !== "all").forEach((c) => {
    const a = document.createElement("a");
    a.className = "filter-chip";
    a.href = `onuri-works.html?category=${c.key}`;
    a.textContent = c.label;
    catWrap.appendChild(a);
  });
