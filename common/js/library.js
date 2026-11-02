function loadLibrary() {
  const status = document.querySelector('#status');
  try {
    const items = window.LIVING_LAB_BOOKS;
    if (!Array.isArray(items)) throw new Error('Generated course list is unavailable');
    document.querySelector('#count').textContent = `총 ${items.length}개 과목`;
    if (!items.length) { status.textContent = '교안을 준비 중입니다'; return; }
    status.hidden = true;
    const cards = document.querySelector('#cards');
    cards.replaceChildren();
    const element = (tag, className, text) => {
      const node = document.createElement(tag); node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    for (const item of items) {
      const card = element('article', 'course-card');
      const heading = element('div', 'course-heading');
      const badge = element('span', 'lesson', `CLASS ${item.number}`);
      const pdf = element('span', 'pdf', 'PDF 교안');
      heading.append(badge, pdf);
      const title = element('h3', 'course-title', item.title);
      const introLabel = element('span', 'course-label', '과목 소개');
      const intro = element('p', 'course-intro', item.intro || '과목 소개를 준비하고 있습니다. 수업 내용은 PDF 교안에서 먼저 확인해 주세요.');
      card.append(heading, title, introLabel, intro);
      if (item.audience || item.duration) {
        const meta = element('dl', 'course-meta');
        for (const [label, value] of [['참여 대상', item.audience], ['수업 시간', item.duration]]) {
          if (!value) continue;
          meta.append(element('dt', '', label), element('dd', '', value));
        }
        card.append(meta);
      }
      if (item.outcomes?.length) {
        const outcomes = element('ul', 'course-outcomes');
        for (const outcome of item.outcomes) outcomes.append(element('li', '', outcome));
        card.append(element('span', 'course-label', '함께 배울 내용'), outcomes);
      }
      const size = item.bytes < 1024 ? `${item.bytes} B` : item.bytes < 1048576 ? `${(item.bytes / 1024).toFixed(1)} KB` : `${(item.bytes / 1048576).toFixed(1)} MB`;
      const fileInfo = element('p', 'file-info', `${item.filename} · ${size}`);
      const actions = element('div', 'course-actions');
      const preview = element('a', 'preview', '미리보기 ↗');
      const pdfUrl = new URL(item.url, window.eduAuth?.root || document.baseURI).href;
      preview.href = pdfUrl; preview.target = '_blank'; preview.rel = 'noopener noreferrer';
      preview.setAttribute('aria-label', `${item.title} PDF 미리보기 (새 탭)`);
      const download = element('button', 'download', '다운로드 ↓');
      download.type = 'button';
      download.setAttribute('aria-label', `${item.title} PDF 다운로드`);
      download.addEventListener('click', async event => {
        event.preventDefault();
        if (download.disabled) return;
        download.disabled = true;
        download.setAttribute('aria-busy', 'true');
        download.textContent = '저장 준비 중…';
        try {
          await window.eduDownloads.save(pdfUrl, item.filename);
        } catch (error) {
          status.hidden = false;
          status.textContent = '다운로드를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.';
          console.error('PDF 다운로드 실패', error);
        } finally {
          download.removeAttribute('aria-busy');
          download.disabled = false;
          download.textContent = '다운로드 ↓';
        }
      });
      actions.append(preview, download); card.append(fileInfo, actions); cards.append(card);
    }
  } catch (error) {
    status.textContent = '교안 목록을 불러오지 못했습니다. 잠시 후 다시 방문해 주세요.';
    console.error('교안 목록 로딩 실패', error);
  }
}
loadLibrary();
