((park) => {
'use strict';

const red='#cf635b', honey='#e8ad62', jade='#519b87', cream='#f4ddae', pink='#e58fa2', indigo='#5f80a5';
const colors=[red,honey,jade,pink,indigo];
const tau=Math.PI*2;
const carousel={x:-3.8,z:-7.3};
const wheel={x:12.7,z:-21.5,y:4.65,r:3.7};
const cups={x:-12.8,z:-19.1};
const lanterns=[[-3,11],[3.2,9],[-3.4,1.3],[3.4,1.3],[-3.4,-8],[3.25,-8],[-3.2,-17],[3.1,-17],[-15,.4],[14,-2.2],[-5.8,-6.9],[5.4,-6.9],[-4.4,18],[4.7,17.7]];

function flower(g,x,z,c,scale=1){
  const h=.17*scale,r=.18*scale;
  g.box(x,0,z,.035,h,.035,'#609369');
  g.disc(x,h,z,r,r,.10*scale,c,6);
  g.disc(x,h+.10*scale,z,r*.35,r*.35,.026*scale,'#ffd266',6);
}
function lantern(g,x,z){
  g.disc(x,0,z,.21,.21,.12,'#8e775d',8);
  g.box(x,.1,z,.09,1.72,.09,'#335b55');
  g.box(x,1.67,z,.28,.11,.28,'#5c7662');
  g.box(x,1.77,z,.22,.32,.22,'#ffe5a0');
  g.roof(x,2.07,z,.32,.31,'#466a60',.18);
}
function bench(g,x,z){
  g.box(x-.44,0,z,.11,.45,.33,'#696c59');
  g.box(x+.44,0,z,.11,.45,.33,'#696c59');
  g.box(x,.4,z,1.19,.10,.40,'#b88152');
  g.box(x,.60,z-.33,1.18,.12,.10,'#c39161');
  g.box(x,.77,z-.33,1.18,.11,.10,'#c39161');
}
function pool(g,x,z,rx,rz){
  const {disc,face,box}=g;
  disc(x,.025,z,rx+.16,rz+.16,.03,'#c1d4ad',18);
  disc(x,.064,z,rx,rz,.03,'#73b9a9',18);
  disc(x-.16,.097,z+.03,rx*.76,rz*.72,.014,'#8ac6b4',16);
  for(let i=0;i<6;i++){
    const px=x+(i-2.5)*rx*.24,pz=z+Math.sin(i*2.6)*rz*.65;
    face([[px,.118,pz],[px+.42,.118,pz-.06],[px+.64,.118,pz],[px+.24,.118,pz+.05]],'#c6eadd');
  }
  box(x+rx*.5,.13,z+rz*.31,.3,.08,.18,'#679766');
  flower(g,x+rx*.5,z+rz*.31,pink,.72);
}
function bridge(g,x,z){
  for(let i=-3;i<=3;i++){
    const t=i*.31,y=.09+(3-Math.abs(i))*.09;
    g.box(x,y,z+t,1.95,.095,.30,i%2?'#bb8b62':'#d09c6a');
    if(i%2) for(const side of [-1,1]) g.box(x+side*.92,y+.03,z+t,.10,.56,.11,'#874e46');
  }
  for(const side of [-1,1]){
    const px=x+side*.92;
    for(let i=-3;i<3;i++){
      const y=.74-Math.abs(i+.5)*.084;
      g.beam([px,y,z+i*.31],[px,y+(i<0?.08:-.08),z+(i+1)*.31],.078,'#a46051');
    }
  }
}
function ribbon(g,x,z,spread){
  const y=2.7;
  for(const side of [-1,1]){
    g.box(x+side*spread,0,z,.115,y,.115,'#5c716a');
    g.disc(x+side*spread,y,z,.12,.12,.11,'#e6ad64',8);
  }
  for(let i=0;i<10;i++){
    const a=x-spread+(2*spread)*i/10,b=x-spread+(2*spread)*(i+1)/10;
    const curve=t=>y-.56*Math.sin(Math.PI*(t-x+spread)/(2*spread));
    g.beam([a,curve(a),z],[b,curve(b),z],.018,'#755647');
    g.face([[a+.08,curve(a)-.04,z],[b-.025,curve(b)-.04,z],[(a+b)/2,curve((a+b)/2)-.35,z]],colors[i%colors.length]);
  }
}
function balloon(g,x,y,z,color){
  g.beam([x,y-.70,z],[x,y+.08,z],.022,'#8f7469');
  g.disc(x,y+.04,z,.22,.23,.36,color,9);
  g.disc(x,y+.36,z,.15,.17,.12,color,9);
  g.disc(x-.055,y+.24,z+.15,.073,.075,.06,'#f7c2b8',7);
}
function garden(g,x,z){
  g.disc(x,0,z,1.22,.69,.10,'#ae816a',12);
  g.disc(x,.09,z,1.11,.57,.07,'#749666',12);
  for(let i=0;i<9;i++){
    const a=i*2.4;
    flower(g,x+Math.cos(a)*(.25+i*.09),z+Math.sin(a)*(.18+i*.042),colors[i%5],.72+(i%3)*.12);
  }
}
const fountainCenter={x:-5.9,z:14.3};
function fountain(g){
  const {x,z}=fountainCenter;
  g.disc(x,0,z,1.76,1.49,.09,'#77766f',32);
  g.disc(x,.09,z,1.66,1.39,.18,'#aba89c',32);
  g.disc(x,.27,z,1.69,1.42,.05,'#d3ccba',32);
  g.disc(x,.32,z,1.49,1.23,.012,'#397482',32);
  g.disc(x,.333,z,1.29,1.06,.006,'#518c99',32);
  g.disc(x,.34,z,.31,.31,.36,'#a49d8e',18,.63);
  g.disc(x,.70,z,.59,.54,.13,'#c1b9a7',24);
  g.disc(x,.83,z,.49,.44,.012,'#71a4aa',24);
  g.disc(x,.84,z,.09,.09,.13,'#656e67',12,.72);
}

function fountainWater(g,t){
  const {x,z}=fountainCenter;
  const surface=.35;
  for(let jet=0;jet<7;jet++){
    const angle=jet*tau/7;
    const aimX=Math.cos(angle)*1.34,aimZ=Math.sin(angle)*1.10;
    const point=u=>[x+aimX*u,.97-.62*u+3.1*u*(1-u),z+aimZ*u];
    for(let segment=0;segment<10;segment++){
      const u=segment/10;
      const flowing=.72+.28*Math.sin(t*12-u*17+jet);
      g.beam(point(u),point(u+.10),(.041-.023*u)*flowing,segment%3===0?'#e2f9f4b8':'#a9e0e8a1');
    }
    for(let drop=0;drop<4;drop++){
      const u=(t*1.65+drop/4+jet*.14)%1;
      const [px,py,pz]=point(u);
      const offset=Math.sin(jet*2+drop)*.065*u;
      g.face([[px+offset-.017,py,pz],[px+offset,py+.044,pz],[px+offset+.02,py,pz]],'#efffffce');
    }
  }
  for(let i=0;i<4;i++){
    const phase=(t*.64+i/4)%1,r=.38+phase*1.08;
    const color=phase<.55?'#d1faf47a':'#b6e8e642';
    for(let n=0;n<24;n++){
      if((n+i)%6===0)continue;
      const a=n*tau/24,b=(n+1)*tau/24;
      const edge=(angle,radius)=>[x+Math.cos(angle)*radius,surface,z+Math.sin(angle)*radius*.81];
      g.face([edge(a,r),edge(b,r),edge(b,r+.022),edge(a,r+.022)],color);
    }
  }
  for(let i=0;i<12;i++){
    const phase=(t*2.3+i/12)%1,a=i*2.399;
    const r=1.04+phase*.34,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r*.82;
    const y=surface+phase*(1-phase)*.62;
    g.face([[px-.019,y,pz],[px,y+.034,pz],[px+.019,y,pz]],'#efffffc7');
  }
}

function buildParkDetails(g,reserve){
  const {box,disc,roof,face,beam}=g;
  // A turquoise stream and red footbridges divide the entrance gardens from the midway.
  for(const [x,z] of [[-12,13.5],[10,8.2]]){
    pool(g,x,z,3.3,1.16);
    bridge(g,x,z);
  }
  pool(g,-5,-12.1,2.45,1.25);
  pool(g,17.3,-8.9,2.8,1.35);
  fountain(g);
  const add=(draw,points,radius)=>points.forEach(([x,z])=>{if(reserve(x,z,radius))draw(g,x,z);});
  for(const [x,z] of lanterns) lantern(g,x,z);
  add(bench,[[-4.8,10.7],[5,6.2],[-7.2,-2.1],[5.8,-5.1],[-6.7,13.8],[6.8,-14.9],[-4.5,-11.4]],1);
  add(garden,[[-4.7,15.5],[4.5,15.9],[5,13.1],[-4.25,5.8],[-5.1,1.3],[5.6,-2.45],[5.6,-10],[5.5,-18],[-5.2,-16.4],[-8.2,-17.5],[-15.7,1.1],[14.6,.7],[15.9,6.5],[-16,10.5]],1.25);
  for(const [x,z,spread] of [[0,8.25,3.1],[0,-6.2,3.25],[-11,-12,3.25],[9,-16,3.2]]) ribbon(g,x,z,spread);
  add((g,x,z)=>{
    g.box(x,0,z,.37,.36,.36,'#997561');
    for(let i=0;i<3;i++) balloon(g,x+(i-1)*.25,1.05+i*.24,z+Math.sin(i)*.17,colors[(i+1)%5]);
  },[[4.5,10.25],[-13.9,-.1],[13.5,-14.4],[-8.5,-15.8]],.45);
  for(let i=0;i<24;i++){
    const side=i%2?-1:1;
    const x=side*(7.3+(i%6)*1.9),z=18.6+(i%4)*.59;
    flower(g,x,z,colors[i%5],.9);
    if(i%2) g.disc(x-.2,0,z,.20,.19,.15,'#829b75',6);
  }
  // Carousel deck, striped canopy, and center mast.
  disc(carousel.x,0,carousel.z,2.45,2.21,.22,'#ab7a66',18);
  disc(carousel.x,.22,carousel.z,2.31,2.08,.11,'#ecbf81',18);
  disc(carousel.x,2.8,carousel.z,2.48,2.25,.18,'#b58961',20);
  for(let i=0;i<20;i++){
    const a=tau*i/20,b=tau*(i+1)/20;
    face([[carousel.x+Math.cos(a)*2.48,2.97,carousel.z+Math.sin(a)*2.25],[carousel.x+Math.cos(b)*2.48,2.97,carousel.z+Math.sin(b)*2.25],[carousel.x,4.44,carousel.z]],i%2?'#f8d890':'#e5757c');
  }
  box(carousel.x,.33,carousel.z,.24,2.48,.24,'#f2c770');
  box(carousel.x,4.43,carousel.z,.075,.80,.075,'#82594e');
  face([[carousel.x,5.2,carousel.z],[carousel.x+.80,5.09,carousel.z],[carousel.x,4.90,carousel.z]],'#d66c72');

  // The wheel turns in a vertical plane. The supports and boarding deck are fixed.
  box(wheel.x,0,wheel.z,8.6,.18,1.12,'#caa17b');
  for(const side of [-1,1]){
    beam([wheel.x+side*2.45,.12,wheel.z+.64],[wheel.x,wheel.y,wheel.z+.44],.19,'#b86d66');
    beam([wheel.x+side*2.45,.12,wheel.z-.64],[wheel.x,wheel.y,wheel.z-.44],.19,'#98749a');
  }
  box(wheel.x,wheel.y-.11,wheel.z,.52,.30,1.13,'#f5c57a');

  // Spinning teacups and pavilion.
  disc(cups.x,0,cups.z,2.83,2.42,.24,'#957e9c',18);
  disc(cups.x,.24,cups.z,2.69,2.26,.11,'#d9b8d5',18);
  disc(cups.x,.34,cups.z,.36,.36,.79,'#ce728f',10);
  roof(cups.x,1.12,cups.z,1.15,.94,'#e7ad69',.42);
}

function drawParkMotion(g,elapsed,reduced){
  const t=reduced?0:elapsed;
  const {box,disc,beam}=g;
  for(let i=0;i<7;i++){
    const a=t*.57+i*tau/7,x=carousel.x+Math.cos(a)*1.63,z=carousel.z+Math.sin(a)*1.49;
    const y=.62+Math.sin(a*2+t*1.4)*.15,c=colors[i%5];
    box(x,.33,z,.068,2.46,.075,'#e6bf6c');
    disc(x,y-.16,z,.40,.35,.14,'#bb9460',8);
    box(x,y,z,.56,.34,.37,c);
    box(x+.25,y+.25,z,.24,.26,.22,c);
    box(x+.32,y+.45,z,.09,.12,.10,c);
    box(x-.19,y-.24,z+.07,.10,.27,.105,c);
    box(x+.16,y-.23,z-.08,.10,.26,.105,c);
  }
  for(let i=0;i<20;i++){
    const a=t*.33+i*tau/20,b=t*.33+(i+1)*tau/20;
    const ax=wheel.x+wheel.r*Math.cos(a),ay=wheel.y+wheel.r*Math.sin(a);
    const bx=wheel.x+wheel.r*Math.cos(b),by=wheel.y+wheel.r*Math.sin(b);
    beam([ax,ay,wheel.z],[bx,by,wheel.z],.082,i%2?'#d07982':'#fcdb99');
    if(i%2===0){
      beam([wheel.x,wheel.y,wheel.z],[ax,ay,wheel.z],.040,'#6e8396');
      box(ax,ay-.49,wheel.z,.66,.37,.60,colors[(i/2)%5]);
      box(ax,ay-.08,wheel.z,.72,.075,.67,'#fbdb9b');
      for(const side of [-1,1]) box(ax+side*.25,ay-.17,wheel.z,.085,.19,.47,colors[(i/2)%5]);
    }
  }
  for(let i=0;i<5;i++){
    const a=t*.51+i*tau/5,x=cups.x+Math.cos(a)*1.73,z=cups.z+Math.sin(a)*1.42;
    disc(x,.35,z,.51,.44,.085,'#fcdfae',9);
    disc(x,.45,z,.36,.33,.36,colors[i],9);
    disc(x,.81,z,.34,.30,.035,'#fbdeb4',9);
    const offset=a*1.7+t;
    box(x+Math.cos(offset)*.41,.58,z+Math.sin(offset)*.36,.17,.15,.15,colors[i]);
  }
  fountainWater(g,t);
}

park.details = { buildParkDetails, drawParkMotion, balloon, carousel, wheel, lanterns };
})(window.onuriMakerPark ??= {});
