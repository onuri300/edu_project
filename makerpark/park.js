((park) => {
'use strict';

const { zones, attractions, galleries, original } = park.parkData;
const { mountWorld, awardReadingCredit } = park.world;

const main=document.querySelector('main');
const navigation=[['map','3D 공원'],['all','전체 어트랙션'],['stamps','내 스탬프']];
let disposeWorld;
const storageKey='onuri-makerpark-v1';
let progress={};
try {const saved=JSON.parse(localStorage.getItem(storageKey)); if(saved && typeof saved==='object' && !Array.isArray(saved)) progress=saved;} catch {}
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(route,label,cls='btn')=>`<a class="${cls}" href="#${route}">${escape(label)}</a>`;
const back=()=>link('map','공원 지도 돌아가기','btn back');
const zoneOf=id=>zones.find(z=>z.id===id);
const attractionOf=id=>attractions.find(a=>a.id===id);
const tile=a=>`<a class="tile" href="#ride/${a.id}"><small>${escape(a.name)}</small><strong>${escape(a.title)}</strong>${progress[a.id]?.stamp?'✿ 스탬프 완료':''}${a.missing?'<span class="pending">자료 준비 중</span>':''}</a>`;
const zoneTile=z=>`<a class="tile" href="#zone/${z.id}"><small>${escape(z.name)}</small><strong>${z.icon} ${escape(z.title)}</strong></a>`;
const put=html=>{main.innerHTML=html;};
function save(a,change) {
  progress[a.id]={...progress[a.id],...change};
  try {localStorage.setItem(storageKey,JSON.stringify(progress)); return true;} catch {return false;}
}
function complete(a,message) {
  const stored=save(a,{stamp:true});
  awardReadingCredit(a.id);
  document.querySelector('#completion').textContent=message+' ✿ 스탬프를 받았어요.'+(stored?'':' 브라우저 저장을 사용할 수 없어 현재 방문 동안 유지돼요.');
}
function home() {
  put(`<div class="hero"><h1 tabindex="-1">오누리 메이커파크</h1><p>지도에서 가고 싶은 곳을 골라보세요.</p></div>
    <div class="map"><img src="assets/map.png" width="1536" height="1024" alt="산책로가 놀이터, 기차역, 제작 공방, 작품 전시장, 안내 광장을 잇는 수채화 지도">
    ${zones.map(z=>`<a class="btn pin" href="#zone/${z.id}" aria-label="${escape(z.name+' · '+z.title)}" style="--x:${z.x}%;--y:${z.y}%"><span aria-hidden="true">${z.icon}</span>&nbsp;${escape(z.title)}</a>`).join('')}</div>
    <nav class="mobile-links" aria-label="공원 메뉴">${navigation.map(([id,label])=>link(id,label)).join('')}</nav>
    <div class="zone-links">${zones.map(zoneTile).join('')}</div>`);
}
function zonePage(z) {
  const rides=attractions.filter(a=>a.zone===z.id);
  put(`${back()}<section class="sheet"><p class="path">${escape(z.name)}</p><h1 tabindex="-1">${z.icon} ${escape(z.title)}</h1>
    <div class="panel"><h2>구역 지도</h2><div class="zone-scene" style="--x:${z.x}%;--y:${z.y}%" aria-hidden="true"></div>
    <div class="grid zone-route">${rides.map(tile).join('')}</div></div></section>`);
}
function allPage() {
  put(`${back()}<section class="sheet"><h1 tabindex="-1">전체 어트랙션</h1><label for="search">기존 메뉴명 또는 어트랙션 검색</label><input id="search" type="search" autocomplete="off"><p id="count" aria-live="polite"></p><div id="results"></div></section>`);
  const search=document.querySelector('#search');
  function filter() {
    const query=search.value.trim().toLocaleLowerCase();
    const matches=attractions.filter(a=>[zoneOf(a.zone).name,a.name,a.title].join(' ').toLocaleLowerCase().includes(query));
    document.querySelector('#count').textContent=`${matches.length}개 공간`;
    document.querySelector('#results').innerHTML=zones.map(z=>{
      const subset=matches.filter(a=>a.zone===z.id);
      return subset.length?`<h2>${escape(z.title)}</h2><div class="grid">${subset.map(tile).join('')}</div>`:'';
    }).join('');
  }
  search.addEventListener('input',filter); filter();
}
function stamps() {
  const done=attractions.filter(a=>progress[a.id]?.stamp);
  put(`${back()}<section class="sheet"><h1 tabindex="-1">내 스탬프</h1><p>${done.length} / ${attractions.length}개 공간 완료</p>
    ${done.length?`<div class="grid">${done.map(tile).join('')}</div>`:'<p>글을 읽거나 체험을 마치면 이곳에 스탬프가 모여요.</p>'}</section>`);
}
function gallery(a) {
  const entries=galleries[a.gallery];
  if(!entries) return;
  const select=document.querySelector('#work-select');
  const img=document.querySelector('#work-image');
  function show() {
    const [label,asset]=entries[Number(select.value)];
    img.src='assets/'+asset;img.alt=label;
  }
  select.addEventListener('change',show);show();
}
function quiz(a) {
  const form=document.querySelector('#quiz');
  const result=document.querySelector('#answer');
  const [question,options,answer,reason]=a.quiz;
  form.innerHTML=`<fieldset><legend>${escape(question)}</legend>${options.map((value,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" required ${progress[a.id]?.answer===i?'checked':''}> ${escape(value)}</label>`).join('')}</fieldset><button class="primary">답 제출</button>`;
  function explain(value) {
    const correct=value===answer;
    result.textContent=(correct?'정답이에요. ':'다시 도전해 보세요. ')+reason;
  }
  if(Number.isInteger(progress[a.id]?.answer)) explain(progress[a.id].answer);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const value=Number(new FormData(form).get('answer'));
    save(a,{answer:value});explain(value);if(value===answer) complete(a,'퀴즈 완료!');
  });
}
function sequence(a) {
  const list=document.querySelector('#sequence');
  const stages=Array.isArray(progress[a.id]?.order)?[...progress[a.id].order]:[...a.order].reverse();
  const controls=[document.querySelector('#up'),document.querySelector('#down')];
  let selected=0;
  function show(focus=false) {
    list.innerHTML=stages.map((stage,i)=>`<li><button type="button" data-index="${i}" aria-pressed="${i===selected}">${escape(stage)}</button></li>`).join('');
    controls[0].disabled=selected===0;
    controls[1].disabled=selected===stages.length-1;
    if(focus) list.children[selected].firstChild.focus();
  }
  list.addEventListener('click',event=>{
    const button=event.target.closest('[data-index]');
    if(button){selected=Number(button.dataset.index);show(true);}
  });
  controls.forEach((button,i)=>button.addEventListener('click',()=>{
    const next=selected+(i===0?-1:1);
    [stages[selected],stages[next]]=[stages[next],stages[selected]];
    selected=next;show(true);
  }));
  document.querySelector('#check-order').addEventListener('click',()=>{
    const correct=stages.every((step,i)=>step===a.order[i]);
    save(a,{order:stages,correct});
    document.querySelector('#answer').textContent=correct?'올바른 제작 순서예요.':'제작 안내를 다시 읽고 단계의 순서를 확인해 보세요.';
    if(correct) complete(a,'순서 미션 완료!');
  });
  if(typeof progress[a.id]?.correct==='boolean') document.querySelector('#answer').textContent=progress[a.id].correct?'올바른 제작 순서예요.':'제작 안내를 다시 읽고 단계의 순서를 확인해 보세요.';
  show();
}
function readMarkdown(text) {
  const inline=line=>escape(line).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  return text.trim().split(/\r?\n\s*\r?\n/).map(block=>{
    const lines=block.split(/\r?\n/);
    if(lines[0].startsWith('|')&&lines.every(line=>line.startsWith('|'))) return '<table>'+lines.filter(line=>!/^[| :\-]+$/.test(line)).map((line,i)=>'<tr>'+line.split('|').slice(1,-1).map(cell=>i?'<td>'+inline(cell)+'</td>':'<th scope="col">'+inline(cell)+'</th>').join('')+'</tr>').join('')+'</table>';
    return lines.map(line=>{
      const heading=line.match(/^#{1,4} (.+)$/);
      return heading?'<h3>'+inline(heading[1])+'</h3>':'<p>'+inline(line.replace(/^> /,''))+'</p>';
    }).join('');
  }).join('');
}
function reading(a,target) {
  const text=park.readings[a.reading];
  if(text) target.innerHTML=readMarkdown(text);
  else target.textContent='본문을 불러오지 못했습니다. 원본 메뉴에서 글을 열 수 있어요.';
}
function ride(a) {
  const zone=zoneOf(a.zone);
  put(`${back()}<article class="sheet"><div class="row">${link('zone/'+zone.id,zone.title)}</div><p class="path">${escape(zone.name+' › '+a.name)}</p>
    <h1 tabindex="-1">${escape(a.title)}</h1><section class="panel" id="material" tabindex="-1"><p>${escape(a.body)}</p>
    ${a.lesson?`<p>${escape(a.lesson)}</p>`:''}
    ${a.missing?`<p class="pending"><strong>자료 준비 중</strong> · ${escape(a.missing)}</p>`:''}
    ${a.gallery?`<label for="work-select">관람할 이미지</label> <select id="work-select">${galleries[a.gallery].map(([name],i)=>`<option value="${i}">${escape(name)}</option>`).join('')}</select><figure><img class="work" id="work-image" alt=""></figure>`:''}
    ${a.booths?`<div class="grid">${a.booths.map(id=>tile(attractionOf(id))).join('')}</div>`:''}
    <div class="row"><a class="btn" href="${escape(new URL(a.path,original))}" target="_blank" rel="noopener noreferrer">원본 메뉴 열기</a>
    ${a.download?`<a class="btn" href="assets/${a.download[0]}" download>${escape(a.download[1])} 받기</a>`:''}
    ${a.related?link('ride/'+a.related,'근거 자료 읽기'):''}</div>
    ${a.reading?'<div id="reading" class="reading"><p>글을 불러오는 중입니다.</p></div>':''}</section>
    <section class="panel"><h2>${a.quiz?'읽기 퀴즈':a.order?'제작 순서 미션':'체험과 스탬프'}</h2>
    ${a.quiz?'<form id="quiz"></form>':a.order?'<p>카드를 선택하고 위아래 버튼으로 옮겨보세요.</p><ol class="sequence" id="sequence"></ol><div class="row"><button id="up">위로 이동</button><button id="down">아래로 이동</button><button id="check-order" class="primary">순서 확인</button></div>':`<div class="row">${a.play?`<button id="play">${escape(a.play)}</button>`:''}<button class="primary" id="finish">${a.gallery||a.booths?'관람 완료':a.play?'체험 완료':'읽기 완료'}</button></div>`}
    <p class="result" id="answer" role="status"></p>
    ${a.quiz||a.order?'<button id="review">글·작품 다시 보기</button>':''}
    <p class="result" id="completion" role="status">${progress[a.id]?.stamp?'✿ 스탬프를 모았어요.':''}</p>
    <div class="row">${link('stamps','내 스탬프 보기')}${link('map','공원 지도 돌아가기')}</div></section></article>`);
  gallery(a);
  if(a.reading) reading(a,document.querySelector('#reading'));
  if(a.quiz) quiz(a);
  if(a.order) sequence(a);
  document.querySelector('#review')?.addEventListener('click',()=>document.querySelector('#material').focus());
  document.querySelector('#finish')?.addEventListener('click',()=>complete(a,'완료!'));
  document.querySelector('#play')?.addEventListener('click',()=>{
    const choices=a.id==='idea'?['책상 위 정리 도구','가방에 걸 수 있는 표지','책갈피와 카드 거치대']:['첫 번째 팀','두 번째 팀','세 번째 팀'];
    document.querySelector('#answer').textContent='뽑은 카드 · '+choices[Math.floor(Math.random()*choices.length)];
  });
}
function render(focus=false) {
  disposeWorld?.();
  disposeWorld=undefined;
  const [page,id]=location.hash.slice(1).split('/');
  const z=zoneOf(id),a=attractionOf(id);
  if(page==='all') allPage();
  else if(page==='stamps') stamps();
  else if(page==='zone'&&z) zonePage(z);
  else if(page==='ride'&&a) ride(a);
  else if(page==='guide-map') home();
  else disposeWorld=mountWorld(main);
  for(const item of document.querySelectorAll('nav a')) {
    const active=item.hash==='#'+(page==='all'||page==='stamps'?page:'map');
    if(active) item.setAttribute('aria-current','page'); else item.removeAttribute('aria-current');
  }
  if(focus){window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});}
}
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();
  main.querySelector('h1').focus();
});
window.addEventListener('hashchange',()=>render(true));render();
})(window.onuriMakerPark);
