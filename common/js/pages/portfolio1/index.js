  // 카테고리 칩 -> onuri-works.html 로 딥링크
  const catWrap = document.getElementById("home-categories");
  CATEGORIES.filter(c => c.key !== "all").forEach((c) => {
    const a = document.createElement("a");
    a.className = "filter-chip";
    a.href = `onuri-works.html?category=${c.key}`;
    a.textContent = c.label;
    catWrap.appendChild(a);
  });
