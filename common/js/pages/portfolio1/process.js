
  const wrap = document.getElementById("process-works");
  WORKS.filter(w => w.process && w.process.length).forEach((w) => {
    const a = document.createElement("a");
    a.className = "work-card reveal";
    a.href = `onuri-work-detail.html?id=${w.id}`;
    a.innerHTML = `
      <div class="work-card-media"><img src="${w.thumb}" alt="${w.title}" loading="lazy" /></div>
      <div class="work-card-body"><h3 class="work-card-title">${w.title}</h3><p class="work-card-meta">${w.genre} · ${w.year}</p></div>`;
    wrap.appendChild(a);
  });
