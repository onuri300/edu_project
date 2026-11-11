(async () => {
  const $ = id => document.getElementById(id);
  const channel=document.body.dataset.newsletter;
  const channelName=channel==='ai'?'AI':'메이킹';
  let activeUrl,selected=null;
  const requestedId=()=>new URLSearchParams(location.hash.slice(1)).get('report');
  const frequency=r=>r.frequency==='daily'?'일일':r.frequency==='weekly'?'주간':'일반';
  const status=message=>{$('report-status').textContent=message;};
  const belongs=r=>r.channel===channel || (channel==='ai'?/^(ai|AI)(\/|$)/.test(r.group):/^(making|메이킹)(\/|$)/.test(r.group));
  if(!Array.isArray(window.ONURI_REPORTS))status('리포트 목록을 불러오지 못했습니다. 새로고침하거나 데이터 파일을 확인해 주세요.');
  const all=()=>[...new Map([...(window.ONURI_REPORTS||[])].map(r=>[r.id,r])).values()].filter(belongs).sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ko'));
  function clearReader(){selected=null;if(activeUrl)URL.revokeObjectURL(activeUrl);activeUrl=null;$('reader-html').srcdoc='';$('reader-pdf').removeAttribute('data');$('reader-content').hidden=true;$('reader-placeholder').hidden=false;}
  function render(){
    const query=$('report-search').value.toLocaleLowerCase(),period=$('report-frequency').value;const items=all().filter(r=>(!period||r.frequency===period)&&`${r.title} ${r.summary||''} ${(r.tags||[]).join(' ')} ${r.text}`.toLocaleLowerCase().includes(query));
    $('report-list').replaceChildren();$('report-count').textContent=`${items.length}개 뉴스레터`;$('report-empty').hidden=items.length>0;
    $('report-empty').textContent=all().length?'검색 결과가 없습니다.':'아직 등록된 뉴스레터가 없습니다. 다음 뉴스레터를 준비 중입니다.';
    let previousDate=null;
    for(const report of items){
      if(report.date!==previousDate){const heading=document.createElement('h2');heading.className='report-date';heading.textContent=report.date||'날짜 미지정';$('report-list').append(heading);previousDate=report.date;}
      const button=document.createElement('button');button.type='button';button.className='report-item';button.dataset.id=report.id;button.setAttribute('aria-current',String(selected===report.id));
      const title=document.createElement('strong');title.textContent=report.title;const meta=document.createElement('small');meta.textContent=`${frequency(report)} · ${report.type.toUpperCase()} · ${Math.ceil(report.bytes/1024)} KB${report.blob?' · 브라우저 보관':''}`;button.append(title,meta);button.onclick=()=>read(report);$('report-list').append(button);
    }
    const wanted=requestedId();
    if(wanted&&!all().some(r=>r.id===wanted)){clearReader();$('reader-placeholder').textContent='해당 ID의 뉴스레터를 찾을 수 없습니다. 왼쪽 목록에서 다른 리포트를 선택하세요.';return;}
    const current=items.find(r=>r.id===(wanted||selected));if(current)read(current);else if(items.length)read(items[0]);else clearReader();
  }
  function read(report){
    if(activeUrl)URL.revokeObjectURL(activeUrl);selected=report.id;
    if(requestedId()!==report.id)history.replaceState(null,'','#report='+encodeURIComponent(report.id));
    const blob=report.blob||new Blob([report.text],{type:report.type==='html'?'text/html;charset=utf-8':'text/plain;charset=utf-8'});
    activeUrl=report.type==='pdf'&&!report.blob?null:URL.createObjectURL(blob);
    $('reader-placeholder').hidden=true;$('reader-content').hidden=false;$('reader-title').textContent=report.title;$('reader-meta').textContent=`${channelName} · ${frequency(report)} · 발행 ${report.date||'날짜 미지정'}${report.period_start?' · 조사 '+report.period_start+' ~ '+report.period_end:''} · 예상 읽기 ${report.reading_minutes_estimate||Math.max(1,Math.round(report.text.length/500))}분`;
    $('reader-summary').textContent=report.summary||'';
    $('reader-tags').replaceChildren(...(report.tags||[]).map(tag=>{const span=document.createElement('span');span.textContent=tag;return span;}));
    $('reader-markdown').hidden=report.type!=='md';$('reader-markdown').replaceChildren();$('reader-toc').replaceChildren();$('reader-sources').replaceChildren();
    if(report.type==='md'&&window.onuriMarkdown){
      const rendered=window.onuriMarkdown.render(report.text);$('reader-markdown').innerHTML=rendered.html;
      const heading=document.createElement('strong');heading.textContent='이 리포트의 목차';const list=document.createElement('ol');
      for(const item of rendered.toc){const li=document.createElement('li'),link=document.createElement('a');li.dataset.level=item.level;link.href='#'+item.id;link.textContent=item.title;link.onclick=event=>{event.preventDefault();document.getElementById(item.id)?.scrollIntoView({block:'start'});};li.append(link);list.append(li);}$('reader-toc').append(heading,list);
      const links=new Map();$('reader-markdown').querySelectorAll('a[href]').forEach(a=>{if(/^https?:/i.test(a.getAttribute('href')))links.set(a.href,a.textContent);});
      if(report.canva_url&&window.onuriMarkdown.safe(report.canva_url)&&/^https?:/i.test(report.canva_url))links.set(report.canva_url,'관련 Canva 자료');
      if(links.size){const title=document.createElement('h3');title.textContent='출처 및 관련 링크';const sources=document.createElement('ul');for(const [url,label] of links){const li=document.createElement('li'),a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label+' · '+new URL(url).hostname;li.append(a);sources.append(li);}$('reader-sources').append(title,sources);}
    }else if(report.type==='md')status('Markdown 렌더러를 불러오지 못했습니다. 원문으로 표시합니다.');
    $('reader-text').hidden=['html','pdf'].includes(report.type)||(report.type==='md'&&!!window.onuriMarkdown);$('reader-text').textContent=report.text;
    $('reader-html').hidden=report.type!=='html';$('reader-pdf').hidden=report.type!=='pdf';
    $('reader-html').srcdoc=report.type==='html'?'<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data:;">'+report.text:'';
    const url=activeUrl||new URL(report.url,window.eduAuth.root).href;
    if(report.type==='pdf')$('reader-pdf').data=url;else $('reader-pdf').removeAttribute('data');
    $('reader-download').href=report.blob?url:new URL(report.url,window.eduAuth.root).href;$('reader-download').download=report.filename;$('reader-download').textContent=report.type==='md'?'Markdown 다운로드':'원본 다운로드';
    $('report-list').querySelectorAll('[data-id]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===report.id)));
  }
  $('reader-download').onclick=async event=>{const report=all().find(r=>r.id===selected);if(!report||report.blob||location.protocol==='file:')return;event.preventDefault();try{const response=await fetch(new URL(report.url,window.eduAuth.root));if(!response.ok)throw Error();const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=report.filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch{status('다운로드하지 못했습니다. 웹 서버에서 열었는지 확인해 주세요.');}};
  $('report-search').oninput=render;$('report-frequency').onchange=render;window.addEventListener('hashchange',render);
  $('report-toggle').onclick=()=>{const collapsed=document.querySelector('.newsletter-workspace').classList.toggle('list-collapsed');$('report-sidebar').inert=collapsed;$('report-toggle').textContent=collapsed?'›':'‹';$('report-toggle').setAttribute('aria-expanded',String(!collapsed));$('report-toggle').setAttribute('aria-label',collapsed?'날짜 목록 펼치기':'날짜 목록 접기');};
  window.addEventListener('pagehide',()=>{if(activeUrl)URL.revokeObjectURL(activeUrl);});render();
})();
