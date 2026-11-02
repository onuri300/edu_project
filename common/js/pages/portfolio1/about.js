
  // 강사 소개
  document.querySelector("[data-profile-role]").textContent = PROFILE.role;
  document.querySelector("[data-profile-bio]").textContent = PROFILE.bio;
  document.querySelector("[data-profile-tools]").textContent = PROFILE.tools.join(", ");
  document.querySelector("[data-profile-portrait]").alt = `${PROFILE.name} 프로필 사진`;

  // 다루는 작업 (skill bar)
  const skillWrap = document.querySelector("[data-profile-skills]");
  PROFILE.skills.forEach((s) => {
    const filled = "●".repeat(s.level);
    const empty = "○".repeat(5 - s.level);
    const row = document.createElement("div");
    row.innerHTML = `<span>${s.label}</span><span>${filled}${empty}</span>`;
    skillWrap.appendChild(row);
  });

  // 이력(경력) 타임라인
  const careerWrap = document.querySelector("[data-career-list]");
  CAREER.forEach((c) => {
    const item = document.createElement("div");
    item.className = "career-item";
    item.innerHTML = `
      <p class="career-period">${c.period}</p>
      <p class="career-role">${c.role}</p>
      ${c.org ? `<p class="career-org">${c.org}</p>` : ""}
      ${c.desc ? `<p class="career-desc">${c.desc}</p>` : ""}
    `;
    careerWrap.appendChild(item);
  });
