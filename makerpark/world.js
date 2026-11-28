((park) => {
'use strict';

const { avatars, places, classBooths, vendors, balloonColors } = park.worldData;
const { names, copy, labels } = park.worldLanguage;
const { makeScene } = park.scene;

const key='onuri-makerpark-world-v1';
let state={active:avatars[0].id,profiles:{}};
try {
  const saved=JSON.parse(localStorage.getItem(key));
  if(saved?.profiles&&avatars.some(a=>a.id===saved.active)) state=saved;
} catch {}
const avatar=()=>avatars.find(a=>a.id===state.active);
function profile(){
  return state.profiles[state.active]??={credits:0,candy:0,tools:{},stamps:{},bonuses:{}};
}
function save(){
  try {localStorage.setItem(key,JSON.stringify(state));return true;} catch {return false;}
}
const claimed=p=>places.filter(place=>p.stamps[place.id]).length;
const findPlace=id=>places.find(place=>place.id===id);
const findStall=id=>classBooths.find(booth=>booth.id===id)??vendors.find(vendor=>vendor.id===id);
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chevron='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" aria-hidden="true"><path d="m5 15 7-7 7 7" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const expandIcon='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function awardReadingCredit(id){
  const p=profile();
  if(p.bonuses[id]) return;
  p.bonuses[id]=true;p.credits+=1;save();
}

function rotateModel(canvas,angle) {
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  const units=Array.from({length:5},(_,layer)=>({y:layer*.17,size:1-layer*.09}));
  function project(x,y,z){
    const cx=x*Math.cos(angle)-z*Math.sin(angle),cz=x*Math.sin(angle)+z*Math.cos(angle);
    return [w/2+cx*68,h*.74-y*58+cz*28];
  }
  const faces=units.flatMap(({y,size},index)=>{
    const s=size/2;
    const path=[[-s,-s],[s,-s],[s,s],[-s,s]];
    return path.map(([x,z],i)=>{
      const [u,v]=path[(i+1)%4];
      return {points:[project(x,y,z),project(u,y,v),project(u,y+.16,v),project(x,y+.16,z)],
        depth:(x+u)*Math.sin(angle)+(z+v)*Math.cos(angle)+index*.025,color:i%2?'#cd6d51':'#b85848'};
    }).concat({points:path.map(([x,z])=>project(x,y+.16,z)),depth:.08+index*.04,color:'#ed9879'});
  });
  for(const {points,color} of faces.sort((a,b)=>a.depth-b.depth)){
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#9b574d';ctx.lineWidth=.65;ctx.stroke();
  }
}

function mountWorld(main){
  const pageLanguage=document.documentElement.lang;
  document.body.classList.add('park-world-mode');
  main.innerHTML=`<section class="world"><div class="world-head"><div><p class="world-kicker">ONURI MAKER PARK</p><h1 tabindex="-1">오누리 메이커파크</h1></div>
  <div class="world-hud"><button type="button" data-ui="avatar"></button><button type="button" data-ui="passport"></button><span id="world-credit"></span><select class="world-language" aria-label="Language / 언어"><option value="en">English</option><option value="ko">한글</option></select></div></div>
  <div class="world-layout"><div class="world-stage"><canvas class="world-canvas" aria-label="아바타가 걸어 다니는 3D 메이커파크"></canvas><div class="world-overlay"></div>
  <div class="world-location" id="world-location">공원 입구</div>
  <p class="world-camera-help">드래그로 회전 · 휠로 확대·축소</p>
  <div class="world-pad" aria-label="아바타 이동" hidden><button type="button" data-key="ArrowUp" aria-label="앞으로">${chevron}</button><div><button type="button" data-key="ArrowLeft" aria-label="왼쪽">${chevron}</button><button type="button" data-key="ArrowDown" aria-label="뒤로">${chevron}</button><button type="button" data-key="ArrowRight" aria-label="오른쪽">${chevron}</button></div></div>
  <div id="world-toast" class="world-toast" role="status"></div></div>
  <div class="world-controls" aria-label="지도 표시 설정"><button type="button" data-ui="panel" aria-controls="world-side" aria-expanded="false">공원 메뉴</button><button type="button" data-ui="labels" aria-pressed="true" aria-label="지도 이름표 표시">이름표</button><div class="world-atmosphere" role="group" aria-label="계절과 시간대">
  <label><select data-atmosphere="season" aria-label="계절"><option value="auto">현재 계절</option><option value="spring">봄</option><option value="summer">여름</option><option value="autumn">가을</option><option value="winter">겨울</option></select></label>
  <label><select data-atmosphere="period" aria-label="시간"><option value="auto">현재 시간</option><option value="morning">아침</option><option value="day">낮</option><option value="evening">저녁</option><option value="night">밤</option></select></label></div>
  </div>
  <div class="world-compass" role="img" aria-label="나침반, 북쪽 0도"><div class="world-compass-card" aria-hidden="true"><b>N</b><span>E</span><span>S</span><span>W</span><i></i></div><small aria-hidden="true">0°</small></div>
  <div class="world-map-actions" aria-label="지도 보기 및 이동"><button type="button" data-ui="walk" aria-pressed="false">걷기 모드</button><button type="button" data-ui="overview">전체 보기</button><button type="button" data-ui="fullscreen" class="world-fullscreen" aria-label="전체 화면">${expandIcon}</button></div>
  <aside class="world-side" id="world-side" aria-label="공원 메뉴" hidden>
  <details class="world-instructions"><summary>조작 방법</summary><p class="world-help">드래그해 시점을 돌리고 휠로 확대하거나 축소하세요. 걷기 모드에서는 바닥을 눌러 이동할 수 있어요. 방향키·WASD로도 걸을 수 있습니다.</p></details>
  <div id="world-destinations" class="world-destinations"></div>
  <div id="world-nearby" class="world-nearby"></div>
  <div class="world-archive-links"><a class="world-archive" href="#guide-map">수채화 안내 지도</a><a class="world-archive" href="#all">전체 어트랙션</a></div></aside></div>
  <dialog id="world-dialog" aria-labelledby="world-dialog-title"><div class="dialog-bar"><h2 id="world-dialog-title"></h2><form method="dialog"><button aria-label="닫기">닫기</button></form></div><div id="world-dialog-body"></div></dialog></section>`;
  const canvas=main.querySelector('canvas');
  const dialog=main.querySelector('dialog');
  const body=main.querySelector('#world-dialog-body');
  const toast=main.querySelector('#world-toast');
  const destinationList=main.querySelector('#world-destinations');
  const nearby=main.querySelector('#world-nearby');
  const world=main.querySelector('.world');
  const side=main.querySelector('#world-side');
  const panelButton=main.querySelector('[data-ui=panel]');
  const labelButton=main.querySelector('[data-ui=labels]');
  const fullscreenButton=main.querySelector('[data-ui=fullscreen]');
  const walkButton=main.querySelector('[data-ui=walk]');
  const pad=main.querySelector('.world-pad');
  const compass=main.querySelector('.world-compass');
  const compassCard=compass.querySelector('.world-compass-card');
  const compassText=compass.querySelector('small');
  let panelOpen=false,walking=false,lastBearing;
  const storagePref='onuri-makerpark-display-v1';
  let preferences={labels:true,season:'auto',period:'auto',language:'en'};
  try {const previous=JSON.parse(localStorage.getItem(storagePref));if(previous)preferences={...preferences,...previous};} catch {}
  if(preferences.language!=='ko')preferences.language='en';
  const translated=new WeakMap();
  const english=()=>preferences.language==='en';
  const t=(ko,en=labels[ko])=>english()?(en??ko):ko;
  const nameFor=item=>t(item.name,item.en??names[item.id]);
  function localize(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      const original=translated.get(node)??node.data;
      if(!Object.hasOwn(labels,original.trim()))continue;
      translated.set(node,original);
      node.data=original.replace(original.trim(),t(original.trim()));
    }
    root.querySelectorAll('[aria-label]').forEach(el=>{
      const original=translated.get(el)??el.getAttribute('aria-label');
      if(!Object.hasOwn(labels,original))return;
      translated.set(el,original);
      el.setAttribute('aria-label',t(original));
    });
  }
  const languageSelect=main.querySelector('.world-language');
  languageSelect.value=preferences.language;
  document.documentElement.lang=preferences.language;
  languageSelect.addEventListener('change',()=>{
    preferences.language=languageSelect.value;
    document.documentElement.lang=preferences.language;
    savePreferences();localize(world);hud();fullState();scene?.refreshLabels();
    lastBearing=undefined;
  });
  localize(world);
  function savePreferences(){
    try {localStorage.setItem(storagePref,JSON.stringify(preferences));} catch {}
  }
  for(const select of main.querySelectorAll('[data-atmosphere]')){
    const key=select.dataset.atmosphere;
    select.value=preferences[key];
    if(!select.value)select.value=preferences[key]='auto';
    select.addEventListener('change',()=>{preferences[key]=select.value;savePreferences();});
  }
  function display(){
    side.hidden=!panelOpen;
    panelButton.setAttribute('aria-expanded',String(panelOpen));
    labelButton.setAttribute('aria-pressed',String(preferences.labels));
    walkButton.setAttribute('aria-pressed',String(walking));
    pad.hidden=!walking;
    world.classList.toggle('world-walking',walking);
    world.classList.toggle('world-labels-off',!preferences.labels);
  }
  function heading(yaw){
    const bearing=((Math.round(-yaw*180/Math.PI)%360)+360)%360;
    if(bearing===lastBearing)return;
    lastBearing=bearing;
    compassCard.style.rotate=`${-bearing}deg`;
    compassText.textContent=`${bearing}°`;
    const i=Math.round(bearing/45)%8;
    const direction=['북','북동','동','남동','남','남서','서','북서'][i];
    compass.setAttribute('aria-label',t(`나침반, ${direction}쪽 ${bearing}도`,`Compass: ${['north','northeast','east','southeast','south','southwest','west','northwest'][i]} ${bearing} degrees`));
  }
  function fullState(){
    const fullscreen=document.fullscreenElement===world;
    fullscreenButton.setAttribute('aria-label',t(fullscreen?'전체 화면 닫기':'전체 화면'));
    fullscreenButton.setAttribute('aria-pressed',String(fullscreen));
  }
  fullscreenButton.hidden=!world.requestFullscreen||!document.fullscreenEnabled;
  document.addEventListener('fullscreenchange',fullState);
  display();
  let scene,activePlace='',toastTimer;
  function message(text){
    toast.textContent=t(text);toast.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),4400);
  }
  function show(title,html){
    main.querySelector('#world-dialog-title').textContent=t(title);
    body.innerHTML=html;
    localize(body);
    if(!dialog.open)dialog.showModal();
  }
  function greeting(color,symbol='✦',message='어서오세요, 뭘 도와드릴까요?'){
    return `<div class="npc-balloon"><span class="npc-face" style="--place:${color}" aria-hidden="true">${symbol}</span><p>${message}</p></div>`;
  }
  const keepWalking='<button type="button" data-close-dialog>계속 둘러보기</button>';
  function hud(){
    const p=profile();
    main.querySelector('[data-ui=avatar]').innerHTML=`<i style="--avatar:${avatar().shirt}"></i>${safe(nameFor(avatar()))} ${t('아바타','Avatar')}`;
    main.querySelector('[data-ui=passport]').textContent=`${t('스탬프','Stamps')} ${claimed(p)} / ${places.length}`;
    main.querySelector('#world-credit').textContent=t(`${p.credits} 크레딧`,`${p.credits} credits`);
    destinationList.innerHTML=[...places,...vendors].map(place=>`<button type="button" data-place="${place.id}"><i style="--place:${place.color}"></i><span>${safe(nameFor(place))}</span>${p.stamps[place.id]?'<span aria-label="완료">✓</span>':''}</button>`).join('');
    destinationList.insertAdjacentHTML('beforeend', `<h3 class="world-class-heading">Class. 수업 부스</h3>${classBooths.map(booth=>`<button type="button" data-booth="${booth.id}"><i style="--place:${booth.color}"></i><span>${safe(nameFor(booth))}</span></button>`).join('')}`);
    localize(destinationList);
    zone(activePlace);
  }
  function zone(id){
    activePlace=id;
    const place=findPlace(id);
    const stall=findStall(id);
    main.querySelector('#world-location').textContent=place||stall?nameFor(place??stall):t('공원 입구·산책로');
    if(place){
      const p=profile();
      nearby.innerHTML=`<h3>${safe(place.building)}</h3><button type="button" data-stall="${place.id}">직원에게 말 걸기</button><div class="world-tools">${place.actions.map(([id,label])=>`<button data-tool="${id}">${safe(t(label,names[id]))}${p.tools[place.id]?.[id]?' ✓':''}</button>`).join('')}</div><a href="#zone/${place.id}">글·작품·수업 자료 열기</a>`;
    } else if(stall) nearby.innerHTML=`<button type="button" data-stall="${stall.id}">직원에게 말 걸기</button>`;
    else nearby.innerHTML='';
    localize(nearby);
  }
  function passport(celebrate=false){
    const p=profile(),done=claimed(p),licensed=done===places.length;
    show(celebrate?'메이커 면허증을 받았어요!':'내 메이커 여권',`
      ${licensed?`<div class="world-license"><div class="world-medal" style="--avatar:${avatar().shirt}" aria-hidden="true">★</div><div><strong>오누리 메이커 면허증</strong><p>${safe(nameFor(avatar()))} · ${t('완주 메달','Completion Medal')}</p><span>${celebrate?t('축하해요! 공원의 모든 구역을 체험했어요.','Congratulations! You explored every area.'):t('다섯 구역 체험 완료','All five areas complete')}</span></div></div>`:''}
      <p>구역 안의 도구와 작품 안내를 모두 들으면 구역 스탬프를 받습니다.</p>
      <ul class="world-checks">${places.map(place=>`<li><span>${safe(nameFor(place))}</span><strong>${p.stamps[place.id]?'완료':Object.keys(p.tools[place.id]??{}).length+' / '+place.actions.length}</strong></li>`).join('')}</ul>
      <p>${t(`${p.credits} 크레딧 · 솜사탕 ${p.candy}개 · 커피 ${p.food?.coffee??0}잔 · 핫도그 ${p.food?.hotdog??0}개`,`${p.credits} credits · Cotton candy: ${p.candy} · Coffee: ${p.food?.coffee??0} · Hot dogs: ${p.food?.hotdog??0}`)}</p><a href="#stamps" data-close-dialog>글·작품 스탬프 보기</a>`);
  }
  function choose(){
    show('아바타 고르기',`<p>아바타마다 체험, 크레딧, 면허증과 메달이 따로 기록됩니다.</p><div class="world-avatars">${avatars.map(a=>`<button data-avatar="${a.id}" aria-pressed="${a.id===state.active}"><i style="--avatar:${a.shirt}"></i><span>${safe(nameFor(a))} <small>${safe(a.role)}</small></span></button>`).join('')}</div>`);
  }
  function foodMenu(shop,purchased=false){
    const p=profile();
    const [ko,en]=shop.product;
    const count=shop.id==='candy'?p.candy:(p.food?.[shop.id]??0);
    show(nameFor(shop),`${greeting(shop.color,shop.icon,purchased?t('구매했어요. 맛있게 드세요!','Enjoy your park treat!'):undefined)}
      <div class="world-buy"><button type="button" data-buy="${shop.id}" ${p.credits<shop.price?'disabled':''}>${t(`${ko} 사기 · ${shop.price}크레딧`,`Buy ${en.toLowerCase()} · ${shop.price} credits`)}</button>${keepWalking}<span>${t(`잔액 ${p.credits}크레딧 · 구매 ${count}개`,`Balance: ${p.credits} credits · Purchased: ${count}`)}</span></div>`);
  }
  function findAction(place,id){return place?.actions.find(a=>a[0]===id);}
  function inspect(place,id){
    const action=findAction(place,id);
    if(!action)return;
    const [_,name,speech,image]=action;
    const p=profile(),complete=p.tools[place.id]?.[id];
    show(t(name,names[id]),`<div class="npc-balloon"><span class="npc-face" style="--place:${place.color}" aria-hidden="true">✦</span><div><strong>${t('부스 직원','Booth Host')}</strong><p>${safe(t(speech,copy[id]))}</p></div></div>
      ${image?`<img class="world-exhibit" src="assets/${image}" alt="${safe(name)}">`:''}
      ${id==='printer'?'<div class="world-model"><canvas width="250" height="142" aria-label="회전하는 3D 출력 모형"></canvas><div><button data-rotate="-1">왼쪽으로 회전</button><button data-rotate="1">오른쪽으로 회전</button></div></div>':''}
      <button type="button" class="world-primary" data-experience="${id}" data-room="${place.id}">${complete?'체험 완료 · 계속 둘러보기':'체험 완료 · 1크레딧 받기'}</button>`);
    const model=body.querySelector('.world-model canvas');
    if(model){body.dataset.angle='.5';rotateModel(model,.5);}
  }
  function earn(place,id){
    if(!findAction(place,id))return;
    const p=profile(),tools=p.tools[place.id]??={};
    let final=false, gained='';
    if(!tools[id]){
      tools[id]=true;p.credits+=1;gained=t('체험 완료 · +1크레딧','Activity complete · +1 credit');
      if(place.actions.every(([key])=>tools[key])){
        p.stamps[place.id]=true;p.credits+=2;
        gained=t(place.name+' 스탬프 · 총 +3크레딧',nameFor(place)+' stamp · +3 credits');
        final=claimed(p)===places.length;
      }
      if(!save()) gained+=t(' · 현재 방문 동안 저장',' · Saved for this visit');
      hud();
    }
    if(final)passport(true);else dialog.close();
    if(gained)message(gained);
  }
  function travel(id){
    const p=findPlace(id)??findStall(id);
    if(!p)return;
    if(scene)scene.travel(p.x,p.z,findPlace(id)?()=>message(t(p.name+' 도착','Arrived at '+nameFor(p))):undefined);
    else {zone(id);stallMenu(id);}
  }
  function marker(m){
    if(m.kind==='booth')stallMenu(m.id);
    if(m.kind==='tool')inspect(findPlace(m.place),m.id);
    if(m.kind==='place')travel(m.id);
    if(m.kind==='vendor')stallMenu(m.id);
  }
  function stallMenu(id){
    const shop=findStall(id);
    if(shop?.product){foodMenu(shop);return;}
    const place=findPlace(id);
    if(place){
      show(place.building,`${greeting(place.color)}<div class="world-buy">${place.actions.map(([action,label])=>`<button type="button" data-tool="${action}" data-room="${place.id}">${safe(t(label,names[action]))}</button>`).join('')}<a class="btn" href="#zone/${place.id}" data-close-dialog>수업 자료 보기</a>${keepWalking}</div>`);
      return;
    }
    if(id==='balloons'){
      const colors={peach:'복숭아빛',mint:'민트빛',gold:'금빛'};
      const shop=findStall(id);
      show(nameFor(shop),`${greeting(shop.color,'🎈')}<div class="world-buy">
        ${Object.entries(colors).map(([key,label])=>`<button type="button" data-balloon="${key}"><i class="world-color-dot" style="--balloon-color:${balloonColors[key]}" aria-hidden="true"></i>${label} 풍선 받기</button>`).join('')}
        ${profile().balloon?'<button type="button" data-balloon="none">풍선 돌려주기</button>':''}
        ${keepWalking}</div>`);
      return;
    }
    const booth=findStall(id);
    if(!booth)return;
    show(nameFor(booth),`${greeting(booth.color)}<div class="world-buy"><button type="button" class="world-primary" data-confirm-booth="${booth.id}">${safe(booth.activity)}</button>${keepWalking}</div>`);
  }
  function confirmBooth(id){
    const booth=classBooths.find(entry=>entry.id===id);
    if(!booth)return;
    const target=new URL(booth.path,park.parkData.original);
    show('해당 메뉴로 이동하시겠습니까?', `<p>${safe(booth.activity)}</p><div class="world-booth-actions"><button type="button" data-close-dialog autofocus>취소</button><a class="btn world-primary" href="${safe(target)}">이동</a></div>`);
    body.querySelector('[data-close-dialog]').focus();
  }
  function action(event){
    const button=event.target.closest('button,a[data-close-dialog]');
    if(!button)return;
    const {ui,place,tool,booth,stall,confirmBooth:confirmation,balloon,avatar:selection,experience,room,rotate}=button.dataset;
    if(ui==='passport')passport();
    if(ui==='avatar')choose();
    if(ui==='panel'){panelOpen=!panelOpen;display();}
    if(ui==='labels'){preferences.labels=!preferences.labels;display();savePreferences();}
    if(ui==='walk'){walking=!walking;display();}
    if(ui==='overview')scene?.overview();
    if(ui==='fullscreen'){
      const change=document.fullscreenElement===world?document.exitFullscreen():world.requestFullscreen();
      change.catch(()=>message('이미 화면을 가득 채운 상태입니다.'));
    }
    if(place)travel(place);
    if(booth||stall)stallMenu(booth??stall);
    if(confirmation)confirmBooth(confirmation);
    if(balloon==='none'||Object.hasOwn(balloonColors,balloon)){
      profile().balloon=balloon==='none'?null:balloon;
      save();dialog.close();
      message(balloon==='none'?'풍선을 돌려줬어요.':'풍선을 들고 공원을 산책해 보세요!');
    }
    if(tool)inspect(findPlace(room??activePlace),tool);
    if(experience)earn(findPlace(room),experience);
    if(selection&&avatars.some(a=>a.id===selection)){
      state.active=selection;save();hud();dialog.close();message(t(avatar().name+' 아바타로 산책을 시작했어요.','Now exploring as '+nameFor(avatar())+'.'));
    }
    if(button.dataset.buy){
      const shop=vendors.find(entry=>entry.id===button.dataset.buy);
      const p=profile();
      if(shop?.product&&p.credits>=shop.price){
        p.credits-=shop.price;
        if(shop.id==='candy')p.candy+=1;
        else {p.food??={};p.food[shop.id]=(p.food[shop.id]??0)+1;}
        save();hud();foodMenu(shop,true);
      }
    }
    if(rotate){
      const angle=Number(body.dataset.angle)+Number(rotate)*.5;
      body.dataset.angle=angle;rotateModel(body.querySelector('.world-model canvas'),angle);
    }
    if(button.hasAttribute('data-close-dialog'))dialog.close();
  }
  main.addEventListener('click',action);
  scene=makeScene(canvas,main.querySelector('.world-overlay'),{avatar,atmosphere:()=>preferences,balloon:()=>profile().balloon,paused:()=>dialog.open,walkMode:()=>walking,onHeading:heading,onMarker:marker,onZone:zone,onApproach:id=>{if(!dialog.open)stallMenu(id);},markerLabel:m=>t(m.name,findStall(m.id)?.en??names[m.id])});
  if(!scene)message('3D 화면을 표시할 수 없습니다. 오른쪽 구역 버튼으로 체험하세요.');
  for(const button of main.querySelectorAll('[data-key]')){
    const code=button.dataset.key;
    button.addEventListener('pointerdown',event=>{button.setPointerCapture(event.pointerId);scene?.walk(code);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>scene?.release(code));
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();scene?.walk(code);}});
    button.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter')scene?.release(code);});
  }
  hud();
  return ()=>{
    scene?.stop();main.removeEventListener('click',action);clearTimeout(toastTimer);
    document.removeEventListener('fullscreenchange',fullState);
    document.body.classList.remove('park-world-mode');
    document.documentElement.lang=pageLanguage;
  };
}

park.world = { awardReadingCredit, mountWorld };
})(window.onuriMakerPark ??= {});
