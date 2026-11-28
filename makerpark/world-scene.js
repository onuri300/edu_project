((park) => {
'use strict';

const { places, classBooths, vendors, balloonColors, exhibits, avatars } = park.worldData;
const stalls=[...classBooths,...vendors];
const { buildParkDetails, drawParkMotion, balloon, carousel, wheel, lanterns } = park.details;
const seasons={
  spring:{sky:['#9ecbe5','#f6eced','#c8d8a9'],grass:'#adc68a',leaves:'#c8a388'},
  summer:{sky:['#6caad1','#e4f0ed','#aac48b'],grass:'#88a86a',leaves:'#60824d'},
  autumn:{sky:['#92b3d1','#f5debe','#d4be94'],grass:'#b2a16d',leaves:'#bc8050'},
  winter:{sky:['#94aec6','#e5eaf0','#dce5e7'],grass:'#d9e1df',leaves:'#879a95'}
};
const daylight={
  morning:{sky:['#96b7d9','#fbe1d0','#f3d4ae'],blend:.55,light:[1.06,1.00,.94],sun:[.22,.26],glow:'#ffdab491'},
  day:{blend:0,light:[1,1,1],sun:[.82,.13],glow:'#fff7dcab'},
  evening:{sky:['#5f679a','#d58b96','#f7be83'],blend:.7,light:[.92,.76,.72],sun:[.81,.4],glow:'#ffc084bd'},
  night:{sky:['#111831','#233151','#40526a'],blend:.94,light:[.29,.37,.53],sun:[.79,.17],glow:'#d2e2ff54'}
};
function mixColor(a,b,weight){
  return '#'+[1,3,5].map(i=>{
    const start=parseInt(a.slice(i,i+2),16),end=parseInt(b.slice(i,i+2),16);
    return Math.round(start+(end-start)*weight).toString(16).padStart(2,'0');
  }).join('')+a.slice(7);
}
function currentAtmosphere(prefs,date=new Date()){
  const month=date.getMonth(),hour=date.getHours();
  const season=seasons[prefs.season]??Object.values(seasons)[Math.floor(((month+10)%12)/3)];
  const period=Object.hasOwn(daylight,prefs.period)?prefs.period:hour<6||hour>=20?'night':hour<10?'morning':hour<17?'day':'evening';
  return {season,period,lighting:daylight[period]};
}
const roadX=z=>2.65*Math.sin((z-18)*.205)*Math.sin((z+23)*.11);
const pinwheels=Array.from({length:18},(_,i)=>{
  const z=15-Math.floor(i/2)*4.1+(i%2)*.38;
  return {x:roadX(z)+(i%2?1:-1)*2.18,z};
});

function geometry(scene) {
  const face=(points,color)=>scene.push({points,color});
  const shades=shade;
  function box(x,y,z,w,h,d,color) {
    const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2,t=y+h;
    face([[a,y,e],[b,y,e],[b,t,e],[a,t,e]],color);
    face([[b,y,c],[a,y,c],[a,t,c],[b,t,c]],shades(color,.78));
    face([[a,y,c],[a,y,e],[a,t,e],[a,t,c]],shades(color,.87));
    face([[b,y,e],[b,y,c],[b,t,c],[b,t,e]],shades(color,.72));
    face([[a,t,e],[b,t,e],[b,t,c],[a,t,c]],shades(color,1.14));
  }
  function roof(x,y,z,w,d,color,h=.85) {
    const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2;
    face([[a,y,e],[b,y,e],[x,y+h,e]],color);
    face([[a,y,c],[b,y,c],[x,y+h,c]],shades(color,.85));
    face([[a,y,e],[x,y+h,e],[x,y+h,c],[a,y,c]],shades(color,1.12));
    face([[x,y+h,e],[b,y,e],[b,y,c],[x,y+h,c]],shades(color,.72));
  }
  function disc(x,y,z,rx,rz,h,color,sides=10,topScale=1) {
    const base=[],top=[];
    for(let i=0;i<sides;i++){
      const a=i*Math.PI*2/sides;
      const dx=Math.cos(a)*rx,dz=Math.sin(a)*rz;
      base.push([x+dx,y,z+dz]);
      top.push([x+dx*topScale,y+h,z+dz*topScale]);
    }
    face(top,shades(color,1.08));
    for(let i=0;i<sides;i++){
      const j=(i+1)%sides;
      face([base[i],base[j],top[j],top[i]],shades(color,.87+.18*Math.sin(i*Math.PI*2/sides)));
    }
  }
  function beam(a,b,width,color){
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
    const nx=-dy/len*width/2,ny=dx/len*width/2;
    face([[a[0]+nx,a[1]+ny,a[2]+width/2],[b[0]+nx,b[1]+ny,b[2]+width/2],[b[0]-nx,b[1]-ny,b[2]+width/2],[a[0]-nx,a[1]-ny,a[2]+width/2]],color);
    face([[a[0]+nx,a[1]+ny,a[2]-width/2],[b[0]+nx,b[1]+ny,b[2]-width/2],[b[0]+nx,b[1]+ny,b[2]+width/2],[a[0]+nx,a[1]+ny,a[2]+width/2]],shades(color,.8));
  }
  function tree(x,z,index) {
    const size=.81+(index%7)*.083;
    box(x,0,z,.22,1.55*size,.25,'#83664d');
    const palette=['#527449','#647c49','#768943','#987969','#4f7b59'];
    const color=palette[index%palette.length];
    const start=scene.length;
    if(index%6===0){
      for(let i=0;i<3;i++)disc(x,(1.05+i*.55)*size,z,(1-i*.19)*size,(.87-i*.15)*size,.94*size,color,7,.12);
    } else {
      disc(x,1.18*size,z,1.03*size,.88*size,.75*size,color,11,.9);
      disc(x+.14,1.9*size,z,.87*size,.76*size,.54*size,color,11,.51);
      disc(x-.24,1.35*size,z+.42,.59*size,.48*size,.48*size,shade(color,.92),9,.72);
      disc(x+.48,1.56*size,z-.25,.49*size,.46*size,.53*size,shade(color,1.06),9,.61);
    }
    for(let i=start;i<scene.length;i++)scene[i].surface='leaves';
  }
  function person(x,z,look,walking=0,heading=0) {
    const parts=[];
    const {box,disc}=geometry(parts);
    const accent=look.accent??'#ead5af';
    const foot=(side,pace)=>{
      box(side*.13,.06,pace,.16,.29,.18,'#53616a');
      box(side*.13,.025,pace+.052,.20,.095,.24,'#453733');
      box(side*.13,.017,pace+.052,.21,.032,.24,'#d1bda1');
    };
    foot(-1,walking);foot(1,-walking);
    disc(0,.31,0,.235,.161,.43,look.shirt,10,.9);
    for(const side of [-1,1]){
      const swing=side*walking;
      box(side*.25,.43,swing,.13,.255,.145,look.shirt);
      disc(side*.25,.395,swing,.064,.066,.068,look.skin,8,.88);
      box(side*.084,.898,.156,.032,.038,.020,'#312a28');
      box(side*.122,.846,.136,.046,.023,.02,'#cc856c');
    }
    disc(0,.735,0,.183,.163,.318,look.skin,12,.92);
    disc(0,1.027,-.025,.205,.185,.096,look.hair,12,.84);
    box(0,.856,-.138,.32,.19,.09,look.hair);
    disc(0,.704,0,.209,.18,.08,accent,12,.95);
    box(.092,.56,.144,.093,.175,.04,accent);
    box(0,.847,.157,.045,.010,.023,'#854d43');
    switch(look.style){
      case 'braids':
        for(const side of [-1,1]) {
          box(side*.18,.69,-.073,.086,.24,.094,look.hair);
          box(side*.18,.68,-.073,.09,.035,.10,accent);
        }
        break;
      case 'bob':
        for(const side of [-1,1])box(side*.168,.817,-.055,.078,.22,.19,look.hair);
        break;
      case 'bun':
        disc(0,1.092,-.11,.10,.106,.14,look.hair,11,.69);
        disc(0,1.08,-.11,.10,.095,.027,accent,10);
        break;
      case 'cap':
        disc(0,1.07,0,.202,.18,.112,look.shirt,12,.76);
        box(0,1.063,.183,.28,.029,.16,look.shirt);
        break;
      default:
        disc(0,1.083,-.02,.202,.18,.132,look.shirt,12,.72);
        disc(0,1.215,-.03,.063,.063,.065,accent,9,.60);
    }
    const sin=Math.sin(heading),cos=Math.cos(heading);
    for(const part of parts){
      face(part.points.map(([px,py,pz])=>[x+px*cos+pz*sin,py,z-px*sin+pz*cos]),part.color);
    }
  }
  return {box,roof,tree,person,face,disc,beam};
}

const shadeCache=new Map();
function shade(color,multiplier){
  const key=color+Math.round(multiplier*100);
  if(!shadeCache.has(key)){
    shadeCache.set(key,'#'+color.slice(1,7).match(/../g).map(pair=>Math.min(255,Math.round(parseInt(pair,16)*multiplier)).toString(16).padStart(2,'0')).join('')+color.slice(7));
  }
  return shadeCache.get(key);
}

function makeScene(canvas,overlay,options) {
  const ctx=canvas.getContext('2d');
  if(!ctx) return null;
  const scenery=[], grounds=[];
  const shapes=geometry(scenery);
  const {box,roof,tree,person,face}=shapes;
  const addGround=(x,z,w,d,color,surface)=>grounds.push({points:[[x-w/2,0,z-d/2],[x+w/2,0,z-d/2],[x+w/2,0,z+d/2],[x-w/2,0,z+d/2]],color,surface});
  const look={shirt:'#e9bf77', hair:'#473b35',skin:'#e3a173'};
  const markers=[];
  const pathSegments=[];
  const props=[{x:carousel.x,z:carousel.z,r:2.8}];
  const bricks=['#c8ad8c','#cfb597','#c3a789','#d3ba9a','#cab295'];
  function reserve(x,z,r){
    if(props.some(p=>Math.hypot(x-p.x,z-p.z)<r+p.r+.14))return false;
    for(const {a,b,width} of pathSegments){
      const dx=b[0]-a[0],dz=b[1]-a[1];
      const along=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
      if(Math.hypot(x-a[0]-dx*along,z-a[1]-dz*along)<width/2+r+.15)return false;
    }
    props.push({x,z,r});
    return true;
  }
  for(let x=-30;x<=30;x+=5) for(let z=-40;z<=35;z+=5) {
    const light=1+Math.sin(x*.27+z*.19)*.035+Math.cos(z*.31-x*.2)*.025;
    addGround(x,z,5.02,5.02,shade('#96ad74',light),'grass');
  }
  for(let i=0;i<430;i++) {
    const x=(i*19.73)%58-29,z=(i*13.91)%70-37;
    addGround(x,z,.16+(i%7)*.09,.11+(i%5)*.07,i%3===0?'#b2bf8542':'#4e714021','grass');
  }
  function path(points,width){
    const banks=points.map(([x,z],i)=>{
      const a=points[Math.max(i-1,0)],b=points[Math.min(i+1,points.length-1)];
      const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz)||1;
      return offset=>[x+dz/length*offset,0,z-dx/length*offset];
    });
    for(let i=1;i<banks.length;i++){
      const a=banks[i-1],b=banks[i];
      pathSegments.push({a:points[i-1],b:points[i],width});
      const rowLength=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);
      if(rowLength<.001)continue;
      const inset=width/2-.085;
      const grout=Math.min(.09,.022/rowLength);
      const blend=(offset,t)=>{
        const start=a(offset),end=b(offset);
        return [start[0]+(end[0]-start[0])*t,0,start[2]+(end[2]-start[2])*t];
      };
      grounds.push({points:[a(-width/2),b(-width/2),b(width/2),a(width/2)],color:'#9b8975',outline:false});
      for(let tile=-1;tile<Math.ceil(width/.61);tile++){
        const left=-inset+(tile+(i%2)*.5)*.61;
        const from=Math.max(-inset,left+.017),to=Math.min(inset,left+.61-.017);
        if(to<=from)continue;
        grounds.push({points:[blend(from,grout),blend(from,1-grout),blend(to,1-grout),blend(to,grout)],color:bricks[(i*7+tile*3+10)%bricks.length],outline:false});
      }
    }
  }
  path(Array.from({length:105},(_,i)=>{const z=-30+i*.5;return [roadX(z),z];}),3.6);
  for(const {x,z} of [...places,...vendors,...classBooths.filter(booth=>booth.id==='kids-mbti')]){
    if(x===0)continue;
    const entry=z+(z<0?1.5:-1.7);
    const start=roadX(entry),bend=Math.sign(x)*1.5;
    path(Array.from({length:31},(_,i)=>{
      const u=i/30;
      return [start+(x-start)*u,entry+(z-entry)*u+Math.sin(Math.PI*u)*bend];
    }),2.45);
  }
  path(Array.from({length:17},(_,i)=>[-13+i*.375,8+Math.sin(Math.PI*i/16)*.62]),2.3);
  for(const {x,z} of pinwheels){
    box(x,0,z,.055,.61,.055,'#716357');
    shapes.disc(x,0,z,.115,.115,.09,'#93816b',8,.85);
  }
  for(const p of places){
    addGround(p.x,p.z-1.8,8,7.2,'#e9d7a9');
    if(p.id==='vibe'){
      const z=p.z-2.25;
      for(const exhibit of exhibits){
        const x=p.x+exhibit.offset;
        box(x,.07,z-1.05,2.23,1.94,.13,exhibit.wall);
        box(x-.99,.07,z-.42,.13,1.94,1.25,exhibit.wall);
        roof(x,1.97,z-.94,2.36,.48,exhibit.color,.25);
        for(let row=0;row<3;row++)for(let col=0;col<5;col++){
          const px=x-.73+col*.37+(row%2)*.08,y=.87+row*.34;
          if(exhibit.pattern==='botanical'){
            face([[px-.08,y,z-.976],[px+.10,y+.17,z-.976],[px+.03,y-.015,z-.976]],'#8eb1a0');
          }else if(exhibit.pattern==='circles'){
            shapes.disc(px,y,z-.975,.055,.018,.11,'#a9b7db',9,.62);
          }else {
            box(px,y,z-.975,.16,.18,.017,'#d5a77d');
            roof(px,y+.18,z-.975,.16,.02,'#d5a77d',.075);
          }
        }
        box(x,.08,z+.12,1.52,.62,.61,exhibit.color);
        box(x,.70,z+.12,1.6,.075,.67,'#dfc7a2');
        for(let i=0;i<3;i++){
          const px=x+(i-1)*.43,pz=z+.12;
          const shade=['#dc9aaa','#9ebcbb','#dfbd77'][i];
          if(exhibit.action==='resin'){
            shadesForResin(px,pz,shade);
          }else if(exhibit.action==='keyring'){
            shapes.disc(px,.79,pz,.105,.085,.16,shade,14,.89);
            shapes.beam([px-.041,.965,pz],[px+.041,1.03,pz],.025,'#bd9c64');
            shapes.beam([px+.041,1.03,pz],[px+.06,.96,pz],.025,'#bd9c64');
          }else{
            box(px,.78,pz,.21,.21,.17,shade);
            box(px,1,pz,.19,.17,.17,'#ebe1c8');
            box(px+(i===0?.01:0),1.17,pz,.06,i===1?.12:.055,.07,shade);
            box(px,.78,pz+.1,.28,.035,.23,'#665b61');
          }
        }
        person(x+.71,z+.68,{...look,shirt:exhibit.color});
        const label=p.actions.find(([id])=>id===exhibit.action)[1];
        markers.push({x,y:1.85,z:z+.22,name:label,id:exhibit.action,place:p.id,kind:'tool'});
      }
      markers.push({x:p.x,y:2.67,z:z-.5,name:p.name,id:p.id,kind:'place'});
      continue;
    }
    // Open-front rooms leave the tools and staff visible from the path.
    box(p.x,0,p.z-4.35,7.3,2.1,.37,'#fff1d4');
    box(p.x-3.45,0,p.z-2.9,.35,2.1,3.2,'#f3e2bb');
    for(let i=-3;i<=3;i++)box(p.x+i*.68,1.11,p.z-4.154,.21,.52,.035,shade(p.color,1.15));
    const roofZ=p.z-4.32;
    box(p.x,2.08,roofZ,7.8,.16,1.1,p.color);
    roof(p.x,2.24,roofZ,7.8,1.2,p.color,.48);
    box(p.x,1.87,p.z-4.08,5.45,.15,.12,p.color);
    for(const side of [-1,1]){
      box(p.x+side*2.95,.2,p.z-4.08,.6,1.4,.10,p.color);
      box(p.x+side*2.92,0,p.z-.9,.24,1.3,.27,p.color);
      box(p.x+side*2.92,1.3,p.z-.9,.38,.12,.36,'#efcd7b');
      box(p.x+side*2.9,1.02,p.z-.78,.29,.25,.2,'#ffdf8b');
      box(p.x+side*3.32,0,p.z-.68,.41,.33,.37,'#b07761');
      shapes.disc(p.x+side*3.32,.33,p.z-.68,.25,.23,.24,'#7b9c65',7,.62);
    }
    box(p.x,0,p.z+.9,7.15,.11,1.9,'#e2bb81');
    person(p.x-2.4,p.z-.43,{...look,shirt:p.color});
    markers.push({x:p.x,y:2.95,z:roofZ,name:p.name,id:p.id,kind:'place'});
    p.actions.forEach(([id,name],i)=>{
      const x=p.x+(i-(p.actions.length-1)/2)*1.85+.4,z=p.z-2.3;
      box(x,0,z,1.5,.64,.94,'#886650');
      box(x,.64,z,1.55,.09,1.0,'#c99861');
      if(id==='printer'){
        for(const side of [-1,1]) box(x+side*.39,.73,z,.12,.79,.69,'#374e64');
        box(x,1.42,z,.91,.10,.70,'#475e79');
        box(x,.76,z,.26,.22,.27,'#e47651');
      } else if(id==='laser'){
        box(x,.73,z,1.03,.33,.74,'#3d586c');box(x,1.05,z,.92,.075,.67,'#91bdcb');
      } else if(id==='vector'){
        box(x,.73,z,.71,.41,.14,'#324b64');box(x,.82,z+.08,.56,.26,.035,'#8ed4cd');
      } else {
        for(let j=-1;j<=1;j++) box(x+j*.30,.73,z-.03,.22,.16+Math.abs(j)*.08,.26,[p.color,'#eaa15f','#79aa98'][j+1]);
      }
      markers.push({x,y:1.5,z,name,id,place:p.id,kind:'tool'});
    });
  }
  function shadesForResin(x,z,color){
    shapes.disc(x,.78,z,.15,.13,.08,'#e8ddc4',12);
    shapes.disc(x,.86,z,.14,.09,.27,color,10,.75);
    shapes.disc(x-.036,.91,z+.07,.057,.031,.085,'#fff0cf',9,.6);
  }
  for(const booth of classBooths){
    const {x,color}=booth,z=booth.z-.65;
    addGround(x,z,2.65,2.3,'#b5ab92');
    box(x,0,z-.46,2.3,.14,1.74,'#8d897d');
    box(x,.14,z-1,2.14,1.6,.16,'#d8cfb8');
    box(x-1,.14,z-.67,.12,1.53,.65,'#d8cfb8');
    for(let i=-4;i<=4;i++)box(x+i*.22,.31+((i+4)%3)*.12,z-.913,.11,1.04,.026,shade(color,1.22));
    box(x,.14,z+.04,2.08,.73,.44,color);
    box(x,.87,z+.04,2.16,.07,.53,'#b28f6a');
    for(const side of [-1,1]){
      box(x+side, .14,z+.24,.11,1.66,.11,'#655847');
      box(x+side,.14,z-.95,.11,1.66,.11,'#655847');
    }
    roof(x,1.78,z-.36,2.42,1.64,color,.42);
    box(x,1.6,z+.48,2.13,.15,.10,color);
    box(x,.95,z-.22,.62,.37,.10,'#303e40');
    box(x,1.01,z-.16,.51,.23,.03,'#a7c6bf');
    const employee=park.worldData.avatars[classBooths.indexOf(booth)];
    person(x+.73,z+1.07,{...employee,shirt:booth.color});
    markers.push({x,y:2.42,z,name:booth.name,id:booth.id,kind:'booth'});
  }
  // Smaller storefronts make the creative district read as a street.
  for(const [x,z,color] of [[-14,-8,'#c47562'],[-7.1,-6.65,'#78a183']]){
    box(x,0,z-1.1,2.05,1.56,.83,'#fff0cf');
    roof(x,1.59,z-1.04,2.4,1.14,color,.52);
    box(x,.51,z-.52,1.58,.16,.71,'#b48056');
    for(let i=-1;i<=1;i++) box(x+i*.42,.68,z-.43,.26,.23+(i+1)*.08,.29,i===0?'#d07f8a':color);
  }
  // The train and little climbing structure give the back lanes silhouettes.
  for(const offset of [-1.15,1.05]){
    const x=10+offset,z=-6.5;
    box(x,.22,z,1.9,.65,.85,'#c47b4b');
    box(x,.87,z,1.28,.62,.77,'#885b8d');
    roof(x,1.48,z,1.5,.95,'#723f6c',.25);
    for(const dx of [-.56,.56]) box(x+dx,.03,z+.26,.31,.34,.28,'#344554');
  }
  for(const dx of [-1,1]){
    box(-10+dx,0,5.6,.15,1.83,.18,'#b47748');
    box(-10+dx,1.78,5.6,.38,.15,.39,'#e2a153');
  }
  box(-10,1.5,5.58,2.03,.11,.12,'#9a6950');
  for(let i=-2;i<=2;i++) box(-10+i*.34,1.28,5.66,.19,.23,.045,i%2?'#609489':'#db857b');
  const [candy,balloonShop]=vendors;
  const {x,z}=candy;
  box(x,0,z-1.8,2.8,.9,1.37,'#da728d');
  box(x,.91,z-1.8,2.9,.11,1.51,'#f9e5bf');
  for(const dx of [-1.24,1.24]) box(x+dx,.92,z-2.1,.12,1.13,.15,'#9e5676');
  roof(x,2.07,z-1.94,3.15,1.75,'#df779a',.50);
  for(let i=-1;i<=1;i++) {
    box(x+i*.38,1.03,z-1.63,.05,.47,.05,'#a07550');
    box(x+i*.38,1.31,z-1.63,.27,.35,.30,i===0?'#faafd1':'#f6d4dc');
  }
  person(x-.3,z-.73,{...look,shirt:'#e9759c'});
  markers.push({x,y:2.75,z:z-1.7,name:candy.name,id:candy.id,kind:'vendor'});
  const bx=balloonShop.x,bz=balloonShop.z-1.4;
  addGround(bx,bz,3.2,2.65,'#d2bd95');
  box(bx,0,bz,2.64,.83,1.28,'#8e729c');
  box(bx,.83,bz,2.74,.11,1.35,'#e7d3af');
  for(const side of [-1,1])box(bx+side*1.21,.9,bz-.38,.10,1.2,.1,'#725742');
  roof(bx,2.1,bz-.26,2.98,1.58,'#b3839f',.38);
  Object.values(balloonColors).forEach((color,i)=>balloon(shapes,bx-.82+i*.37,1.43+i%2*.33,bz+.45,color));
  person(bx+.62,bz+.9,park.worldData.avatars.find(avatar=>avatar.style==='bun'));
  markers.push({x:bx,y:2.83,z:bz,name:balloonShop.name,id:balloonShop.id,kind:'vendor'});
  for(const [i,shop] of vendors.slice(2).entries()){
    const {x,z,color}=shop,back=z-1.1;
    addGround(x,z-1,3.2,2.7,'#c7b496');
    box(x,.07,back-.62,2.55,1.7,.15,i?'#edcb94':'#e4d6c0');
    box(x-1.2,.07,back-.24,.13,1.7,.74,i?'#edcb94':'#e4d6c0');
    box(x,.07,back+.23,2.48,.76,.61,color);
    box(x,.83,back+.23,2.55,.075,.71,'#debf8f');
    roof(x,1.78,back-.19,2.78,1.17,color,.36);
    for(let j=0;j<3;j++){
      const offset=(j-1)*.49;
      if(i){
        box(x+offset,.905,back+.24,.31,.13,.19,'#e4b379');
        box(x+offset,.97,back+.24,.25,.06,.075,'#9a4e40');
      }else{
        shapes.disc(x+offset,.91,back+.24,.082,.08,.16,'#f1e5d6',12,.98);
        shapes.disc(x+offset,1.071,back+.24,.078,.075,.008,'#754a36',12);
      }
    }
    person(x+.90,z-.43,{...avatars[i+3],shirt:color});
    markers.push({x,y:2.54,z:back,name:shop.name,id:shop.id,kind:'vendor'});
  }
  for(const side of [-1,1]){
    const post=side*1.95;
    box(post,0,17.9,.74,.24,.78,'#a49c85');
    box(post,.24,17.9,.43,2.27,.5,'#865c44');
    box(post,2.43,17.9,.62,.12,.67,'#ac805c');
    roof(post,2.55,17.9,.82,.85,'#4f6854',.27);
    box(post,1.38,18.23,.25,.33,.18,'#edc078');
    box(post,1.70,18.23,.33,.09,.24,'#4a4b3e');
    box(post,1.34,18.23,.30,.06,.22,'#4a4b3e');
    box(side*2.8,0,17.9,.76,.4,1.65,'#a77657');
    for(let i=0;i<5;i++){
      shapes.disc(side*(2.64+i%2*.25),.35,17.35+i*.25,.23,.22,.28,'#658455',9,.7);
      shapes.disc(side*(2.64+i%2*.25),.62,17.35+i*.25,.08,.073,.06,i%2?'#d9948a':'#f4d599',8,.6);
    }
  }
  box(0,2.03,17.9,3.67,.55,.31,'#694c3b');
  box(0,2.11,18.06,2.36,.40,.06,'#3c574b');
  scenery.push({points:[[-1.18,2.11,18.095],[1.18,2.11,18.095],[1.18,2.51,18.095],[-1.18,2.51,18.095]],color:'#3c574b',label:'WELCOME'});
  for(let i=0;i<9;i++){
    const x=(i-4)*.40;
    shapes.disc(x,2.01-Math.cos(x*.8)*.14,18.20,.047,.047,.075,'#fce0a1',8);
  }
  for(let i=0;i<45;i++){
    const sign=i%2?1:-1;
    const x=sign*(18+(i%5)*1.8);
    const z=(i*5.37)%47-28;
    if(places.some(p=>Math.abs(x-p.x)<4.9&&Math.abs(z-p.z)<6)||Math.abs(z-12)<3&&x>0&&x<10) continue;
    tree(x,z,i);
  }
  for(let i=0;i<18;i++){
    const z=18-i*2.35,x=roadX(z)+(i%2?1:-1)*(2.75+i%3*.12);
    shapes.disc(x,.02,z,.27,.22,.38,i%2?'#758a63':'#637d63',9,.65);
    shapes.disc(x+.13,.05,z+.19,.19,.18,.22,'#87976c',8,.61);
  }
  for(let i=-5;i<=5;i++){
    const x=i*8.4,z=-37-(i%3)*1.4,h=4.2+Math.abs(i%4)*1.22;
    face([[x-7,0,z],[x-1,h,z-3],[x+6,0,z]],i%2?'#8bb9a2':'#9ec4a7');
    face([[x-1,h,z-3],[x+1.7,h*.62,z-1],[x+6,0,z],[x+.3,0,z+.6]],i%2?'#a6c8a9':'#b4cfad');
  }
  buildParkDetails(shapes,reserve);
  const buttons=markers.map(marker=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='world-tag world-tag-'+marker.kind;
    b.textContent=options.markerLabel(marker);
    b.addEventListener('click',()=>options.onMarker(marker));
    overlay.append(b);
    return b;
  });

  const camera={x:0,z:13,yaw:0,pitch:.43,zoom:1};
  let orbitYaw=0,orbitPitch=.43,zoom=1;
  const plaza=places.find(place=>place.id==='manage');
  const p={x:0,z:13,heading:Math.atan2(plaza.x,plaza.z-13)};
  const keys=new Set();
  let route=[],reached=null,section='',approach='',faceTime=0,last=0,frame=0,stopped=false,pointer=null;
  let sin=.43,cos=Math.sqrt(1-sin*sin),yawSin=0,yawCos=1;
  const midpoint=points=>points.reduce(([a,b,c],[x,y,z])=>[a+x/points.length,b+y/points.length,c+z/points.length],[0,0,0]);
  const worldDepth=([x,y,z])=>-(x*yawSin+z*yawCos)*cos-y*sin;
  const sortedStatic=scenery.map(face=>({face,center:midpoint(face.points),depth:0}));
  const lightPoints=[
    ...lanterns.map(([x,z])=>[x,1.92,z,'#ffcf80',.74]),
    ...classBooths.flatMap(({x,z})=>[-.82,.82].map(offset=>[x+offset,1.65,z-.16,'#ffd991',.5])),
    ...vendors.map(({x,z})=>[x,1.8,z-1.16,'#ffbba0',.72]),
    ...Array.from({length:12},(_,i)=>[carousel.x+Math.cos(i*Math.PI/6)*2.43,2.91,carousel.z+Math.sin(i*Math.PI/6)*2.16,i%2?'#ffc974':'#ffa1b3',.39]),
    ...[-1.95,1.95].map(x=>[x,1.55,18.35,'#ffce82',.78]),
    ...Array.from({length:9},(_,i)=>[(i-4)*.40,1.91,18.26,'#ffe4ac',.31])
  ];
  let atmosphere,atmosphereKey='',colorCache=new Map();
  function displayColor(color,surface){
    const key=color+(surface??'');
    if(colorCache.has(key))return colorCache.get(key);
    const tint=surface?mixColor(color,atmosphere.season[surface],surface==='grass'?.76:.46):color;
    const rgb=atmosphere.lighting.light.map((value,i)=>Math.min(255,Math.round(parseInt(tint.slice(1+i*2,3+i*2),16)*value)).toString(16).padStart(2,'0'));
    const shaded='#'+rgb.join('')+color.slice(7);
    colorCache.set(key,shaded);
    return shaded;
  }
  let sortYaw=Infinity,sortPitch=Infinity;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let W,H,F,CX,device=1;
  const centerY=()=>Math.max(H*.45,F*.5);
  function resize(){
    const {width,height}=canvas.getBoundingClientRect();
    device=Math.min(devicePixelRatio||1,2);
    W=width; H=height; CX=W*.5;
    F=Math.min(780,Math.max(285,Math.min(W*.66,H*1.12)));
    canvas.width=Math.round(W*device);canvas.height=Math.round(H*device);
    ctx.setTransform(device,0,0,device,0,0);
  }
  resize();
  const observer=new ResizeObserver(resize);
  observer.observe(canvas);
  function project([x,y,z]){
    const dx=x-camera.x,dz=z-camera.z,forward=11.6-(dx*yawSin+dz*yawCos),dy=y-8;
    return {d:forward*cos-dy*sin,x:dx*yawCos-dz*yawSin,y:dy*cos+forward*sin};
  }
  function screen(v){return [CX+F*camera.zoom*v.x/v.d,centerY()-F*camera.zoom*v.y/v.d];}
  function glow(point,color,relativeSize){
    const view=project(point);
    if(view.d<1)return;
    const [x,y]=screen(view),r=Math.min(65,relativeSize*F*camera.zoom/view.d);
    if(r<1||x+r<0||x-r>W||y+r<0||y-r>H)return;
    const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
    gradient.addColorStop(0,color);gradient.addColorStop(.16,color+'a0');gradient.addColorStop(1,color+'00');
    ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function polygon({points,color,label,surface,light,outline=true}) {
    if(light){glow(points[0],color,light);return;}
    const vs=points.map(project);
    const clipped=[];
    for(let i=0;i<vs.length;i++){
      const a=vs[i],b=vs[(i+1)%vs.length];
      if(a.d>=1) clipped.push(a);
      if((a.d>=1)!==(b.d>=1)){
        const t=(1-a.d)/(b.d-a.d);
        clipped.push({d:1,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
      }
    }
    if(clipped.length<3) return;
    const corners=clipped.map(screen);
    if(corners.every(([x])=>x<0)||corners.every(([x])=>x>W)||corners.every(([,y])=>y<0)||corners.every(([,y])=>y>H))return;
    ctx.beginPath();
    for(const [i,[x,y]] of corners.entries()){
      if(i===0) ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    const painted=displayColor(color,surface);
    ctx.closePath();ctx.fillStyle=painted;ctx.fill();
    if(outline){ctx.strokeStyle=painted;ctx.lineWidth=.42;ctx.stroke();}
    if(label&&corners.length===4&&vs.every(point=>point.d>=1)){
      const [left,right,top]=corners;
      const width=Math.abs(right[0]-left[0]),height=Math.abs(top[1]-right[1]);
      ctx.fillStyle='#fff0c9';
      ctx.font=`700 ${Math.min(height*.73,width*.18)}px Georgia, serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(label,(left[0]+right[0])/2,(right[1]+top[1])/2,width*.88);
    }
  }
  function travel(x,z,callback){
    route=[];
    if(Math.abs(p.z-z)>6){
      const steps=Math.ceil(Math.abs(p.z-z)/1.8);
      for(let i=0;i<=steps;i++){
        const nextZ=p.z+(z-p.z)*i/steps;
        route.push([roadX(nextZ),nextZ]);
      }
    }
    route.push([x,z]);reached=callback??null;
  }
  const commands={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
  function movementKey(event){
    return commands[event.key] ? event.key : event.key.toLowerCase();
  }
  function down(event){
    const key=movementKey(event);
    if(!commands[key]||options.paused()||event.altKey||event.ctrlKey||event.metaKey||event.target.closest?.('input,textarea,select,dialog,[role=dialog]')) return;
    event.preventDefault();route=[];reached=null;keys.add(key);
  }
  function up(event){keys.delete(movementKey(event));}
  const clear=()=>keys.clear();
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function pan(event){
    if(options.paused()||pointer?.id!==event.pointerId)return;
    if(pointer.drag||Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)>5){
      pointer.drag=true;
      orbitYaw-=(event.clientX-pointer.x)*.0027;
      orbitPitch=clamp(orbitPitch+(event.clientY-pointer.y)*.0021,.20,.66);
    }
    pointer.x=event.clientX;pointer.y=event.clientY;
  }
  function changeZoom(event){
    if(options.paused())return;
    event.preventDefault();
    const scale=event.deltaMode===1?16:event.deltaMode===2?H:1;
    const delta=clamp(event.deltaY*scale,-100,100);
    zoom=clamp(zoom*Math.exp(-delta*.00058),.72,1.6);
  }
  const stage=canvas.parentElement;
  stage.addEventListener('pointermove',pan);
  stage.addEventListener('wheel',changeZoom,{passive:false});
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0||options.paused())return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,drag:false};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('pointerup',event=>{
    if(pointer?.id!==event.pointerId)return;
    const drag=pointer.drag||Math.hypot(pointer.startX-event.clientX,pointer.startY-event.clientY)>5;
    pointer=null;
    if(drag||!options.walkMode()||options.paused())return;
    const r=canvas.getBoundingClientRect();
    const focal=F*camera.zoom;
    const sy=(centerY()-(event.clientY-r.top))/focal,sx=(event.clientX-r.left-CX)/focal;
    const denominator=sin-sy*cos;
    if(denominator<.15) return;
    const dz=(8*cos+sy*8*sin)/denominator;
    const depth=dz*cos+8*sin;
    const lateral=sx*depth,radial=11.6-dz;
    travel(clamp(camera.x+lateral*yawCos+radial*yawSin,-17,17),clamp(camera.z-lateral*yawSin+radial*yawCos,-24,19));
  });
  function draw(now){
    if(stopped)return;
    const dt=Math.min(.045,(now-last)/1000)||0;
    last=now;
    const ease=reduced.matches?1:1-Math.exp(-dt*14);
    camera.yaw+=(orbitYaw-camera.yaw)*ease;
    camera.pitch+=(orbitPitch-camera.pitch)*ease;
    camera.zoom+=(zoom-camera.zoom)*ease;
    options.onHeading(camera.yaw);
    sin=camera.pitch;cos=Math.sqrt(1-sin*sin);
    yawSin=Math.sin(camera.yaw);yawCos=Math.cos(camera.yaw);
    let moving=false;
    if(options.paused())keys.clear();
    else {
      let dx=0,dz=0;
      for(const key of keys){dx+=commands[key][0];dz+=commands[key][1];}
      if(keys.size)[dx,dz]=[dx*yawCos+dz*yawSin,-dx*yawSin+dz*yawCos];
      const waypoint=route[0];
      if(waypoint&&!keys.size){
        dx=waypoint[0]-p.x;dz=waypoint[1]-p.z;
        if(Math.hypot(dx,dz)<.17){
          route.shift();dx=dz=0;
          if(!route.length&&reached){const callback=reached;reached=null;callback();}
        }
      }
      const norm=Math.hypot(dx,dz);
      if(norm>.001){
        p.heading=Math.atan2(dx,dz);
        const step=Math.min(6.6*dt,waypoint&&!keys.size?norm:Infinity);
        p.x=Math.max(-17,Math.min(17,p.x+dx/norm*step));
        p.z=Math.max(-24,Math.min(19,p.z+dz/norm*step));
        faceTime+=dt*13;moving=true;
      }
    }
    camera.x+=(p.x-camera.x)*Math.min(1,dt*6);
    camera.z+=(p.z-camera.z)*Math.min(1,dt*6);
    const nearby=places.find(place=>Math.abs(place.x-p.x)<4.8&&Math.abs((place.z-1)-p.z)<4.1);
    const stall=stalls.find(entry=>Math.hypot(entry.x-p.x,entry.z-p.z)<(entry.id===section?1.65:1.28));
    const next=stall?.id??nearby?.id??'';
    if(next!==section){section=next;options.onZone(section);}
    const nearCounter=stall??places.find(place=>Math.hypot(place.x-p.x,place.z-p.z)<(approach===place.id?1.9:1.48));
    const counter=nearCounter?.id??'';
    if(counter!==approach){approach=counter;if(counter)options.onApproach(counter);}
    const nextAtmosphere=currentAtmosphere(options.atmosphere());
    const nextKey=nextAtmosphere.period+nextAtmosphere.season.grass;
    if(nextKey!==atmosphereKey){atmosphere=nextAtmosphere;atmosphereKey=nextKey;colorCache.clear();}
    const {season,period,lighting}=atmosphere;
    const night=period==='night';
    const sky=ctx.createLinearGradient(0,0,0,H);
    [0,.58,1].forEach((stop,i)=>sky.addColorStop(stop,lighting.sky?mixColor(season.sky[i],lighting.sky[i],lighting.blend):season.sky[i]));
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    const sx=W*lighting.sun[0],sy=H*lighting.sun[1];
    const sunlight=ctx.createRadialGradient(sx,sy,0,sx,sy,Math.min(92,W*.14));
    sunlight.addColorStop(0,night?'#edf2ff':'#fff8e5');sunlight.addColorStop(.23,lighting.glow);sunlight.addColorStop(1,lighting.glow.slice(0,7)+'00');
    ctx.fillStyle=sunlight;ctx.fillRect(0,0,W,H);
    if(night){
      for(let i=0;i<57;i++){
        ctx.fillStyle=i%4?'#dbe7ff86':'#f7edcebc';
        ctx.fillRect(W*((i*17.73)%101)/101,H*((i*9.13)%39)/100,i%4?1:1.8,i%4?1:1.8);
      }
      ctx.beginPath();ctx.arc(sx,sy,Math.min(11,W*.03),0,Math.PI*2);ctx.fillStyle='#e8efff';ctx.fill();
    }
    ctx.fillStyle=night?'#8b9eb51e':period==='evening'?'#ffddc183':'#fff8edb3';
    for(const [x,y,size] of [[.18,.16,1],[.57,.085,.64],[.88,.26,.76]]){
      const radius=Math.min(33,W*.055)*size;
      ctx.beginPath();
      ctx.ellipse(W*x-radius*.66,H*y,radius*.94,radius*.34,0,0,Math.PI*2);
      ctx.ellipse(W*x,H*y-radius*.18,radius*.78,radius*.53,0,0,Math.PI*2);
      ctx.ellipse(W*x+radius*.69,H*y+radius*.04,radius*.77,radius*.34,0,0,Math.PI*2);
      ctx.fill();
    }
    for(const tile of grounds) polygon(tile);
    const dynamic=[];
    const live=geometry(dynamic);
    drawParkMotion(live,now/1000,reduced.matches);
    if(night){
      for(const [x,y,z,color,light] of lightPoints)dynamic.push({points:[[x,y,z]],color,light});
      const turn=(reduced.matches?0:now*.00033);
      for(let i=0;i<16;i++){
        const a=turn+i*Math.PI/8;
        dynamic.push({points:[[wheel.x+Math.cos(a)*wheel.r,wheel.y+Math.sin(a)*wheel.r,wheel.z+.11]],color:i%2?'#ffd28c':'#a9d8ff',light:.54});
      }
      for(const [x,z] of lanterns){
        const view=project([x,.01,z]);
        if(view.d<1)continue;
        const [px,py]=screen(view),radius=Math.min(75,1.45*F*camera.zoom/view.d);
        if(px+radius<0||px-radius>W||py+radius<0||py-radius>H)continue;
        const pool=ctx.createRadialGradient(0,0,0,0,0,1);
        pool.addColorStop(0,'#f5bf6f50');pool.addColorStop(1,'#f5bf6f00');
        ctx.save();ctx.translate(px,py);ctx.scale(radius,radius*.44);ctx.fillStyle=pool;ctx.fillRect(-1,-1,2,2);ctx.restore();
      }
    }
    const blades=['#c47765','#f1c36d','#639a8a','#7a83a6'];
    for(const [i,{x,z}] of pinwheels.entries()){
      const spin=(reduced.matches?0:now*.0022)+i*.74;
      for(let blade=0;blade<4;blade++){
        const a=spin+blade*Math.PI/2,b=a+.76;
        live.face([[x,.65,z+.045],[x+Math.cos(a)*.29,.65+Math.sin(a)*.29,z+.055],[x+Math.cos(b)*.19,.65+Math.sin(b)*.19,z+.09]],blades[blade]);
      }
      live.disc(x,.625,z+.06,.037,.042,.05,'#d9b98b',7);
    }
    live.person(p.x,p.z,options.avatar(),moving&&!reduced.matches?Math.sin(faceTime)*.115:0,p.heading);
    const carried=balloonColors[options.balloon()];
    if(carried){
      const sway=reduced.matches?0:Math.sin(now*.003)*.10;
      balloon(live,p.x+Math.cos(p.heading)*.37+sway,1.19,p.z-Math.sin(p.heading)*.37,carried);
    }
    if(Math.abs(camera.yaw-sortYaw)>.004||Math.abs(camera.pitch-sortPitch)>.004){
      for(const item of sortedStatic)item.depth=worldDepth(item.center);
      sortedStatic.sort((a,b)=>b.depth-a.depth);
      sortYaw=camera.yaw;sortPitch=camera.pitch;
    }
    const sortedLive=dynamic.map(face=>({face,depth:worldDepth(midpoint(face.points))})).sort((a,b)=>b.depth-a.depth);
    const minimum=-(camera.x*yawSin+camera.z*yawCos+11.6)*cos-8*sin-3;
    let i=0,j=0;
    while(i<sortedStatic.length||j<sortedLive.length){
      const item=j>=sortedLive.length||(i<sortedStatic.length&&sortedStatic[i].depth>=sortedLive[j].depth)?sortedStatic[i++]:sortedLive[j++];
      if(item.depth<minimum)break;
      polygon(item.face);
    }
    for(const [i,marker] of markers.entries()){
      const point=project([marker.x,marker.y,marker.z]);
      const [x,y]=screen(point);
      const usable=marker.kind==='tool'?section===marker.place:marker.kind==='place'?section!==marker.id:true;
      const shown=usable&&point.d>1&&x>18&&x<W-18&&y>30&&y<H-15;
      buttons[i].hidden=!shown;
      if(shown) buttons[i].style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-50%)`;
    }
    frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);
  return {
    travel,
    refreshLabels(){markers.forEach((marker,i)=>{buttons[i].textContent=options.markerLabel(marker);});},
    overview(){orbitYaw=Math.round(camera.yaw/(2*Math.PI))*2*Math.PI;orbitPitch=.43;zoom=.76;},
    nearby:()=>section,
    walk(key){route=[];reached=null;keys.add(key);},
    release(key){keys.delete(key);},
    stop(){stopped=true;cancelAnimationFrame(frame);observer.disconnect();stage.removeEventListener('pointermove',pan);stage.removeEventListener('wheel',changeZoom);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);}
  };
}

park.scene = { makeScene };
})(window.onuriMakerPark ??= {});
