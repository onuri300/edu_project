(() => {
  'use strict';
  // Public browser key. Access is enforced by Supabase row-level security.
  const endpoint = 'https://sqsynpvdtgaoklqzkwrw.supabase.co/rest/v1/announcements';
  const publishableKey = 'sb_publishable_T8Uxfrz4CIRl2RNEZpVOFg_SXxOlOzW';
  const list = document.querySelector('#notices');
  const status = document.querySelector('#notice-status');
  const refresh = document.querySelector('#refresh');
  const more = document.querySelector('#more');
  const size = 20;
  let offset = 0;
  async function load(reset = false) {
    refresh.disabled = more.disabled = true;
    status.textContent = '공지사항을 불러오는 중입니다.';
    const start = reset ? 0 : offset;
    try {
      const url = new URL(endpoint);
      url.search = new URLSearchParams({select:'id,title,content,created_at',published:'eq.true',order:'created_at.desc,id.desc',limit:String(size),offset:String(start)});
      const response = await fetch(url, {headers:{apikey:publishableKey},cache:'no-store',signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error('Unable to load announcements');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Invalid response');
      if (reset) list.replaceChildren();
      for (const row of rows) {
        const item = document.createElement('details');
        const title = document.createElement('summary');
        title.textContent = row.title;
        const time = document.createElement('time');
        const date = new Date(row.created_at);
        if (!Number.isNaN(date.getTime())) {
          time.dateTime = date.toISOString();
          time.textContent = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'long'}).format(date);
        }
        const content = document.createElement('div');
        content.className = 'notice-content';
        content.textContent = row.content;
        item.append(title,time,content);
        list.append(item);
      }
      offset = start + rows.length;
      more.hidden = rows.length < size;
      status.textContent = offset ? `${offset}개의 공지사항을 표시합니다. 제목을 누르면 내용을 볼 수 있습니다.` : '등록된 공지사항이 없습니다.';
    } catch {
      status.textContent = '공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      refresh.disabled = more.disabled = false;
    }
  }
  refresh.addEventListener('click', () => load(true));
  more.addEventListener('click', () => load());
  load(true);
})();
