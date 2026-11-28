((park) => {
'use strict';

const avatars = [
  {id:'coral', name:'코랄', role:'정원사', style:'braids', shirt:'#b96958', accent:'#f4dbad', hair:'#302925', skin:'#e5a475'},
  {id:'sage', name:'세이지', role:'지도 탐험가', style:'cap', shirt:'#5b806a', accent:'#e7c589', hair:'#69432e', skin:'#c48b61'},
  {id:'plum', name:'자두', role:'만들기 공방지기', style:'bob', shirt:'#7d668f', accent:'#e8c4af', hair:'#342742', skin:'#f0b389'},
  {id:'momo', name:'모모', role:'풍선 디자이너', style:'bun', shirt:'#b5748a', accent:'#ffdfa0', hair:'#523329', skin:'#b67b55'},
  {id:'sol', name:'솔', role:'공원 정비사', style:'beanie', shirt:'#4c76a0', accent:'#df9c58', hair:'#2c2528', skin:'#db9b70'}
];

const places = [
  {id:'vibe', x:-10,z:-10,name:'오누리 창작 거리', building:'메이커 전시 거리',color:'#cc6653', actions:[
    ['keyring','UV 레진 키링','투명한 UV 레진 안에 색과 작은 장식을 담은 키링을 살펴보세요.','keyring.webp'],
    ['holder','3D 케이블 홀더','책상 위 케이블이 흘러내리지 않게 잡아주는 출력물이에요. 케이블 굵기에 맞춰 홈을 설계해요.','holder.webp'],
    ['resin','레진아트','꽃 모양과 빛이 통과하는 색을 관찰해 보세요. 여기에는 온유 메이커의 레진 플라워 샘플을 전시했어요.','resin-flower.webp'],
    ['figures','피규어 컬렉션','로봇, 토끼, 우주 탐험가 모형을 비교해 보고, 색과 실루엣이 캐릭터의 인상에 어떤 차이를 만드는지 살펴보세요.']
  ]},
  {id:'manual',x:10,z:3,name:'제작공방',building:'메이커 작업실',color:'#546fbc',actions:[
    ['printer','3D 프린터','이 기계는 재료를 얇은 층으로 차곡차곡 쌓아요. 실제 출력 전에는 슬라이서로 층과 예상 시간을 확인해요. 화면에서 모형을 직접 돌려 보세요.'],
    ['laser','레이저 가공기','레이저 가공기는 재료에 모양을 새기거나 잘라요. 가공 전에 재료와 작업 조건이 장비에 맞는지 담당자가 확인해요.'],
    ['vector','벡터 작업대','디자인을 크기 조절이 쉬운 벡터 도안으로 정리해요. SVG를 열어 선이 끊긴 곳과 겹친 곳을 찾아봐요.']
  ]},
  {id:'class',x:-10,z:3,name:'체험 놀이터',building:'아이디어 부스',color:'#b37c39',actions:[
    ['idea','아이디어 카드','오늘의 미션이에요. 책상 위에서 자꾸 떨어지는 물건 하나를 골라, 제자리에 두는 도구를 생각해 보세요.'],
    ['ladder','사다리 게임','사다리는 여러 가지 결과 중 하나를 골라 주는 놀이예요. 직접 수업 활동을 열어 친구와 순서를 정해 볼 수 있어요.']
  ]},
  {id:'doc',x:10,z:-10,name:'이야기 열차역',building:'배움 도서관',color:'#8b69a5',actions:[
    ['reading','메이커 읽기 칸','키링을 만들기 전에는 작은 부품과 고리 위치를 확인해요. 열차역의 읽을거리에는 만들기 전 확인할 다른 조건도 나와요.'],
    ['book','수업 예시 서가','레진아트 자료와 메이킹 리포트를 찾아볼 수 있어요. 예제에서 재료와 제작 과정이 어떻게 연결되는지 살펴보세요.']
  ]},
  {id:'manage',x:0,z:-20,name:'안내 광장',building:'공원 안내센터',color:'#4d876f',actions:[
    ['welcome','안내 직원','공원의 다섯 구역을 찾아가 각 구역의 체험을 마치면 메이커 면허증을 받을 수 있어요. 체험 크레딧은 솜사탕 가판대에서 사용할 수 있어요.'],
    ['shelf','자료 게시대','공원 안의 자료 보관함에서 디지털 명함 예제를 받을 수 있어요. 원래 공지와 자료실은 구역 자료에서 열 수 있습니다.']
  ]}
];

const classBooths = [
  {id:'quiz', x:-13, z:8, name:'번쩍! 컴퓨터 퀴즈 연구소', activity:'컴퓨터 퀴즈 풀기', path:'cl_class/cl_quiz.html', color:'#456d86'},
  {id:'kids-mbti', x:-10, z:8, name:'두근두근 성격 탐험소', activity:'어린이 MBTI', path:'cl_class/cl_mbti-k.html', color:'#646d56'},
  {id:'procedure', x:-7, z:8, name:'차례차례 순서 퍼즐 가게', activity:'절차적 사고 게임', path:'cl_class/cl_proc.html', color:'#87644c'}
];

const vendors=[
  {id:'candy',x:6,z:12,name:'솜사탕 가판대',en:'Cotton Candy',color:'#d87698', product:['솜사탕','Cotton candy'],price:3,icon:'🍭'},
  {id:'balloons',x:-8.8,z:15.3,name:'둥실둥실 풍선 가게',en:'Balloon Shop',color:'#80629d'},
  {id:'coffee',x:7,z:-4.3,name:'회전목마 커피숍',en:'Carousel Café',color:'#8a6151',product:['커피','Coffee'],price:2,icon:'☕'},
  {id:'hotdog',x:-6.2,z:-18,name:'별빛 핫도그',en:'Starlight Hot Dogs',color:'#b16d48',product:['핫도그','Hot dog'],price:3,icon:'🌭'}
];
const balloonColors={peach:'#ee8b81',mint:'#70b59d',gold:'#e6bb59'};
const exhibits=[
  {action:'resin',offset:-2.45,color:'#679482',wall:'#dceade',pattern:'botanical'},
  {action:'keyring',offset:0,color:'#7186b0',wall:'#e0e5f4',pattern:'circles'},
  {action:'figures',offset:2.45,color:'#b78153',wall:'#f2dfc3',pattern:'arches'}
];
park.worldData = { avatars, places, classBooths, vendors, balloonColors, exhibits };
})(window.onuriMakerPark ??= {});
